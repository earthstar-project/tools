import * as React from "react";
import { useLetterboxLayer } from "./letterbox-layer";

export default function ThreadTitle(
  { threadId, workspace }: { threadId: string; workspace?: string },
) {
  const letterboxLayer = useLetterboxLayer(workspace);
  const threadTitle = letterboxLayer.getThreadTitle(threadId);

  if (!threadTitle) {
    return null;
  }

  return <>{threadTitle}</>;
}
