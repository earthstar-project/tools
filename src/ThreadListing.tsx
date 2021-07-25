import { WorkspaceLabel } from "react-earthstar";
import { Link, Outlet, useMatch } from "react-router-dom";
import { useLetterboxLayer } from "./letterbox-layer";
import ThreadRootItem from "./ThreadRootItem";
import { useWorkspaceAddrFromRouter } from "./WorkspaceLookup";

function SpaceBar() {
  const workspace = useWorkspaceAddrFromRouter();

  return <div
    className="flex py-2 px-3 md:px-3 bg-gray-100 border-b shadow-sm justify-end sticky top-0 z-50 items-baseline"
  >
    <Link className="lg:hidden mr-2 text-blue-500 text-xl" to="/">⬅</Link>
    <WorkspaceLabel
      className="flex-grow font-bold text-xl"
      address={workspace}
    />
    <Link className="p-1.5 bg-blue-800 text-white rounded" to="post">
      New Thread
    </Link>
  </div>;
}

export default function ThreadListing() {
  const letterbox = useLetterboxLayer();

  const threadRoots = letterbox.getThreadRoots();

  const match = useMatch("/:workspacePath/*");

  const isExactlyOnSpacePath = match?.params["*"] === "";

  return <>
    <section
      className={`border-r-2 border-gray-300 h-full flex flex-col overflow-scroll shadow-lg ${
        isExactlyOnSpacePath ? "block" : "hidden md:block"
      }`}
    >
      <SpaceBar />
      {threadRoots.length === 0
        ? <div className="p-1 md:p-3 text-gray-500 text-center">
          No threads have been posted yet.
        </div>
        : <ol>
          {letterbox.getThreadRoots().map((threadRoot) => {
            return <>
              <li key={threadRoot.id}>
                <ThreadRootItem root={threadRoot} />
              </li>
              <hr />
            </>;
          })}
        </ol>}
    </section>
    <Outlet />
  </>;
}
