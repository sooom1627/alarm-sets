import { useEffect, useState } from "react";

// The current time, moving on every second: the running cards count down
// with it and drop the starts that have rung (docs/screens/running.md).
export function useNow() {
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  return now;
}
