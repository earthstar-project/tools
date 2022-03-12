import { LetterboxLayerCache } from "@earthstar-project/rich-threads-layer";
import * as React from "react";
import { ShareLabel, useIdentity, useReplica } from "react-earthstar";
import { Link, Outlet, useMatch } from "react-router-dom";
import ThreadItem from "./ThreadRootItem";
import { useIsCacheHeated } from "./util/use-cache-heated";
import { useWorkspaceAddrFromRouter } from "./WorkspaceLookup";

function SpaceBar() {
  const workspace = useWorkspaceAddrFromRouter();
  const [currentAuthor] = useIdentity();

  return (
    <div className="flex flex-col py-2 px-3 pl-6 bg-white dark:bg-black border-b shadow-sm justify-end sticky top-0 z-50 items-baseline dark:text-white dark:border-gray-800">
      <div className="flex justify-between items-baseline self-stretch">
        <Link className="lg:hidden mr-2 text-blue-500 text-xl" to="/">
          ⬅
        </Link>
        <ShareLabel
          className="flex-grow font-bold text-xl"
          address={workspace}
        />

        {currentAuthor
          ? (
            <Link className="p-1.5 bg-blue-800 text-white rounded" to="post">
              New Thread
            </Link>
          )
          : null}
      </div>
    </div>
  );
}

function FilterBar(props: {
  onlyUnread: boolean;
  setOnlyUnread: (newVal: boolean) => void;
}) {
  return (
    <div className="sticky bottom-0 p-2 text-right bg-white dark:bg-black border-t dark:border-gray-700">
      <label className="mt-1 text-sm">
        <input
          type="checkbox"
          checked={props.onlyUnread}
          onChange={() => {
            props.setOnlyUnread(!props.onlyUnread);
          }}
        />
        <span className="ml-2 text-gray-500">Show unread only</span>
      </label>
    </div>
  );
}

export default function ThreadListing() {
  const inferredWorkspace = useWorkspaceAddrFromRouter();
  const replica = useReplica(inferredWorkspace);

  const [identity] = useIdentity();

  const letterbox = new LetterboxLayerCache(replica, identity);

  const [onlyUnread, setOnlyUnread] = React.useState<boolean>(false);

  const threadRoots = letterbox.getThreadRoots();

  const match = useMatch("/:workspacePath");

  const isExactlyOnSpacePath = match !== null;

  const isHeated = useIsCacheHeated(threadRoots);

  console.log("changed", match?.params["workspacePath"]);

  React.useEffect(() => {
    const unsub = replica.onCacheUpdated(() => {
      console.log("cache updated");
    });

    return () => {
      console.log("unsubbed");
      unsub();
    };
  }, [replica]);

  return (
    <React.Fragment key={match ? match.params["workspacePath"] : "none"}>
      <section
        className={`border-r-2 border-gray-300 dark:border-gray-800 h-full flex flex-col overflow-auto shadow-lg ${
          isExactlyOnSpacePath ? "block" : "hidden md:block"
        }`}
      >
        <SpaceBar />
        {!isHeated && threadRoots.length === 0
          ? (
            <div className="p-1 md:p-3 text-gray-500 text-center">
              Loading threads...
            </div>
          )
          : null}

        {threadRoots.length === 0 && isHeated
          ? (
            <div className="p-1 md:p-3 text-gray-500 text-center">
              No threads have been posted yet.
            </div>
          )
          : (
            <>
              <ol>
                {threadRoots.map((threadRoot) => {
                  return (
                    <React.Fragment key={threadRoot.doc.path}>
                      <li>
                        <ThreadItem
                          author={threadRoot.doc.author}
                          timestamp={letterbox.getThreadRootTimestamp(
                            threadRoot.doc,
                          )}
                          hideIfRead={onlyUnread}
                        />
                      </li>
                      <hr className="dark:border-gray-800" />
                    </React.Fragment>
                  );
                })}
              </ol>
              {threadRoots.length > 0
                ? (
                  <FilterBar
                    onlyUnread={onlyUnread}
                    setOnlyUnread={setOnlyUnread}
                  />
                )
                : null}
            </>
          )}
      </section>
      <Outlet />
    </React.Fragment>
  );
}
