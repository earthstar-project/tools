import { Doc } from "earthstar";
import * as React from "react";

export function useIsCacheHeated<T>(value: T | undefined): boolean {
  const didRenderOnceRef = React.useRef(false);
  const [isHeated, setIsHeated] = React.useState(false);

  React.useEffect(() => {
    if (didRenderOnceRef.current === false) {
      didRenderOnceRef.current = true;
      return;
    } else if (didRenderOnceRef.current === true && isHeated === false) {
      setIsHeated(true);
    }
  }, [value]);

  return isHeated;
}
