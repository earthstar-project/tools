import * as React from "react";
import { Route, Routes } from "react-router-dom";
import NewThreadForm from "./NewThreadForm";
import WorkspaceView from "./WorkspaceView";

export default function WorkspaceRoutes() {
  return <Routes>
    <Route path="/" element={<WorkspaceView />}>
    </Route>
    <Route path={"post"} element={<NewThreadForm />} />
  </Routes>;
}
