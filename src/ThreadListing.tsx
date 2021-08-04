import * as React from "react";
import { useCurrentAuthor, WorkspaceLabel } from "react-earthstar";
import { Link, Outlet, useMatch } from "react-router-dom";
import { useLetterboxLayer } from "./letterbox-layer";
import ThreadItem from "./ThreadRootItem";
import { useWorkspaceAddrFromRouter } from "./WorkspaceLookup";

function SpaceBar() {
  const workspace = useWorkspaceAddrFromRouter();
  const [currentAuthor] = useCurrentAuthor();

  return <div
    className="flex py-2 px-3 pl-6 bg-white dark:bg-black border-b shadow-sm justify-end sticky top-0 z-50 items-baseline dark:text-white dark:border-gray-800"
  >
    <Link className="lg:hidden mr-2 text-blue-500 text-xl" to="/">⬅</Link>
    <WorkspaceLabel
      className="flex-grow font-bold text-xl"
      address={workspace}
    />
    {currentAuthor
      ? <Link className="p-1.5 bg-blue-800 text-white rounded" to="post">
        New Thread
      </Link>
      : null}
  </div>;
}

export default function ThreadListing() {
  const letterbox = useLetterboxLayer();

  const threads = letterbox.getThreads();

  const match = useMatch("/:workspacePath/*");

  const isExactlyOnSpacePath = match?.params["*"] === "";

  return <>
    <section
      className={`border-r-2 border-gray-300 dark:border-gray-800 h-full flex flex-col overflow-scroll shadow-lg ${
        isExactlyOnSpacePath ? "block" : "hidden md:block"
      }`}
    >
      <SpaceBar />
      {threads.length === 0
        ? <div className="p-1 md:p-3 text-gray-500 text-center">
          No threads have been posted yet.
        </div>
        : <ol>
          {threads.map((thread) => {
            return <React.Fragment key={thread.root.id}>
              <li>
                <ThreadItem thread={thread} />
              </li>
              <hr className="dark:border-gray-800" />
            </React.Fragment>;
          })}
        </ol>}
    </section>
    <Outlet />
  </>;
}
