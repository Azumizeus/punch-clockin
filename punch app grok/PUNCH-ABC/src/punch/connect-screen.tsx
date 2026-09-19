import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PunchBar } from "@/punch/bar";
import { usePunch, useT } from "@/lib/punch/store";

export function ConnectScreen() {
  const t = useT();
  const connect = usePunch((s) => s.connect);
  const [busy, setBusy] = useState(false);

  function onConnect() {
    setBusy(true);
    window.setTimeout(() => connect("punch"), 700);
  }

  return (
    <div className="flex min-h-dvh flex-col pb-8">
      <PunchBar />
      <div className="flex flex-1 flex-col items-center justify-center px-5 text-center">
        <svg viewBox="0 0 32 32" className="size-10" aria-hidden>
          <path fill="currentColor" d="M18.4 3.2 8.6 16.8h6.1l-2.2 12 11.6-16.1h-6.4L18.4 3.2Z" />
        </svg>
        <h1 className="mt-8 font-display text-5xl font-medium tracking-tight">{t.clockIn}</h1>
        <p className="mt-3 text-sm text-muted">{t.nexusLine}</p>
        <Button className="mt-10 w-full" size="lg" onClick={onConnect} disabled={busy}>
          {busy ? t.connecting : t.connectCta}
        </Button>
        <Link to="/" className="mt-3 flex h-12 items-center justify-center text-sm text-muted">
          {t.atelier}
        </Link>
        <p className="mt-2 text-xs text-subtle">{t.demoVault}</p>
      </div>
    </div>
  );
}
