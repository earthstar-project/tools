import { Thread, useLetterboxLayer } from "./letterbox-layer";

export default function ThreadTitle(
  { thread, workspace }: { thread: Thread; workspace?: string },
) {
  const letterboxLayer = useLetterboxLayer(workspace);
  const threadTitle = letterboxLayer.getThreadTitle(thread);

  return <>{threadTitle || "Untitled thread"}</>;
}
