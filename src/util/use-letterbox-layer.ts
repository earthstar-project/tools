import * as React from "react";
import { useCurrentIdentity, useReplica } from "react-earthstar";
import { useWorkspaceAddrFromRouter } from "../WorkspaceLookup";

import {LetterboxLayerCache} from "@earthstar-project/rich-threads-layer";

export function useLetterboxLayer(workspaceAddress?: string) {
  const inferredWorkspace = useWorkspaceAddrFromRouter();

  const replica = useReplica(workspaceAddress || inferredWorkspace);

  const [currentAuthor] = useCurrentIdentity();

  const layer = new LetterboxLayerCache(replica, currentAuthor);

  return layer;
}
