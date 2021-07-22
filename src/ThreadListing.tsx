import * as React from "react";
import { useCurrentAuthor } from "react-earthstar";
import { Link, Outlet } from "react-router-dom";
import { useLetterboxLayer } from "./letterbox-layer";
import ThreadRootItem from "./ThreadRootItem";

export default function ThreadListing() {
  const letterbox = useLetterboxLayer();
  const [currentAuthor] = useCurrentAuthor();

  const threadRoots = letterbox.getThreadRoots();

  return <>
    <section className="border-r h-full flex flex-col">
      {currentAuthor
        ? <Link className={"link-btn m-2 text-center"} to={"post"}>
          New thread
        </Link>
        : <p>You must sign in to post threads.</p>}
      <hr />
      {threadRoots.length === 0
        ? <div className="py-3">No threads have been posted yet.</div>
        : <ol>
          {letterbox.getThreadRoots().map((threadRoot) => {
            return <>
              <li key={threadRoot.id}>
                <ThreadRootItem root={threadRoot} />
              </li>
              <hr />
            </>;
          })}
        </ol>}
    </section>
    <Outlet />
  </>;
}
