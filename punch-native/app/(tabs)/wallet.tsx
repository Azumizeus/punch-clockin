import { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Connection, PublicKey } from "@solana/web3.js";
import { useRouter } from "expo-router";
import { GoldBadge } from "../../components/GoldBadge";
import { usePunch, useT, useColors, useShape } from "../../lib/punch/store";
import { fonts } from "../../lib/punch/fonts";
import { tokenColors } from "../../lib/punch/theme";
import { formatAmt, formatUsd, usdValue } from "../../lib/punch/format";
import type { Token } from "../../lib/punch/types";

const TOKENS: Token[] = ["USDC", "USDT", "SKR"];

export default function WalletScreen() {
  const t = useT();
  const c = useColors();
  const sh = useShape();
  const s = useMemo(() => makeStyles(c, sh), [c, sh]);
  const wallet = usePunch((s) => s.wallet);
  const rank = usePunch((s) => s.rank);
  const stake = usePunch((s) => s.stake);
  const unstake = usePunch((s) => s.unstake);
  const swap = usePunch((s) => s.swap);
  const lastTxError = usePunch((s) => s.lastTxError);
  const router = useRouter();

  const [swapFrom, setSwapFrom] = useState<Token>("SKR");
  const [swapTo, setSwapTo] = useState<Token>("USDC");
  const [swapAmt, setSwapAmt] = useState("100");
  const [stakeAmt, setStakeAmt] = useState("1000");
  const [staking, setStaking] = useState(false);
  const [unstaking, setUnstaking] = useState(false);

  function bal(token: Token) {
    if (token === "USDC") return wallet.usdc;
    if (token === "USDT") return wallet.usdt;
    return wallet.skr;
  }

  const totalUsd =
    usdValue(wallet.usdc, "USDC") +
    usdValue(wallet.usdt, "USDT") +
    usdValue(wallet.skr + wallet.stakedSkr, "SKR");

  const [swapping, setSwapping] = useState(false);

  // En mode réel, une transaction signée par le Seed Vault exige des frais en
  // SOL payés par l'utilisateur. Si le wallet n'en a plus, on refuse propre
  // AVANT d'ouvrir la feuille de signature (sinon : échec muet ou crash).
  async function canSign() {
    if (!wallet.real) return true;
    if (!wallet.authToken) {
      Alert.alert(t.needReconnect);
      return false;
    }
    try {
      const conn = new Connection("https://api.devnet.solana.com");
      // Plafonné à 4 s : sous rate-limit devnet, ce pré-check ne doit JAMAIS
      // laisser le bouton mort en silence — passé ce délai on tente quand
      // même, le vault affichera son erreur s'il y en a une.
      const lamports = await Promise.race([
        conn.getBalance(new PublicKey(wallet.address)),
        new Promise<number>((_, rej) => setTimeout(() => rej(new Error("precheck-timeout")), 4000)),
      ]).catch(() => -1);
      if (lamports >= 0 && lamports < 10_000) {
        Alert.alert(t.needSol);
        return false;
      }
    } catch {
      // RPC indisponible : on laisse tenter, le vault affichera son erreur.
    }
    return true;
  }

  async function handleSwap() {
    const amt = parseFloat(swapAmt);
    if (!Number.isFinite(amt) || amt <= 0) return;
    // Spinner IMMÉDIAT : canSign() fait un appel réseau — sans ça, le bouton
    // paraissait mort pendant des secondes de silence (rate-limit devnet).
    setSwapping(true);
    try {
      if (!(await canSign())) return;
      const rec = await swap(swapFrom, swapTo, amt);
      if (!rec) {
        // La VRAIE raison (session expirée, RPC saturé, refus...) quand le
        // store en a écrit une ; sinon c'est vraiment le solde.
        const reason = usePunch.getState().lastTxError;
        Alert.alert(reason ?? t.notEnough);
      } else router.push("/receipt");
    } finally {
      setSwapping(false);
    }
  }

  async function handleStake() {
    const amt = parseFloat(stakeAmt);
    if (!Number.isFinite(amt) || amt <= 0) return;
    if (wallet.skr < amt) {
      Alert.alert(t.notEnough);
      return;
    }
    // Spinner immédiat (même raison que handleSwap).
    setStaking(true);
    try {
      if (!(await canSign())) return;
      const ok = await stake(amt);
      if (!ok) Alert.alert(t.txFailed, usePunch.getState().lastTxError ?? undefined);
      else router.push("/receipt");
    } finally {
      setStaking(false);
    }
  }

  async function handleUnstake() {
    const amt = parseFloat(stakeAmt);
    if (!Number.isFinite(amt) || amt <= 0) return;
    if (wallet.stakedSkr < amt) {
      Alert.alert(t.notEnough);
      return;
    }
    // Spinner immédiat (même raison que handleSwap).
    setUnstaking(true);
    try {
      if (!(await canSign())) return;
      const ok = await unstake(amt);
      if (!ok) Alert.alert(t.txFailed, usePunch.getState().lastTxError ?? undefined);
      else router.push("/receipt");
    } finally {
      setUnstaking(false);
    }
  }

  return (
    <ScrollView style={s.wrap} contentContainerStyle={s.content}>
      <Text style={s.title}>{t.wallet}</Text>
      <Text style={s.totalUsd}>{formatUsd(totalUsd)}</Text>
      <Text style={s.hint}>{t.moneyUsdc}</Text>
      <Text style={s.hint}>{t.moneySkr}</Text>
      <Text style={s.rankLine}>{t.openRanks[rank()]}</Text>
      <TouchableOpacity onPress={() => router.push("/history" as never)} activeOpacity={0.8}>
        <Text style={s.historyLink}>{t.history} →</Text>
      </TouchableOpacity>

      {/* Badge SEEKER PREMIUM : ne se porte que sur le thème gold — dégradé
          or métal (reflet → métal → ombre) autour d'un fond noir chaud. */}
      <GoldBadge />

      <View style={s.balances}>
        {TOKENS.map((tok) => (
          <View key={tok} style={s.balRow}>
            <View style={[s.tokenChip, { backgroundColor: tokenColors[tok] + "26" }]}>
              <Text style={[s.tokenChipTxt, { color: tokenColors[tok] }]}>{tok}</Text>
            </View>
            <View style={s.balRight}>
              <Text style={s.balAmt}>{formatAmt(bal(tok), tok)} {tok}</Text>
              {tok === "SKR" && (
                <Text style={s.balSub}>{t.staked} {formatAmt(wallet.stakedSkr, "SKR")}</Text>
              )}
            </View>
          </View>
        ))}
      </View>

      {/* Swap */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>{t.swap}</Text>
        <Text style={s.hint}>{t.spreadSplit}</Text>

        <Text style={s.swapLabel}>{t.from}</Text>
        <View style={s.tokenRow}>
          {TOKENS.map((tok) => (
            <TouchableOpacity
              key={tok}
              style={[s.tokenBtn, swapFrom === tok && s.tokenBtnActive]}
              onPress={() => setSwapFrom(tok)}
              activeOpacity={0.8}
            >
              <Text style={[s.tokenBtnTxt, swapFrom === tok && s.tokenBtnTxtActive]}>{tok}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.swapLabel}>{t.to}</Text>
        <View style={s.tokenRow}>
          {TOKENS.map((tok) => (
            <TouchableOpacity
              key={tok}
              style={[s.tokenBtn, swapTo === tok && s.tokenBtnActiveAlt]}
              onPress={() => setSwapTo(tok)}
              activeOpacity={0.8}
            >
              <Text style={[s.tokenBtnTxt, swapTo === tok && s.tokenBtnTxtActive]}>{tok}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={s.input}
          value={swapAmt}
          onChangeText={setSwapAmt}
          keyboardType="decimal-pad"
          placeholderTextColor={c.dim}
        />
        <Text style={s.spreadHint}>{t.spread}</Text>

        <TouchableOpacity style={s.ctaBtn} onPress={handleSwap} activeOpacity={0.8} disabled={swapping}>
          {swapping ? <ActivityIndicator color={c.accentFg} /> : <Text style={s.ctaTxt}>{t.confirmSwap}</Text>}
        </TouchableOpacity>
        {wallet.real && <Text style={s.hint}>{t.realTxHint}</Text>}
        {lastTxError ? <Text style={s.errTxt}>{lastTxError}</Text> : null}
      </View>

      {/* Stake */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>{t.stake}</Text>
        <Text style={s.hint}>{t.stakeHint}</Text>

        <TextInput
          style={s.input}
          value={stakeAmt}
          onChangeText={setStakeAmt}
          keyboardType="number-pad"
          placeholderTextColor={c.dim}
        />

        <View style={s.stakeRow}>
          <TouchableOpacity
            style={s.ctaBtn}
            onPress={handleStake}
            activeOpacity={0.8}
            disabled={staking || unstaking}
          >
            {staking ? <ActivityIndicator color={c.accentFg} /> : <Text style={s.ctaTxt}>{t.confirmStake}</Text>}
          </TouchableOpacity>
          <TouchableOpacity
            style={s.secondaryBtn}
            onPress={handleUnstake}
            activeOpacity={0.8}
            disabled={staking || unstaking}
          >
            {unstaking ? <ActivityIndicator color={c.fg} /> : <Text style={s.secondaryBtnTxt}>{t.unstake}</Text>}
          </TouchableOpacity>
        </View>
        {wallet.real && <Text style={s.hint}>{t.realTxHint}</Text>}
      </View>
    </ScrollView>
  );
}

function makeStyles(c: ReturnType<typeof useColors>, sh: ReturnType<typeof useShape>) {
  return StyleSheet.create({
    wrap: { flex: 1, backgroundColor: c.bg },
    // paddingBottom large : les boutons stake finissaient SOUS la barre
    // d'onglets (il fallait scroller pour les atteindre — « le bouton ne
    // fonctionne pas »). 140 garde tout accessible d'un seul coup d'œil.
    content: { paddingTop: 16, paddingHorizontal: 24, paddingBottom: 140 },
    title: { fontFamily: fonts.display, fontSize: 26, color: c.fg },
    totalUsd: { fontFamily: fonts.display, fontSize: 34, color: c.fg, marginTop: 10 },
    hint: { fontFamily: fonts.body, fontSize: 13, color: c.dim2, lineHeight: 18, marginTop: 6 },
    rankLine: { fontFamily: fonts.bodySemi, fontSize: 13, color: c.fg, marginTop: 8 },
    historyLink: { fontFamily: fonts.bodySemi, fontSize: 14, color: c.accent, marginTop: 6 },
    balances: { marginTop: 20, gap: 8, marginBottom: 24 },
    balRow: {
      flexDirection: "row", alignItems: "center", justifyContent: "space-between",
      backgroundColor: c.card, borderRadius: sh.card, paddingHorizontal: 16, paddingVertical: 14,
    },
    tokenChip: { borderRadius: sh.chip, paddingHorizontal: 10, paddingVertical: 4 },
    tokenChipTxt: { fontFamily: fonts.mono, fontSize: 11, color: c.dim2 },
    balRight: { alignItems: "flex-end" },
    balAmt: { fontFamily: fonts.mono, fontSize: 14, color: c.fg },
    balSub: { fontFamily: fonts.mono, fontSize: 11, color: c.dim, marginTop: 2 },
    section: { marginBottom: 28 },
    sectionTitle: { fontFamily: fonts.display, fontSize: 18, color: c.fg, marginBottom: 6 },
    swapLabel: { fontFamily: fonts.mono, fontSize: 11, color: c.dim, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 12, marginBottom: 6 },
    tokenRow: { flexDirection: "row", gap: 6 },
    tokenBtn: { flex: 1, height: 44, borderRadius: sh.chip, backgroundColor: c.card, alignItems: "center", justifyContent: "center" },
    tokenBtnActive: { backgroundColor: c.accent },
    tokenBtnActiveAlt: { backgroundColor: c.fg },
    tokenBtnTxt: { fontFamily: fonts.mono, fontSize: 12, color: c.dim },
    tokenBtnTxtActive: { color: c.accentFg },
    input: {
      backgroundColor: c.card, borderRadius: sh.card, paddingHorizontal: 16, paddingVertical: 14,
      fontFamily: fonts.mono, fontSize: 16, color: c.fg, marginTop: 12,
    },
    spreadHint: { fontFamily: fonts.mono, fontSize: 11, color: c.dim, marginTop: 8 },
    errTxt: { fontFamily: fonts.body, fontSize: 12, color: "#e06060", lineHeight: 17, marginTop: 10 },
    ctaBtn: { flex: 1, backgroundColor: c.accent, borderRadius: sh.btn, paddingVertical: 14, alignItems: "center", marginTop: 12 },
    ctaTxt: { fontFamily: fonts.bodySemi, fontSize: 14, color: c.accentFg },
    stakeRow: { flexDirection: "row", gap: 8 },
    secondaryBtn: { flex: 1, backgroundColor: c.card, borderRadius: sh.btn, paddingVertical: 14, alignItems: "center", marginTop: 12 },
    secondaryBtnTxt: { fontFamily: fonts.bodySemi, fontSize: 14, color: c.fg },
  });
}
