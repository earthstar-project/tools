import * as React from "react";
import { useLetterboxLayer } from "./letterbox-layer";

export default function ThreadTitle({ threadId }: { threadId: string }) {
  const letterboxLayer = useLetterboxLayer();
  const threadTitle = letterboxLayer.getThreadTitle(threadId);

  if (!threadTitle) {
    return null;
  }

  return <>{threadTitle}</>;
}
