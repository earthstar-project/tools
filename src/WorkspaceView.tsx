import * as React from "react";
import { useStorage, WorkspaceLabel } from "react-earthstar";
import { Link, Outlet, useMatch, useParams } from "react-router-dom";
import { useLetterboxLayer } from "./letterbox-layer";
import { useWorkspaceAddrFromRouter } from "./WorkspaceLookup";

function ThreadTitle({ threadId }: { threadId: string }) {
  const letterboxLayer = useLetterboxLayer();
  const threadTitle = letterboxLayer.getThreadTitle(threadId);

  if (!threadTitle) {
    return null;
  }

  return <>{threadTitle}</>;
}

export default function WorkspaceView() {
  const workspace = useWorkspaceAddrFromRouter();
  const storage = useStorage(workspace);

  const { workspaceLookup } = useParams();
  const match = useMatch("/:workspaceLookup/thread/:pubKey/:timestamp/*");

  return <div className={"p-3"}>
    <header className={"mb-3"}>
      <h1 className={"text-2xl"}>
        <Link className={"text-blue-600 underline"} to={"/"}>Letterbox</Link>
        {" ‣ "}
        <Link className={"text-blue-600 underline"} to={`/${workspaceLookup}`}>
          <WorkspaceLabel address={storage.workspace} />
        </Link>
        {match?.params.timestamp
          ? <>
            {" ‣ "}
            <Link
              className={"text-blue-600 underline"}
              to={`/${workspaceLookup}/thread/${match.params.pubKey}/${match.params.timestamp}`}
            >
              <ThreadTitle
                threadId={`${match.params.pubKey}/${match.params.timestamp}`}
              />
            </Link>
          </>
          : null}
      </h1>
    </header>
    <Outlet />
  </div>;
}
