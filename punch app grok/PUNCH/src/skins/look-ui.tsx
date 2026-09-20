import { useEffect, useState, type ReactNode } from "react";
import { lookTokens } from "@/lib/punch/looks";
import { usePunch } from "@/lib/punch/store";
import { cn } from "@/lib/utils";

export function ClockLive() {
  const skin = usePunch((s) => s.skin);
  const tag = lookTokens[skin].clockTag;
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!tag) return;
    let id = 0;
    const tick = () => setNow(new Date());
    const start = () => {
      tick();
      window.clearInterval(id);
      if (document.visibilityState === "visible") id = window.setInterval(tick, 1000);
    };
    start();
    document.addEventListener("visibilitychange", start);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", start);
    };
  }, [tag]);

  if (!tag) return null;
  const clock = now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  if (tag === "dash") {
    return <p className="mt-3 font-mono text-xs tracking-[0.35em] text-muted">— {clock} —</p>;
  }
  return (
    <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.3em] text-muted">
      Local time {clock}
    </p>
  );
}

export function HwNav() {
  const skin = usePunch((s) => s.skin);
  if (!lookTokens[skin].hwNav) return null;
  return (
    <p className="mt-4 font-mono text-[10px] tracking-[0.4em] text-subtle">‖ DOM / 2 VUE</p>
  );
}

export function LookTitle({ children, className }: { children: ReactNode; className?: string }) {
  const skin = usePunch((s) => s.skin);
  const tok = lookTokens[skin];
  return (
    <h1
      className={cn("look-title font-medium tracking-tight", tok.monoTitle ? "font-mono uppercase" : "font-display", className)}
      style={{ letterSpacing: tok.titleSpacing >= 1 ? `${tok.titleSpacing * 0.04}em` : `${tok.titleSpacing * 0.02}em` }}
    >
      {children}
    </h1>
  );
}