import * as React from "react";
import { useCurrentIdentity, ShareLabel } from "react-earthstar";
import { Link, Outlet, useMatch } from "react-router-dom";
import ThreadItem from "./ThreadRootItem";
import { useLetterboxLayer } from "./util/use-letterbox-layer";
import { useWorkspaceAddrFromRouter } from "./WorkspaceLookup";

function SpaceBar(props: {
  onlyUnread: boolean;
  setOnlyUnread: (newVal: boolean) => void;
}) {
  const workspace = useWorkspaceAddrFromRouter();
  const [currentAuthor] = useCurrentIdentity();

  return (
    <div className="flex flex-col py-2 px-3 pl-6 bg-white dark:bg-black border-b shadow-sm justify-end sticky top-0 z-50 items-baseline dark:text-white dark:border-gray-800">
      <div className="flex justify-between items-baseline self-stretch">
        <Link className="lg:hidden mr-2 text-blue-500 text-xl" to="/">
          ⬅
        </Link>
        <ShareLabel
          className="flex-grow font-bold text-xl"
          address={workspace}
        />

        {currentAuthor ? (
          <Link className="p-1.5 bg-blue-800 text-white rounded" to="post">
            New Thread
          </Link>
        ) : null}
      </div>
      <label className="text-gray-500 dark:text-gray-300 self-end mt-1 text-sm">
        <input
          type="checkbox"
          checked={props.onlyUnread}
          onChange={() => {
            props.setOnlyUnread(!props.onlyUnread);
          }}
        />
        <span className="ml-2">Unread only</span>
      </label>
    </div>
  );
}

export default function ThreadListing() {
  const letterbox = useLetterboxLayer();

  const [onlyUnread, setOnlyUnread] = React.useState<boolean>(false);

  const threads = letterbox.getThreads();

  const threadsToUse = onlyUnread
    ? threads.filter((thread) => letterbox.threadHasUnreadPosts(thread))
    : threads;

  const match = useMatch("/:workspacePath");

  const isExactlyOnSpacePath = match !== undefined;

  return (
    <>
      <section
        className={`border-r-2 border-gray-300 dark:border-gray-800 h-full flex flex-col overflow-auto shadow-lg ${
          isExactlyOnSpacePath ? "block" : "hidden md:block"
        }`}
      >
        <SpaceBar onlyUnread={onlyUnread} setOnlyUnread={setOnlyUnread} />
        {threads.length === 0 ? (
          <div className="p-1 md:p-3 text-gray-500 text-center">
            No threads have been posted yet.
          </div>
        ) : (
          <ol>
            {threadsToUse.map((thread) => {
              return (
                <React.Fragment key={thread.root.doc.path}>
                  <li>
                    <ThreadItem thread={thread} />
                  </li>
                  <hr className="dark:border-gray-800" />
                </React.Fragment>
              );
            })}
          </ol>
        )}
      </section>
      <Outlet />
    </>
  );
}
