import * as React from "react";
import {
  AuthorKeypair,
  Document,
  isErr,
  IStorage,
  ValidationError,
} from "earthstar";
import {
  findEdgesSync,
  GraphEdgeContent,
  writeEdgeSync,
} from "earthstar-graph-db";
import { useCurrentAuthor, useStorage } from "react-earthstar";
import { useWorkspaceAddrFromRouter } from "./WorkspaceLookup";

export type Post = {
  doc: Document;
  firstPosted: Date;
  unread: boolean;
};

export type Tag = {
  id: string;
  label: string;
};

export type ThreadRoot = {
  doc: Document;
  firstPosted: Date;
  tags: Tag[];
};

export type Thread = {
  root: ThreadRoot;
  replies: Post[];
};

const APP_NAME = "letterbox";
const KIND_HAS_THREAD = "HAS_THREAD";
const KIND_TAGGED_WITH = "TAGGED_WITH";

function onlyDefined<T>(val: T | undefined): val is T {
  if (val) {
    return true;
  }

  return false;
}

const pathTimestampRegex = /(\d*)(?:\.md)/;

export function getDocPublishedTimestamp(doc: Document): number {
  const result = pathTimestampRegex.exec(doc.path);

  if (result === null) {
    return 0;
  }

  return parseInt(result[0]);
}

export default class LetterboxLayer {
  _storage: IStorage;
  _user: AuthorKeypair | null;

  constructor(storage: IStorage, user: AuthorKeypair | null) {
    this._user = user;
    this._storage = storage;

    this._edgeToThreadRoot.bind(this);
  }

  _edgeToTag(edgeDoc: Document): Tag | undefined {
    const edgeContent: GraphEdgeContent = JSON.parse(edgeDoc.content);

    const tagContent = this._storage.getContent(edgeContent.dest);

    return tagContent ? JSON.parse(tagContent) : undefined;
  }

  _edgeToThreadRoot(edgeDoc: Document): ThreadRoot | undefined {
    const edgeContent: GraphEdgeContent = JSON.parse(edgeDoc.content);

    const tagEdges = findEdgesSync(this._storage, {
      appName: APP_NAME,
      source: edgeContent.source,
      owner: edgeContent.owner,
      kind: KIND_TAGGED_WITH,
    });

    const doc = this._storage.getDocument(edgeContent.dest);

    if (doc && !isErr(tagEdges)) {
      return {
        doc,
        firstPosted: new Date(getDocPublishedTimestamp(doc) / 1000),
        tags: tagEdges.map(this._edgeToTag, this).filter(onlyDefined),
      };
    }

    return undefined;
  }

  getThreadRoots(): ThreadRoot[] {
    const threadRootEdges = findEdgesSync(this._storage, {
      appName: APP_NAME,
      source: this._storage.workspace,
      kind: KIND_HAS_THREAD,
    });

    if (isErr(threadRootEdges)) {
      console.error(threadRootEdges);
      return [];
    }

    return threadRootEdges.map(this._edgeToThreadRoot, this).filter(
      onlyDefined,
    );
  }

  createThread(
    content: string,
    deleteAfter?: number,
  ): ThreadRoot | ValidationError {
    if (!this._user) {
      return new ValidationError(
        "Couldn't create thread without a known user.",
      );
    }

    const timestamp = Date.now() * 1000;
    const path = `/letterbox/~${this._user.address}/${timestamp}.md`;

    const result = this._storage.set(this._user, {
      content,
      path,
      deleteAfter,
      format: "es.4",
    });

    if (isErr(result)) {
      console.error(result);

      return result;
    }

    const edgeResult = writeEdgeSync(this._storage, this._user, {
      appName: APP_NAME,
      source: this._storage.workspace,
      dest: path,
      owner: this._user.address,
      kind: KIND_HAS_THREAD,
    });

    if (isErr(edgeResult)) {
      console.error(result);

      return edgeResult;
    }

    const hopefullyAnEdge = findEdgesSync(this._storage, {
      appName: APP_NAME,
      source: this._storage.workspace,
      dest: path,
    });

    if (isErr(hopefullyAnEdge)) {
      console.error(result);

      return hopefullyAnEdge;
    }

    const [edge] = hopefullyAnEdge;

    if (!edge) {
      return new ValidationError(
        "Couldn't get the edge for newly created ThreadRoot document. Weird.",
      );
    }

    const threadRoot = this._edgeToThreadRoot(edge);

    if (threadRoot === undefined) {
      return new ValidationError(
        "Couldn't make a ThreadRoot out of the newly created edge. Weird.",
      );
    }

    return threadRoot;
  }
}

export function useLetterboxLayer() {
  const workspace = useWorkspaceAddrFromRouter();
  const storage = useStorage(workspace);
  const [currentAuthor] = useCurrentAuthor();

  const layer = React.useMemo(() => {
    return new LetterboxLayer(storage, currentAuthor);
  }, [storage, currentAuthor]);

  return layer;
}
