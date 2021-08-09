import { useCurrentAuthor, useStorage } from "react-earthstar";
import { useWorkspaceAddrFromRouter } from "../WorkspaceLookup";

import LetterboxLayer from '@earthstar-project/rich-threads-layer'

export function useLetterboxLayer(workspaceAddress?: string) {
  const inferredWorkspace = useWorkspaceAddrFromRouter();

  const storage = useStorage(workspaceAddress || inferredWorkspace);
  const [currentAuthor] = useCurrentAuthor();

  const layer = new LetterboxLayer(storage, currentAuthor);

  return layer;
}
