import * as React from "react";
import {
  useCurrentAuthor,
  useStorage,
  useWorkspaces,
  WorkspaceLabel,
} from "react-earthstar";
import { Link, Outlet, useMatch } from "react-router-dom";
import LetterboxLayer from "./letterbox-layer";
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

  return <Link
    to={`/${workspacePath}`}
  >
    <section
      className={`flex justify-between items-baseline p-3 text-base sm:text-sm ${
        isActive
          ? "bg-blue-100"
          : unreadThreadRoots.length === 0
          ? "bg-gray-100"
          : ""
      }`}
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
        <Link to={`/${workspacePath}/settings`}>⚙️</Link>
      </div>
    </section>
  </Link>;
}

export default function Dashboard() {
  const workspaces = useWorkspaces();

  // if size is less than lg AND path is not '/' this should be hidden.

  const rootMatch = useMatch("/");
  const workspaceMatch = useMatch("/:workspace/*");

  const isExactlyAtRoot = rootMatch?.path === "/";
  const isExactlyAtWorkspace = workspaceMatch?.params.workspace &&
    workspaceMatch?.params["*"] === "";

  return <div
    className={"w-screen flex-grow grid lg:grid-cols-app-lg md:grid-cols-app-md app border-t md:h-app-md"}
  >
    <ul
      className={`h-full flex-initial border-r-2 border-gray-300 display-none ${
        isExactlyAtRoot
          ? `block`
          : isExactlyAtWorkspace
          ? "hidden md:block"
          : "hidden lg:block"
      }`}
    >
      {workspaces.map((addr) =>
        <React.Fragment key={addr}>
          <li>
            <WorkspaceSection workspace={addr} />
          </li>
          <hr />
        </React.Fragment>
      )}
    </ul>
    <Outlet />
  </div>;
}
