import * as React from "react";
import { useWorkspaces, WorkspaceLabel } from "react-earthstar";
import { Link } from "react-router-dom";
import { PathWorkspaceLookupContext } from "./WorkspaceLookup";

export default function Dashboard() {
  const workspaces = useWorkspaces();
  const lookup = React.useContext(PathWorkspaceLookupContext);

  return <div className={"p-3"}>
    <header className={"mb-3"}>
      <h1 className={"text-2xl"}>Letterbox</h1>
    </header>
    <ul>
      {workspaces.map((addr) =>
        <li key={addr}>
          <Link
            className={"underline text-blue-600"}
            to={`/${lookup.addrsToPaths[addr]}`}
          >
            <WorkspaceLabel address={addr} />
          </Link>
        </li>
      )}
    </ul>
  </div>;
}
