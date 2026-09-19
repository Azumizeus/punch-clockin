import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { countryByCode } from "@/lib/punch/globe";
import { usePunch, useT } from "@/lib/punch/store";
import { Bolt } from "@/skins/bolt";
import { PunchRest } from "@/skins/rest";
import { cn } from "@/lib/utils";

export function HomeA() {
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

  const total = 75000;
  const p = punched ? Math.min(1, left / total) : 1;
  const r = 86;
  const c = 2 * Math.PI * r;

  return (
    <div className="flex flex-col px-5 pb-8 pt-4">
      <p className="text-center font-mono text-xs uppercase tracking-[0.3em] text-muted">A · Horloge</p>
      <div className="mt-6 flex flex-col items-center">
        <button
          type="button"
          onClick={() => punchIn()}
          disabled={punched}
          aria-label={t.punchCta}
          className="relative grid size-56 place-items-center rounded-full disabled:cursor-default"
        >
          {!punched ? (
            <span className="pulse-ring pointer-events-none absolute inset-2 rounded-full border border-accent/40" />
          ) : null}
          <svg viewBox="0 0 200 200" className="absolute inset-0 size-full -rotate-90 text-accent">
            <circle cx="100" cy="100" r={r} fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2" />
            <circle
              cx="100"
              cy="100"
              r={r}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray={`${c * p} ${c}`}
              strokeLinecap="round"
            />
          </svg>
          <span
            className={cn(
              "relative grid size-40 place-items-center rounded-full",
              punched ? "bg-surface-2" : "bg-accent text-accent-fg active:scale-[0.96]",
            )}
          >
            {punched ? (
              <span className="font-display text-3xl tabular-nums">{time}</span>
            ) : (
              <Bolt className="size-14" />
            )}
          </span>
        </button>
        <p className="mt-6 font-display text-3xl font-medium tracking-tight">
          {punched ? t.punched : t.punchCta}
        </p>
        <p className="mt-2 text-sm text-muted">{place.name[locale]}</p>
        {punched ? (
          <div className="mt-5 grid w-full grid-cols-2 gap-2">
            <Button size="lg" onClick={() => setTab("board")}>
              {t.seeJobs}
            </Button>
            <Button size="lg" variant="secondary" onClick={() => setTab("globe")}>
              {t.seeWorld}
            </Button>
          </div>
        ) : (
          <p className="mt-3 text-xs text-subtle">{t.demoNote}</p>
        )}
      </div>
      <PunchRest />
    </div>
  );
}
