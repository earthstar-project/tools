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
import JoinForm from "./JoinForm";
import AddForm from "./AddForm";

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
        <div
          className="flex flex-col h-screen bg-white dark:bg-black dark:text-white"
        >
          <Earthbar>
            <MultiWorkspaceTab />
            <Spacer />
            <AuthorTab />
          </Earthbar>
          <WorkspaceLookup>
            <Routes>
              <Route element={<Dashboard />}>
                <Route
                  path={":workspaceLookup/*"}
                  element={<WorkspaceRoutes />}
                />
                <Route path={"join/*"} element={<JoinForm />} />
                <Route path={"add"} element={<AddForm />} />
              </Route>
            </Routes>
          </WorkspaceLookup>
          <LocalStorageSettingsWriter storageKey={STORAGE_KEY} />
        </div>
      </EarthstarPeer>
    </Router>
  );
}

export default App;
