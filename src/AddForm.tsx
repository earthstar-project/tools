import {
  Combobox,
  ComboboxInput,
  ComboboxList,
  ComboboxOption,
  ComboboxPopover,
} from "@reach/combobox";
import { isErr, ValidatorEs4 } from "earthstar";
import * as React from "react";
import { useAddWorkspace, usePubs, WorkspaceLabel } from "react-earthstar";
import { Link } from "react-router-dom";
import BrowserPocketIcon from "./images/browser-pocket.svg";
import CloudPocketIcon from "./images/cloud-pocket.svg";
import PocketDesc from "./PocketDesc";

function AddBar() {
  return <div
    className="flex py-2 px-3 bg-white dark:bg-black border-b shadow-sm justify-end sticky top-0 z-50 items-baseline dark:text-white dark:border-gray-800"
  >
    <Link className="md:hidden mr-2 text-blue-500 text-xl" to="/">⬅</Link>
    <p className="flex-grow font-bold text-xl">
      Add space
    </p>
  </div>;
}

export default function AddForm() {
  return <div className="h-app w-full h-overflow col-auto lg:col-span-2">
    <AddBar />
    <WorkspaceCreatorForm />
  </div>;
}

const LETTERS = "abcdefghijklmnopqrstuvwxyz";
const NUMBERS = "1234567890";

function randomFromString(str: string) {
  return str[Math.floor(Math.random() * str.length)];
}

function generateSuffix() {
  const firstLetter = randomFromString(LETTERS);
  const rest = Array.from(Array(11), () => randomFromString(LETTERS + NUMBERS))
    .join("");

  return `${firstLetter}${rest}`;
}

export function WorkspaceCreatorForm({
  onCreate,
}: {
  onCreate?: (workspace: string) => void;
}) {
  const [pubs, setPubs] = usePubs();
  const add = useAddWorkspace();

  const [workspaceName, setWorkspaceName] = React.useState("");
  const [workspaceSuffix, setWorkspaceSuffix] = React.useState(generateSuffix);
  const address = `+${workspaceName}.${workspaceSuffix}`;
  const validResult = ValidatorEs4._checkWorkspaceIsValid(address);
  const isValid = !isErr(validResult);

  const allPubs = Array.from(new Set(Object.values(pubs).flat()));
  const [addedPubs, setAddedPubs] = React.useState<string[]>([]);
  const selectablePubs = allPubs.filter((pubUrl) =>
    !addedPubs.includes(pubUrl)
  );

  const [pubToAdd, setPubToAdd] = React.useState("");

  return (
    <>
      <form
        className="p-3 md:p-3 max-w-prose space-y-3"
        onSubmit={(e) => {
          e.preventDefault();

          add(address);
          setWorkspaceName("");
          setWorkspaceSuffix(generateSuffix());

          setPubs((prev) => ({
            ...prev,
            [address]: addedPubs,
          }));

          setAddedPubs([]);

          if (onCreate) {
            onCreate(address);
          }
        }}
      >
        <p>
          Here you can create a new space, or manually add a space you already
          know of.
        </p>

        <div className="my-3 p-4 bg-blue-50 dark:bg-blue-900 space-y-4">
          <p>A new pocket will be created for this space.</p>
          <div className="flex gap-2 items-center">
            <img src={BrowserPocketIcon} width={50} />
            <div className="flex items-stretch">
              <span
                className="p-1 rounded-l-lg shadow border-2 border-r-0 border-black font-bold bg-white flex items-center justify-center text-sm text-black"
              >
              <span>
                Browser pocket</span>
              </span>
              <div
                className=" inline-block  bg-black text-white p-2 rounded-r-lg"
              >
                <div className="flex gap-1 items-baseline">
                  <span>{"+"}</span>
                  <input
                    className="p-1  w-32 bg-gray-800 text-white"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    placeholder={"myspace"}
                  />
                  <span>{"."}</span>
                  <input
                    className="p-1  w-32 bg-gray-800 text-white"
                    value={workspaceSuffix}
                    onChange={(e) => setWorkspaceSuffix(e.target.value)}
                  />
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setWorkspaceSuffix(generateSuffix());
                    }}
                  >
                    {"↻"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {isErr(validResult) && workspaceName.length > 0
            ? (
              <p className="text-red-600 text-sm my-1">{validResult.message}</p>
            )
            : null}

          <p className="text-sm my-1">
            A space address is made of two parts: an identifier and suffix. The
            identifier should be memorable. The suffix should be hard to guess.
          </p>
        </div>
        <div className="my-3 p-4 rounded space-y-4 bg-blue-50 dark:bg-blue-900">
          <p >
            And it will be synced with these cloud pockets.
          </p>
          <ul className="space-y-4">
            {addedPubs.length === 0 ? <div className="text-gray-500">(None - you can always add some later!)</div>: null}
            {addedPubs.map((pubUrl) => (
              <li key={pubUrl} className="flex">
                
                  <div className="flex items-center gap-2">
                    <img src={CloudPocketIcon} width={70} />
                    <div className="flex flex-col space-y-2">
                      <PocketDesc
                        address={address}
                        kind="Cloud pocket"
                      />
                      <div className="text-sm">{pubUrl}</div>
                    </div>
                  </div>
                  <button
                  className="text-red-500 text-lg flex-grow text-right"
                    onClick={() => {
                      setAddedPubs((prev) =>
                        prev.filter((url) => url !== pubUrl)
                      );
                    }}
                  >
                    {"✕"}
                  </button>
                
              </li>
            ))}
          </ul>
          <div className="space-x-1 flex items-baseline">
          <Combobox
            className="inline-block rounded-lg flex-grow"
            openOnFocus
            onSelect={(item) => setAddedPubs((prev) => [...prev, item])}
          >
            <ComboboxInput
            className="p-1 w-full"
              selectOnClick
              value={pubToAdd}
              onChange={(e) => setPubToAdd(e.target.value)}
              placeholder={"https://cloud.pocket"}
            />
            {selectablePubs.length > 0
              ? (
                <ComboboxPopover className="rounded border border-gray-50">
                  <ComboboxList>
                    {selectablePubs.map((pubUrl) => (
                      <ComboboxOption
                        key={pubUrl}
                        value={pubUrl}
                      >
                        <span>{pubUrl}</span>
                      </ComboboxOption>
                    ))}
                  </ComboboxList>
                </ComboboxPopover>
              )
              : null}
          </Combobox>
          <button
            className="text-white bg-black rounded-lg p-2"
            disabled={pubToAdd.length === 0}
            onClick={(e) => {
              e.preventDefault();
              setPubToAdd("");
              setAddedPubs((prev) => [...prev, pubToAdd]);
            }}
          >
            {"Add cloud pocket"}
          </button>
          </div>
        </div>
        {isValid
          ? (
            <button
              className="btn"
              disabled={!isValid}
              type={"submit"}
            >
              Add {<WorkspaceLabel address={address}/>}
            </button>
          )
          : null}
      </form>
    </>
  );
}
