import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PunchBar } from "@/punch/bar";
import { usePunch, useT } from "@/lib/punch/store";
import { Bolt } from "@/skins/bolt";

export function ConnectB() {
  const t = useT();
  const connect = usePunch((s) => s.connect);
  const [busy, setBusy] = useState(false);

  return (
    <div className="flex min-h-dvh flex-col pb-8">
      <PunchBar />
      <div className="flex flex-1 flex-col justify-center px-5">
        <article className="look-ticket mt-2 bg-paper px-5 py-8 text-paper-fg">
          <div className="flex justify-between">
            <p className="font-mono text-xs uppercase tracking-widest text-paper-muted">{t.clockIn}</p>
            <Bolt className="size-6" />
          </div>
          <p className="mt-8 font-display text-6xl font-medium leading-none">{t.ticketIn}</p>
          <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.3em] text-paper-muted">Time</p>
          <p className="mt-1 font-display text-2xl tabular-nums">—:—</p>
          <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.3em] text-paper-muted">Split</p>
          <p className="mt-1 font-mono text-sm">{t.ticketRule}</p>
        </article>
        <Button
          className="mt-6 w-full"
          size="lg"
          disabled={busy}
          onClick={() => {
            setBusy(true);
            window.setTimeout(() => connect("punch"), 700);
          }}
        >
          {busy ? t.connecting : t.connectCta}
        </Button>
      </div>
    </div>
  );
}
