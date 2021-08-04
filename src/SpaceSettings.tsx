import * as React from "react";
import {
  useMakeInvitation,
  useRemoveWorkspace,
  WorkspaceLabel,
} from "react-earthstar";
import { useNavigate } from "react-router-dom";
import { useWorkspaceAddrFromRouter } from "./WorkspaceLookup";

function CopyButton({
  children,
  copyValue,
  onClick,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  copyValue: any;
}) {
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    let id = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(id);
  }, [copied]);

  return (
    <button
      className="btn"
      {...props}
      onClick={(e) => {
        if (onClick) {
          onClick(e);
        }

        navigator.clipboard.writeText(copyValue);
        setCopied(true);
      }}
    >
      {copied ? "Copied to clipboard!" : children || "Copy"}
    </button>
  );
}

export default function SpaceSettings() {
  const inferredWorkspace = useWorkspaceAddrFromRouter();
  const invitationCode = useMakeInvitation([], inferredWorkspace);

  const invitationUrl =
    `${window.location.protocol}//${window.location.hostname}${
      window.location.port !== "" ? `:${window.location.port}` : ""
    }/join/${invitationCode}`;

  const remove = useRemoveWorkspace();

  const navigate = useNavigate();

  return <section className="p-6 space-y-3 lg:col-span-2">
    <h1 className="font-bold text-2xl">Settings</h1>

    <h2 className="font-bold text-xl">
      Invite someone to <WorkspaceLabel address={inferredWorkspace} />
    </h2>
    <p className="max-w-prose">
      If you'd like to invite someone you trust to this space, you can share a
      special URL with them that will get them set up on this deployment of
      Letterbox.
    </p>
    <CopyButton copyValue={invitationUrl}>
      Copy Invitation URL to clipboard
    </CopyButton>

    <hr />

    <h2 className="font-bold text-xl">Data deletion</h2>

    <button
      className="btn"
      onClick={() => {
        const isSure = window.confirm(
          `Are you sure you want to remove ${inferredWorkspace} from your workspaces?`,
        );

        if (isSure) {
          remove(inferredWorkspace);
          navigate("/");
        }
      }}
    >
      {`Forget ${inferredWorkspace}`}
    </button>

    <p className="max-w-prose">
      The below will come later - for now you can do all these things from the
      {" "}
      <b>Workspaces</b> tab.
    </p>

    <h2 className="font-bold text-xl">🚧 Display name</h2>
    <h2 className="font-bold text-xl">🚧 Replica servers</h2>
  </section>;
}
