export type Locale = "en" | "fr";
/** Identité de couleur de l'app. gold = Seeker Premium (défaut), nuit =
 * Seeker Nuit (optionnel, noir bleuté / argent). Le champ reste pour la
 * compat des anciens stockages. */
export type Theme = "gold" | "nuit";
/** Habillage : champ conservé pour compat (tout migre vers "b" = fusion
 * Seeker Premium). Un seul design à partir de v1.5.0. */
export type Look = "b";
/** Rendu de la composition : "flat" = l'actuel (angles bruts, surfaces à
 * plat), "depth3d" = le même design en relief — isométrie légère, badge
 * métallique en 3 nuances, anneaux pulsés, ticket papier avec ombre. Les
 * 13 tokens et les deux thèmes (gold/nuit) restent LA source de couleur. */
export type Skin = "flat" | "depth3d";
export type Token = "USDC" | "USDT" | "SKR";
export type Product = "punch" | "pli";
export type Tab = "punch" | "board" | "wallet" | "split" | "box" | "write" | "globe" | "hellos";
export type Rank = "open" | "silver" | "gold" | "guardian";
export type ShiftKind = "dwell" | "review" | "scan" | "swap" | "watch";
export type View = "app" | "shift" | "post" | "receipt" | "how" | "letter";

export interface Shift {
  id: string;
  title: { en: string; fr: string };
  sponsor: string;
  city: { en: string; fr: string };
  kind: ShiftKind;
  durationMin: number;
  payout: number;
  token: Token;
  rank: Rank;
  spots: number;
  taken: number;
  blurb: { en: string; fr: string };
  genesisRequired: boolean;
  userPosted?: boolean;
}

export interface Pli {
  id: string;
  author: string;
  city: { en: string; fr: string };
  tease: { en: string; fr: string };
  body: { en: string; fr: string };
  price: number;
  token: "USDC" | "USDT";
  rank: Rank;
  genesisRequired: boolean;
  opensAt: number;
  mine?: boolean;
  sold?: boolean;
}

export interface Receipt {
  id: string;
  at: number;
  kind: "shift" | "swap" | "sponsor" | "stake" | "hello" | "pli";
  title: string;
  token: Token;
  gross: number;
  worker: number;
  stakers: number;
  protocol: number;
  signature: string;
  city?: string;
  /** Bonus SKR versé en plus de la part worker (bonjour uniquement, pour l'instant). */
  bonusSkr?: number;
  /** Détail d'un échange (kind === "swap") : ce que tu as payé et ce que tu as reçu. */
  swapIn?: { amount: number; token: Token };
  swapOut?: { amount: number; token: Token };
  /** Part gardien SKR versée à CE wallet sur un échange (3 % des frais, si SKR staké). */
  stakerSkrPaid?: number;
}

/** Un bonjour effectué : horodaté, nommé, bonus SKR tracé — alimente les cumuls. */
export interface HelloEvent {
  id: string;
  at: number;
  name: string;
  /** SKR gagné sur ce bonjour (lot de démarrage, pas encore de paiements on-chain). */
  skr: number;
}

export interface FeedItem {
  id: string;
  at: number;
  name: string;
  text: { en: string; fr: string };
  amount?: number;
  token?: Token;
}

export interface NearbyPerson {
  id: string;
  name: string;
  meters: number;
}

export interface Wallet {
  connected: boolean;
  address: string;
  genesis: boolean;
  usdc: number;
  usdt: number;
  skr: number;
  stakedSkr: number;
  /** true = vraie session Mobile Wallet Adapter (Seed Vault). false = démo locale. */
  real: boolean;
  /** Token MWA reçu lors de l'autorisation Seed Vault. Nécessaire pour reauthorize(). */
  authToken: string | null;
}

export interface PunchState {
  locale: Locale;
  localeChosen: boolean;
  theme: Theme;
  look: Look;
  /** Habillage de rendu : à plat (héritage) ou en relief 3D vectoriel. */
  skin: Skin;
  seenHow: boolean;
  product: Product;
  tab: Tab;
  view: View;
  activeShiftId: string | null;
  activePliId: string | null;
  lastReceiptId: string | null;
  lastTxError: string | null;
  lastPunchAt: number | null;
  streak: number;
  crewOnline: number;
  todayEarnedUsd: number;
  protocolUsdc: number;
  stakerUsdc: number;
  skrBought: number;
  wallet: Wallet;
  shifts: Shift[];
  plis: Pli[];
  receipts: Receipt[];
  feed: FeedItem[];
  /** Historique complet des bonjours effectués (cumuls semaine / mois / année). */
  helloEvents: HelloEvent[];
  completedIds: string[];
  greetedIds: string[];
  openedIds: string[];
  country: string;
  globeToday: Record<string, number>;
  globePulse: { code: string; sig: string; at: number } | null;
}
