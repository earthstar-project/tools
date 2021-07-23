import { useNavigate, useSearchParams } from "react-router-dom";
import { useInvitation, WorkspaceLabel } from "react-earthstar";
import { isErr, ValidatorEs4, WorkspaceParsed } from "earthstar";

export default function Redeemer() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [workspace] = searchParams.getAll("workspace");
  const pubs = searchParams.getAll("pub");

  const workspaceAddr = "+" + workspace.trimLeft();

  const reconstituted = workspace
    ? `earthstar:///?workspace=+${workspaceAddr.substr(1)}${
      pubs.map((url) => `&pub=${url}`).join("")
    }&v=1`
    : "";

  const result = useInvitation(reconstituted);

  return isErr(result)
    ? <div>The invitation code you pasted is no good: {result.message}</div>
    : <form
      className="col-span-2 p-6 space-y-3"
      onSubmit={() => {
        result.redeem();

        const { name } = ValidatorEs4.parseWorkspaceAddress(
          result.workspace,
        ) as WorkspaceParsed;

        navigate(`/${name}`);
      }}
    >
      <h1 className="text-2xl font-bold">Join a space</h1>

      <p className="max-w-prose">
        Welcome! Here are the details enclosed in your invitation.
      </p>

      <dl>
        <dt className="font-bold mt-3">Space</dt>
        <dd className="pl-6">{result.workspace}</dd>
        <dt className="font-bold mt-3">Replica Servers</dt>
        {pubs.length > 0
          ? result.pubs.map((url) => <dd className="pl-6">{url}</dd>)
          : <p className="max-w-prose text-gray-500 pl-6">
            This invitation didn't include any replica servers, so anything you
            do will stay on this device. You can always add some later!
          </p>}
      </dl>

      <p className="max-w-prose">
        Joining this space will synchronise data from these replica servers with
        a new Earthstar pocket in your browser.
      </p>

      <p className="max-w-prose">
        You can add more replica servers to sync with, or delete your copy of
        this space's data at any point using the <b>Workspaces</b> tab.
      </p>

      <button type="submit" className="btn">
        Join <WorkspaceLabel address={result.workspace} />
      </button>
    </form>;
}
