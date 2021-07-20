import * as React from "react";
import { ThreadRoot } from "./letterbox-layer";
import { micromark } from "micromark";
import { AuthorLabel } from "react-earthstar";
import { formatRelative } from "date-fns";
import { Link } from "react-router-dom";

export default function ThreadRootItem({ root }: { root: ThreadRoot }) {
  const [firstLine] = root.doc.content.split("\n");

  const excerpt = firstLine.slice(0, 140);

  const html = micromark(excerpt);

  return <Link to={`thread/${root.id}`}>
    <div dangerouslySetInnerHTML={{ __html: html }} />
    <div>
      <b>
        <AuthorLabel address={root.doc.author} />
      </b>{" "}
      {formatRelative(root.firstPosted, Date.now())}
    </div>
  </Link>;
}
