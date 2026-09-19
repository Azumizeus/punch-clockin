import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { PunchBar } from "@/punch/bar";
import { usePunch, useT } from "@/lib/punch/store";
import { Bolt } from "@/skins/bolt";

export function ConnectC() {
  const t = useT();
  const connect = usePunch((s) => s.connect);
  const [busy, setBusy] = useState(false);

  return (
    <div className="flex min-h-dvh flex-col">
      <PunchBar />
      <div className="flex flex-1 flex-col items-center justify-center px-5 text-center">
        <Bolt className="size-8" />
        <h1 className="mt-10 font-display text-5xl font-medium tracking-tight">{t.clockIn}</h1>
        <p className="mt-3 text-sm text-muted">{t.nexusLine}</p>
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            setBusy(true);
            window.setTimeout(() => connect("punch"), 700);
          }}
          className="mt-16 h-14 w-full max-w-xs rounded-full bg-accent text-base font-medium text-accent-fg disabled:opacity-40"
        >
          {busy ? t.connecting : t.connectCta}
        </button>
        <Link to="/looks" className="mt-6 text-sm text-muted">
          ← A B C
        </Link>
      </div>
    </div>
  );
}
