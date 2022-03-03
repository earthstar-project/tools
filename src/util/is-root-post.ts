import { Doc } from "earthstar";

export default function isRootPost(doc: Doc) {
  return doc.path.startsWith(`/letterbox/rootthread`);
}
