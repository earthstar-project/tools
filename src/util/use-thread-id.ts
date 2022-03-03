import { Thread } from "@earthstar-project/rich-threads-layer";
import { useLetterboxLayer } from "./use-letterbox-layer";

export default function useThreadId(thread: Thread) {
  const layer = useLetterboxLayer();
  const author = thread.root.doc.author;
  const timestamp = layer.getThreadRootTimestamp(thread.root.doc);
  return `${author}/${timestamp}`;
}
