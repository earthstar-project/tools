import * as React from "react";
import {
  useMakeInvitation,
  usePubs,
  useRemoveWorkspace,
  useWorkspacePubs,
  WorkspaceLabel,
  useStorage,
  useCurrentAuthor,
} from "react-earthstar";
import { AuthorParsed, ValidatorEs4 } from "earthstar";
import { Link, useNavigate } from "react-router-dom";
import {
  Combobox,
  ComboboxInput,
  ComboboxList,
  ComboboxOption,
  ComboboxPopover,
} from "@reach/combobox";
import { useWorkspaceAddrFromRouter } from "./WorkspaceLookup";
import PocketDesc from "./PocketDesc";
import CloudPocketIcon from "./images/cloud-pocket.svg";

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

function SpaceSettingsBar() {
  const workspace = useWorkspaceAddrFromRouter();

  return (
    <div className="flex py-2 px-3 bg-white dark:bg-black border-b shadow-sm justify-end sticky top-0 z-50 items-baseline dark:text-white dark:border-gray-800">
      <Link className="lg:hidden mr-2 text-blue-500 text-xl" to="/">
        ⬅
      </Link>
      <p className="flex-grow font-bold text-xl">
        Settings for <WorkspaceLabel address={workspace} />
      </p>
    </div>
  );
}

export default function SpaceSettings() {
  const inferredWorkspace = useWorkspaceAddrFromRouter();
  const invitationCode = useMakeInvitation([], inferredWorkspace);

  const invitationUrl = `${window.location.protocol}//${
    window.location.hostname
  }${
    window.location.port !== "" ? `:${window.location.port}` : ""
  }/join/${invitationCode}`;

  const remove = useRemoveWorkspace();

  const [currentAuthor] = useCurrentAuthor();

  const navigate = useNavigate();

  return (
    <div className="h-full overflow-auto md:col-span-2">
      <SpaceSettingsBar />
      <section className="p-3 space-y-4">
        {currentAuthor ? (
          <>
            <h2 className="font-bold text-xl">Display name</h2>{" "}
            <DisplayNameForm />
            <hr />
          </>
        ) : null}

        <h2 className="font-bold text-xl">Cloud pockets</h2>

        <p>
          For your posts to reach others — and for theirs to reach you — you'll
          need the URLs of cloud pockets to sync with.
        </p>

        <PocketEditor />

        <p>
          Want to run your own cloud pocket for you and your friends?{" "}
          <a
            className="underline text-blue-500"
            href="https://github.com/earthstar-project/earthstar-pub#readme"
          >
            Find out how!
          </a>
        </p>

        <hr />

        <h2 className="font-bold text-xl">
          Invite someone to <WorkspaceLabel address={inferredWorkspace} />
        </h2>
        <p className="max-w-prose">
          If you'd like to invite someone you trust to this space, you can share
          a special URL with them that will get them set up on this deployment
          of Letterbox.
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
              `Are you sure you want to remove ${inferredWorkspace} from your workspaces?`
            );

            if (isSure) {
              remove(inferredWorkspace);
              navigate("/");
            }
          }}
        >
          {`Forget ${inferredWorkspace}`}
        </button>
      </section>
    </div>
  );
}

function PocketEditor() {
  const inferredWorkspace = useWorkspaceAddrFromRouter();
  const [pubs, setPubs] = useWorkspacePubs(inferredWorkspace);

  const [pubToAdd, setPubToAdd] = React.useState("");

  const removePub = React.useCallback(
    (pubToRemove: string) => {
      setPubs((prev) => prev.filter((pub) => pub !== pubToRemove));
    },
    [setPubs]
  );

  const addPub = React.useCallback(
    (pubToAdd: string) => {
      setPubToAdd("");
      setPubs((prev) => [...prev, pubToAdd]);
    },
    [setPubs, setPubToAdd]
  );

  const [totalPubs] = usePubs();
  const allPubs = Array.from(new Set(Object.values(totalPubs).flat()));
  const selectablePubs = allPubs.filter((pubUrl) => !pubs.includes(pubUrl));

  return (
    <div className="space-y-4 bg-blue-900  dark:bg-blue-900 p-4 rounded-lg">
      <ul className="space-y-4">
        {allPubs.length === 0 ? (
          <div className="text-gray-400">
            (None yet - anything you post will stay on this device!)
          </div>
        ) : null}
        {allPubs.map((pubUrl) => (
          <li key={pubUrl} className="flex">
            <div className="flex items-center gap-2">
              <img src={CloudPocketIcon} width={70} />
              <div className="flex flex-col space-y-2">
                <PocketDesc address={inferredWorkspace} kind="Cloud pocket" />
                <div className="text-sm text-white">{pubUrl}</div>
              </div>
            </div>
            <button
              className="text-red-500 text-lg flex-grow text-right"
              onClick={() => {
                removePub(pubUrl);
              }}
            >
              {"✕"}
            </button>
          </li>
        ))}
      </ul>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (pubToAdd.length > 0) {
            addPub(pubToAdd);
          }
        }}
      >
        <div className="space-x-1 flex items-baseline">
          <Combobox
            className="flex-grow "
            openOnFocus
            onSelect={(item) => addPub(item)}
          >
            <ComboboxInput
              placeholder="https://mypocket.org"
              className="w-full border p-2 shadow-inner p-1 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              type="url"
              selectOnClick
              value={pubToAdd}
              onChange={(e) => setPubToAdd(e.target.value)}
            />
            {selectablePubs.length > 0 ? (
              <ComboboxPopover>
                <ComboboxList>
                  {selectablePubs.map((pubUrl) => (
                    <ComboboxOption key={pubUrl} value={pubUrl}>
                      <span data-re-pub-item>{pubUrl}</span>
                    </ComboboxOption>
                  ))}
                </ComboboxList>
              </ComboboxPopover>
            ) : null}
          </Combobox>
          <button
            className="block text-white bg-black rounded-lg p-2"
            type={"submit"}
            disabled={pubToAdd.length === 0}
          >
            {"Add cloud pocket"}
          </button>
        </div>
      </form>
    </div>
  );
}

function DisplayNameForm() {
  const [currentAuthor] = useCurrentAuthor();
  const inferredWorkspace = useWorkspaceAddrFromRouter();
  const storage = useStorage(inferredWorkspace);

  const displayNamePath = `/about/~${currentAuthor?.address}/displayName.txt`;

  const displayNameDoc = storage?.getDocument(displayNamePath);

  const [newDisplayName, setNewDisplayName] = React.useState("");

  if (!currentAuthor) {
    return null;
  }

  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        setNewDisplayName("");

        storage?.set(currentAuthor, {
          format: "es.4",
          content: newDisplayName,
          path: displayNamePath,
        });
      }}
    >
      <input
        value={newDisplayName}
        className="w-full border p-2 shadow-inner p-1 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        onChange={(e) => setNewDisplayName(e.target.value)}
        placeholder={
          displayNameDoc?.content ||
          (
            ValidatorEs4.parseAuthorAddress(
              currentAuthor.address
            ) as AuthorParsed
          ).shortname
        }
      />
      <button className="btn whitespace-nowrap" type={"submit"}>
        {"Set display name"}
      </button>
    </form>
  );
}
