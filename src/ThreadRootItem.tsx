import { Thread } from "@earthstar-project/rich-threads-layer";
import * as React from "react";
import { AuthorLabel } from "react-earthstar";
import { Link, useMatch } from "react-router-dom";
import ThreadTitle from "./ThreadTitle";
import { renderMarkdownPreview } from "./util/markdown";
import { useLetterboxLayer } from "./util/use-letterbox-layer";
import useThreadId from "./util/use-thread-id";
import { PathWorkspaceLookupContext } from "./WorkspaceLookup";

export default function ThreadItem({ thread }: { thread: Thread }) {
  const letterboxLayer = useLetterboxLayer(thread.root.doc.workspace);
  const hasUnreadPosts = letterboxLayer.threadHasUnreadPosts(thread);
  const lastThreadItem = letterboxLayer.lastThreadItem(thread);
  const lookup = React.useContext(PathWorkspaceLookupContext);

  const match = useMatch("/:workspace/thread/:pubKey/:timestamp/*");

  const isActive = thread.root.doc.author === match?.params.pubKey &&
    letterboxLayer.getThreadRootTimestamp(thread.root.doc) ===
      parseInt(match?.params.timestamp || "");

  const id = useThreadId(thread);

  const markdownMemo = React.useMemo(
    () => renderMarkdownPreview(lastThreadItem.doc.content),
    [lastThreadItem?.doc.content],
  );

  return (
    <div
      className={`px-1 md:px-2 py-3 ${
        isActive
          ? "bg-blue-100 dark:bg-blue-900"
          : !hasUnreadPosts
          ? "bg-gray-100 dark:bg-gray-900 text-gray-600"
          : "bg-white dark:bg-black"
      }`}
    >
      <Link
        className={"flex items-center gap-2"}
        to={`/${lookup.addrsToPaths[thread.root.doc.workspace]}/thread/${id}`}
      >
        <div
          className={hasUnreadPosts
            ? "flex-shrink-0 bg-blue-500 rounded-full w-3 h-3"
            : "flex-shrink-0 w-3"}
        />
        <div className="flex flex-col gap-1 flex-grow overflow-hidden overflow-ellipsis text-sm">
          <h1 className={"font-bold dark:text-white"}>
            <ThreadTitle
              workspace={thread.root.doc.workspace}
              thread={thread}
            />
          </h1>
          {lastThreadItem
            ? (
              <div className="text-gray-500 dark:text-gray-400 overflow-ellipsis overflow-hidden">
                <AuthorLabel
                  className="mr-1 text-gray-800 dark:text-gray-200"
                  address={lastThreadItem.doc.author}
                />
                {markdownMemo}
              </div>
            )
            : null}
        </div>
      </Link>
    </div>
  );
}
