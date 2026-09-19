import { useState } from "react";
import { Link } from "@tanstack/react-router";
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
        <p className="text-center font-mono text-xs uppercase tracking-[0.3em] text-muted">B · Ticket de pointeuse</p>
        <article className="mt-6 rounded-sm bg-paper px-5 py-8 text-paper-fg">
          <div className="flex justify-between">
            <p className="font-mono text-xs uppercase tracking-widest text-paper-muted">{t.clockIn}</p>
            <Bolt className="size-6" />
          </div>
          <h1 className="mt-8 font-display text-5xl font-medium leading-none">{t.ticketIn}</h1>
          <p className="mt-4 text-base text-paper-muted">{t.nexusLine}</p>
          <p className="mt-8 font-mono text-sm">{t.ticketRule}</p>
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
        <Link to="/looks" className="mt-3 flex h-12 items-center justify-center text-sm text-muted">
          ← A B C
        </Link>
      </div>
    </div>
  );
}
