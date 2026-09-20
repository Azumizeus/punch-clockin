import { useEffect, useState } from "react";
import { usePunch } from "@/lib/punch/store";
import { Bolt } from "@/skins/bolt";
import { cn } from "@/lib/utils";

export function PunchSplash() {
  const skin = usePunch((s) => s.skin);
  const [out, setOut] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    setOut(false);
    setGone(false);
    const hide = window.setTimeout(() => setOut(true), 900);
    const remove = window.setTimeout(() => setGone(true), 1250);
    return () => {
      window.clearTimeout(hide);
      window.clearTimeout(remove);
    };
  }, [skin]);

  if (gone) return null;

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 z-40 grid place-items-center bg-bg text-fg transition-opacity duration-300",
        out ? "opacity-0" : "opacity-100",
      )}
    >
      {skin === "b" ? (
        <article className="w-[70%] rounded-sm bg-paper px-6 py-10 text-center text-paper-fg">
          <p className="font-mono text-[10px] uppercase tracking-[0.35em]">PUNCH</p>
          <p className="mt-4 font-display text-6xl font-medium leading-none">IN</p>
        </article>
      ) : skin === "c" ? (
        <Bolt className="size-8" />
      ) : (
        <div className="relative grid size-36 place-items-center rounded-full border-2 border-accent">
          <Bolt className="size-12" />
        </div>
      )}
    </div>
  );
}
