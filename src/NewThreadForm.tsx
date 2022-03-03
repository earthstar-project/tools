import { isErr } from "earthstar";
import * as React from "react";
import { useCurrentIdentity } from "react-earthstar";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDebounce, useDebouncedCallback } from "use-debounce";
import MarkdownPreview from "./MarkdownPreview";
import { renderMarkdownPreview } from "./util/markdown";
import { useLetterboxLayer } from "./util/use-letterbox-layer";

function NewThreadBar() {
  const { workspaceLookup } = useParams();

  return <div
    className="flex py-2 py-3 px-3 md:px-6 bg-white border-b shadow-sm justify-end sticky top-0 z-50 items-baseline dark:bg-black dark:text-white dark:border-gray-800"
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
  const [currentAuthor] = useCurrentIdentity();
  const letterboxLayer = useLetterboxLayer();

  const { workspaceLookup } = useParams();

  const [currentDraftId, setCurrentDraftId] = React.useState<
    string | undefined
  >(undefined);

  const defaults = currentDraftId
    ? letterboxLayer.getDraftThreadParts(currentDraftId)
    : { title: "", content: "" };

  const [title, setTitle] = React.useState(defaults?.title);
  const [postVal, setPostVal] = React.useState(defaults?.content);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!currentDraftId) {
      setTitle("");
      setPostVal("");
      return;
    }

    setTitle(defaults?.title);
    setPostVal(defaults?.content);
  }, [currentDraftId, defaults?.title, defaults?.content]);

  const draftIds = letterboxLayer.getThreadRootDraftIds();

  const [didSaveDraft, setDidSaveDraft] = React.useState(false);

  const combinedContent = [`# ${title}`, "", postVal].join("\n");

  const onContentChange = useDebouncedCallback((content: string) => {
    if (title?.length === 0 && postVal?.length === 0) {
      return;
    }

    letterboxLayer.setThreadRootDraft(
      content,
      currentDraftId,
    ).then((res) => {
      if (!isErr(res)) {      
        setCurrentDraftId(res);
        setDidSaveDraft(true);
      }
    });

   
  }, 1000);

  React.useEffect(() => {
    onContentChange(combinedContent);
  }, [combinedContent, onContentChange]);

  const formRef = React.useRef<HTMLFormElement | null>(null);

  if (!currentAuthor) {
    return <div>{"You must be signed in to make threads"}</div>;
  }

  return <section className="h-full overflow-scroll">
    <NewThreadBar />
    <form
      ref={formRef}
      className="flex flex-col  p-3 md:p-6"
      onSubmit={async () => {
        const res = await letterboxLayer.createThread(combinedContent);

        if (isErr(res)) {
          alert("Couldn't create the new thread.");
          console.error(res);

          return;
        }

        if (currentDraftId) {
          letterboxLayer.clearThreadRootDraft(currentDraftId);
        }
        
        const author = res.root.doc.author;
        const timestamp = letterboxLayer.getThreadRootTimestamp(res.root.doc);
        const id = `${author}/${timestamp}`;

        navigate(`/${workspaceLookup}/thread/${id}`);
      }}
    >
      <input
        className="border mb-2 p-2 shadow-inner dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        type={"text"}
        value={title}
        onChange={(e) => {
          setDidSaveDraft(false);
          setTitle(e.target.value);
        }}
        placeholder={"Thread title"}
        required
      />
      <textarea
        required
        className="border mb-2 p-2 shadow-inner dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        placeholder={"Write the first post of a new thread. Accepts markdown."}
        rows={15}
        value={postVal}
        onChange={(e) => {
          setDidSaveDraft(false);
          setPostVal(e.target.value);
        }}
      />
      <div
        className={`text-right text-gray-500 ${
          didSaveDraft ? "visible" : "invisible"
        }`}
      >
        ✔ Draft saved
      </div>
      <MarkdownPreview raw={[`# ${title}`, ``, postVal].join("\n")} />
      <button className="btn mt-2" type={"submit"}>
        Create new thread
      </button>
    </form>
    {draftIds.length > 0
      ? <div className="flex flex-col px-6 py-3">
        <hr className="dark:border-gray-800" />
        <h1 className="font-bold text-xl my-3">Drafts</h1>
        <ul className="space-y-3">
          {draftIds.map((id) =>
            <DraftItem
              draftId={id}
              key={id}
              isSelected={id === currentDraftId}
              onDelete={() => setCurrentDraftId(undefined)}
              onSelect={() => {
                setCurrentDraftId(id);

                if (formRef.current) {
                  formRef.current.scrollIntoView();
                }
              }}
            />
          )}
        </ul>
      </div>
      : null}
  </section>;
}

function DraftItem(
  { draftId, onSelect, isSelected, onDelete }: {
    draftId: string;
    onSelect: () => void;
    isSelected: boolean;
    onDelete: () => void;
  },
) {
  const letterboxLayer = useLetterboxLayer();
  const maybeParts = letterboxLayer.getDraftThreadParts(draftId);

  const markdownMemo = React.useMemo(
    () => renderMarkdownPreview(maybeParts?.content || ""),
    [maybeParts?.content],
  );

  return <div
    className={`flex justify-between items-baseline border rounded dark:border-gray-800 ${
      isSelected ? "bg-blue-50 dark:bg-blue-900" : ""
    }`}
  >
    <button
      onClick={onSelect}
      className="text-gray-500 p-2 flex-grow text-left"
    >
      <h2 className="font-bold text-black dark:text-white">
        {maybeParts?.title || "Untitled thread"}
      </h2>

      {markdownMemo}
    </button>
    <button
      className="text-red-600 text-sm p-2"
      onClick={(e) => {
        onDelete();
        e.preventDefault();
        const isSure = window.confirm(
          "Is it really OK to delete this draft?",
        );

        if (!isSure) {
          return;
        }

        letterboxLayer.clearThreadRootDraft(draftId);
      }}
    >
      Delete
    </button>
  </div>;
}
