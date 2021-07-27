import { isErr } from "earthstar";
import * as React from "react";
import { useCurrentAuthor } from "react-earthstar";
import { useNavigate, useParams } from "react-router-dom";
import { useDebouncedCallback } from "use-debounce";
import { useLetterboxLayer } from "./letterbox-layer";
import MarkdownPreview from "./MarkdownPreview";

export default function ThreadReplyForm() {
  const { authorPubKey, timestamp } = useParams();
  const threadId = `${authorPubKey}/${timestamp}`;

  const [currentAuthor] = useCurrentAuthor();
  const letterboxLayer = useLetterboxLayer();
  const [replyText, setReplyText] = React.useState(
    letterboxLayer.getReplyDraft(threadId) || "",
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
    letterboxLayer.setReplyDraft(threadId, content);

    setDidSaveDraft(true);
  }, 1000);

  return <form
    ref={formRef}
    className={"flex flex-col pt-0 p-3 lg:p-6 lg:pt-0  bg-white"}
    onSubmit={(e) => {
      e.preventDefault();

      const result = letterboxLayer.createReply(
        threadId,
        replyText,
      );

      if (isErr(result)) {
        alert("Something went wrong with creating this reply.");
      } else {
        letterboxLayer.clearReplyDraft(threadId);
      }

      navigate("..");
    }}
  >
    <textarea
      required
      className={"border p-2 mb-2 shadow-inner"}
      value={replyText}
      placeholder={"Supports markdown"}
      rows={10}
      onChange={(e) => {
        setReplyText(e.target.value);
        writeDraft(e.target.value);
      }}
    />
    {didSaveDraft
      ? <div className="text-right text-gray-500">✔ Draft saved</div>
      : null}
    <MarkdownPreview raw={replyText} />
    <button disabled={!currentAuthor} className={"btn mt-2"} type={"submit"}>
      Post reply
    </button>
  </form>;
}
