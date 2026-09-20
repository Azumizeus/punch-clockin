import { create } from "zustand";
import { persist } from "zustand/middleware";
import { copy } from "./copy";
import {
  DEMO_ADDRESS,
  FEED_POOL,
  SEED_FEED,
  SEED_RECEIPTS,
  SHIFTS,
} from "./shifts";
import { seedPlis } from "./plis";
import { COUNTRIES, seedToday } from "./globe";
import {
  fakeSig,
  rankFromStake,
  rankMeets,
  round2,
  roundSkr,
  SKR_USD,
  splitOf,
  usdValue,
} from "./format";
import type {
  FeedItem,
  Locale,
  Pli,
  Product,
  PunchState,
  Rank,
  Receipt,
  Shift,
  Skin,
  Tab,
  Theme,
  Token,
  View,
} from "./types";

const DEMO_COOLDOWN_MS = 75_000;
const SPREAD = 0.0035;

function seedWallet() {
  return {
    connected: false,
    address: DEMO_ADDRESS,
    genesis: true,
    usdc: 126.4,
    usdt: 40,
    skr: 12400,
    stakedSkr: 6000,
  };
}

function seed(): PunchState {
  return {
    locale: "fr",
    theme: "goldLight",
    skin: "a",
    seenHow: false,
    product: "punch",
    tab: "punch",
    view: "app",
    activeShiftId: null,
    activePliId: null,
    lastReceiptId: null,
    lastPunchAt: null,
    streak: 3,
    crewOnline: 847,
    todayEarnedUsd: 3.86,
    protocolUsdc: 184.2,
    stakerUsdc: 110.52,
    skrBought: 3220,
    wallet: seedWallet(),
    shifts: SHIFTS.map((s) => ({ ...s })),
    plis: seedPlis(),
    receipts: SEED_RECEIPTS,
    feed: SEED_FEED,
    completedIds: ["cafe-lumen"],
    greetedIds: [],
    openedIds: [],
    country: "FR",
    globeToday: seedToday(),
    globePulse: null,
  };
}

function credit(wallet: PunchState["wallet"], token: Token, amount: number) {
  if (token === "USDC") wallet.usdc = round2(wallet.usdc + amount);
  else if (token === "USDT") wallet.usdt = round2(wallet.usdt + amount);
  else wallet.skr = roundSkr(wallet.skr + amount);
}

function debit(wallet: PunchState["wallet"], token: Token, amount: number) {
  if (token === "USDC") wallet.usdc = round2(wallet.usdc - amount);
  else if (token === "USDT") wallet.usdt = round2(wallet.usdt - amount);
  else wallet.skr = roundSkr(wallet.skr - amount);
}

function bal(wallet: PunchState["wallet"], token: Token) {
  if (token === "USDC") return wallet.usdc;
  if (token === "USDT") return wallet.usdt;
  return wallet.skr;
}

export const usePunch = create<
  PunchState & {
    t: () => (typeof copy)[Locale];
    rank: () => Rank;
    punchedToday: () => boolean;
    cooldownLeft: () => number;
    setLocale: (locale: Locale) => void;
    setTheme: (theme: Theme) => void;
    setSkin: (skin: Skin) => void;
    dismissHow: () => void;
    setProduct: (product: Product) => void;
    setTab: (tab: Tab) => void;
    setView: (view: View, shiftId?: string | null) => void;
    connect: (product?: Product) => void;
    punchIn: () => boolean;
    setCountry: (code: string) => void;
    greetNearby: (id: string, name: string) => Receipt | null;
    openShift: (id: string) => string | null;
    cashShift: (id: string, title: string) => Receipt | null;
    swap: (from: Token, to: Token, amount: number) => Receipt | null;
    stake: (amount: number) => void;
    unstake: (amount: number) => void;
    postShift: (input: {
      title: string;
      city: string;
      amount: number;
      token: "USDC" | "USDT";
      minutes: number;
    }) => string | null;
    fillPosted: (id: string) => Receipt | null;
    buyPli: (id: string) => string | null;
    openLetter: (id: string) => void;
    writePli: (input: {
      body: string;
      price: number;
      token: "USDC" | "USDT";
      delayMs: number;
    }) => string | null;
    sellPli: (id: string) => Receipt | null;
    pushFeed: () => void;
    reset: () => void;
  }
