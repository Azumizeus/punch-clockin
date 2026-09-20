import type { Rank, Token } from "./types";

export const SKR_USD = 0.0182;

export const FEE = {
  worker: 0.92,
  stakers: 0.03,
  protocol: 0.05,
} as const;

export function usdValue(amount: number, token: Token) {
  if (token === "SKR") return amount * SKR_USD;
  return amount;
}

export function formatAmt(n: number, token: Token) {
  if (token === "SKR") {
    return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  }
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatUsd(n: number) {
  return n.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function shortAddr(addr: string) {
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}

export function rankFromStake(staked: number): Rank {
  if (staked >= 25000) return "guardian";
  if (staked >= 5000) return "gold";
  if (staked >= 1000) return "silver";
  return "open";
}

export const RANK_ORDER: Rank[] = ["open", "silver", "gold", "guardian"];

export function rankMeets(have: Rank, need: Rank) {
  return RANK_ORDER.indexOf(have) >= RANK_ORDER.indexOf(need);
}

export function splitOf(gross: number) {
  return {
    worker: round2(gross * FEE.worker),
    stakers: round2(gross * FEE.stakers),
    protocol: round2(gross * FEE.protocol),
  };
}

export function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function roundSkr(n: number) {
  return Math.round(n);
}

export function fakeSig() {
  const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let s = "";
  for (let i = 0; i < 88; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return s;
}

/** Une vraie signature Solana : base58, 87–88 caractères, jamais 0/O/I/l. */
export function isRealSig(sig: string | null | undefined) {
  if (!sig) return false;
  return sig.length >= 87 && sig.length <= 88 && !/[0OIl]/.test(sig);
}

/** Lien explorer d'une transaction, cluster devnet. */
export function txUrl(sig: string) {
  return `https://explorer.solana.com/tx/${sig}?cluster=devnet`;
}
