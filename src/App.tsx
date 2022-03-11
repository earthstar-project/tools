import { FormatValidatorEs4, Replica } from "earthstar";
import { ReplicaDriverIndexedDB } from "earthstar/browser";
import {
  LocalStorageSettingsWriter,
  Peer,
  useLocalStorageEarthstarSettings,
} from "react-earthstar";
import WorkspaceRoutes from "./WorkspaceRoutes";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import WorkspaceLookup from "./WorkspaceLookup";
import Dashboard from "./Dashboard";
import JoinForm from "./JoinForm";
import AddForm from "./AddForm";
import SettingsManager from "./SettingsManager";
import IdentityCreatorForm from "./IdentityCreatorForm";
import ExistingIdentityForm from "./ExistingIdentityForm";

const STORAGE_KEY = "letterbox";

function App() {
  const settings = useLocalStorageEarthstarSettings(STORAGE_KEY);

  return (
    <Router>
      <Peer
        {...settings}
        onCreateShare={(addr) => {
          return new Replica(
            addr,
            FormatValidatorEs4,
            new ReplicaDriverIndexedDB(addr),
          );
        }}
      >
        <div className="flex flex-col h-screen bg-white dark:bg-black dark:text-white">
          <WorkspaceLookup>
            <Routes>
              <Route path={"/"} element={<Dashboard />}>
                <Route
                  path={":workspaceLookup/*"}
                  element={<WorkspaceRoutes />}
                />
                <Route path={"join/*"} element={<JoinForm />} />
                <Route path={"add"} element={<AddForm />} />
                <Route path={"settings"} element={<SettingsManager />} />
                <Route
                  path={"new-identity"}
                  element={<IdentityCreatorForm />}
                />
                <Route
                  path={"existing-identity"}
                  element={<ExistingIdentityForm />}
                />
              </Route>
            </Routes>
          </WorkspaceLookup>
          <LocalStorageSettingsWriter storageKey={STORAGE_KEY} />
        </div>
      </Peer>
    </Router>
  );
}

export default App;
