import { Button } from "@/components/ui/button";
import { formatUsd, rankFromStake } from "@/lib/punch/format";
import { NEARBY } from "@/lib/punch/shifts";
import { usePunch, useT } from "@/lib/punch/store";

export function PunchRest() {
  const t = useT();
  const streak = usePunch((s) => s.streak);
  const crewOnline = usePunch((s) => s.crewOnline);
  const todayEarnedUsd = usePunch((s) => s.todayEarnedUsd);
  const wallet = usePunch((s) => s.wallet);
  const feed = usePunch((s) => s.feed) ?? [];
  const locale = usePunch((s) => s.locale);
  const greetNearby = usePunch((s) => s.greetNearby);
  const greetedIds = usePunch((s) => s.greetedIds) ?? [];
  const rank = rankFromStake(wallet.stakedSkr);

  return (
    <>
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
    </>
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
