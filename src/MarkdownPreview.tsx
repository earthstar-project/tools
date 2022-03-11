import * as React from "react";
import { renderMarkdown } from "./util/markdown";

export default function MarkdownPreview({ raw }: { raw: string }) {
  const [enabled, setEnabled] = React.useState(false);

  const mdMemo = React.useMemo(() => renderMarkdown(raw), [raw]);

  return (
    <div className="dark:text-white">
      {enabled
        ? (
          <div className={"border p-2 border-dashed dark:border-gray-700 mb-2"}>
            {mdMemo}
          </div>
        )
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
    </div>
  );
}
