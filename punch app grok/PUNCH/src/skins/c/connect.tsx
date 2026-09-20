import { useState } from "react";
import { PunchBar } from "@/punch/bar";
import { usePunch, useT } from "@/lib/punch/store";
import { ClockLive, HwNav, LookTitle } from "@/skins/look-ui";
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
        <LookTitle className="mt-10 text-5xl">{t.clockIn}</LookTitle>
        <HwNav />
        <ClockLive />
        <p className="mt-3 text-sm text-muted">{t.nexusLine}</p>
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            setBusy(true);
            window.setTimeout(() => connect("punch"), 700);
          }}
          className="mt-16 h-14 w-full max-w-xs bg-accent text-base font-medium text-accent-fg disabled:opacity-40"
          style={{ borderRadius: "var(--cta-radius)" }}
        >
          {busy ? t.connecting : t.connectCta}
        </button>
      </div>
    </div>
  );
}
