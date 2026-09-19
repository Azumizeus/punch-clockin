import { TokenChip } from "@/shared/token-chip";
import { formatAmt, shortAddr } from "@/lib/punch/format";
import { useT } from "@/lib/punch/store";
import type { Receipt } from "@/lib/punch/types";

export function ReceiptCard({
  receipt,
  featured = false,
}: {
  receipt: Receipt;
  featured?: boolean;
}) {
  const t = useT();
  return (
    <article
      className={
        featured
          ? "receipt-enter rounded-2xl bg-paper p-5 text-paper-fg"
          : "rounded-xl bg-paper/95 p-4 text-paper-fg"
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-paper-muted">
            {t.receipt}
          </p>
          <h3 className="mt-1 font-display text-lg font-medium leading-snug">
            {receipt.title}
          </h3>
          {receipt.city ? (
            <p className="mt-0.5 text-sm text-paper-muted">{receipt.city}</p>
          ) : null}
        </div>
        <TokenChip token={receipt.token} />
      </div>
      <dl className="mt-4 space-y-1.5 font-mono text-sm tabular-nums">
        <Row k={t.gross} v={`${formatAmt(receipt.gross, receipt.token)} ${receipt.token}`} />
        <Row
          k={t.worker}
          v={`${formatAmt(receipt.worker, receipt.token)}  92%`}
          strong
        />
        <Row k={t.stakers} v={`${formatAmt(receipt.stakers, receipt.token)}  3%`} />
        <Row k={t.protocol} v={`${formatAmt(receipt.protocol, receipt.token)}  5%`} />
      </dl>
      <p className="mt-4 truncate font-mono text-[10px] text-paper-muted">
        {t.tx} {shortAddr(receipt.signature)}
      </p>
    </article>
  );
}

function Row({
  k,
  v,
  strong,
}: {
  k: string;
  v: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-paper-fg/8 py-1 last:border-0">
      <dt className="text-paper-muted">{k}</dt>
      <dd className={strong ? "font-medium text-paper-fg" : "text-paper-fg/80"}>{v}</dd>
    </div>
  );
}
