import type { HelloEvent } from "./types";

/**
 * Récompense SKR par bonjour. Lot de démarrage versé hors chaîne pour
 * l'instant — pas un paiement on-chain : c'est écrit honnêtement sur l'écran.
 * Quand le programme de staking existera on-chain, ce montant partira du
 * trésor via une vraie transaction, sans changer l'UI.
 */
export const HELLO_REWARD_SKR = 25;

/** Début de semaine : LUNDI 00:00 local (semaine civile française). */
export function startOfWeek(now: number) {
  const d = new Date(now);
  const day = (d.getDay() + 6) % 7; // lundi = 0, dimanche = 6
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day);
  return d.getTime();
}

/** Début du mois : le 1er à 00:00 local. */
export function startOfMonth(now: number) {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  d.setDate(1);
  return d.getTime();
}

/** Début de l'année : le 1er janvier à 00:00 local. */
export function startOfYear(now: number) {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  d.setMonth(0, 1);
  return d.getTime();
}

export type HelloPeriod = "week" | "month" | "year" | "all";

export function periodStart(period: HelloPeriod, now = Date.now()) {
  if (period === "week") return startOfWeek(now);
  if (period === "month") return startOfMonth(now);
  if (period === "year") return startOfYear(now);
  return 0;
}

export function helloCountInPeriod(events: HelloEvent[], period: HelloPeriod, now = Date.now()) {
  const from = periodStart(period, now);
  return events.reduce((n, e) => (e.at >= from ? n + 1 : n), 0);
}

/** Les 4 compteurs affichés : cette semaine, ce mois, cette année, total. */
export function helloCounts(events: HelloEvent[], now = Date.now()) {
  return {
    week: helloCountInPeriod(events, "week", now),
    month: helloCountInPeriod(events, "month", now),
    year: helloCountInPeriod(events, "year", now),
    total: helloCountInPeriod(events, "all", now),
  };
}

/** Total SKR gagné en disant bonjour. */
export function helloSkr(events: HelloEvent[]) {
  return events.reduce((n, e) => n + e.skr, 0);
}

// ——— Classement ———
// Mêmes prénoms que le feed live et les Seekers voisins : un seul monde, pas
// deux. Tant qu'aucun backend n'existe, les rangs des autres Seekers sont une
// SIMULATION STABLE (démo assumée, comme crewOnline) : la graine dépend de la
// période, donc le classement ne change pas à chaque regard — il change quand
// la semaine / le mois / l'année change. Les rangs réels brancheront sur les
// vrais événements agrégés on-chain sans toucher à l'écran.

const RIVAL_NAMES = [
  "Inès",
  "Karim",
  "Nao",
  "Léa",
  "Jules",
  "Mira",
  "Theo",
  "Amina",
  "Rafi",
  "Sofia",
  "Owen",
];

// Plages crédibles de bonjours par période (démo).
const RANGES: Record<HelloPeriod, [number, number]> = {
  week: [2, 6],
  month: [8, 26],
  year: [90, 260],
  all: [150, 420],
};

// Sels distincts par période : un même i donne des tirages différents selon la
// période (le classement annuel n'est pas le classement hebdo multiplié).
const PERIOD_SALT: Record<HelloPeriod, number> = {
  week: 7919,
  month: 104729,
  year: 1299709,
  all: 15485863,
};

// PRNG déterministe (mulberry32) : même graine = même classement.
function seeded(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export interface HelloLeader {
  /** "You" pour toi — l'écran le traduit (Toi). Les autres sont des prénoms. */
  name: string;
  count: number;
  isYou: boolean;
}

export function helloLeaderboard(myCount: number, period: HelloPeriod, now = Date.now()): HelloLeader[] {
  const base = periodStart(period, now);
  const [lo, hi] = RANGES[period];
  const salt = PERIOD_SALT[period];
  const rows: HelloLeader[] = [{ name: "You", count: myCount, isYou: true }];
  RIVAL_NAMES.forEach((name, i) => {
    const rnd = seeded((base + (i + 1) * salt) >>> 0);
    rows.push({ name, count: lo + Math.floor(rnd() * (hi - lo + 1)), isYou: false });
  });
  // Égalité : tu passes devant (c'est ton classement, tu tiens ta place).
  rows.sort((a, b) => b.count - a.count || (a.isYou ? -1 : b.isYou ? 1 : 0));
  return rows;
}
