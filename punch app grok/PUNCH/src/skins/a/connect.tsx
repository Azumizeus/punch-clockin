import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PunchBar } from "@/punch/bar";
import { usePunch, useT } from "@/lib/punch/store";
import { ClockLive, LookTitle } from "@/skins/look-ui";
import { Bolt } from "@/skins/bolt";

export function ConnectA() {
  const t = useT();
  const connect = usePunch((s) => s.connect);
  const [busy, setBusy] = useState(false);

  return (
    <div className="flex min-h-dvh flex-col pb-8">
      <PunchBar />
      <div className="flex flex-1 flex-col items-center justify-center px-5 text-center">
        <div className="relative mt-4 grid size-48 place-items-center rounded-full border-2" style={{ borderColor: "var(--dial-ring)" }}>
          <Bolt className="size-14" />
        </div>
        <LookTitle className="mt-8 text-4xl">{t.clockIn}</LookTitle>
        <ClockLive />
        <p className="mt-3 max-w-[28ch] text-sm text-muted">{t.nexusLine}</p>
        <Button
          className="mt-10 w-full"
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
