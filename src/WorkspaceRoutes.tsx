import { Route, Routes } from "react-router-dom";
import NewThreadForm from "./NewThreadForm";
import ThreadReplyForm from "./ThreadReplyForm";
import ThreadView from "./ThreadView";
import ThreadListing from "./ThreadListing";
import SpaceSettings from "./SpaceSettings";

export default function WorkspaceRoutes() {
  return (
    <Routes>
      <Route path={"/settings"} element={<SpaceSettings />} />
      <Route path={"/"} element={<ThreadListing />}>
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
      </Route>
    </Routes>
  );
}
