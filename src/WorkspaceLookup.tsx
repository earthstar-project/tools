import { ParsedAddress, parseShareAddress, ShareAddress } from "earthstar";
import * as React from "react";
import { usePeer } from "react-earthstar";
import { useParams } from "react-router-dom";

type PathToWorkspaceLookup = Record<string, ShareAddress>;
type WorkspaceToPathLookup = Record<ShareAddress, string>;
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
  const peer = usePeer();
  const shares = peer.shares();

  const pathsToAddrs = shares.reduce((lookup, workspaceAddr) => {
    const { name } = parseShareAddress(
      workspaceAddr,
    ) as ParsedAddress;

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

  return (
    <PathWorkspaceLookupContext.Provider
      value={{ addrsToPaths, pathsToAddrs }}
    >
      {children}
    </PathWorkspaceLookupContext.Provider>
  );
}

export function useWorkspaceAddrFromRouter() {
  const { workspaceLookup } = useParams();

  const lookup = React.useContext(PathWorkspaceLookupContext);
  
  console.log({lookup})

  return lookup.pathsToAddrs[workspaceLookup || ""];
}
