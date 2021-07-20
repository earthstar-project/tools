import { isErr } from "earthstar";
import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLetterboxLayer } from "./letterbox-layer";

export default function ThreadReplyForm() {
  const { authorPubKey, timestamp } = useParams();

  const [replyText, setReplyText] = React.useState("");

  const letterboxLayer = useLetterboxLayer();

  const navigate = useNavigate();

  return <form
    className={"flex flex-col"}
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
      className={"border"}
      value={replyText}
      placeholder={"Supports markdown"}
      onChange={(e) => setReplyText(e.target.value)}
    />
    <button className={"bg-blue-100 p-2"} type={"submit"}>Reply</button>
  </form>;
}
