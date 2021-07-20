import * as React from "react";
import { ThreadRoot } from "./letterbox-layer";
import { AuthorLabel } from "react-earthstar";
import { formatRelative } from "date-fns";
import { Link } from "react-router-dom";
import ThreadTitle from "./ThreadTitle";

export default function ThreadRootItem({ root }: { root: ThreadRoot }) {
  return <div className="border p-2 shadow-sm mb-3">
    <Link className={""} to={`thread/${root.id}`}>
      <h1 className={"text-xl"}>
        <ThreadTitle threadId={root.id} />
      </h1>
      <div className={"my-1 text-gray-500"}>
        <b>
          <AuthorLabel address={root.doc.author} />
        </b>{" "}
        {formatRelative(root.firstPosted, Date.now())}
      </div>
    </Link>
  </div>;
}
