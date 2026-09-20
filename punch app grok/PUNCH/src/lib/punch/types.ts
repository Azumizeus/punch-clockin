export type Locale = "en" | "fr";
export type Theme = "dark" | "light" | "gold" | "goldLight";
export type Look = "a" | "b" | "c";
export type Skin = Look;
export type Token = "USDC" | "USDT" | "SKR";
export type Product = "punch" | "pli";
export type Tab = "punch" | "board" | "wallet" | "split" | "box" | "write" | "globe";
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
}

export interface LookTokens {
  monoTitle: boolean;
  monoUi: boolean;
  labels: boolean;
  upper: boolean;
  titleSpacing: number;
  ctaRadius: number;
  dialInnerAccent: boolean;
  dialRing: "gold" | "accent";
  clockTag: false | "dash" | "mono";
  hwNav: boolean;
  ticketRadius: number;
  ticketBorder: boolean;
  ticketDashed: boolean;
  pressTilt: boolean;
  ticketMono: boolean;
}

export interface LookShape {
  radius: number;
  body: string;
  display: string;
}

export interface LookPalette {
  bg: string;
  fg: string;
  dim: string;
  dim2: string;
  card: string;
  input: string;
  border: string;
  borderLight: string;
  accent: string;
  accentFg: string;
  paper: string;
  paperFg: string;
  paperMuted: string;
}

export interface PunchState {
  locale: Locale;
  theme: Theme;
  skin: Skin;
  seenHow: boolean;
  product: Product;
  tab: Tab;
  view: View;
  activeShiftId: string | null;
  activePliId: string | null;
  lastReceiptId: string | null;
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
  completedIds: string[];
  greetedIds: string[];
  openedIds: string[];
  country: string;
  globeToday: Record<string, number>;
  globePulse: { code: string; sig: string; at: number } | null;
}
