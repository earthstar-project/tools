import { checkShareIsValid, isErr } from "earthstar";
import * as React from "react";
import { ShareLabel, useAddShare } from "react-earthstar";
import { Link, useNavigate } from "react-router-dom";

function AddBar() {
  return (
    <div className="flex py-2 px-3 bg-white dark:bg-black border-b shadow-sm justify-end sticky top-0 z-50 items-baseline dark:text-white dark:border-gray-800">
      <Link className="md:hidden mr-2 text-blue-500 text-xl" to="/">⬅</Link>
      <p className="flex-grow font-bold text-xl">
        Add share
      </p>
    </div>
  );
}

export default function AddForm({ notFound }: { notFound?: string }) {
  return (
    <div className="h-app w-full h-overflow col-auto lg:col-span-2">
      <AddBar />
      {notFound && notFound.length && (<p className="m-3 bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 text-sm p-2 rounded inline-block border dark:border-gray-800">Share "{notFound}" does not exist yet.</p>)}
      <ShareCreatorForm />
    </div>
  );
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

export function ShareCreatorForm({
  onCreate,
}: {
  onCreate?: (workspace: string) => void;
}) {
  const [shareName, setShareName] = React.useState("");
  const [shareSuffix, setShareSuffix] = React.useState(generateSuffix);
  const address = `+${shareName}.${shareSuffix}`;
  const validResult = checkShareIsValid(address);

  const navigate = useNavigate();

  const add = useAddShare();

  return (
    <>
      <form
        className="p-3 md:p-3 max-w-prose space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();

          await add(address);

          setShareName("");
          setShareSuffix(generateSuffix());

          if (onCreate) {
            onCreate(address);
          }

          navigate(`/${shareName}`);
        }}
      >
        <p>
          A <b>share</b> is like a shared folder you sync with people you trust.
        </p>
        <p>
          You keep a copy of the share's data in your own <b>replica</b>{" "}
          so it's always accessible.
        </p>
        <p>Here you can make a replica for a new or existing share.</p>

        <div className="my-3 p-4 bg-blue-50 dark:bg-blue-900 space-y-4">
          <p className="font-bold">Enter share address</p>
          <div className="flex gap-2 items-center">
            <div className="flex items-stretch">
              <div className=" inline-block  bg-black text-white p-2 rounded-lg">
                <div className="flex gap-1 items-baseline">
                  <span>{"+"}</span>
                  <input
                    className="p-1  w-32 bg-gray-800 text-white"
                    value={shareName}
                    onChange={(e) => setShareName(e.target.value)}
                    placeholder={"myshare"}
                  />
                  <span>{"."}</span>
                  <input
                    className="p-1  w-32 bg-gray-800 text-white"
                    value={shareSuffix}
                    onChange={(e) => setShareSuffix(e.target.value)}
                  />
                  <button
                    className="bg-blue-800 rounded-xl px-2 py-1"
                    onClick={(e) => {
                      e.preventDefault();
                      setShareSuffix(generateSuffix());
                    }}
                  >
                    {"↻"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {isErr(validResult) && shareName.length > 0
            ? <p className="text-red-600 text-sm my-1">{validResult.message}</p>
            : null}

          <p className="text-sm my-1">
            Creating a new share? Make the first part memorable, and the second
            bit hard to guess. Only share this address with people you trust.
          </p>
        </div>

        {validResult === true
          ? (
            <>
              <button
                className="btn"
                disabled={validResult !== true}
                type={"submit"}
              >
                Add {<ShareLabel address={address} />}
              </button>
              <p className="text-sm">
                This will create a new in-browser replica of{" "}
                <ShareLabel address={address} />, and begin syncing with any
                peers which already know of this share.
              </p>
            </>
          )
          : null}
      </form>
    </>
  );
}
