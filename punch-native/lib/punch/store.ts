import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import * as Haptics from "expo-haptics";
import { Connection, PublicKey } from "@solana/web3.js";
import { copy } from "./copy";
import { sendTreasurySol, sendTreasuryToUserTransfer, sendUserToTreasuryTransfer } from "../solana/wallet";
import { getTokenBalance, mintFor, toBaseUnits } from "../solana/tokens";
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
import { zustandMMKVStorage } from "./storage";
import { palettes, lookPalettes } from "./theme";
import { applyLookFonts } from "./fonts";
import type {
  FeedItem,
  Locale,
  Look,
  Pli,
  Product,
  PunchState,
  Rank,
  Receipt,
  Shift,
  Tab,
  Theme,
  Token,
  View,
} from "./types";

const DEMO_COOLDOWN_MS = 75_000;
const SPREAD = 0.0035;

// Frais protocole sur les transactions "d'entrée / de sortie" du réseau et
// sur les retraits — petits montants, mais réels (crédités à protocolUsdc /
// stakerUsdc comme les autres flux), pour rémunérer le travail derrière l'app.
const ENTRY_FEE_USDC = 0.02; // pointage (validation) — prélevé sur le wallet si possible
const EXIT_FEE_USDC = 0.02; // quitter le réseau — crédité même si le wallet démo est remis à zéro
const WITHDRAW_FEE_PCT = 0.015; // 1.5% sur chaque retrait de SKR misé (unstake)

const devnetConn = new Connection("https://api.devnet.solana.com", "confirmed");

function seedWallet() {
  return {
    connected: false,
    address: DEMO_ADDRESS,
    genesis: true,
    usdc: 126.4,
    usdt: 40,
    skr: 12400,
    stakedSkr: 6000,
    real: false,
    authToken: null,
  };
}

