import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatAmt, rankFromStake, rankMeets } from "@/lib/punch/format";
import { usePunch, useT } from "@/lib/punch/store";
import { toast } from "sonner";

export function PliBox() {
  const t = useT();
  const locale = usePunch((s) => s.locale);
  const plis = usePunch((s) => s.plis);
  const openedIds = usePunch((s) => s.openedIds);
  const wallet = usePunch((s) => s.wallet);
  const buyPli = usePunch((s) => s.buyPli);
  const openLetter = usePunch((s) => s.openLetter);
  const rank = rankFromStake(wallet.stakedSkr);
  const [, tick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => tick((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  function open(id: string) {
    const err = buyPli(id);
    if (err === "bal") toast(t.notEnough);
    else if (err === "rank") toast(t.lockedRank);
    else if (err === "genesis") toast(t.lockedGenesis);
    else if (err === "wait") toast(t.pliSoon);
    else if (err === "mine") toast(t.pliMine);
  }

  return (
    <div className="px-5 pb-8 pt-3">
      <h1 className="font-display text-4xl font-medium leading-none tracking-tight">{t.pliTag}</h1>
      <p className="mt-3 text-base leading-relaxed text-muted">{t.pliChain}</p>

      <ul className="mt-6 space-y-4">
        {plis.map((pli) => {
          const opened = openedIds.includes(pli.id);
          const waiting = pli.opensAt > Date.now();
          const lockedRank = !rankMeets(rank, pli.rank);
          const lockedGen = pli.genesisRequired && !wallet.genesis;
          const left = waiting ? Math.max(0, Math.ceil((pli.opensAt - Date.now()) / 1000)) : 0;
          let cta: string = t.pliOpenCta;
          if (pli.mine && pli.sold) cta = t.pliSold;
          else if (pli.mine) cta = t.pliWaitingSell;
          else if (opened) cta = t.pliRead;
          else if (waiting) cta = `${t.pliWaiting} · ${left}s`;
          else if (lockedGen) cta = t.lockedGenesis;
          else if (lockedRank) cta = t.lockedRank;

          return (
            <li key={pli.id} className="envelope">
              <div className="envelope-flap" />
              <div className="p-4 pt-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm text-muted">
                    {pli.author} · {pli.city[locale]}
                  </p>
                  <span className="wax text-[10px] font-medium">
                    {opened ? "OK" : waiting ? left : "PL"}
                  </span>
                </div>
                <h2 className="mt-2 font-display text-2xl font-medium leading-snug">
                  {pli.tease[locale]}
                </h2>
                <p className="mt-3 font-display text-2xl tabular-nums">
                  {formatAmt(pli.price, pli.token)} {pli.token}
                </p>
                {pli.mine ? <p className="mt-1 text-sm">{t.pliMine}</p> : null}
                <Button
                  className="mt-4 w-full"
                  size="lg"
                  variant={opened || pli.mine ? "secondary" : "primary"}
                  disabled={Boolean(pli.mine && !pli.sold) || (waiting && !opened)}
                  onClick={() => {
                    if (opened) openLetter(pli.id);
                    else open(pli.id);
                  }}
                >
                  {cta}
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
