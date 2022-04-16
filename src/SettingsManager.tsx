import * as React from "react";
import { useIdentity, useReplicaServers } from "react-earthstar";
import { Link } from "react-router-dom";
import IdentityCard from "./IdentityCard";

function ManagerBar() {
  return (
    <div className="flex py-2 px-3 bg-white dark:bg-black border-b shadow-sm justify-end sticky top-0 z-50 items-baseline dark:text-white dark:border-gray-800">
      <Link className="lg:hidden mr-2 text-blue-500 text-xl" to="/">⬅</Link>
      <p className="flex-grow font-bold text-xl">
        Your settings
      </p>
    </div>
  );
}

function ReplicaServerManager() {
  const [replicaServers, setReplicaServers] = useReplicaServers();
  const [newReplicaServer, setNewReplicaServer] = React.useState("");

  return (
    <div className="space-y-3">
      {replicaServers.length === 0
        ? (
          <p className="bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 text-sm p-2 rounded inline-block border dark:border-gray-800">
            You haven't specified any replica servers to sync with yet.
          </p>
        )
        : (
          <ul className="list-none">
            {replicaServers.map((server, index) => {
              return <li key={server}>
                <code className="mr-2 font-mono">{server}</code>

                <button type="button" title="Remove replica server" onClick={(e) => {
                e.preventDefault();

                if (window.confirm(`There is no undo! Continue removing ${server}?`)) {
                  const _replicaServers = replicaServers.filter(_server => _server !== server);
                  setReplicaServers(_replicaServers);
                }
              }}>❌</button>
              </li>;
            })}
          </ul>
        )}
      <form
        onSubmit={(e) => {
          e.preventDefault();

          try {
            if (replicaServers.includes(newReplicaServer)) {
              throw new Error('Already added!')
            }

            setReplicaServers((prev) => [...prev, newReplicaServer]);
            setNewReplicaServer("");

          } catch(error) {
            window.alert(`Replica server ${newReplicaServer} already added.`)
          }
        }}
      >
        <label htmlFor="newreplicaserver" className="block mb-1">Add Replica Server by URL</label>
        <input
          value={newReplicaServer}
          id="newreplicaserver"
          onChange={(e) => setNewReplicaServer(e.target.value)}
          className="input mr-2"
          placeholder="wss://my.server"
          type="url"
          required={true}
        />
        <button type="submit" className="btn">Add</button>
      </form>
    </div>
  );
}

export default function SettingsManager() {
  const [identity] = useIdentity();

  return (
    <div className="h-app w-full h-overflow col-auto md:col-span-2">
      <ManagerBar />
      <div className="p-3 space-y-3">
        <h2 className="font-bold text-xl">Identity</h2>
        {identity ? <IdentityCard keypair={identity} /> : (
          <div>
            <p className="max-w-prose">
              You're currently using this app anonymously. You will not be able
              to write data.
            </p>
            <Link
              className="block underline text-blue-700"
              to="/new-identity"
            >
              Create a new identity
            </Link>
            <Link
              className="block underline text-blue-700"
              to="/existing-identity"
            >
              Use an existing identity
            </Link>
          </div>
        )}
        <hr />
        <h2 className="font-bold text-xl">Replica servers</h2>
        <ReplicaServerManager />
      </div>
    </div>
  );
}
