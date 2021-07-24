import { Link, Outlet } from "react-router-dom";
import { useLetterboxLayer } from "./letterbox-layer";
import ThreadRootItem from "./ThreadRootItem";

function SpaceBar() {
  return <div
    className="flex  p-3 bg-gray-100 border-b shadow-sm justify-end sticky top-0 z-50"
  >
    <Link to="post">✍️ New Post</Link>
  </div>;
}

export default function ThreadListing() {
  const letterbox = useLetterboxLayer();

  const threadRoots = letterbox.getThreadRoots();

  return <>
    <section
      className="border-r border-gray-300 h-full flex flex-col overflow-scroll"
    >
      <SpaceBar />
      {threadRoots.length === 0
        ? <div className="p-3 text-gray-500 text-center">
          No threads have been posted yet.
        </div>
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
