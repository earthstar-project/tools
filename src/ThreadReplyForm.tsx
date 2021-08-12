import { isErr } from "earthstar";
import * as React from "react";
import { useCurrentAuthor } from "react-earthstar";
import { useNavigate, useParams } from "react-router-dom";
import { useDebouncedCallback } from "use-debounce";
import MarkdownPreview from "./MarkdownPreview";
import { useLetterboxLayer } from "./util/use-letterbox-layer";

export default function ThreadReplyForm() {
  const { authorPubKey, timestamp } = useParams();
  
  const timestampInt = parseInt(timestamp)

  const [currentAuthor] = useCurrentAuthor();
  const letterboxLayer = useLetterboxLayer();
  const [replyText, setReplyText] = React.useState(
    letterboxLayer.getReplyDraft(timestampInt, authorPubKey) || "",
  );
  const navigate = useNavigate();
  const [didSaveDraft, setDidSaveDraft] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement | null>(null);

  React.useLayoutEffect(() => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ block: "end" });
    }
  }, []);

  const writeDraft = useDebouncedCallback((content) => {
    letterboxLayer.setReplyDraft(timestampInt, authorPubKey, content);

    setDidSaveDraft(true);
  }, 1000);

  return <form
    ref={formRef}
    className={"flex flex-col pt-0 p-3 lg:p-6 lg:pt-0"}
    onSubmit={(e) => {
      e.preventDefault();

      const result = letterboxLayer.createReply(
        timestampInt,
        authorPubKey,
        replyText,
      );

      if (isErr(result)) {
        alert("Something went wrong with creating this reply.");
      } else {
        letterboxLayer.clearReplyDraft(timestampInt, authorPubKey);
      }

      navigate("..");
    }}
  >
    <textarea
      required
      className={"border p-2 mb-2 shadow-inner dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"}
      value={replyText}
      placeholder={"Supports markdown"}
      rows={10}
      onChange={(e) => {
        setDidSaveDraft(false);
        setReplyText(e.target.value);
        writeDraft(e.target.value);
      }}
    />
    <div
      className={`text-right text-gray-500 dark:text-gray-400 ${
        didSaveDraft ? "visible" : "invisible"
      }`}
    >
      ✔ Draft saved
    </div>

    <MarkdownPreview raw={replyText} />

    <button disabled={!currentAuthor} className={"btn mt-2"} type={"submit"}>
      Post reply
    </button>
  </form>;
}
