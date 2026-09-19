import { useEffect, useState } from "react";
import { countryByCode } from "@/lib/punch/globe";
import { usePunch, useT } from "@/lib/punch/store";
import { Bolt } from "@/skins/bolt";

export function HomeC() {
  const t = useT();
  const punchIn = usePunch((s) => s.punchIn);
  const lastPunchAt = usePunch((s) => s.lastPunchAt);
  const cooldownLeft = usePunch((s) => s.cooldownLeft);
  const locale = usePunch((s) => s.locale);
  const country = usePunch((s) => s.country);
  const setTab = usePunch((s) => s.setTab);
  const [left, setLeft] = useState(0);
  const punched = left > 0 && !!lastPunchAt;
  const place = countryByCode(country);
  const time = lastPunchAt
    ? new Date(lastPunchAt).toLocaleTimeString(locale === "fr" ? "fr-FR" : "en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  useEffect(() => {
    const tick = () => setLeft(cooldownLeft());
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [cooldownLeft, lastPunchAt]);

  return (
    <div className="flex min-h-[70dvh] flex-col items-center justify-center px-5 text-center">
      <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-subtle">C · Hardware</p>
      <Bolt className="mt-16 size-8" />
      {!punched ? (
        <>
          <h1 className="mt-10 font-display text-5xl font-medium tracking-tight">{t.clockIn}</h1>
          <p className="mt-3 text-sm text-muted">{t.nexusLine}</p>
          <button
            type="button"
            onClick={() => punchIn()}
            className="mt-16 h-14 w-full max-w-xs rounded-full bg-accent text-base font-medium text-accent-fg"
          >
            {t.punchCta}
          </button>
        </>
      ) : (
        <>
          <p className="mt-10 font-display text-6xl font-medium tracking-tight">{t.ticketIn}</p>
          <p className="mt-3 font-display text-3xl tabular-nums">{time}</p>
          <p className="mt-2 text-sm text-muted">{place.name[locale]}</p>
          <div className="mt-16 flex w-full max-w-xs flex-col gap-2">
            <button type="button" className="h-12 text-sm" onClick={() => setTab("board")}>
              {t.seeJobs} →
            </button>
            <button type="button" className="h-12 text-sm text-muted" onClick={() => setTab("globe")}>
              {t.seeWorld} →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
