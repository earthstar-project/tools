import { AuthorKeypair, Crypto, isErr } from "earthstar";
import * as React from "react";
import { useIdentity } from "react-earthstar";
import { useNavigate } from "react-router-dom";
import PageBar from "./PageBar";
import IdentityCard from './IdentityCard'

export default function SettingsManager() {
  const [identity, setCurrentIdentity] = useIdentity();
  const [shortName, setShortName] = React.useState('');
  const [proposedKeypair, setProposedKeypair] = React.useState<AuthorKeypair | null>(null)
  const [error, setError] = React.useState<null | string>(null)
  const navigate = useNavigate()

  return (
    <div className="h-app w-full h-overflow col-auto md:col-span-2">
      <PageBar backLink="/settings">
        <div className="font-bold text-xl flex-grow">Create a new identity</div>

      </PageBar>
      <div className="space-y-2 p-2 max-w-prose">
        <p>You need an <b>identity</b> to write data like messages. Identities don't rely on servers, so they work offline. You can have as many or as few as you want.</p>
        <form className="max-w-prose space-y-2" onSubmit={(e) => {
          e.preventDefault();

          const canProceed = identity ? window.confirm(`You're already signed in as ${identity}. Are you sure you want to replace that with the new identity?`) : true

          if (canProceed && proposedKeypair) {
            setCurrentIdentity(proposedKeypair)
          }

          navigate('/settings')


        }}>
          <div className="space-y-2 p-2 bg-gray-100 dark:bg-gray-900 rounded border-2 border-gray-200 dark:border-gray-800">
            <label className="font-bold block">A four-character shortname, used as a permanent part of your address.</label>

            <input
              value={shortName}
              spellCheck="false"
              placeholder={'abcd'}
              style={{ width: 'calc(4ch + 1.25rem)' }}
              className="border border-2 p-2 font-mono text-2xl rounded dark:text-black"
              onChange={async (e) => {
                setShortName(e.target.value)

                if (e.target.value.length < 4) {
                  setError(null)
                  setProposedKeypair(null)
                  return;
                }

                const result = await Crypto.generateAuthorKeypair(e.target.value);

                if (isErr(result)) {
                  setError(result.message);
                  setProposedKeypair(null)
                  return;
                }

                setError(null)
                setProposedKeypair(result)
              }}
            />

            <p className="text-sm">Don't worry too much about picking a shortname, it's only used as a secondary way to identify you. You can change your display name whenever you want.</p>
          </div>
          {error ? <p className="text-red-700 text-sm">{error}</p> : null}
          {proposedKeypair ? <><div className="text-4xl font-bold text-gray-300 text-center">⬇</div><IdentityCard keypair={proposedKeypair} />
            <p className="text-sm text-gray-800 dark:text-gray-200">Make sure to save the generated address and secret someplace safe. Only you have access to it, so it can never be recovered or reset!</p>
            <button className="btn">Use this identity</button></> : null}
        </form>

      </div>
    </div>
  );
}
