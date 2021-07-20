import * as React from "react";

import { useCurrentAuthor, useStorage, WorkspaceLabel } from "react-earthstar";
import { Link } from "react-router-dom";
import { useLetterboxLayer } from "./letterbox-layer";
import { useWorkspaceAddrFromRouter } from "./WorkspaceLookup";

import ThreadRootItem from "./ThreadRootItem";

export default function WorkspaceView() {
  const workspace = useWorkspaceAddrFromRouter();
  const storage = useStorage(workspace);
  const [currentAuthor] = useCurrentAuthor();
  const letterbox = useLetterboxLayer();

  const threadRoots = letterbox.getThreadRoots();

  return <div>
    <h1 className={"text-2xl"}>
      <WorkspaceLabel address={storage.workspace} />
    </h1>
    {currentAuthor
      ? <Link to={"post"}>Post a new thread</Link>
      : <p>You must sign in to post threads.</p>}
    {threadRoots.length === 0 ? <div>No threads.</div> : <ul>
      {letterbox.getThreadRoots().map((threadRoot, i) => {
        return <li>
          <ThreadRootItem root={threadRoot} />
          {i < threadRoots.length - 1 ? <hr /> : null}
        </li>;
      })}
    </ul>}
  </div>;
}
