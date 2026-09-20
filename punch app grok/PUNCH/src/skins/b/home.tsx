import { Button } from "@/components/ui/button";
import { countryByCode } from "@/lib/punch/globe";
import { usePunch, useT } from "@/lib/punch/store";
import { Bolt } from "@/skins/bolt";
import { PunchRest } from "@/skins/rest";
import { usePunched } from "@/skins/use-punched";

export function HomeB() {
  const t = useT();
  const punchIn = usePunch((s) => s.punchIn);
  const locale = usePunch((s) => s.locale);
  const country = usePunch((s) => s.country);
  const pulse = usePunch((s) => s.globePulse);
  const setTab = usePunch((s) => s.setTab);
  const { punched, lastPunchAt } = usePunched();
  const place = countryByCode(country);
  const time = lastPunchAt
    ? new Date(lastPunchAt).toLocaleTimeString(locale === "fr" ? "fr-FR" : "en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "--:--";

  return (
    <div className="flex flex-col px-5 pb-8 pt-4">
      <button type="button" onClick={() => punchIn()} disabled={punched} className="mt-2 text-left disabled:cursor-default">
        <article className="look-ticket bg-paper px-5 py-7 text-paper-fg">
          <div className="flex items-start justify-between">
            <p className="font-mono text-xs uppercase tracking-widest text-paper-muted">{t.app}</p>
            <Bolt className="size-6" />
          </div>
          <p className="mt-8 font-display text-7xl font-medium leading-none tracking-tight">
            {punched ? t.ticketIn : "—"}
          </p>
          <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.3em] text-paper-muted">Time</p>
          <p className="mt-1 font-display text-3xl font-medium tabular-nums">{time}</p>
          <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.3em] text-paper-muted">Country</p>
          <p className="mt-1 text-lg">{place.name[locale]}</p>
          <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.3em] text-paper-muted">Split</p>
          <p className="mt-1 font-mono text-sm tracking-wide">{t.ticketRule}</p>
          {pulse && punched ? (
            <p className="mt-3 truncate font-mono text-[10px] text-paper-muted">
              {t.globeStamp} {pulse.sig.slice(0, 18)}…
            </p>
          ) : (
            <p className="mt-3 text-sm text-paper-muted">{punched ? t.punched : t.punchCta}</p>
          )}
        </article>
      </button>
      {punched ? (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button size="lg" onClick={() => setTab("board")}>
            {t.seeJobs}
          </Button>
          <Button size="lg" variant="secondary" onClick={() => setTab("globe")}>
            {t.seeWorld}
          </Button>
        </div>
      ) : (
        <p className="mt-3 text-center text-xs text-subtle">{t.demoNote}</p>
      )}
      <PunchRest />
    </div>
  );
}
