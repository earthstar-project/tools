import { Thread } from "@earthstar-project/rich-threads-layer";
import { useLetterboxLayer } from "./util/use-letterbox-layer";


export default function ThreadTitle(
  { thread, workspace }: { thread: Thread; workspace?: string },
) {
  const letterboxLayer = useLetterboxLayer(workspace);
  const threadTitle = letterboxLayer.getThreadTitle(thread);

  return <>{threadTitle || "Untitled thread"}</>;
}
