import * as React from "react";
import { Crypto, isErr } from "earthstar";
import { useIdentity } from "react-earthstar";
import { useNavigate } from "react-router-dom";
import PageBar from "./PageBar";

export default function SettingsManager() {
  const [identity, setCurrentIdentity] = useIdentity();
  const [address, setAddress] = React.useState("");
  const [secret, setSecret] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const navigate = useNavigate();

  return (
    <div className="h-app w-full h-overflow col-span-2">
      <PageBar backLink="/settings">
        <div className="font-bold text-xl flex-grow">
          Use an existing identity
        </div>
      </PageBar>

      <form
        className="m-3"
        onSubmit={async (e) => {
          e.preventDefault();

          const keypair = { address, secret };

          const isValid = await Crypto.checkAuthorKeypairIsValid(keypair);

          if (isErr(isValid)) {
            setError(isValid.message);
            return;
          }

          const canProceed = identity
            ? window.confirm(
              `You're already signed in as ${identity}. Are you sure you want to replace that with this identity?`,
            )
            : true;

          if (canProceed) {
            setCurrentIdentity(keypair);
            navigate("/settings");
          }
        }}
      >
        <table>
          <tbody>
            {error
              ? (
                <tr>
                  <td
                    colSpan={2}
                    className="bg-red-100 p-2 border border-red-200 rounded text-red-800"
                  >
                    {error}
                  </td>
                </tr>
              )
              : null}
            <tr>
              <td>
                <label>Address</label>
              </td>
              <td>
                <input
                  value={address}
                  placeholder="@xxxx.xxxx"
                  className="input w-full ml-2"
                  onChange={(e) => setAddress(e.target.value)}
                />
              </td>
            </tr>
            <tr>
              <td>
                <label>Secret</label>
              </td>
              <td>
                <input
                  value={secret}
                  className="input w-full ml-2"
                  type="password"
                  onChange={(e) => setSecret(e.target.value)}
                />
              </td>
            </tr>

            <tr>
              <td colSpan={2}>
                <button type="submit" className="btn block">
                  Use identity
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </form>
    </div>
  );
}
