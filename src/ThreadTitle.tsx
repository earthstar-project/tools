import { useLetterboxLayer } from "./letterbox-layer";

export default function ThreadTitle(
  { threadId, workspace }: { threadId: string; workspace?: string },
) {
  const letterboxLayer = useLetterboxLayer(workspace);
  const threadTitle = letterboxLayer.getThreadTitle(threadId);

  return <>{threadTitle || "Untitled thread"}</>;
}
