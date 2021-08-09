import * as React from "react";
import {
  useCurrentAuthor,
  useStorage,
  useWorkspaces,
  WorkspaceLabel,
} from "react-earthstar";
import { Link, Outlet, useMatch } from "react-router-dom";
import LetterboxLayer from "@earthstar-project/rich-threads-layer";
import { PathWorkspaceLookupContext } from "./WorkspaceLookup";

function WorkspaceSection({ workspace }: { workspace: string }) {
  const storage = useStorage(workspace);
  const [currentAuthor] = useCurrentAuthor();

  const layer = React.useMemo(() => {
    return new LetterboxLayer(storage, currentAuthor);
  }, [storage, currentAuthor]);

  const unreadThreadRoots = layer.getThreads().filter((thread) =>
    layer.threadHasUnreadPosts(thread)
  );

  const lookup = React.useContext(PathWorkspaceLookupContext);

  const match = useMatch("/:workspace/*");

  const isActive = lookup.addrsToPaths[workspace] === match?.params.workspace;

  const workspacePath = lookup.addrsToPaths[workspace];

  return <section
    className={`flex items-baseline text-base sm:text-sm space-x-1 ${
      isActive
        ? "bg-blue-100 dark:bg-blue-900"
        : unreadThreadRoots.length === 0
        ? "bg-gray-100 dark:bg-gray-900"
        : ""
    }`}
  >
    <Link
      to={`/${workspacePath}`}
      className="flex flex-grow items-baseline justify-between p-2 pr-0"
    >
      <h2>
        <WorkspaceLabel address={workspace} />
      </h2>
      <div className="flex items-baseline space-x-1">
        {unreadThreadRoots.length
          ? <div
            className="text-white bg-blue-500 px-2 py-1 rounded-full shadow-sm"
          >
            {unreadThreadRoots.length}
          </div>
          : null}
      </div>
    </Link>
    <Link to={`/${workspacePath}/settings`}>⚙️</Link>
  </section>;
}

export default function Dashboard() {
  const workspaces = useWorkspaces();

  // if size is less than lg AND path is not '/' this should be hidden.

  const rootMatch = useMatch("/");
  const workspaceMatch = useMatch("/:workspace/*");

  const isExactlyAtRoot = rootMatch?.path === "/";
  const isOneLevelDeep = workspaceMatch?.params.workspace;

  const isAtWorkspace = ["add", "join", "settings"].includes(
    workspaceMatch?.params.workspace || "",
  );

  return <div
    className={"w-screen flex-grow grid lg:grid-cols-app-lg md:grid-cols-app-md app border-t h-app"}
  >
    <ul
      className={`h-full flex-initial border-r-2 border-gray-300 dark:border-gray-700 text-black dark:text-white ${
        isExactlyAtRoot
          ? "block"
          : isOneLevelDeep && isAtWorkspace
          ? "hidden md:block"
          : "hidden lg:block"
      }`}
    >
      {workspaces.map((addr) =>
        <React.Fragment key={addr}>
          <li>
            <WorkspaceSection workspace={addr} />
          </li>
          <hr className="dark:border-gray-800" />
        </React.Fragment>
      )}
      <div>
        <Link className="block p-2 text-gray-500 text-sm" to="/add">
          Add a space
        </Link>
      </div>
    </ul>
    <Outlet />
  </div>;
}
