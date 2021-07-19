import * as React from "react";
import { useWorkspaces, WorkspaceLabel } from "react-earthstar";
import { Link } from "react-router-dom";
import { PathWorkspaceLookupContext } from "./WorkspaceLookup";

export default function Dashboard() {
  const workspaces = useWorkspaces();
  const lookup = React.useContext(PathWorkspaceLookupContext);

  return <div>
    <ul>
      {workspaces.map((addr) =>
        <li key={addr}>
          <Link to={`/${lookup.addrsToPaths[addr]}`}>
            <WorkspaceLabel address={addr} />
          </Link>
        </li>
      )}
    </ul>
  </div>;
}
