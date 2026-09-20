import { useEffect, useState } from "react";
import { usePunch } from "@/lib/punch/store";

const WINDOW_MS = 75_000;

export function usePunched() {
  const lastPunchAt = usePunch((s) => s.lastPunchAt);
  const [left, setLeft] = useState(0);

  useEffect(() => {
    if (!lastPunchAt) {
      setLeft(0);
      return;
    }
    const tick = () => setLeft(Math.max(0, WINDOW_MS - (Date.now() - lastPunchAt)));
    tick();
    if (Date.now() - lastPunchAt >= WINDOW_MS) return;
    const id = window.setInterval(tick, 400);
    return () => window.clearInterval(id);
  }, [lastPunchAt]);

  return { punched: left > 0 && !!lastPunchAt, left, lastPunchAt };
}