function seed(): PunchState {
  return {
    locale: "fr",
    localeChosen: false,
    theme: "dark",
    look: "c" as Look,
    screensaverSecs: 0,
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
    chooseLocale: (locale: Locale) => void;
    setTheme: (theme: Theme) => void;
    setLook: (look: Look) => void;
    setScreensaver: (secs: number) => void;
    dismissHow: () => void;
    setProduct: (product: Product) => void;
    setTab: (tab: Tab) => void;
    setView: (view: View, shiftId?: string | null) => void;
    connect: (product?: Product) => void;
    connectReal: (address: string, authToken: string) => Promise<void>;
    punchIn: (signature?: string) => boolean;
    setCountry: (code: string) => void;
    greetNearby: (id: string, name: string) => Promise<Receipt | null>;
    openShift: (id: string) => string | null;
    cashShift: (id: string, title: string) => Promise<Receipt | null>;
    swap: (from: Token, to: Token, amount: number) => Promise<Receipt | null>;
    stake: (amount: number) => Promise<boolean>;
    unstake: (amount: number) => Promise<boolean>;
    postShift: (input: {
      title: string;
      city: string;
      amount: number;
      token: "USDC" | "USDT";
      minutes: number;
    }) => Promise<string | null>;
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
    leaveNetwork: () => void;
    refreshWalletBalances: () => Promise<void>;
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
      chooseLocale: (locale) => set({ locale, localeChosen: true }),
      setTheme: (theme) => set({ theme }),
      setLook: (look) => set({ look }),
      setScreensaver: (secs) => set({ screensaverSecs: secs }),
      dismissHow: () => set({ seenHow: true, view: "app", tab: "punch" }),
      setProduct: (product) => {
        set({
          product,
          view: "app",
          tab: product === "pli" ? "box" : "punch",
          activeShiftId: null,
          activePliId: null,
        });
      },
      setTab: (tab) => {
        set({ tab, view: "app", activeShiftId: null });
      },
      setView: (view, shiftId) =>
        set({
          view,
          activeShiftId: shiftId === undefined ? get().activeShiftId : shiftId,
        }),
      connect: (product = "punch") =>
        set((s) => ({
          wallet: { ...s.wallet, connected: true, real: false },
          product,
          tab: product === "pli" ? "box" : "punch",
          view: "app",
        })),
      connectReal: async (address, authToken) => {
        set((s) => ({
          wallet: { ...s.wallet, connected: true, real: true, address, authToken },
          product: "punch",
          tab: "punch",
          view: "app",
        }));
        // Un vrai wallet Seed Vault démarre à zéro (normal, c'est le sien, pas
        // une simulation). On lit son vrai solde ; s'il est vide (première
        // connexion), le trésor lui envoie un vrai petit lot de bienvenue —
        // comme un faucet — pour pouvoir utiliser l'app tout de suite.
        try {
          await get().refreshWalletBalances();
          const w = get().wallet;
          if (w.usdc === 0 && w.usdt === 0 && w.skr === 0) {
            const pubkey = new PublicKey(address);
            // Un peu de SOL d'abord, sinon le wallet ne peut payer aucun frais.
            await sendTreasurySol(devnetConn, pubkey, 50_000_000); // 0.05 SOL
            // USDC = vrai mint devnet Circle, quantité limitée côté trésor —
            // petit lot. USDT/SKR = mints à nous (devnet), on peut être large.
            await sendTreasuryToUserTransfer(devnetConn, pubkey, mintFor("USDC"), toBaseUnits(5, "USDC"));
            await sendTreasuryToUserTransfer(devnetConn, pubkey, mintFor("USDT"), toBaseUnits(20, "USDT"));
            await sendTreasuryToUserTransfer(devnetConn, pubkey, mintFor("SKR"), toBaseUnits(5000, "SKR"));
            await get().refreshWalletBalances();
          }
        } catch {
          // Le lot de bienvenue est un bonus, pas un blocage — l'app reste
          // utilisable même si le RPC devnet est capricieux.
        }
      },
      punchIn: (signature) => {
        const s = get();
        if (s.lastPunchAt && Date.now() - s.lastPunchAt < DEMO_COOLDOWN_MS) return false;
        const bump = s.lastPunchAt ? 1 : 0;
        const code = s.country || "FR";
        const sig = signature ?? fakeSig();
        // Frais d'entrée (validation du pointage) : prélevé sur le wallet
        // seulement si le solde le permet — jamais de solde négatif fictif.
        const canPayFee = s.wallet.usdc >= ENTRY_FEE_USDC;
        const feeHalf = round2(ENTRY_FEE_USDC / 2);
        set({
          lastPunchAt: Date.now(),
          streak: Math.min(7, s.streak + (s.lastPunchAt ? bump : 0)),
          crewOnline: s.crewOnline + 1,
          tab: "punch",
          seenHow: true,
          globeToday: { ...s.globeToday, [code]: (s.globeToday[code] ?? 0) + 1 },
          globePulse: { code, sig, at: Date.now() },
          wallet: canPayFee ? { ...s.wallet, usdc: round2(s.wallet.usdc - ENTRY_FEE_USDC) } : s.wallet,
          protocolUsdc: canPayFee ? round2(s.protocolUsdc + feeHalf) : s.protocolUsdc,
          stakerUsdc: canPayFee ? round2(s.stakerUsdc + feeHalf) : s.stakerUsdc,
          skrBought: canPayFee ? s.skrBought + roundSkr((feeHalf * 0.4) / SKR_USD) : s.skrBought,
        });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        return true;
      },
      setCountry: (code) => set({ country: code }),
      greetNearby: async (id, name) => {
        const s = get();
        if ((s.greetedIds ?? []).includes(id)) return null;
        // Vrai transfert : le trésor paie le "bonjour" directement au wallet.
        // La signature réelle est gardée pour le reçu (vérifiable sur explorer).
        let txSig = "";
        // Le trésor signe seul : recevoir un "bonjour" ne nécessite pas de
        // session wallet (un authToken périmé ne doit pas bloquer un paiement).
        if (s.wallet.real) {
          try {
            const pubkey = new PublicKey(s.wallet.address);
            txSig = await sendTreasuryToUserTransfer(devnetConn, pubkey, mintFor("USDC"), toBaseUnits(0.1, "USDC"));
          } catch (e) {
            console.log("[PUNCH-TX] greetNearby:", e);
            return null;
          }
        }
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
          signature: txSig || fakeSig(),
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
        if (s.wallet.real) await get().refreshWalletBalances();
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
      cashShift: async (id, title) => {
        const s = get();
        const shift = s.shifts.find((x) => x.id === id);
        if (!shift) return null;
        const parts = splitOf(shift.payout);
        // Vrai paiement : le trésor envoie la part du travailleur au wallet.
        // La signature réelle est gardée pour le reçu (vérifiable sur explorer).
        let txSig = "";
        // Le trésor signe seul : recevoir la part travailleur ne nécessite pas
        // de session wallet (un authToken périmé ne doit pas bloquer un paiement).
        if (s.wallet.real) {
          try {
            const pubkey = new PublicKey(s.wallet.address);
            txSig = await sendTreasuryToUserTransfer(
              devnetConn,
              pubkey,
              mintFor(shift.token),
              toBaseUnits(parts.worker, shift.token)
            );
          } catch (e) {
            console.log("[PUNCH-TX] cashShift:", e);
            return null;
          }
        }
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
          signature: txSig || fakeSig(),
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
        if (s.wallet.real) await get().refreshWalletBalances();
        return rec;
      },
      swap: async (from, to, amount) => {
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
        // En mode réel : deux vrais transferts SPL — l'utilisateur envoie
        // "from" au trésor (signé Seed Vault), le trésor renvoie "to" (signé
        // par le trésor). Taux fixe affiché, mais transactions on-chain réelles.
        // On garde dans le reçu la signature du transfert signé par l'utilisateur
        // (celle qu'il peut vérifier dans son historique Seed Vault).
        let txSig = "";
        // Session perdue (authToken purgé au démarrage) : refus propre,
        // JAMAIS de simulation locale en secours.
        const token = s.wallet.authToken;
        if (s.wallet.real) {
          if (!token) return null; // session perdue : refus propre, jamais simulé
          try {
            const pubkey = new PublicKey(s.wallet.address);
            txSig = await sendUserToTreasuryTransfer(
              devnetConn,
              token,
              pubkey,
              mintFor(from),
              toBaseUnits(amount, from)
            );
            await sendTreasuryToUserTransfer(devnetConn, pubkey, mintFor(to), toBaseUnits(out, to));
          } catch (e) {
            console.log("[PUNCH-TX] swap:", e);
            return null;
          }
        }
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
          signature: txSig || fakeSig(),
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
        if (s.wallet.real) await get().refreshWalletBalances();
        return rec;
      },
      stake: async (amount) => {
        const s = get();
        if (amount <= 0 || s.wallet.skr < amount) return false;
        // En mode réel : vrai transfert SPL signé par Seed Vault, user -> trésor.
        // Session perdue (authToken purgé au démarrage) : refus propre, jamais simulé.
        const token = s.wallet.authToken;
        let txSig = "";
        if (s.wallet.real) {
          if (!token) return false; // session perdue : refus propre, jamais simulé
          try {
            const pubkey = new PublicKey(s.wallet.address);
            const units = toBaseUnits(amount, "SKR");
            txSig = await sendUserToTreasuryTransfer(devnetConn, token, pubkey, mintFor("SKR"), units);
          } catch (e) {
            console.log("[PUNCH-TX] stake:", e);
            return false;
          }
        }
        // Reçu visible : le stake est une vraie transaction, il doit avoir son
        // ticket avec la signature vérifiable sur l'explorer.
        const rec: Receipt = {
          id: `r-${Date.now()}`,
          at: Date.now(),
          kind: "stake",
          title: "Stake SKR",
          token: "SKR",
          gross: amount,
          worker: 0,
          stakers: 0,
          protocol: 0,
          signature: txSig || fakeSig(),
        };
        set((prev) => ({
          wallet: {
            ...prev.wallet,
            skr: roundSkr(prev.wallet.skr - amount),
            stakedSkr: roundSkr(prev.wallet.stakedSkr + amount),
          },
          receipts: [rec, ...prev.receipts],
          lastReceiptId: rec.id,
        }));
        if (s.wallet.real) await get().refreshWalletBalances();
        return true;
      },
      unstake: async (amount) => {
        const s = get();
        if (amount <= 0 || s.wallet.stakedSkr < amount) return false;
        // Frais de retrait : une petite part du SKR retiré finance le
        // protocole et les stakers au lieu de revenir intégralement au wallet.
        const fee = roundSkr(amount * WITHDRAW_FEE_PCT);
        const net = roundSkr(amount - fee);
        // En mode réel : vrai transfert SPL signé par le trésor, trésor -> user.
        // (Le trésor signe seul : pas de session wallet nécessaire pour recevoir.)
        let txSig = "";
        if (s.wallet.real) {
          try {
            const pubkey = new PublicKey(s.wallet.address);
            const units = toBaseUnits(net, "SKR");
            txSig = await sendTreasuryToUserTransfer(devnetConn, pubkey, mintFor("SKR"), units);
          } catch (e) {
            console.log("[PUNCH-TX] unstake:", e);
            return false;
          }
        }
        const feeUsd = round2(fee * SKR_USD);
        const feeHalf = round2(feeUsd / 2);
        // Reçu visible : montant relâché, frais 1,5 %, net reçu + signature.
        const rec: Receipt = {
          id: `r-${Date.now()}`,
          at: Date.now(),
          kind: "stake",
          title: "Unstake SKR",
          token: "SKR",
          gross: amount,
          worker: net,
          stakers: fee,
          protocol: 0,
          signature: txSig || fakeSig(),
        };
        set((prev) => ({
          wallet: {
            ...prev.wallet,
            skr: roundSkr(prev.wallet.skr + net),
            stakedSkr: roundSkr(prev.wallet.stakedSkr - amount),
          },
          protocolUsdc: round2(prev.protocolUsdc + feeHalf),
          stakerUsdc: round2(prev.stakerUsdc + feeHalf),
          receipts: [rec, ...prev.receipts],
          lastReceiptId: rec.id,
        }));
        if (s.wallet.real) await get().refreshWalletBalances();
        return true;
      },
      postShift: async (input) => {
        const s = get();
        if (input.amount < 1) return "amount";
        if (bal(s.wallet, input.token) < input.amount) return "bal";
        // Vrai blocage de fonds : l'utilisateur envoie le montant complet au
        // trésor (signé Seed Vault) — ce n'est plus un nombre modifié en local.
        // Session perdue (authToken purgé au démarrage) : refus propre, jamais simulé.
        const token = s.wallet.authToken;
        if (s.wallet.real) {
          if (!token) return "tx"; // session perdue : refus propre, jamais simulé
          try {
            const pubkey = new PublicKey(s.wallet.address);
            await sendUserToTreasuryTransfer(
              devnetConn,
              token,
              pubkey,
              mintFor(input.token),
              toBaseUnits(input.amount, input.token)
            );
          } catch (e) {
            console.log("[PUNCH-TX] postShift:", e);
            return "tx";
          }
        }
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
            fr: "Argent bloqué depuis ton portefeuille. Même règle : toi 92 %, gardiens SKR 3 %, l'app 5 %.",
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
        if (s.wallet.real) await get().refreshWalletBalances();
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
      // Relit les vrais soldes liquides (USDC/USDT/SKR) directement sur devnet
      // — plus un nombre stocké dans le téléphone. Le SKR "misé" (stakedSkr)
      // reste un compteur app : le staking envoie le SKR dans le trésor
      // commun, et sans un vrai programme on-chain dédié (hors scope ici), la
      // chaîne ne peut pas dire "combien appartient à quel utilisateur" —
      // seul le transfert lui-même est réel, sa comptabilité par utilisateur
      // est faite côté app, comme pour n'importe quel protocole de staking
      // avant qu'un programme on-chain existe.
      refreshWalletBalances: async () => {
        const s = get();
        if (!s.wallet.real) return;
        try {
          const pubkey = new PublicKey(s.wallet.address);
          const [usdc, usdt, skr] = await Promise.all([
            getTokenBalance(devnetConn, pubkey, mintFor("USDC")),
            getTokenBalance(devnetConn, pubkey, mintFor("USDT")),
            getTokenBalance(devnetConn, pubkey, mintFor("SKR")),
          ]);
          set((prev) => ({ wallet: { ...prev.wallet, usdc: round2(usdc), usdt: round2(usdt), skr: roundSkr(skr) } }));
        } catch {
          // RPC indisponible : on garde les derniers montants connus.
        }
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
      // Quitter le réseau : retire vraiment la contribution de ce Seeker des
      // compteurs partagés (crew / carte du monde) — pas de faux chiffres qui
      // restent gonflés. Revenir exigera une vraie reconnexion Seed Vault
      // (nouvelle transaction) puis un nouveau pointage pour être recompté.
      leaveNetwork: () => {
        const s = get();
        const wasCounted = !!s.lastPunchAt;
        const code = s.country || "FR";
        const nextCrew = wasCounted ? Math.max(0, s.crewOnline - 1) : s.crewOnline;
        const nextGlobeToday = wasCounted
          ? { ...s.globeToday, [code]: Math.max(0, (s.globeToday[code] ?? 0) - 1) }
          : s.globeToday;
        const locale = s.locale;
        const theme = s.theme;
        // Frais de sortie : crédité au protocole/stakers avant la remise à
        // zéro du wallet démo — sinon la contrepartie de la transaction
        // signée disparaîtrait avec le reset au lieu de rémunérer l'app.
        const feeHalf = round2(EXIT_FEE_USDC / 2);
        set({
          ...seed(),
          locale,
          theme,
          seenHow: true,
          crewOnline: nextCrew,
          globeToday: nextGlobeToday,
          wallet: { ...seedWallet(), connected: false },
          protocolUsdc: round2(s.protocolUsdc + feeHalf),
          stakerUsdc: round2(s.stakerUsdc + feeHalf),
          skrBought: s.skrBought + roundSkr((feeHalf * 0.4) / SKR_USD),
        });
      },
    }),
    {
      name: "punch-v3",
      storage: createJSONStorage(() => zustandMMKVStorage),
      skipHydration: true,
      partialize: (s) => ({
        locale: s.locale,
        localeChosen: s.localeChosen,
        theme: s.theme,
        look: s.look,
        screensaverSecs: s.screensaverSecs,
        seenHow: s.seenHow,
        country: s.country,
        streak: s.streak,
        todayEarnedUsd: s.todayEarnedUsd,
        protocolUsdc: s.protocolUsdc,
        stakerUsdc: s.stakerUsdc,
        skrBought: s.skrBought,
        lastPunchAt: s.lastPunchAt,
        completedIds: s.completedIds,
        wallet: {
          ...s.wallet,
          connected: false,
          authToken: null,
        },
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<PunchState>;
        const wallet = { ...current.wallet, ...(p.wallet ?? {}), authToken: null };
        return {
          ...current,
          ...p,
          locale: p.locale === "en" ? "en" : "fr",
          localeChosen: Boolean(p.localeChosen),
          theme:
            p.theme === "light" || p.theme === "gold" || p.theme === "goldLight" ? p.theme : "dark",
          look: p.look === "a" || p.look === "b" ? p.look : "c",
          screensaverSecs:
            p.screensaverSecs === 10 || p.screensaverSecs === 30 || p.screensaverSecs === 60
              ? p.screensaverSecs
              : 0,
          seenHow: Boolean(p.seenHow),
          greetedIds: Array.isArray(p.greetedIds) ? p.greetedIds : [],
          view: "app",
          tab: "punch",
          product: "punch",
          lastPunchAt: typeof p.lastPunchAt === "number" ? p.lastPunchAt : null,
          completedIds: Array.isArray(p.completedIds) ? p.completedIds : current.completedIds,
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

export function useColors() {
  const theme = usePunch((s) => s.theme);
  const look = usePunch((s) => s.look);
  // Portage CSS PUNCH-ABC : l'habillage change la police GLOBALE (mono pour a,
  // serif pour b). Mutation synchrone ici, avant les makeStyles des écrans.
  applyLookFonts(look);
  const base = palettes[theme] ?? palettes.dark;
  // Le THÈME reste maître : l'habillage applique SA variante pour ce thème —
  // les 4 thèmes (dark, light, gold, goldLight) ont chacune leur variante par
  // habillage. Identité fraîche à chaque appel pour que tous les styles se
  // recalculent au changement d'habillage ou de thème.
  const variant = lookPalettes[look];
  const over = variant
    ? theme === "light"
      ? variant.light
      : theme === "gold"
        ? variant.gold
        : theme === "goldLight"
          ? variant.goldLight
          : variant.dark
    : undefined;
  return { ...base, ...(over ?? {}) };
}

export function rehydratePunch() {
  void usePunch.persist.rehydrate();
}

/**
 * Formes globales par habillage (portage des radius PUNCH-ABC appliqués à
 * toute la page) : A = pilules partout, B = angles vifs 2px, C = doux 16px.
 * Les cartes, rangées et boutons de TOUS les écrans s'en servent — c'est ce
 * qui rend le changement d'habillage visible au-delà de la police.
 */
export function useShape() {
  const look = usePunch((s) => s.look);
  if (look === "a") return { card: 32, btn: 999, chip: 999 };
  if (look === "b") return { card: 2, btn: 2, chip: 2 };
  return { card: 16, btn: 14, chip: 10 };
}
