import { ReceiptCard } from "@/shared/receipt-card";
import { Button } from "@/components/ui/button";
import { formatUsd } from "@/lib/punch/format";
import { usePunch, useT } from "@/lib/punch/store";
import { Link } from "@tanstack/react-router";

export function SplitScreen() {
  const t = useT();
  const protocolUsdc = usePunch((s) => s.protocolUsdc);
  const stakerUsdc = usePunch((s) => s.stakerUsdc);
  const skrBought = usePunch((s) => s.skrBought);
  const todayEarnedUsd = usePunch((s) => s.todayEarnedUsd);
  const receipts = usePunch((s) => s.receipts);
  const reset = usePunch((s) => s.reset);

  return (
    <div className="px-5 pb-8 pt-2">
      <h1 className="font-display text-3xl font-medium leading-[1.15] tracking-tight">
        {t.splitHero}
      </h1>
      <p className="mt-3 text-base leading-relaxed text-muted">{t.splitBody}</p>
      <p className="mt-3 text-sm leading-relaxed text-muted">{t.moneyUsdc}</p>
      <p className="mt-1 text-sm leading-relaxed text-muted">{t.moneySkr}</p>

      <div className="mt-6 grid grid-cols-3 gap-2 text-center">
        <Fee n="92%" label={t.worker} />
        <Fee n="3%" label={t.stakers} />
        <Fee n="5%" label={t.protocol} accent />
      </div>

      <div className="mt-6 space-y-2">
        <Tile k={t.yourWages} v={formatUsd(todayEarnedUsd)} />
        <Tile k={t.protocolTreasury} v={formatUsd(protocolUsdc)} />
        <Tile k={t.stakerPool} v={formatUsd(stakerUsdc)} />
        <Tile k={t.skrBought} v={`${skrBought.toLocaleString()} SKR`} />
      </div>

      <h2 className="mt-8 font-display text-lg font-medium">{t.feeTable}</h2>
      <div className="mt-3 space-y-3">
        {receipts.slice(0, 6).map((r) => (
          <ReceiptCard key={r.id} receipt={r} />
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-2">
        <Link
          to="/pitch"
          className="flex h-12 items-center justify-center rounded-xl bg-accent text-sm font-medium text-accent-fg"
        >
          {t.pitch}
        </Link>
        <Button variant="ghost" onClick={reset}>
          {t.reset}
        </Button>
        <p className="text-center text-xs text-subtle">{t.demoVault}</p>
      </div>
    </div>
  );
}

function Fee({ n, label, accent }: { n: string; label: string; accent?: boolean }) {
  return (
    <div className="rounded-xl bg-surface px-2 py-4 shadow-border">
      <p className={`font-display text-3xl font-medium ${accent ? "text-accent" : "text-fg"}`}>
        {n}
      </p>
      <p className="mt-1 text-xs leading-snug text-muted">{label}</p>
    </div>
  );
}

function Tile({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between rounded-xl bg-surface px-4 py-3 shadow-border">
      <span className="text-sm text-muted">{k}</span>
      <span className="font-mono text-sm tabular-nums">{v}</span>
    </div>
  );
}
