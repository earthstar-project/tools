import * as React from "react";
import { StorageLocalStorage, ValidatorEs4 } from "earthstar";
import {
  AuthorTab,
  Earthbar,
  EarthstarPeer,
  LocalStorageSettingsWriter,
  MultiWorkspaceTab,
  Spacer,
  useLocalStorageEarthstarSettings,
} from "react-earthstar";
import "react-earthstar/styles/layout.css";
import "react-earthstar/styles/junior.css";
import WorkspaceRoutes from "./WorkspaceRoutes";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import WorkspaceLookup from "./WorkspaceLookup";
import Dashboard from "./Dashboard";

const STORAGE_KEY = "letterbox";

function App() {
  const settings = useLocalStorageEarthstarSettings(STORAGE_KEY);

  return (
    <Router>
      <EarthstarPeer
        {...settings}
        onCreateWorkspace={(addr) => {
          return new StorageLocalStorage([ValidatorEs4], addr);
        }}
      >
        <Earthbar>
          <MultiWorkspaceTab />
          <Spacer />
          <AuthorTab />
        </Earthbar>
        <WorkspaceLookup>
          <Routes>
            <Route path={"/"} element={<Dashboard />}>
              <Route
                path={":workspaceLookup/*"}
                element={<WorkspaceRoutes />}
              />
            </Route>
          </Routes>
        </WorkspaceLookup>
        <LocalStorageSettingsWriter storageKey={STORAGE_KEY} />
      </EarthstarPeer>
    </Router>
  );
}

export default App;
