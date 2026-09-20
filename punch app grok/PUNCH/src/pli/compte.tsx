import { ReceiptCard } from "@/shared/receipt-card";
import { formatAmt, formatUsd } from "@/lib/punch/format";
import { usePunch, useT } from "@/lib/punch/store";

export function PliCompte() {
  const t = useT();
  const wallet = usePunch((s) => s.wallet);
  const protocolUsdc = usePunch((s) => s.protocolUsdc);
  const stakerUsdc = usePunch((s) => s.stakerUsdc);
  const todayEarnedUsd = usePunch((s) => s.todayEarnedUsd);
  const receipts = usePunch((s) => s.receipts.filter((r) => r.kind === "pli"));
  const setTab = usePunch((s) => s.setTab);

  return (
    <div className="px-5 pb-8 pt-2">
      <h1 className="font-display text-4xl font-medium tracking-tight">{t.pliCompte}</h1>
      <p className="mt-2 text-base leading-relaxed text-muted">{t.splitBody}</p>

      <div className="mt-6 grid grid-cols-3 gap-2 text-center">
        <Cut n="92%" label={t.worker} />
        <Cut n="3%" label={t.stakers} />
        <Cut n="5%" label={t.protocol} />
      </div>

      <ul className="mt-6 space-y-2">
        <Row k="USDC" v={formatAmt(wallet.usdc, "USDC")} />
        <Row k="USDT" v={formatAmt(wallet.usdt, "USDT")} />
        <Row k="SKR" v={formatAmt(wallet.skr, "SKR")} />
        <Row k={t.yourWages} v={formatUsd(todayEarnedUsd)} />
        <Row k={t.protocolTreasury} v={formatUsd(protocolUsdc)} />
        <Row k={t.stakerPool} v={formatUsd(stakerUsdc)} />
      </ul>

      <h2 className="mt-8 font-display text-2xl font-medium">{t.feeTable}</h2>
      <div className="mt-3 space-y-3">
        {receipts.slice(0, 5).map((r) => (
          <ReceiptCard key={r.id} receipt={r} />
        ))}
      </div>
      <button
        type="button"
        className="mt-6 h-12 w-full text-sm text-muted"
        onClick={() => setTab("box")}
      >
        ← {t.pliSeeBox}
      </button>
    </div>
  );
}

function Cut({ n, label }: { n: string; label: string }) {
  return (
    <div className="rounded-sm bg-surface-2 px-2 py-4">
      <p className="font-display text-3xl font-medium">{n}</p>
      <p className="mt-1 text-xs leading-snug text-muted">{label}</p>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <li className="flex items-baseline justify-between border-b border-line py-3">
      <span className="text-muted">{k}</span>
      <span className="tabular-nums">{v}</span>
    </li>
  );
}
