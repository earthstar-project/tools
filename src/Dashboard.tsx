import * as React from "react";
import {
  useCurrentAuthor,
  useStorage,
  useWorkspaces,
  WorkspaceLabel,
} from "react-earthstar";
import { Link, Outlet, useMatch } from "react-router-dom";
import LetterboxLayer from "./letterbox-layer";
import ThreadRootItem from "./ThreadRootItem";
import { PathWorkspaceLookupContext } from "./WorkspaceLookup";

function WorkspaceSection({ workspace }: { workspace: string }) {
  console.log(workspace);

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

  console.log(match);
  console.log(lookup.addrsToPaths[workspace]);

  const isActive = lookup.addrsToPaths[workspace] === match?.params.workspace;

  console.log(isActive);

  return <Link
    to={`/${lookup.addrsToPaths[workspace]}`}
  >
    <section
      className={`flex justify-between items-baseline p-3 ${
        isActive ? "bg-blue-50" : ""
      }`}
    >
      <h2 className="text-md">
        <WorkspaceLabel address={workspace} />
      </h2>
      {unreadThreadRoots.length
        ? <div
          className="text-white bg-blue-500 px-2 py-1 rounded-full shadow-sm text-md"
        >
          {unreadThreadRoots.length}
        </div>
        : null}
    </section>
  </Link>;
}

export default function Dashboard() {
  const workspaces = useWorkspaces();

  return <div className={"h-screen w-screen grid grid-cols-app-wide"}>
    <ul className={"h-full flex-initial border-r"}>
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
