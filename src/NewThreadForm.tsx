import { isErr } from "earthstar";
import * as React from "react";
import { useCurrentAuthor } from "react-earthstar";
import { useNavigate } from "react-router-dom";
import { useLetterboxLayer } from "./letterbox-layer";

export default function NewThreadForm() {
  const [currentAuthor] = useCurrentAuthor();
  const letterboxLayer = useLetterboxLayer();

  const [title, setTitle] = React.useState("");
  const [postVal, setPostVal] = React.useState("");
  const navigate = useNavigate();

  if (!currentAuthor) {
    return <div>{"You must be signed in to make threads"}</div>;
  }

  return <form
    onSubmit={() => {
      const content = [`# ${title}`, "", postVal].join("\n");

      const res = letterboxLayer.createThread(content);

      if (isErr(res)) {
        alert("Couldn't create the new thread.");
        console.error(res);

        return;
      }

      navigate("..");
    }}
  >
    <input
      type={"text"}
      value={title}
      onChange={(e) => setTitle(e.target.value)}
    />
    <textarea
      placeholder={"Write the first post of a new thread. Accepts markdown."}
      value={postVal}
      onChange={(e) => {
        setPostVal(e.target.value);
      }}
    />
    <button type={"submit"}>Create new thread</button>
  </form>;
}
