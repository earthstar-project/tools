import * as React from "react";
import { useIdentity, useReplicaServers } from "react-earthstar";
import { Link } from "react-router-dom";
import IdentityCard from './IdentityCard'

function ManagerBar() {
  return (
    <div className="flex py-2 px-3 bg-white dark:bg-black border-b shadow-sm justify-end sticky top-0 z-50 items-baseline dark:text-white dark:border-gray-800">
      <Link className="md:hidden mr-2 text-blue-500 text-xl" to="/">⬅</Link>
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
          <p className="bg-gray-100 text-gray-600 text-sm p-2 rounded inline-block border">
            You haven't specified any replica servers to sync with yet.
          </p>
        )
        : null}
      {replicaServers.map((server) => {
        return (
          <li>{server}</li>
        );
      })}
      <form
        onSubmit={(e) => {
          e.preventDefault();

          setReplicaServers((prev) => [...prev, newReplicaServer]);
          setNewReplicaServer("");
        }}
      >
        <input
          value={newReplicaServer}
          onChange={(e) => setNewReplicaServer(e.target.value)}
          className="border p-2"
          placeholder="wss://my.server"
          type="url"
        />
        <button type="submit" className="btn">Add replica server</button>
      </form>
    </div>
  );
}

export default function SettingsManager() {
  const [identity] = useIdentity();

  return (
    <div className="h-app w-full h-overflow col-auto lg:col-span-2">
      <ManagerBar />
      <div className="p-3 space-y-3">
        <h2 className="font-bold text-xl">Identity</h2>
        {identity
          ? (
            <div className="space-y-2">
              <IdentityCard keypair={identity} />

            </div>
          )
          : (
            <div>
              <p className="max-w-prose">
                You're currently using this app anonymously. You will not be
                able to write data.
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
