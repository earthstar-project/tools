import * as React from "react";
import { ThreadRoot, useLetterboxLayer } from "./letterbox-layer";
import { AuthorLabel } from "react-earthstar";
import { Link, useMatch } from "react-router-dom";
import ThreadTitle from "./ThreadTitle";
import { renderMarkdownPreview } from "./util/markdown";
import { PathWorkspaceLookupContext } from "./WorkspaceLookup";

export default function ThreadRootItem({ root }: { root: ThreadRoot }) {
  const letterboxLayer = useLetterboxLayer(root.doc.workspace);
  const hasUnreadPosts = letterboxLayer.threadHasUnreadPosts(root.id);
  const lastReply = letterboxLayer.lastReply(root.id);
  const lookup = React.useContext(PathWorkspaceLookupContext);

  const match = useMatch("/:workspace/thread/:pubKey/:timestamp/*");

  const isActive =
    root.id === `${match?.params.pubKey}/${match?.params.timestamp}`;

  return <div
    className={`px-2 py-3 ${
      isActive ? "bg-blue-50" : !hasUnreadPosts ? "bg-gray-50 opacity-70" : ""
    }`}
  >
    <Link
      className={"flex items-center gap-2"}
      to={`/${lookup.addrsToPaths[root.doc.workspace]}/thread/${root.id}`}
    >
      <div
        className={hasUnreadPosts
          ? "flex-shrink-0 bg-blue-500 rounded-full w-3 h-3"
          : "flex-shrink-0 w-3"}
      />
      <div
        className="flex flex-col gap-1 flex-grow overflow-hidden overflow-ellipsis"
      >
        <h1 className={"text-md font-bold"}>
          <ThreadTitle workspace={root.doc.workspace} threadId={root.id} />
        </h1>
        {lastReply
          ? <div className="text-gray-500 overflow-ellipsis overflow-hidden">
            <AuthorLabel
              className="mr-1 text-gray-800"
              address={lastReply.doc.author}
            />
            {renderMarkdownPreview(lastReply.doc.content)}
          </div>
          : <div className="text-gray-500 overflow-ellipsis overflow-hidden">
            <AuthorLabel
              className="mr-1 text-gray-800"
              address={root.doc.author}
            />
            {renderMarkdownPreview(root.doc.content)}
          </div>}
      </div>
    </Link>
  </div>;
}
