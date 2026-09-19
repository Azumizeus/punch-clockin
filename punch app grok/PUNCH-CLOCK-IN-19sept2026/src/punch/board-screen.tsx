import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TokenChip } from "@/shared/token-chip";
import { formatAmt, rankFromStake, rankMeets } from "@/lib/punch/format";
import { usePunch, useT } from "@/lib/punch/store";
import type { Token } from "@/lib/punch/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const FILTERS: Array<"all" | Token> = ["all", "USDC", "USDT", "SKR"];

export function BoardScreen() {
  const t = useT();
  const locale = usePunch((s) => s.locale);
  const shifts = usePunch((s) => s.shifts);
  const wallet = usePunch((s) => s.wallet);
  const lastPunchAt = usePunch((s) => s.lastPunchAt);
  const completedIds = usePunch((s) => s.completedIds);
  const openShift = usePunch((s) => s.openShift);
  const setView = usePunch((s) => s.setView);
  const setTab = usePunch((s) => s.setTab);
  const rank = rankFromStake(wallet.stakedSkr);
  const [filter, setFilter] = useState<"all" | Token>("all");

  const list = shifts.filter((s) => (filter === "all" ? true : s.token === filter));

  function take(id: string) {
    const err = openShift(id);
    if (err === "punch") {
      toast(t.needPunch);
      setTab("punch");
    } else if (err === "rank") toast(t.lockedRank);
    else if (err === "genesis") toast(t.lockedGenesis);
    else if (err === "done") toast(t.cashed);
  }

  return (
    <div className="px-5 pb-8 pt-2">
      <h1 className="font-display text-3xl font-medium tracking-tight">
        {lastPunchAt ? t.boardUnlocked : t.needPunch}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">{t.splitBody}</p>
      <Button
        className="mt-4 w-full"
        variant="secondary"
        size="lg"
        onClick={() => setView("post")}
      >
        {t.postShift}
      </Button>

      <div className="mt-5 flex gap-2 overflow-x-auto no-scrollbar">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "h-11 shrink-0 rounded-full px-4 text-sm font-medium",
              filter === f ? "bg-accent text-accent-fg" : "bg-surface text-muted",
            )}
          >
            {f === "all" ? t.filterAll : f}
          </button>
        ))}
      </div>

      <ul className="mt-4 space-y-3">
        {list.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted">{t.emptyBoard}</p>
        ) : (
          list.map((shift) => {
            const lockedRank = !rankMeets(rank, shift.rank);
            const lockedGen = shift.genesisRequired && !wallet.genesis;
            const done = completedIds.includes(shift.id) && !shift.userPosted;
            const full = shift.taken >= shift.spots;
            const locked = lockedRank || lockedGen || done || full;
            const status = done
              ? t.cashed
              : lockedGen
                ? t.lockedGenesis
                : lockedRank
                  ? t.lockedRank
                  : full
                    ? t.locked
                    : null;
            return (
              <li key={shift.id} className="rounded-2xl bg-surface p-4 shadow-border">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-subtle">
                      {shift.sponsor} · {shift.city[locale]}
                    </p>
                    <h2 className="mt-1 font-display text-xl font-medium leading-snug">
                      {shift.title[locale]}
                    </h2>
                  </div>
                  <TokenChip token={shift.token} />
                </div>
                <p className="mt-3 font-display text-2xl font-medium tabular-nums">
                  {formatAmt(shift.payout, shift.token)} {shift.token}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {shift.durationMin} {t.min} · {shift.spots - shift.taken} {t.spots} ·{" "}
                  {t.kinds[shift.kind]}
                </p>
                {shift.userPosted ? <p className="mt-1 text-sm text-fg">{t.posted}</p> : null}
                <Button
                  className="mt-4 w-full"
                  size="lg"
                  variant={locked ? "secondary" : "primary"}
                  onClick={() => take(shift.id)}
                >
                  {status ?? t.startShift}
                </Button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
