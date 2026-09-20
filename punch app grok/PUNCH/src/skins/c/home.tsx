import { countryByCode } from "@/lib/punch/globe";
import { usePunch, useT } from "@/lib/punch/store";
import { ClockLive, HwNav, LookTitle } from "@/skins/look-ui";
import { Bolt } from "@/skins/bolt";
import { usePunched } from "@/skins/use-punched";

export function HomeC() {
  const t = useT();
  const punchIn = usePunch((s) => s.punchIn);
  const locale = usePunch((s) => s.locale);
  const country = usePunch((s) => s.country);
  const setTab = usePunch((s) => s.setTab);
  const { punched, lastPunchAt } = usePunched();
  const place = countryByCode(country);
  const time = lastPunchAt
    ? new Date(lastPunchAt).toLocaleTimeString(locale === "fr" ? "fr-FR" : "en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div className="flex min-h-[70dvh] flex-col items-center justify-center px-5 text-center">
      <Bolt className="mt-8 size-8" />
      {!punched ? (
        <>
          <LookTitle className="mt-10 text-5xl">{t.clockIn}</LookTitle>
          <HwNav />
          <p className="mt-3 text-sm text-muted">{t.nexusLine}</p>
          <ClockLive />
          <button
            type="button"
            onClick={() => punchIn()}
            className="mt-16 h-14 w-full max-w-xs bg-accent text-base font-medium text-accent-fg"
            style={{ borderRadius: "var(--cta-radius)" }}
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
