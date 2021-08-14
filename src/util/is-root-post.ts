import { Document } from 'earthstar'

export default function isRootPost(doc: Document) {
  return doc.path.startsWith(`/letterbox/rootthread`);
}