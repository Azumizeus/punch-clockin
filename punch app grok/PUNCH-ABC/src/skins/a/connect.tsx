import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PunchBar } from "@/punch/bar";
import { usePunch, useT } from "@/lib/punch/store";
import { Bolt } from "@/skins/bolt";

export function ConnectA() {
  const t = useT();
  const connect = usePunch((s) => s.connect);
  const [busy, setBusy] = useState(false);

  return (
    <div className="flex min-h-dvh flex-col pb-8">
      <PunchBar />
      <div className="flex flex-1 flex-col items-center justify-center px-5 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">A · Horloge d’usine</p>
        <div className="relative mt-8 grid size-48 place-items-center rounded-full border border-accent">
          <Bolt className="size-14" />
        </div>
        <h1 className="mt-8 font-display text-4xl font-medium tracking-tight">{t.clockIn}</h1>
        <p className="mt-3 max-w-[28ch] text-sm text-muted">{t.nexusLine}</p>
        <Button
          className="mt-10 w-full rounded-full"
          size="lg"
          disabled={busy}
          onClick={() => {
            setBusy(true);
            window.setTimeout(() => connect("punch"), 700);
          }}
        >
          {busy ? t.connecting : t.connectCta}
        </Button>
        <Link to="/looks" className="mt-3 flex h-12 items-center text-sm text-muted">
          ← A B C
        </Link>
      </div>
    </div>
  );
}
