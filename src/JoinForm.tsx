import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ShareLabel, useInvitation, usePeer } from "react-earthstar";
import {
  FormatValidatorEs4,
  isErr,
  ParsedAddress,
  parseShareAddress,
} from "earthstar";
import BrowserPocketIcon from "./images/browser-pocket.svg";
import CloudPocketIcon from "./images/cloud-pocket.svg";
import PocketDesc from "./PocketDesc";

function JoinBar({ address }: { address: string }) {
  return (
    <div className="flex py-2 px-3 bg-white dark:bg-black border-b shadow-sm justify-end sticky top-0 z-50 items-baseline dark:text-white dark:border-gray-800">
      <Link className="md:hidden mr-2 text-blue-500 text-xl" to="/">⬅</Link>
      <p className="flex-grow font-bold text-xl">
        Join <ShareLabel address={address} />
      </p>
    </div>
  );
}

export default function Redeemer() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const peer = usePeer();
  const shares = peer.shares();

  const [workspace] = searchParams.getAll("workspace");
  const pubs = searchParams.getAll("pub");

  const workspaceAddr = "+" + workspace.trimLeft();

  const reconstituted = workspace
    ? `earthstar:///?workspace=+${workspaceAddr.substr(1)}${
      pubs.map((url) => `&pub=${url}`).join("")
    }&v=1`
    : "";

  const result = useInvitation(reconstituted);

  const alreadyHasWorkspace = isErr(result)
    ? false
    : shares.includes(result.workspace);

  return (
    <div className="h-app w-full h-overflow w-full  col-auto md:col-span-2">
      {isErr(result)
        ? <div>The invitation code you pasted is no good: {result.message}</div>
        : alreadyHasWorkspace
        ? (
          <div>
            <JoinBar address={result.workspace} />
            <p className="p-2">You're already a member of this share!</p>
          </div>
        )
        : (
          <>
            <JoinBar address={result.workspace} />
            <form
              className="p-3 space-y-3 max-w-prose"
              onSubmit={() => {
                result.redeem();

                const { name } = parseShareAddress(
                  result.workspace,
                ) as ParsedAddress;

                navigate(`/${name}`);
              }}
            >
              <p>If you choose to join this share, here's what will happen:</p>

              <ol>
                <li className="bg-blue-50 dark:bg-blue-900 p-3 space-y-4 inline-block rounded-xl my-2 border dark:border-blue-600">
                  <p>
                    A new replica to hold{" "}
                    <b>
                      <ShareLabel address={result.workspace} />
                    </b>'s data will be stored in your browser.
                  </p>
                </li>
                {pubs.length > 0
                  ? (
                    <li className="bg-blue-50 dark:bg-blue-900 p-3 space-y-4 inline-block rounded-xl my-2 border dark:border-blue-600">
                      <p>
                        The following replica servers will be added:
                      </p>

                      <ul className="list-disc pl-4">
                        {result.pubs.map((url) => (
                          <li key={url} className="list-disc">
                            <a
                              href={url}
                              target="_blank"
                              className="text-blue-600 underline"
                            >
                              {url}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </li>
                  )
                  : null}
              </ol>

              <p>
                You will then be able to write and view posts made to{" "}
                <ShareLabel address={result.workspace} />.
              </p>

              <button type="submit" className="btn">
                Join <ShareLabel address={result.workspace} />
              </button>
            </form>
          </>
        )}
    </div>
  );
}
