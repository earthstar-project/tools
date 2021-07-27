import { isErr } from "earthstar";
import * as React from "react";
import { useCurrentAuthor } from "react-earthstar";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useLetterboxLayer } from "./letterbox-layer";
import MarkdownPreview from "./MarkdownPreview";
import { renderMarkdownPreview } from "./util/markdown";

function NewThreadBar() {
  const { workspaceLookup } = useParams();

  return <div
    className="flex py-2 py-3 px-3 md:px-6 bg-white border-b shadow-sm justify-end sticky top-0 z-50 items-baseline"
  >
    <Link
      className="md:hidden mr-2 text-blue-500 text-xl"
      to={`/${workspaceLookup}`}
    >
      ⬅
    </Link>

    <div className="flex-grow font-bold text-xl">New thread</div>
  </div>;
}

export default function NewThreadForm() {
  const [currentAuthor] = useCurrentAuthor();
  const letterboxLayer = useLetterboxLayer();

  const { workspaceLookup, draftId } = useParams();

  const maybeDraftId = draftId === "" ? undefined : draftId;

  const defaults = maybeDraftId
    ? letterboxLayer.getDraftThreadParts(maybeDraftId)
    : { title: "", content: "" };

  const [title, setTitle] = React.useState(defaults?.title);
  const [postVal, setPostVal] = React.useState(defaults?.content);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!maybeDraftId) {
      setTitle("");
      setPostVal("");
      return;
    }

    setTitle(defaults?.title);
    setPostVal(defaults?.content);
  }, [maybeDraftId, defaults?.title, defaults?.content]);

  const draftIds = letterboxLayer.getThreadRootDraftIds();

  if (!currentAuthor) {
    return <div>{"You must be signed in to make threads"}</div>;
  }

  return <section>
    <NewThreadBar />
    <form
      className="flex flex-col  p-3 md:p-6"
      onSubmit={() => {
        const content = [`# ${title}`, "", postVal].join("\n");

        const res = letterboxLayer.createThread(content);

        if (isErr(res)) {
          alert("Couldn't create the new thread.");
          console.error(res);

          return;
        }

        if (maybeDraftId) {
          letterboxLayer.clearThreadRootDraft(maybeDraftId);
        }

        navigate(`/${workspaceLookup}/thread/${res.id}`);
      }}
    >
      <input
        className="border mb-2 p-2 shadow-inner"
        type={"text"}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={"Thread title"}
        required
      />
      <textarea
        required
        className="border mb-2 p-2 shadow-inner"
        placeholder={"Write the first post of a new thread. Accepts markdown."}
        rows={15}
        value={postVal}
        onChange={(e) => {
          setPostVal(e.target.value);
        }}
      />
      <MarkdownPreview raw={[`# ${title}`, ``, postVal].join("\n")} />
      <button
        className="mt-2 border-blue-800 border p-2 rounded shadow text-blue-800"
        onClick={(e) => {
          e.preventDefault();

          const content = [`# ${title}`, "", postVal].join("\n");

          letterboxLayer.setThreadRootDraft(
            content,
            maybeDraftId,
          );

          setTitle("");
          setPostVal("");
        }}
      >
        {maybeDraftId ? "Update draft" : "Save as draft"}
      </button>
      <button className="btn mt-2" type={"submit"}>
        Create new thread
      </button>
    </form>
    {draftIds.length > 0
      ? <div className="flex flex-col px-6 py-3">
        <hr />
        <h1 className="font-bold text-xl my-3">Drafts</h1>
        <ul className="space-y-3">
          {draftIds.map((id) => {
            const maybeParts = letterboxLayer.getDraftThreadParts(id);

            return <Link
              className="block"
              to={`/${workspaceLookup}/post/${id}`}
            >
              <li
                className={`flex justify-between items-baseline border rounded p-2 ${
                  draftId === id ? "bg-blue-50" : ""
                }`}
              >
                <div className="text-gray-500">
                  <h2 className="font-bold text-black">
                    {maybeParts?.title || "Untitled thread"}
                  </h2>

                  {renderMarkdownPreview(maybeParts?.content || "")}
                </div>
                <button
                  className="text-red-600 text-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    const isSure = window.confirm(
                      "Is it really OK to delete this draft?",
                    );

                    if (!isSure) {
                      return;
                    }

                    letterboxLayer.clearThreadRootDraft(id);
                    navigate(`/${workspaceLookup}/post`);
                  }}
                >
                  Delete
                </button>
              </li>
            </Link>;
          })}
        </ul>
      </div>
      : null}
  </section>;
}
