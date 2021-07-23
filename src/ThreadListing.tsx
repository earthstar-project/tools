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
        : <p className="p-3 text-gray-500 text-center">You must sign in to post threads.</p>}
      <hr />
      {threadRoots.length === 0
        ? <div className="p-3 text-gray-500 text-center">No threads have been posted yet.</div>
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
