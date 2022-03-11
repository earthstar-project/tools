import * as React from "react";
import { Link } from "react-router-dom";

export default function PageBar(
  { backLink, children }: { backLink: string; children: React.ReactNode },
) {
  return (
    <div className="flex py-2 px-3 bg-white dark:bg-black border-b shadow-sm justify-end sticky top-0 z-50 items-baseline dark:text-white dark:border-gray-800">
      <Link className="md:hidden mr-2 text-blue-500 text-xl" to={backLink}>
        ⬅
      </Link>
      {children}
    </div>
  );
}
