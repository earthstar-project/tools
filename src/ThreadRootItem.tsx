import * as React from "react";
import { Thread, ThreadRoot, useLetterboxLayer } from "./letterbox-layer";
import { AuthorLabel } from "react-earthstar";
import { Link, useMatch } from "react-router-dom";
import ThreadTitle from "./ThreadTitle";
import { renderMarkdownPreview } from "./util/markdown";
import { PathWorkspaceLookupContext } from "./WorkspaceLookup";

export default function ThreadItem({ thread }: { thread: Thread }) {
  const letterboxLayer = useLetterboxLayer(thread.root.doc.workspace);
  const hasUnreadPosts = letterboxLayer.threadHasUnreadPosts(thread);
  const lastThreadItem = letterboxLayer.lastThreadItem(thread);
  const lookup = React.useContext(PathWorkspaceLookupContext);

  const match = useMatch("/:workspace/thread/:pubKey/:timestamp/*");

  const isActive =
    thread.root.id === `${match?.params.pubKey}/${match?.params.timestamp}`;

  const markdownMemo = React.useMemo(
    () => renderMarkdownPreview(lastThreadItem?.doc.content || ""),
    [lastThreadItem?.doc.content],
  );

  return <div
    className={`px-1 md:px-2 py-3 ${
      isActive
        ? "bg-blue-100"
        : !hasUnreadPosts
        ? "bg-gray-100 text-gray-600"
        : ""
    }`}
  >
    <Link
      className={"flex items-center gap-2"}
      to={`/${
        lookup.addrsToPaths[thread.root.doc.workspace]
      }/thread/${thread.root.id}`}
    >
      <div
        className={hasUnreadPosts
          ? "flex-shrink-0 bg-blue-500 rounded-full w-3 h-3"
          : "flex-shrink-0 w-3"}
      />
      <div
        className="flex flex-col gap-1 flex-grow overflow-hidden overflow-ellipsis text-sm"
      >
        <h1 className={"font-bold"}>
          <ThreadTitle
            workspace={thread.root.doc.workspace}
            thread={thread}
          />
        </h1>
        {lastThreadItem
          ? <div className="text-gray-500 overflow-ellipsis overflow-hidden">
            <AuthorLabel
              className="mr-1 text-gray-800"
              address={lastThreadItem.doc.author}
            />
            {markdownMemo}
          </div>
          : null}
      </div>
    </Link>
  </div>;
}