>()(
  persist(
    (set, get) => ({
      ...seed(),
      t: () => copy[get().locale],
      rank: () => rankFromStake(get().wallet.stakedSkr),
      punchedToday: () => {
        const at = get().lastPunchAt;
        if (!at) return false;
        return Date.now() - at < DEMO_COOLDOWN_MS;
      },
      cooldownLeft: () => {
        const at = get().lastPunchAt;
        if (!at) return 0;
        return Math.max(0, DEMO_COOLDOWN_MS - (Date.now() - at));
      },
      setLocale: (locale) => set({ locale }),
      setTheme: (theme) => set({ theme }),
      setSkin: (skin) => set({ skin }),
      dismissHow: () => set({ seenHow: true, view: "app", tab: "punch" }),
      setProduct: (product) => {
        set({
          product,
          view: "app",
          tab: product === "pli" ? "box" : "punch",
          activeShiftId: null,
          activePliId: null,
        });
        if (typeof window !== "undefined") window.scrollTo(0, 0);
      },
      setTab: (tab) => {
        set({ tab, view: "app", activeShiftId: null });
        if (typeof window !== "undefined") window.scrollTo(0, 0);
      },
      setView: (view, shiftId) =>
        set({
          view,
          activeShiftId: shiftId === undefined ? get().activeShiftId : shiftId,
        }),
      connect: (product = "punch") =>
        set((s) => ({
          wallet: { ...s.wallet, connected: true },
          product,
          tab: product === "pli" ? "box" : "punch",
          view: "app",
        })),
      punchIn: () => {
        const s = get();
        if (s.lastPunchAt && Date.now() - s.lastPunchAt < DEMO_COOLDOWN_MS) return false;
        const bump = s.lastPunchAt ? 1 : 0;
        const code = s.country || "FR";
        const sig = fakeSig();
        set({
          lastPunchAt: Date.now(),
          streak: Math.min(7, s.streak + (s.lastPunchAt ? bump : 0)),
          crewOnline: s.crewOnline + 1,
          tab: "punch",
          seenHow: true,
          globeToday: { ...s.globeToday, [code]: (s.globeToday[code] ?? 0) + 1 },
          globePulse: { code, sig, at: Date.now() },
        });
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(18);
        return true;
      },
      setCountry: (code) => set({ country: code }),
      greetNearby: (id, name) => {
        const s = get();
        if ((s.greetedIds ?? []).includes(id)) return null;
        const rec: Receipt = {
          id: `r-${Date.now()}`,
          at: Date.now(),
          kind: "hello",
          title: name,
          token: "USDC",
          gross: 0.21,
          worker: 0.1,
          stakers: 0.01,
          protocol: 0.1,
          signature: fakeSig(),
        };
        set((prev) => {
          const wallet = { ...prev.wallet };
          credit(wallet, "USDC", 0.1);
          return {
            wallet,
            greetedIds: [...prev.greetedIds, id],
            receipts: [rec, ...prev.receipts],
            lastReceiptId: rec.id,
            todayEarnedUsd: round2(prev.todayEarnedUsd + 0.1),
            protocolUsdc: round2(Math.max(0, prev.protocolUsdc - 0.11)),
            stakerUsdc: round2(prev.stakerUsdc + 0.01),
            view: "receipt",
            feed: [
              {
                id: `f-${Date.now()}`,
                at: Date.now(),
                name: "You",
                text: {
                  en: `said hi to ${name}`,
                  fr: `a dit bonjour à ${name}`,
                },
                amount: 0.1,
                token: "USDC",
              },
              ...prev.feed,
            ],
          };
        });
        return rec;
      },
      openShift: (id) => {
        const s = get();
        const shift = s.shifts.find((x) => x.id === id);
        if (!shift) return "missing";
        if (!s.lastPunchAt) return "punch";
        if (shift.genesisRequired && !s.wallet.genesis) return "genesis";
        if (!rankMeets(rankFromStake(s.wallet.stakedSkr), shift.rank)) return "rank";
        if (s.completedIds.includes(id) && !shift.userPosted) return "done";
        if (shift.taken >= shift.spots) return "full";
        set({ view: "shift", activeShiftId: id, tab: "board" });
        return null;
      },
      cashShift: (id, title) => {
        const s = get();
        const shift = s.shifts.find((x) => x.id === id);
        if (!shift) return null;
        const parts = splitOf(shift.payout);
        const rec: Receipt = {
          id: `r-${Date.now()}`,
          at: Date.now(),
          kind: "shift",
          title,
          token: shift.token,
          gross: shift.payout,
          worker: parts.worker,
          stakers: parts.stakers,
          protocol: parts.protocol,
          signature: fakeSig(),
          city: shift.city[s.locale],
        };
        set((prev) => {
          const wallet = { ...prev.wallet };
          credit(wallet, shift.token, parts.worker);
          const protocolAdd = usdValue(parts.protocol, shift.token);
          const stakerAdd = usdValue(parts.stakers, shift.token);
          const buy = round2(protocolAdd * 0.4);
          return {
            wallet,
            receipts: [rec, ...prev.receipts],
            lastReceiptId: rec.id,
            view: "receipt",
            completedIds: prev.completedIds.includes(id)
              ? prev.completedIds
              : [...prev.completedIds, id],
            shifts: prev.shifts.map((x) =>
              x.id === id ? { ...x, taken: Math.min(x.spots, x.taken + 1) } : x,
            ),
            todayEarnedUsd: round2(prev.todayEarnedUsd + usdValue(parts.worker, shift.token)),
            protocolUsdc: round2(prev.protocolUsdc + protocolAdd),
            stakerUsdc: round2(prev.stakerUsdc + stakerAdd),
            skrBought: prev.skrBought + roundSkr(buy / SKR_USD),
            crewOnline: prev.crewOnline + 1,
          };
        });
        return rec;
      },
      swap: (from, to, amount) => {
        if (from === to || amount <= 0) return null;
        const s = get();
        if (bal(s.wallet, from) < amount) return null;
        const mid =
          from === "SKR"
            ? amount * SKR_USD
            : to === "SKR"
              ? amount / SKR_USD
              : amount;
        const out = from === "SKR" || to === "SKR" ? (to === "SKR" ? roundSkr(mid * (1 - SPREAD)) : round2(mid * (1 - SPREAD))) : round2(amount * (1 - SPREAD));
        const spreadUsd =
          from === "SKR" ? amount * SKR_USD * SPREAD : to === "SKR" ? amount * SPREAD : amount * SPREAD;
        const half = round2(spreadUsd / 2);
        const rec: Receipt = {
          id: `r-${Date.now()}`,
          at: Date.now(),
          kind: "swap",
          title: `${from} → ${to}`,
          token: "USDC",
          gross: round2(spreadUsd),
          worker: 0,
          stakers: half,
          protocol: half,
          signature: fakeSig(),
        };
        set((prev) => {
          const wallet = { ...prev.wallet };
          debit(wallet, from, amount);
          credit(wallet, to, out);
          return {
            wallet,
            receipts: [rec, ...prev.receipts],
            lastReceiptId: rec.id,
            protocolUsdc: round2(prev.protocolUsdc + half),
            stakerUsdc: round2(prev.stakerUsdc + half),
            skrBought: prev.skrBought + roundSkr((half * 0.4) / SKR_USD),
            view: "receipt",
            tab: "wallet",
          };
        });
        return rec;
      },
      stake: (amount) => {
        const s = get();
        if (amount <= 0 || s.wallet.skr < amount) return;
        set((prev) => ({
          wallet: {
            ...prev.wallet,
            skr: roundSkr(prev.wallet.skr - amount),
            stakedSkr: roundSkr(prev.wallet.stakedSkr + amount),
          },
        }));
      },
      unstake: (amount) => {
        const s = get();
        if (amount <= 0 || s.wallet.stakedSkr < amount) return;
        set((prev) => ({
          wallet: {
            ...prev.wallet,
            skr: roundSkr(prev.wallet.skr + amount),
            stakedSkr: roundSkr(prev.wallet.stakedSkr - amount),
          },
        }));
      },
      postShift: (input) => {
        const s = get();
        if (input.amount < 1) return "amount";
        if (bal(s.wallet, input.token) < input.amount) return "bal";
        const id = `user-${Date.now()}`;
        const shift: Shift = {
          id,
          title: { en: input.title, fr: input.title },
          sponsor: shortName(s.wallet.address),
          city: { en: input.city, fr: input.city },
          kind: "dwell",
          durationMin: input.minutes,
          payout: round2(input.amount),
          token: input.token,
          rank: "open",
          spots: 1,
          taken: 0,
          genesisRequired: false,
          userPosted: true,
          blurb: {
            en: "Money locked from your wallet. Same rule: you 92%, SKR holders 3%, the app 5%.",
            fr: "Argent bloqué depuis ton portefeuille. Même règle : toi 92 %, gardiens SKR 3 %, l’app 5 %.",
          },
        };
        set((prev) => {
          const wallet = { ...prev.wallet };
          debit(wallet, input.token, input.amount);
          return {
            wallet,
            shifts: [shift, ...prev.shifts],
            view: "app",
            tab: "board",
            feed: [
              {
                id: `f-${Date.now()}`,
                at: Date.now(),
                name: "You",
                text: {
                  en: `posted a ${input.amount} ${input.token} shift`,
                  fr: `a posté un shift ${input.amount} ${input.token}`,
                },
              },
              ...prev.feed,
            ],
          };
        });
        return null;
      },
      fillPosted: (id) => {
        const s = get();
        const shift = s.shifts.find((x) => x.id === id);
        if (!shift || !shift.userPosted) return null;
        const parts = splitOf(shift.payout);
        const rec: Receipt = {
          id: `r-${Date.now()}`,
          at: Date.now(),
          kind: "sponsor",
          title: shift.title[s.locale],
          token: shift.token,
          gross: shift.payout,
          worker: parts.worker,
          stakers: parts.stakers,
          protocol: parts.protocol,
          signature: fakeSig(),
          city: shift.city[s.locale],
        };
        set((prev) => {
          const protocolAdd = usdValue(parts.protocol, shift.token);
          const stakerAdd = usdValue(parts.stakers, shift.token);
          const buy = round2(protocolAdd * 0.4);
          return {
            receipts: [rec, ...prev.receipts],
            lastReceiptId: rec.id,
            view: "receipt",
            shifts: prev.shifts.map((x) =>
              x.id === id ? { ...x, taken: 1 } : x,
            ),
            protocolUsdc: round2(prev.protocolUsdc + protocolAdd),
            stakerUsdc: round2(prev.stakerUsdc + stakerAdd),
            skrBought: prev.skrBought + roundSkr(buy / SKR_USD),
            feed: [
              {
                id: `f-${Date.now()}`,
                at: Date.now(),
                name: "Mira",
                text: {
                  en: "cleared your posted shift",
                  fr: "a validé ton shift",
                },
                amount: parts.worker,
                token: shift.token,
              },
              ...prev.feed,
            ],
          };
        });
        return rec;
      },
      buyPli: (id) => {
        const s = get();
        const pli = s.plis.find((x) => x.id === id);
        if (!pli) return "missing";
        if (pli.mine) return "mine";
        if (s.openedIds.includes(id)) {
          set({ view: "letter", activePliId: id });
          return null;
        }
        if (pli.genesisRequired && !s.wallet.genesis) return "genesis";
        if (!rankMeets(rankFromStake(s.wallet.stakedSkr), pli.rank)) return "rank";
        if (pli.opensAt > Date.now()) return "wait";
        if (bal(s.wallet, pli.token) < pli.price) return "bal";
        const parts = splitOf(pli.price);
        const rec: Receipt = {
          id: `r-${Date.now()}`,
          at: Date.now(),
          kind: "pli",
          title: pli.tease[s.locale],
          token: pli.token,
          gross: pli.price,
          worker: parts.worker,
          stakers: parts.stakers,
          protocol: parts.protocol,
          signature: fakeSig(),
          city: pli.city[s.locale],
        };
        set((prev) => {
          const wallet = { ...prev.wallet };
          debit(wallet, pli.token, pli.price);
          const protocolAdd = usdValue(parts.protocol, pli.token);
          const stakerAdd = usdValue(parts.stakers, pli.token);
          const buy = round2(protocolAdd * 0.4);
          return {
            wallet,
            openedIds: [...prev.openedIds, id],
            receipts: [rec, ...prev.receipts],
            lastReceiptId: rec.id,
            activePliId: id,
            view: "letter",
            protocolUsdc: round2(prev.protocolUsdc + protocolAdd),
            stakerUsdc: round2(prev.stakerUsdc + stakerAdd),
            skrBought: prev.skrBought + roundSkr(buy / SKR_USD),
            feed: [
              {
                id: `f-${Date.now()}`,
                at: Date.now(),
                name: "You",
                text: {
                  en: `opened a sealed note by ${pli.author}`,
                  fr: `a ouvert un pli de ${pli.author}`,
                },
                amount: pli.price,
                token: pli.token,
              },
              ...prev.feed,
            ],
          };
        });
        return null;
      },
      openLetter: (id) => set({ view: "letter", activePliId: id }),
      writePli: (input) => {
        const body = input.body.trim();
        if (body.length < 24) return "short";
        if (input.price < 1) return "amount";
        const s = get();
        const id = `pli-you-${Date.now()}`;
        const pli: Pli = {
          id,
          author: s.locale === "fr" ? "Toi" : "You",
          city: { en: "Your Seeker", fr: "Ton Seeker" },
          tease: {
            en: body.slice(0, 42) + (body.length > 42 ? "…" : ""),
            fr: body.slice(0, 42) + (body.length > 42 ? "…" : ""),
          },
          body: { en: body, fr: body },
          price: round2(input.price),
          token: input.token,
          rank: "open",
          genesisRequired: false,
          opensAt: input.delayMs > 0 ? Date.now() + input.delayMs : 0,
          mine: true,
        };
        set((prev) => ({
          plis: [pli, ...prev.plis],
          tab: "box",
          view: "app",
          product: "pli",
          feed: [
            {
              id: `f-${Date.now()}`,
              at: Date.now(),
              name: "You",
              text: {
                en: "sealed a note. The chain cannot read it.",
                fr: "a scellé un pli. La chaîne ne peut pas le lire.",
              },
            },
            ...prev.feed,
          ],
        }));
        return id;
      },
      sellPli: (id) => {
        const s = get();
        const pli = s.plis.find((x) => x.id === id);
        if (!pli || !pli.mine || pli.sold) return null;
        const parts = splitOf(pli.price);
        const rec: Receipt = {
          id: `r-${Date.now()}`,
          at: Date.now(),
          kind: "pli",
          title: pli.tease[s.locale],
          token: pli.token,
          gross: pli.price,
          worker: parts.worker,
          stakers: parts.stakers,
          protocol: parts.protocol,
          signature: fakeSig(),
          city: pli.city[s.locale],
        };
        set((prev) => {
          const wallet = { ...prev.wallet };
          credit(wallet, pli.token, parts.worker);
          const protocolAdd = usdValue(parts.protocol, pli.token);
          const stakerAdd = usdValue(parts.stakers, pli.token);
          const buy = round2(protocolAdd * 0.4);
          return {
            wallet,
            plis: prev.plis.map((x) => (x.id === id ? { ...x, sold: true } : x)),
            receipts: [rec, ...prev.receipts],
            lastReceiptId: rec.id,
            view: "receipt",
            todayEarnedUsd: round2(prev.todayEarnedUsd + usdValue(parts.worker, pli.token)),
            protocolUsdc: round2(prev.protocolUsdc + protocolAdd),
            stakerUsdc: round2(prev.stakerUsdc + stakerAdd),
            skrBought: prev.skrBought + roundSkr(buy / SKR_USD),
            feed: [
              {
                id: `f-${Date.now()}`,
                at: Date.now(),
                name: "Nao",
                text: {
                  en: "paid to read your sealed note",
                  fr: "a payé pour lire ton pli",
                },
                amount: parts.worker,
                token: pli.token,
              },
              ...prev.feed,
            ],
          };
        });
        return rec;
      },
      pushFeed: () => {
        const pick = FEED_POOL[Math.floor(Math.random() * FEED_POOL.length)];
        const item: FeedItem = {
          ...pick,
          id: `f-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          at: Date.now(),
        };
        set((prev) => {
          const code = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)].code;
          return {
            feed: [item, ...prev.feed].slice(0, 24),
            crewOnline: Math.max(620, prev.crewOnline + (Math.random() > 0.5 ? 1 : -1)),
            globeToday: {
              ...prev.globeToday,
              [code]: (prev.globeToday[code] ?? 0) + 1,
            },
          };
        });
      },
      reset: () => {
        const locale = get().locale;
        const theme = get().theme;
        set({
          ...seed(),
          locale,
          theme,
          seenHow: true,
          wallet: { ...seedWallet(), connected: true },
        });
      },
    }),
    {
      name: "punch-v6",
      skipHydration: true,
      partialize: (s) => ({
        locale: s.locale,
        theme: s.theme,
        skin: s.skin,
        seenHow: s.seenHow,
        country: s.country,
        streak: s.streak,
        todayEarnedUsd: s.todayEarnedUsd,
        protocolUsdc: s.protocolUsdc,
        stakerUsdc: s.stakerUsdc,
        skrBought: s.skrBought,
        wallet: {
          ...s.wallet,
          connected: false,
        },
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<PunchState>;
        const wallet = { ...current.wallet, ...(p.wallet ?? {}) };
        return {
          ...current,
          ...p,
          locale: p.locale === "en" ? "en" : "fr",
          theme:
            p.theme === "dark" || p.theme === "light" || p.theme === "gold" || p.theme === "goldLight"
              ? p.theme
              : "goldLight",
          skin: p.skin === "b" || p.skin === "c" ? p.skin : "a",
          seenHow: Boolean(p.seenHow),
          greetedIds: Array.isArray(p.greetedIds) ? p.greetedIds : [],
          view: "app",
          tab: "punch",
          product: "punch",
          lastPunchAt: null,
          plis: current.plis,
          openedIds: [],
          globeToday: current.globeToday,
          globePulse: null,
          country: typeof p.country === "string" ? p.country : "FR",
          wallet: { ...wallet, connected: false },
        };
      },
    },
  ),
);

function shortName(addr: string) {
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}

export function useT() {
  const locale = usePunch((s) => s.locale);
  return copy[locale] ?? copy.fr;
}

export function rehydratePunch() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem("punch-v1");
    window.localStorage.removeItem("punch-v2");
  } catch {
    /* ignore */
  }
  void usePunch.persist.rehydrate();
}
