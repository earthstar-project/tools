import * as React from "react";

export default function CopyButton({
  children,
  copyValue,
  onClick,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  copyValue: any;
}) {
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    let id = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(id);
  }, [copied]);

  return (
    <button
      className={props.className || "btn"}
      {...props}
      onClick={(e) => {
        e.preventDefault();

        if (onClick) {
          onClick(e);
        }

        navigator.clipboard.writeText(copyValue);
        setCopied(true);
      }}
    >
      {copied ? "Copied to clipboard!" : children || "Copy"}
    </button>
  );
}
