import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TokenChip } from "@/shared/token-chip";
import { formatAmt, formatUsd, rankFromStake, usdValue } from "@/lib/punch/format";
import { usePunch, useT } from "@/lib/punch/store";
import type { Token } from "@/lib/punch/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { GoldBadge } from "@/components/gold-badge";

const TOKENS: Token[] = ["USDC", "USDT", "SKR"];

export function WalletScreen() {
  const t = useT();
  const wallet = usePunch((s) => s.wallet);
  const stake = usePunch((s) => s.stake);
  const unstake = usePunch((s) => s.unstake);
  const swap = usePunch((s) => s.swap);
  const rank = rankFromStake(wallet.stakedSkr);
  const [from, setFrom] = useState<Token>("SKR");
  const [to, setTo] = useState<Token>("USDC");
  const [amt, setAmt] = useState("100");
  const [stakeAmt, setStakeAmt] = useState("1000");

  const totalUsd =
    usdValue(wallet.usdc, "USDC") +
    usdValue(wallet.usdt, "USDT") +
    usdValue(wallet.skr + wallet.stakedSkr, "SKR");

  function doSwap() {
    const n = Number(amt);
    if (!Number.isFinite(n) || n <= 0) return;
    const rec = swap(from, to, n);
    if (!rec) toast(t.notEnough);
  }

  function doStake() {
    const n = Number(stakeAmt);
    if (!Number.isFinite(n) || n <= 0) return;
    if (wallet.skr < n) {
      toast(t.notEnough);
      return;
    }
    stake(n);
  }

  function doUnstake() {
    const n = Number(stakeAmt);
    if (!Number.isFinite(n) || n <= 0) return;
    if (wallet.stakedSkr < n) {
      toast(t.notEnough);
      return;
    }
    unstake(n);
  }

  return (
    <div className="px-5 pb-8 pt-2">
      <h1 className="font-display text-3xl font-medium tracking-tight">{t.wallet}</h1>
      <p className="mt-3 font-display text-4xl font-medium tabular-nums tracking-tight">
        {formatUsd(totalUsd)}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-muted">{t.moneyUsdc}</p>
      <p className="mt-1 text-sm leading-relaxed text-muted">{t.moneySkr}</p>
      <p className="mt-2 text-sm font-medium">{t.openRanks[rank]}</p>

      {/* Badge SEEKER PREMIUM : même emplacement que le natif — entre le rang
          et les soldes, porté sur le thème gold, wallet connecté. */}
      <GoldBadge />

      <div className="mt-6 space-y-2">
        <Bal token="USDC" liquid={wallet.usdc} />
        <Bal token="USDT" liquid={wallet.usdt} />
        <Bal token="SKR" liquid={wallet.skr} staked={wallet.stakedSkr} stakedLabel={t.staked} />
      </div>

      <section className="mt-8">
        <h2 className="font-display text-lg font-medium">{t.swap}</h2>
        <p className="mt-2 text-sm text-muted">{t.spreadSplit}</p>
        <p className="mt-3 font-mono text-[11px] uppercase tracking-wide text-subtle">{t.from}</p>
        <div className="mt-2 flex gap-2">
          {TOKENS.map((tok) => (
            <button
              key={tok}
              type="button"
              onClick={() => setFrom(tok)}
              className={cn(
                "h-11 flex-1 rounded-full font-mono text-xs",
                from === tok ? "bg-accent text-accent-fg" : "bg-surface text-muted",
              )}
            >
              {tok}
            </button>
          ))}
        </div>
        <p className="mt-3 font-mono text-[11px] uppercase tracking-wide text-subtle">{t.to}</p>
        <div className="mt-2 flex gap-2">
          {TOKENS.map((tok) => (
            <button
              key={tok}
              type="button"
              onClick={() => setTo(tok)}
              className={cn(
                "h-11 flex-1 rounded-full font-mono text-xs",
                to === tok ? "bg-fg text-bg" : "bg-surface text-muted",
              )}
            >
              {tok}
            </button>
          ))}
        </div>
        <input
          value={amt}
          onChange={(e) => setAmt(e.target.value)}
          inputMode="decimal"
          className="mt-3 h-12 w-full rounded-xl bg-surface px-4 font-mono tabular-nums shadow-border outline-none"
        />
        <p className="mt-2 font-mono text-[11px] text-subtle">{t.spread}</p>
        <Button className="mt-3 w-full" onClick={doSwap}>
          {t.confirmSwap}
        </Button>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-lg font-medium">{t.stake}</h2>
        <p className="mt-2 text-sm text-muted">{t.stakeHint}</p>
        <input
          value={stakeAmt}
          onChange={(e) => setStakeAmt(e.target.value)}
          inputMode="numeric"
          className="mt-3 h-12 w-full rounded-xl bg-surface px-4 font-mono tabular-nums shadow-border outline-none"
        />
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button onClick={doStake}>{t.confirmStake}</Button>
          <Button variant="secondary" onClick={doUnstake}>
            {t.unstake}
          </Button>
        </div>
      </section>
    </div>
  );
}

function Bal({
  token,
  liquid,
  staked,
  stakedLabel,
}: {
  token: Token;
  liquid: number;
  staked?: number;
  stakedLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-surface px-4 py-3 shadow-border">
      <TokenChip token={token} />
      <div className="text-right">
        <p className="font-mono text-sm tabular-nums">
          {formatAmt(liquid, token)} {token}
        </p>
        {staked != null ? (
          <p className="font-mono text-[11px] text-subtle">
            {stakedLabel} {formatAmt(staked, token)}
          </p>
        ) : null}
      </div>
    </div>
  );
}
