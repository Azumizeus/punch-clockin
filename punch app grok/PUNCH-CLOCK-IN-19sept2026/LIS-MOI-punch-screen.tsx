import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { countryByCode } from "@/lib/punch/globe";
import { formatUsd, rankFromStake } from "@/lib/punch/format";
import { NEARBY } from "@/lib/punch/shifts";
import { usePunch, useT } from "@/lib/punch/store";
import { cn } from "@/lib/utils";

export function PunchScreen() {
  const t = useT();
  const punchIn = usePunch((s) => s.punchIn);
  const lastPunchAt = usePunch((s) => s.lastPunchAt);
  const streak = usePunch((s) => s.streak);
  const crewOnline = usePunch((s) => s.crewOnline);
  const todayEarnedUsd = usePunch((s) => s.todayEarnedUsd);
  const wallet = usePunch((s) => s.wallet);
  const feed = usePunch((s) => s.feed) ?? [];
  const locale = usePunch((s) => s.locale);
  const country = usePunch((s) => s.country);
  const pulse = usePunch((s) => s.globePulse);
  const setTab = usePunch((s) => s.setTab);
  const cooldownLeft = usePunch((s) => s.cooldownLeft);
  const greetNearby = usePunch((s) => s.greetNearby);
  const greetedIds = usePunch((s) => s.greetedIds) ?? [];
  const seenHow = usePunch((s) => s.seenHow);
  const dismissHow = usePunch((s) => s.dismissHow);
  const [left, setLeft] = useState(0);
  const punched = left > 0 && !!lastPunchAt;
  const rank = rankFromStake(wallet.stakedSkr);
  const place = countryByCode(country);

  useEffect(() => {
    const tick = () => setLeft(cooldownLeft());
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [cooldownLeft, lastPunchAt]);

  const time = lastPunchAt
    ? new Date(lastPunchAt).toLocaleTimeString(locale === "fr" ? "fr-FR" : "en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div className="flex flex-col px-5 pb-8 pt-2">
      {wallet.genesis ? (
        <p className="text-center text-xs font-medium text-muted">{t.genesis}</p>
      ) : null}

      {!punched ? (
        <div className="mt-4 flex flex-col items-center text-center">
          <p className="font-display text-5xl font-medium tracking-tight">{t.clockIn}</p>
          <p className="mt-2 text-sm text-muted">{t.nexusLine}</p>
          <div className="mt-8">
            <PunchDial punched={false} left={left} onPunch={() => punchIn()} label={t.punchCta} />
          </div>
          <p className="mt-5 font-display text-2xl font-medium tracking-tight">{t.punchCta}</p>
          <p className="mt-2 text-xs text-subtle">
            {place.name[locale]} · {streak} {t.days}
          </p>
          <p className="mt-3 text-center text-xs leading-relaxed text-subtle">{t.demoNote}</p>
        </div>
      ) : (
        <div className="mt-4">
          <article className="receipt-enter rounded-sm bg-paper px-5 py-6 text-paper-fg">
            <div className="flex items-start justify-between">
              <p className="font-mono text-xs uppercase tracking-widest text-paper-muted">{t.app}</p>
              <svg viewBox="0 0 32 32" className="size-6" aria-hidden>
                <path fill="currentColor" d="M18.4 3.2 8.6 16.8h6.1l-2.2 12 11.6-16.1h-6.4L18.4 3.2Z" />
              </svg>
            </div>
            <p className="mt-6 font-display text-6xl font-medium leading-none tracking-tight">{t.ticketIn}</p>
            <p className="mt-3 font-display text-4xl font-medium tabular-nums">{time}</p>
            <p className="mt-2 text-lg">{place.name[locale]}</p>
            <p className="mt-8 font-mono text-sm tracking-wide">{t.ticketRule}</p>
            {pulse ? (
              <p className="mt-3 truncate font-mono text-[10px] text-paper-muted">
                {t.globeStamp} {pulse.sig.slice(0, 18)}…
              </p>
            ) : null}
          </article>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button size="lg" onClick={() => setTab("board")}>
              {t.seeJobs}
            </Button>
            <Button size="lg" variant="secondary" onClick={() => setTab("globe")}>
              {t.seeWorld}
            </Button>
          </div>
        </div>
      )}

      {!seenHow && !punched ? (
        <div className="mt-6 rounded-2xl bg-surface p-4 shadow-border">
          <p className="font-display text-lg font-medium">{t.howTitle}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">{t.how1b}</p>
          <p className="mt-1 text-sm leading-relaxed text-muted">{t.how2b}</p>
          <p className="mt-1 text-sm leading-relaxed text-muted">{t.how3b}</p>
          <Button className="mt-3 w-full" onClick={dismissHow}>
            {t.done}
          </Button>
        </div>
      ) : null}

      <div className="mt-8 grid grid-cols-3 gap-2">
        <Stat k={t.streak} v={`${streak}`} sub={t.days} />
        <Stat k={t.crew} v={crewOnline.toLocaleString()} sub={t.live} />
        <Stat k={t.today} v={formatUsd(todayEarnedUsd)} sub="USD" />
      </div>

      <section className="mt-8">
        <h2 className="font-display text-lg font-medium">{t.nearby}</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted">{t.greetPay}</p>
        <ul className="mt-3 space-y-2">
          {NEARBY.map((p) => {
            const done = greetedIds.includes(p.id);
            return (
              <li
                key={p.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-surface px-4 py-3 shadow-border"
              >
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-muted">
                    {p.meters} {t.meters}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={done ? "secondary" : "primary"}
                  disabled={done}
                  onClick={() => greetNearby(p.id, p.name)}
                >
                  {done ? t.greeted : t.greet}
                </Button>
              </li>
            );
          })}
        </ul>
      </section>

      <p className="mt-8 text-center text-sm leading-relaxed text-muted">{t.rankLine}</p>
      <p className="mt-2 text-center text-xs font-medium text-fg">
        {t.openRanks[rank]} · {streak >= 3 ? t.earlyAccess : t.earlyAccessOff}
      </p>

      <section className="mt-8">
        <h2 className="font-display text-lg font-medium">{t.live}</h2>
        <ul className="mt-2 divide-y divide-line">
          {feed.slice(0, 4).map((item) => (
            <li key={item.id} className="flex items-baseline justify-between gap-3 py-3">
              <p className="text-sm">
                <span className="text-fg">{item.name === "You" ? (locale === "fr" ? "Toi" : "You") : item.name}</span>{" "}
                <span className="text-muted">{item.text[locale]}</span>
              </p>
              {item.amount != null && item.token ? (
                <span className="shrink-0 font-mono text-xs tabular-nums">
                  {item.amount} {item.token}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Stat({ k, v, sub }: { k: string; v: string; sub: string }) {
  return (
    <div className="rounded-xl bg-surface p-3 shadow-border">
      <p className="text-xs text-subtle">{k}</p>
      <p className="mt-1 font-display text-lg font-medium tabular-nums leading-none">{v}</p>
      <p className="mt-1 text-xs text-subtle">{sub}</p>
    </div>
  );
}

function PunchDial({
  punched,
  left,
  onPunch,
  label,
}: {
  punched: boolean;
  left: number;
  onPunch: () => void;
  label: string;
}) {
  const total = 75000;
  const p = punched ? Math.min(1, left / total) : 1;
  const r = 86;
  const c = 2 * Math.PI * r;
  const dash = c * p;

  return (
    <button
      type="button"
      onClick={onPunch}
      disabled={punched}
      className="relative grid size-52 place-items-center rounded-full disabled:cursor-default"
      aria-label={label}
    >
      {!punched ? (
        <span className="pulse-ring pointer-events-none absolute inset-3 rounded-full border border-line-strong" />
      ) : null}
      <svg viewBox="0 0 200 200" className="absolute inset-0 size-full -rotate-90 text-accent">
        <circle cx="100" cy="100" r={r} fill="none" stroke="currentColor" strokeOpacity="0.18" strokeWidth="1.5" />
        <circle
          cx="100"
          cy="100"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray={`${dash} ${c}`}
          strokeLinecap="round"
        />
      </svg>
      <span
        className={cn(
          "relative grid size-36 place-items-center rounded-full transition-[transform,background-color] duration-150",
          punched ? "bg-surface-2 text-fg" : "bg-accent text-accent-fg active:scale-[0.96]",
        )}
      >
        <svg viewBox="0 0 32 32" className="size-12" aria-hidden>
          <path fill="currentColor" d="M18.4 3.2 8.6 16.8h6.1l-2.2 12 11.6-16.1h-6.4L18.4 3.2Z" />
        </svg>
      </span>
    </button>
  );
}
