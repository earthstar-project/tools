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
  const unreadThreadRoots = layer.getThreadRoots().filter((root) =>
    layer.threadHasUnreadPosts(root.id)
  );

  const lookup = React.useContext(PathWorkspaceLookupContext);

  const match = useMatch("/:workspace/*");

  const isActive = lookup.addrsToPaths[workspace] === match?.params.workspace;

  const workspacePath = lookup.addrsToPaths[workspace];

  return <Link
    to={`/${workspacePath}`}
  >
    <section
      className={`flex justify-between items-baseline p-3 ${
        isActive ? "bg-blue-50" : ""
      }`}
    >
      <h2 className="text-md">
        <WorkspaceLabel address={workspace} />
      </h2>
      <div className="flex items-baseline space-x-1">
        {unreadThreadRoots.length
          ? <div
            className="text-white bg-blue-500 px-2 py-1 rounded-full shadow-sm text-md"
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

  return <div className={"w-screen flex-grow grid grid-cols-app-wide border-t"}>
    <ul className={"h-full flex-initial border-r border-gray-300"}>
      <header className="bg-blue-800 text-white p-3">📮 Letterbox</header>
      {workspaces.map((addr) =>
        <>
          <li key={addr}>
            <WorkspaceSection workspace={addr} />
          </li>
          <hr />
        </>
      )}
    </ul>
    <Outlet />
  </div>;
}
