import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useInvitation, useWorkspaces, WorkspaceLabel } from "react-earthstar";
import { isErr, ValidatorEs4, WorkspaceParsed } from "earthstar";
import BrowserPocketIcon from "./images/browser-pocket.svg";
import CloudPocketIcon from "./images/cloud-pocket.svg";

function JoinBar({ address }: { address: string }) {
  return <div
    className="flex py-2 px-3 pl-6 bg-white dark:bg-black border-b shadow-sm justify-end sticky top-0 z-50 items-baseline dark:text-white dark:border-gray-800"
  >
    <Link className="lg:hidden mr-2 text-blue-500 text-xl" to="/">⬅</Link>
    <p className="flex-grow font-bold text-xl">
      Add <WorkspaceLabel address={address} />
    </p>
  </div>;
}

function PocketDesc({ kind, address }: { address: string; kind: string }) {
  return <div className="text-sm inline-block">
    <span
      className="p-1 rounded-l-lg shadow border-2 border-r-0 border-black font-bold bg-white"
    >
      {kind}
    </span>
    <span
      className="bg-black text-white p-1.5 rounded-r-lg shadow border-1 border-black"
    >
      {address}
    </span>
  </div>;
}

export default function Redeemer() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const workspaces = useWorkspaces();

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
    : workspaces.includes(result.workspace);

  return <div className="h-app overflow w-full">
    {isErr(result)
      ? <div>The invitation code you pasted is no good: {result.message}</div>
      : alreadyHasWorkspace
      ? <div>
        <JoinBar address={result.workspace} />
        <p>You're already a member of this space!</p>
      </div>
      : <>
        <JoinBar address={result.workspace} />
        <form
          className="col-span-2 p-6 space-y-3 max-w-prose"
          onSubmit={() => {
            result.redeem();

            const { name } = ValidatorEs4.parseWorkspaceAddress(
              result.workspace,
            ) as WorkspaceParsed;

            navigate(`/${name}`);
          }}
        >
          <p>If you choose to add this space, here's what will happen:</p>

          <ol>
            <li className="bg-blue-50 p-4 space-y-4 inline-block rounded my-2">
              <p>
                A new pocket to hold{" "}
                <b>
                  <WorkspaceLabel address={result.workspace} />
                </b>'s data will be created in your browser.
              </p>
              <div className="flex items-center gap-2">
                <img src={BrowserPocketIcon} width={50} />
                <div className="flex flex-col">
                  <PocketDesc
                    address={result.workspace}
                    kind="Browser pocket"
                  />
                </div>
              </div>
            </li>
            {pubs.length > 0
              ? <li
                className="bg-blue-50 p-4 space-y-4 inline-block rounded my-2"
              >
                <p>
                  It will then be synchronised with the following{" "}
                  <b>cloud pockets</b>:
                </p>

                {result.pubs.map((url) =>
                  <div className="flex items-center gap-2">
                    <img src={CloudPocketIcon} width={70} />
                    <div className="flex flex-col space-y-2">
                      <PocketDesc
                        address={result.workspace}
                        kind="Cloud pocket"
                      />
                      <div className="text-sm">{url}</div>
                    </div>
                  </div>
                )}
              </li>
              : <p>
                No cloud pockets to sync with were included with this
                invitation, so anything you do will stay on this device.
              </p>}
          </ol>

          <p>
            You will then be able to write and view posts made to{" "}
            <WorkspaceLabel address={result.workspace} />.
          </p>

          <p>More cloud pockets to sync with can always be added later!</p>

          <button type="submit" className="btn">
            Add <WorkspaceLabel address={result.workspace} />
          </button>
        </form>
      </>}
  </div>;
}
