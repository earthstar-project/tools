import * as React from "react";
import {
  IdentityLabel,
  ShareLabel,
  useIdentity,
  usePeer,
} from "react-earthstar";
import { Link, Outlet, useMatch } from "react-router-dom";
import { PathWorkspaceLookupContext } from "./WorkspaceLookup";
import { useLetterboxLayer } from "./util/use-letterbox-layer";

const WorkspaceSectionMemo = React.memo(WorkspaceSection);

function WorkspaceSection({ workspace }: { workspace: string }) {
  const layer = useLetterboxLayer(workspace);

  const unreadThreadRoots = layer
    .getThreads()
    .filter((thread) => layer.threadHasUnreadPosts(thread));

  const lookup = React.useContext(PathWorkspaceLookupContext);

  const match = useMatch("/:workspace/*");

  const isActive = lookup.addrsToPaths[workspace] === match?.params.workspace;

  const sharePath = lookup.addrsToPaths[workspace];

  return (
    <section
      className={`flex items-baseline text-base sm:text-sm space-x-1 ${
        isActive
          ? "bg-blue-100 dark:bg-blue-900"
          : unreadThreadRoots.length === 0
          ? "bg-gray-100 dark:bg-gray-900"
          : ""
      }`}
    >
      <Link
        to={`/${sharePath}`}
        className="flex flex-grow items-baseline justify-between p-2 pr-0"
      >
        <h2>
          <ShareLabel address={workspace} />
        </h2>
        <div className="flex items-baseline space-x-1">
          {unreadThreadRoots.length
            ? (
              <div className="text-white bg-blue-500 px-2 py-1 rounded-full shadow-sm">
                {unreadThreadRoots.length}
              </div>
            )
            : null}
        </div>
      </Link>
      <Link to={`/${sharePath}/settings`}>⚙️</Link>
    </section>
  );
}

function IdentityBar() {
  const [identity] = useIdentity();

  return (
    <Link
      to={`/settings`}
      className="border-t p-2 text-sm block dark:border-gray-800"
    >
      {identity ? <IdentityLabel address={identity.address} /> : "Anonymous"}
    </Link>
  );
}

export default function Dashboard() {
  const peer = usePeer();
  const shares = peer.shares();

  // if size is less than lg AND path is not '/' this should be hidden.

  const rootMatch = useMatch("/");
  const workspaceMatch = useMatch("/:workspace");

  const isExactlyAtRoot = rootMatch?.pathname === "/";
  const isOneLevelDeep = workspaceMatch?.params.workspace;

  const isAtWorkspace = ["add", "join"].includes(
    workspaceMatch?.params.workspace || "",
  );

  return (
    <div
      className={"w-screen flex-grow grid lg:grid-cols-app-lg md:grid-cols-app-md app border-t h-app"}
    >
      <div
        className={`h-full flex flex-col justify-between flex-initial border-r-2 border-gray-300 dark:border-gray-700 text-black dark:text-white items-stretch justify-between ${
          isExactlyAtRoot
            ? "block"
            : isOneLevelDeep && isAtWorkspace
            ? "hidden md:flex"
            : "hidden lg:flex"
        }`}
      >
        <ul>
          {shares.map((addr) => (
            <React.Fragment key={addr}>
              <li>
                <WorkspaceSectionMemo workspace={addr} />
              </li>
              <hr className="dark:border-gray-800" />
            </React.Fragment>
          ))}
          <div>
            <Link className="block p-2 text-gray-500 text-sm" to="/add">
              Add a share
            </Link>
          </div>
        </ul>
        <IdentityBar />
      </div>
      <Outlet />
    </div>
  );
}
