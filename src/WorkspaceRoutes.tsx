import * as React from "react";
import { Route, Routes } from "react-router-dom";
import NewThreadForm from "./NewThreadForm";
import ThreadReplyForm from "./ThreadReplyForm";
import ThreadView from "./ThreadView";
import WorkspaceView from "./WorkspaceView";

export default function WorkspaceRoutes() {
  return <Routes>
    <Route path="/" element={<WorkspaceView />}>
    </Route>
    <Route path={"post"} element={<NewThreadForm />} />
    <Route
      path={"thread/:authorPubKey/:timestamp"}
      element={<ThreadView />}
    >
      <Route
        path={"reply"}
        element={<ThreadReplyForm />}
      />
    </Route>
  </Routes>;
}
