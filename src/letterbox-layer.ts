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
};

export type Tag = {
  id: string;
  label: string;
};

export type ThreadRoot = {
  id: string;
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
const KIND_HAS_REPLY = "HAS_REPLY";
const KIND_READ_THREAD_UP_TO = "READ_THREAD_UP_TO";

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
  }

  _docToThreadRoot(rootDoc: Document): ThreadRoot {
    const publishedTimestamp = getDocPublishedTimestamp(rootDoc);

    const tagEdges = findEdgesSync(this._storage, {
      appName: APP_NAME,
      source: rootDoc.path,
      owner: rootDoc.author,
      kind: KIND_TAGGED_WITH,
    });

    if (isErr(tagEdges)) {
      console.group("LetterboxLayer Error");
      console.warn(
        `Something went wrong when trying to retrieve tags for ${rootDoc.path}`,
      );
      console.warn(tagEdges);
      console.groupEnd();
    }

    return {
      id: `${rootDoc.author}/${publishedTimestamp}`,
      doc: rootDoc,
      firstPosted: new Date(publishedTimestamp / 1000),
      tags: isErr(tagEdges)
        ? []
        : tagEdges.map(this._edgeToTag, this).filter(onlyDefined),
    };
  }

  _docToPost(postDoc: Document): Post {
    const publishedTimestamp = getDocPublishedTimestamp(postDoc);

    return {
      doc: postDoc,
      firstPosted: new Date(publishedTimestamp / 1000),
    };
  }

  _edgeToTag(edgeDoc: Document): Tag | undefined {
    const edgeContent: GraphEdgeContent = JSON.parse(edgeDoc.content);

    const tagContent = this._storage.getContent(edgeContent.dest);

    return tagContent ? JSON.parse(tagContent) : undefined;
  }

  _edgeToThreadRoot(edgeDoc: Document): ThreadRoot | undefined {
    const edgeContent: GraphEdgeContent = JSON.parse(edgeDoc.content);

    const doc = this._storage.getDocument(edgeContent.dest);

    if (doc) {
      return this._docToThreadRoot(doc);
    }

    return undefined;
  }

  _edgeToPost(edgeDoc: Document): Post | undefined {
    const edgeContent: GraphEdgeContent = JSON.parse(edgeDoc.content);

    const postDoc = this._storage.getDocument(edgeContent.dest);

    if (postDoc) {
      return this._docToPost(postDoc);
    }

    return undefined;
  }

  _createPostDoc(
    content: string,
    deleteAfter?: number,
  ): string | ValidationError {
    if (!this._user) {
      return new ValidationError(
        "Couldn't create post document without a known user.",
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

    return isErr(result) ? result : path;
  }

  getThreadTitle(id: string): string | undefined {
    const thread = this.getThread(id);

    if (!thread) {
      return undefined;
    }

    const { content } = thread.root.doc;

    const [firstLine] = content.split("\n");

    if (!firstLine || !firstLine.startsWith("# ")) {
      return undefined;
    }

    return firstLine.substring(2);
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
    ).sort((aRoot, bRoot) => aRoot.firstPosted < bRoot.firstPosted ? 1 : -1);
  }

  createThread(
    content: string,
    deleteAfter?: number,
  ): ThreadRoot | ValidationError {
    const maybePath = this._createPostDoc(content, deleteAfter);

    if (isErr(maybePath)) {
      console.error(maybePath);

      return maybePath;
    }

    if (!this._user) {
      return new ValidationError(
        "Couldn't create post document without a known user.",
      );
    }

    const edgeResult = writeEdgeSync(this._storage, this._user, {
      appName: APP_NAME,
      source: this._storage.workspace,
      dest: maybePath,
      owner: this._user.address,
      kind: KIND_HAS_THREAD,
    });

    if (isErr(edgeResult)) {
      console.error(maybePath);

      return edgeResult;
    }

    const hopefullyAnEdge = findEdgesSync(this._storage, {
      appName: APP_NAME,
      source: this._storage.workspace,
      dest: maybePath,
    });

    if (isErr(hopefullyAnEdge)) {
      console.error(maybePath);

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

    this.markReadUpTo(threadRoot.id, threadRoot.doc.timestamp);

    return threadRoot;
  }

  getThread(id: string): Thread | undefined {
    const threadRootDoc = this._storage.getDocument(`/letterbox/~${id}.md`);

    if (!threadRootDoc) {
      return undefined;
    }

    const replyEdges = findEdgesSync(this._storage, {
      appName: APP_NAME,
      source: threadRootDoc.path,
      kind: KIND_HAS_REPLY,
    });

    if (isErr(replyEdges)) {
      console.warn(
        `Something went wrong when getting the replies for ${threadRootDoc.path}`,
      );
      return undefined;
    }

    const replies = replyEdges.map(this._edgeToPost, this).filter(onlyDefined)
      .sort((aPost, bPost) => aPost.firstPosted < bPost.firstPosted ? -1 : 1);

    return {
      root: this._docToThreadRoot(threadRootDoc),
      replies,
    };
  }

  createReply(
    threadId: string,
    content: string,
    deleteAfter?: number,
  ): Post | ValidationError {
    const maybePath = this._createPostDoc(content, deleteAfter);

    if (isErr(maybePath)) {
      console.error(maybePath);

      return maybePath;
    }

    if (!this._user) {
      return new ValidationError(
        "Couldn't create reply without a known user.",
      );
    }

    const edgeResult = writeEdgeSync(this._storage, this._user, {
      appName: APP_NAME,
      source: `/letterbox/~${threadId}.md`,
      dest: maybePath,
      owner: this._user.address,
      kind: KIND_HAS_REPLY,
    });

    if (isErr(edgeResult)) {
      console.group("LetterboxLayer");
      console.error(
        `Something went wrong when creating a reply for ${threadId}`,
      );
      console.error(edgeResult);
      console.groupEnd();

      return edgeResult;
    }

    const hopefullyReplyDoc = this._storage.getDocument(maybePath);

    if (!hopefullyReplyDoc) {
      return new ValidationError(
        "Couldn't get the reply which was just created. Weird.",
      );
    }

    this.markReadUpTo(threadId, hopefullyReplyDoc.timestamp);

    return this._docToPost(hopefullyReplyDoc);
  }

  isUnread(threadId: string, timestamp: number): boolean {
    if (!this._user) {
      return false;
    }

    const readUpToEdges = findEdgesSync(this._storage, {
      appName: APP_NAME,
      source: this._user.address,
      owner: this._user.address,
      dest: `/letterbox/~${threadId}.md`,
      kind: KIND_READ_THREAD_UP_TO,
    });

    if (isErr(readUpToEdges)) {
      return false;
    }

    const [readUpToEdge] = readUpToEdges;

    if (!readUpToEdge) {
      return true;
    }

    const edgeContent: GraphEdgeContent = JSON.parse(readUpToEdge.content);

    return timestamp > edgeContent.data;
  }

  threadHasUnreadPosts(threadId: string): boolean {
    const thread = this.getThread(threadId);

    if (!thread) {
      return false;
    }

    if (!this._user) {
      return false;
    }

    const readUpToEdges = findEdgesSync(this._storage, {
      appName: APP_NAME,
      source: this._user.address,
      owner: this._user.address,
      dest: `/letterbox/~${threadId}.md`,
      kind: KIND_READ_THREAD_UP_TO,
    });

    if (isErr(readUpToEdges)) {
      return false;
    }

    const [readUpToEdge] = readUpToEdges;

    if (!readUpToEdge) {
      return true;
    }

    return [thread.root, ...thread.replies].map(({ doc }) => doc).some(
      (doc) => {
        return this.isUnread(threadId, getDocPublishedTimestamp(doc));
      },
    );
  }

  markReadUpTo(threadId: string, timestamp: number) {
    if (!this._user) {
      return;
    }

    const result = writeEdgeSync(this._storage, this._user, {
      appName: APP_NAME,
      kind: KIND_READ_THREAD_UP_TO,
      owner: this._user.address,
      source: this._user.address,
      dest: `/letterbox/~${threadId}.md`,
    }, timestamp);

    if (isErr(result)) {
      console.warn(
        `Something went wrong marking ${threadId} as read`,
      );
    }
  }

  lastReply(threadId: string): Post | undefined {
    const thread = this.getThread(threadId);

    if (!thread) {
      return undefined;
    }

    if (thread.replies.length === 0) {
      return undefined;
    }

    return thread.replies[thread.replies.length - 1];
  }
}

export function useLetterboxLayer(workspaceAddress?: string) {
  const inferredWorkspace = useWorkspaceAddrFromRouter();

  const storage = useStorage(workspaceAddress || inferredWorkspace);
  const [currentAuthor] = useCurrentAuthor();

  const layer = React.useMemo(() => {
    return new LetterboxLayer(storage, currentAuthor);
  }, [storage, currentAuthor]);

  return layer;
}
