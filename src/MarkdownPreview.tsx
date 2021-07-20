import * as React from "react";
import renderToMarkdown from "./util/markdown";

export default function MarkdownPreview({ raw }: { raw: string }) {
  const [enabled, setEnabled] = React.useState(false);

  return <div>
    {enabled
      ? <div className={"border p-2 border-dashed"}>
        {renderToMarkdown(raw)}
      </div>
      : null}
    <label>
      <input
        className="mr-2"
        type="checkbox"
        checked={enabled}
        onChange={(e) => setEnabled(e.target.checked)}
      />
      Show preview
    </label>
  </div>;
}
