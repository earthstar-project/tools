import * as React from "react";
import { useCurrentAuthor } from "react-earthstar";
import { Link } from "react-router-dom";
import { useLetterboxLayer } from "./letterbox-layer";
import ThreadRootItem from "./ThreadRootItem";

export default function ThreadListing() {
  const letterbox = useLetterboxLayer();
  const [currentAuthor] = useCurrentAuthor();

  const threadRoots = letterbox.getThreadRoots();

  return <div>
    {currentAuthor
      ? <Link className={"link-btn"} to={"post"}>
        New thread
      </Link>
      : <p>You must sign in to post threads.</p>}
    {threadRoots.length === 0
      ? <div className="py-3">No threads have been posted yet.</div>
      : <ol className="my-3">
        {letterbox.getThreadRoots().map((threadRoot) => {
          return <li key={threadRoot.id}>
            <ThreadRootItem root={threadRoot} />
          </li>;
        })}
      </ol>}
  </div>;
}
