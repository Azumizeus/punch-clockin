import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function PunchSplash() {
  const [out, setOut] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const hide = window.setTimeout(() => setOut(true), 1100);
    const remove = window.setTimeout(() => setGone(true), 1500);
    return () => {
      window.clearTimeout(hide);
      window.clearTimeout(remove);
    };
  }, []);

  if (gone) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 grid place-items-center bg-[#0c0c0d] transition-opacity duration-300",
        out ? "opacity-0" : "opacity-100",
      )}
    >
      <svg viewBox="0 0 32 32" className="size-10" aria-hidden>
        <path fill="#f2f1ee" d="M18.4 3.2 8.6 16.8h6.1l-2.2 12 11.6-16.1h-6.4L18.4 3.2Z" />
      </svg>
    </div>
  );
}
