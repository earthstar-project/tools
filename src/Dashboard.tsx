import * as React from "react";
import {
  useCurrentAuthor,
  useStorage,
  useWorkspaces,
  WorkspaceLabel,
} from "react-earthstar";
import { Link } from "react-router-dom";
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
  ).splice(0, 3);

  const lookup = React.useContext(PathWorkspaceLookupContext);

  return <section>
    <header className={"border-b mb-3 flex justify-between"}>
      <h2 className="text-xl mb-2">
        <Link
          className={"underline text-blue-600"}
          to={`/${lookup.addrsToPaths[workspace]}`}
        >
          <WorkspaceLabel address={workspace} />
        </Link>
      </h2>
    </header>

    {unreadThreadRoots.length > 0
      ? <>
        <h2 className="mb-1 font-bold">New posts</h2>
        <ol>
          {unreadThreadRoots.splice(0, 3).map((root) =>
            <ThreadRootItem root={root} />
          )}
        </ol>
        {unreadThreadRoots.length > 3
          ? <Link
            className={"underline text-blue-600"}
            to={lookup.addrsToPaths[workspace]}
          >
            {`And ${unreadThreadRoots.length - 3} more.`}
          </Link>
          : null}
      </>
      : <div>Nothing new.</div>}
  </section>;
}

export default function Dashboard() {
  const workspaces = useWorkspaces();

  return <div className={"p-3"}>
    <header className={"mb-3"}>
      <h1 className={"text-2xl"}>Letterbox</h1>
    </header>
    <ul className={"space-y-8"}>
      {workspaces.map((addr) =>
        <li key={addr}>
          <WorkspaceSection workspace={addr} />
        </li>
      )}
    </ul>
  </div>;
}
