import * as React from "react";
import { ThreadRoot, useLetterboxLayer } from "./letterbox-layer";
import { AuthorLabel } from "react-earthstar";
import { Link } from "react-router-dom";
import ThreadTitle from "./ThreadTitle";
import { renderMarkdownPreview } from "./util/markdown";
import { PathWorkspaceLookupContext } from "./WorkspaceLookup";

export default function ThreadRootItem({ root }: { root: ThreadRoot }) {
  const letterboxLayer = useLetterboxLayer(root.doc.workspace);
  const hasUnreadPosts = letterboxLayer.threadHasUnreadPosts(root.id);
  const lastReply = letterboxLayer.lastReply(root.id);
  const lookup = React.useContext(PathWorkspaceLookupContext);

  return <div className="border p-2 shadow-sm mb-3">
    <Link
      className={"flex items-center gap-2"}
      to={`/${lookup.addrsToPaths[root.doc.workspace]}/thread/${root.id}`}
    >
      <div
        className={hasUnreadPosts ? "bg-blue-500 rounded-full w-3 h-3" : "w-3"}
      />
      <div className="flex flex-col gap-1 flex-grow">
        <h1 className={"text-xl"}>
          <ThreadTitle workspace={root.doc.workspace} threadId={root.id} />
        </h1>
        <hr />
        {lastReply
          ? <div className="text-gray-500">
            <AuthorLabel
              className="mr-1 text-gray-800"
              address={lastReply.doc.author}
            />
            {renderMarkdownPreview(lastReply.doc.content)}
          </div>
          : <div className="text-gray-500">
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
