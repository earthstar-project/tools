import { isErr } from "earthstar";
import * as React from "react";
import { useCurrentAuthor } from "react-earthstar";
import { useNavigate, useParams } from "react-router-dom";
import { useLetterboxLayer } from "./letterbox-layer";
import MarkdownPreview from "./MarkdownPreview";

export default function ThreadReplyForm() {
  const { authorPubKey, timestamp } = useParams();

  const [replyText, setReplyText] = React.useState("");

  const [currentAuthor] = useCurrentAuthor();

  const letterboxLayer = useLetterboxLayer();

  const navigate = useNavigate();

  const formRef = React.useRef<HTMLFormElement | null>(null);

  React.useLayoutEffect(() => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ block: "end" });
    }
  }, []);

  return <form
    ref={formRef}
    className={"flex flex-col p-6 bg-white border-t"}
    onSubmit={() => {
      const result = letterboxLayer.createReply(
        `${authorPubKey}/${timestamp}`,
        replyText,
      );

      if (isErr(result)) {
        alert("Something went wrong with creating this reply.");
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
      onChange={(e) => setReplyText(e.target.value)}
    />
    <MarkdownPreview raw={replyText} />
    <button disabled={!currentAuthor} className={"btn mt-2"} type={"submit"}>
      Post reply
    </button>
  </form>;
}
