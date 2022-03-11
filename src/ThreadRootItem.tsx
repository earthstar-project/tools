import * as React from "react";
import { IdentityLabel } from "react-earthstar";
import { Link, useMatch } from "react-router-dom";
import ThreadTitle from "./ThreadTitle";
import { renderMarkdownPreview } from "./util/markdown";
import { useLetterboxLayer } from "./util/use-letterbox-layer";
import { PathWorkspaceLookupContext } from "./WorkspaceLookup";

function PostPreview({ content }: { content: string }) {
  const markdownMemo = React.useMemo(
    () => renderMarkdownPreview(content),
    [content],
  );

  return <>{markdownMemo}</>
}

export default function ThreadItem({ author, timestamp }: { author: string, timestamp: number }) {
  const letterboxLayer = useLetterboxLayer();

  const thread = letterboxLayer.getThread(timestamp, author);

  const id = `${author}/${timestamp}`;
  const hasUnreadPosts = thread ? letterboxLayer.threadHasUnreadPosts(thread) : false;
  const lastThreadItem = thread ? letterboxLayer.lastThreadItem(thread) : null;
  const lookup = React.useContext(PathWorkspaceLookupContext);

  const match = useMatch("/:workspace/thread/:pubKey/:timestamp/*");

  const isActive = author === match?.params.pubKey &&
    timestamp ===
    parseInt(match?.params.timestamp || "");

  return (
    thread ?
      <div
        className={`px-1 md:px-2 py-3 ${isActive
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
                  <IdentityLabel
                    className="mr-1 text-gray-800 dark:text-gray-200"
                    address={lastThreadItem.doc.author}
                  />
                  <PostPreview content={lastThreadItem.doc.content} />
                </div>
              )
              : null}
          </div>
        </Link>
      </div> : null
  );
}

