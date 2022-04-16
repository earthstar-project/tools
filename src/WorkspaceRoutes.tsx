import { Route, Routes } from "react-router-dom";
import NewThreadForm from "./NewThreadForm";
import ThreadReplyForm from "./ThreadReplyForm";
import ThreadView from "./ThreadView";
import ThreadListing from "./ThreadListing";
import SpaceSettings from "./SpaceSettings";
import { useWorkspaceAddrFromRouter } from "./WorkspaceLookup";
import AddForm from "./AddForm";

export default function WorkspaceRoutes() {
  const workspace = useWorkspaceAddrFromRouter();

  const ShareNotFound = function () {
    return (<AddForm />);
  }

  /**
   * If a workspace is found, load it, otherwise show "add form" 
   */
  const ThreadListingElement = function () {
    return workspace ? (<ThreadListing />) : (<ShareNotFound />);
  };

  return (
    <Routes>
      <Route path={"/settings"} element={<SpaceSettings />} />
      <Route path={"/"} element={<ThreadListingElement />}>
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
