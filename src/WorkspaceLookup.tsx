import { ValidatorEs4, WorkspaceAddress, WorkspaceParsed } from "earthstar";
import * as React from "react";
import { useWorkspaces } from "react-earthstar";
import { useParams } from "react-router-dom";

type PathToWorkspaceLookup = Record<string, WorkspaceAddress>;
type WorkspaceToPathLookup = Record<WorkspaceAddress, string>;
type Lookup = {
  pathsToAddrs: PathToWorkspaceLookup;
  addrsToPaths: WorkspaceToPathLookup;
};

export const PathWorkspaceLookupContext = React.createContext<Lookup>({
  addrsToPaths: {},
  pathsToAddrs: {},
});

export default function WorkspaceLookup(
  { children }: { children: React.ReactNode },
) {
  const workspaces = useWorkspaces();

  const pathsToAddrs = workspaces.reduce((lookup, workspaceAddr) => {
    const { name } = ValidatorEs4.parseWorkspaceAddress(
      workspaceAddr,
    ) as WorkspaceParsed;

    if (lookup[name]) {
      return {
        ...lookup,
        [workspaceAddr]: workspaceAddr,
      };
    }

    return {
      ...lookup,
      [name]: workspaceAddr,
    };
  }, {} as PathToWorkspaceLookup);

  const addrsToPaths = Object.entries(pathsToAddrs).reduce(
    (lookup, [path, addr]) => {
      return {
        ...lookup,
        [addr]: path,
      };
    },
    {} as WorkspaceToPathLookup,
  );

  return <PathWorkspaceLookupContext.Provider
    value={{ addrsToPaths, pathsToAddrs }}
  >
    {children}
  </PathWorkspaceLookupContext.Provider>;
}

export function useWorkspaceAddrFromRouter() {
  const { workspaceLookup } = useParams();
  const lookup = React.useContext(PathWorkspaceLookupContext);

  return lookup.pathsToAddrs[workspaceLookup || ''];
}
