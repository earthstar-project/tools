import { isErr } from "earthstar";
import * as React from "react";
import { useCurrentAuthor } from "react-earthstar";
import { useNavigate } from "react-router-dom";
import { useLetterboxLayer } from "./letterbox-layer";
import MarkdownPreview from "./MarkdownPreview";

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
    className="flex flex-col px-6 py-3"
    onSubmit={() => {
      const content = [`# ${title}`, "", postVal].join("\n");

      const res = letterboxLayer.createThread(content);

      if (isErr(res)) {
        alert("Couldn't create the new thread.");
        console.error(res);

        return;
      }

      navigate(`../thread/${res.id}`);
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
      rows={6}
      value={postVal}
      onChange={(e) => {
        setPostVal(e.target.value);
      }}
    />
    <MarkdownPreview raw={[`# ${title}`, ``, postVal].join("\n")} />
    <button className="btn mt-2" type={"submit"}>Create new thread</button>
  </form>;
}
