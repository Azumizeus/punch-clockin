import { useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from "react-native";
import { usePunch, useT, useColors } from "../../lib/punch/store";
import { fonts } from "../../lib/punch/fonts";
import { lookTokens } from "../../lib/punch/looks";
import { tokenColors } from "../../lib/punch/theme";
import { formatAmt, formatUsd, shortAddr, isRealSig, txUrl } from "../../lib/punch/format";
import { useLeaveNetwork } from "../../lib/punch/useLeaveNetwork";

export default function SplitScreen() {
  const t = useT();
  const c = useColors();
  // L'habillage pilote rayons + mono du ticket ici aussi (reçus = tickets).
  const look = usePunch((st) => st.look);
  const lk = useMemo(() => lookTokens(look), [look]);
  const s = useMemo(() => makeStyles(c, lk), [c, lk]);
  const receipts = usePunch((s) => s.receipts);
  const protocolUsdc = usePunch((s) => s.protocolUsdc);
  const stakerUsdc = usePunch((s) => s.stakerUsdc);
  const skrBought = usePunch((s) => s.skrBought);
  const todayEarnedUsd = usePunch((s) => s.todayEarnedUsd);
  const { leaving, confirmLeave } = useLeaveNetwork();

  return (
    <ScrollView style={s.wrap} contentContainerStyle={s.content}>
      <Text style={s.hero}>{t.splitHero}</Text>
      <Text style={s.body}>{t.splitBody}</Text>
      <Text style={s.body2}>{t.moneyUsdc}</Text>
      <Text style={s.body2}>{t.moneySkr}</Text>

      <View style={s.pctRow}>
        <View style={s.pctCard}>
          <Text style={s.pctVal}>92%</Text>
          <Text style={s.pctLabel}>{t.worker}</Text>
        </View>
        <View style={s.pctCard}>
          <Text style={s.pctVal}>3%</Text>
          <Text style={s.pctLabel}>{t.stakers}</Text>
        </View>
        <View style={s.pctCard}>
          <Text style={[s.pctVal, s.pctValAccent]}>5%</Text>
          <Text style={s.pctLabel}>{t.protocol}</Text>
        </View>
      </View>

      <View style={s.totals}>
        <View style={s.totalRow}>
          <Text style={s.totalLabel}>{t.yourWages}</Text>
          <Text style={s.totalVal}>{formatUsd(todayEarnedUsd)}</Text>
        </View>
        <View style={s.totalRow}>
          <Text style={s.totalLabel}>{t.protocolTreasury}</Text>
          <Text style={s.totalVal}>{formatUsd(protocolUsdc)}</Text>
        </View>
        <View style={s.totalRow}>
          <Text style={s.totalLabel}>{t.stakerPool}</Text>
          <Text style={s.totalVal}>{formatUsd(stakerUsdc)}</Text>
        </View>
        <View style={s.totalRow}>
          <Text style={s.totalLabel}>{t.skrBought}</Text>
          <Text style={s.totalVal}>{skrBought.toLocaleString()} SKR</Text>
        </View>
      </View>

      <Text style={s.receiptTitle}>{t.feeTable}</Text>
      {receipts.slice(0, 6).map((r) => (
        <View key={r.id} style={s.receiptCard}>
          <View style={s.recHead}>
            <Text style={s.recTitle} numberOfLines={1}>{r.title}</Text>
            <View style={[s.tokenChip, { backgroundColor: tokenColors[r.token] + "26" }]}>
              <Text style={[s.tokenChipTxt, { color: tokenColors[r.token] }]}>{r.token}</Text>
            </View>
          </View>
          <View style={s.recRows}>
            <Text style={s.recRow}>{t.gross}: {formatAmt(r.gross, r.token)} {r.token}</Text>
            <Text style={s.recRow}>{t.worker}: {formatAmt(r.worker, r.token)}  92%</Text>
            <Text style={s.recRow}>{t.stakers}: {formatAmt(r.stakers, r.token)}  3%</Text>
            <Text style={s.recRow}>{t.protocol}: {formatAmt(r.protocol, r.token)}  5%</Text>
          </View>
          {/* Preuve on-chain : les vraies signatures ouvrent la page tx (devnet).
              Les signatures fictives du mode démo restent en texte simple. */}
          {isRealSig(r.signature) ? (
            <TouchableOpacity onPress={() => Linking.openURL(txUrl(r.signature))} activeOpacity={0.7}>
              <Text style={[s.recTx, s.recTxLink]} numberOfLines={1}>{t.tx} {shortAddr(r.signature)} ↗</Text>
            </TouchableOpacity>
          ) : (
            <Text style={s.recTx} numberOfLines={1}>{t.tx} {shortAddr(r.signature)}</Text>
          )}
        </View>
      ))}

      <View style={s.footer}>
        <View style={s.pitchBtn}>
          <Text style={s.pitchBtnTxt}>{t.pitch}</Text>
        </View>
        <TouchableOpacity onPress={confirmLeave} disabled={leaving}>
          {leaving ? (
            <ActivityIndicator color={c.dim} />
          ) : (
            <Text style={s.resetTxt}>{t.leaveNetwork}</Text>
          )}
        </TouchableOpacity>
        <Text style={s.demoVault}>{t.demoVault}</Text>
      </View>
    </ScrollView>
  );
}

function makeStyles(c: ReturnType<typeof useColors>, lk: ReturnType<typeof lookTokens>) {
  return StyleSheet.create({
    wrap: { flex: 1, backgroundColor: c.bg },
    content: { paddingTop: 16, paddingHorizontal: 24, paddingBottom: 40 },
    hero: { fontFamily: fonts.display, fontSize: 26, color: c.fg, lineHeight: 32, marginBottom: 10 },
    body: { fontFamily: fonts.body, fontSize: 15, color: c.dim2, lineHeight: 21, marginBottom: 8 },
    body2: { fontFamily: fonts.body, fontSize: 13, color: c.dim2, lineHeight: 19 },
    pctRow: { flexDirection: "row", gap: 8, marginTop: 20, marginBottom: 20 },
    pctCard: { flex: 1, backgroundColor: c.card, borderRadius: 16, paddingVertical: 16, alignItems: "center" },
    pctVal: { fontFamily: fonts.display, fontSize: 26, color: c.fg },
    pctValAccent: { color: c.accent },
    pctLabel: { fontFamily: fonts.body, fontSize: 11, color: c.dim, textAlign: "center", marginTop: 4 },
    totals: { gap: 8, marginBottom: 28 },
    totalRow: {
      flexDirection: "row", justifyContent: "space-between", alignItems: "center",
      backgroundColor: c.card, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12,
    },
    totalLabel: { fontFamily: fonts.body, fontSize: 14, color: c.dim2 },
    totalVal: { fontFamily: fonts.mono, fontSize: 14, color: c.fg },
    receiptTitle: { fontFamily: fonts.display, fontSize: 18, color: c.fg, marginBottom: 12 },
    receiptCard: { backgroundColor: c.paper, borderRadius: lk.ticketRadius, padding: 14, marginBottom: 10 },
    recHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
    recTitle: { fontFamily: fonts.display, fontSize: 15, color: c.paperFg, flex: 1, marginRight: 8 },
    tokenChip: { backgroundColor: "rgba(0,0,0,0.06)", borderRadius: lk.ctaRadius, paddingHorizontal: 8, paddingVertical: 3 },
    tokenChipTxt: { fontFamily: lk.ticketMono ? fonts.mono : fonts.bodySemi, fontSize: 10, color: c.paperMuted },
    recRows: { gap: 2 },
    recRow: { fontFamily: lk.ticketMono ? fonts.mono : fonts.body, fontSize: 12, color: "rgba(26,25,22,0.75)" },
    recTx: { fontFamily: lk.ticketMono ? fonts.mono : fonts.body, fontSize: 10, color: c.paperMuted, marginTop: 8 },
    recTxLink: { textDecorationLine: "underline" },
    footer: { marginTop: 12, gap: 10, alignItems: "stretch" },
    pitchBtn: { backgroundColor: c.accent, borderRadius: lk.ctaRadius, paddingVertical: 14, alignItems: "center" },
    pitchBtnTxt: { fontFamily: fonts.bodySemi, fontSize: 14, color: c.accentFg },
    resetTxt: { fontFamily: fonts.body, fontSize: 14, color: c.dim, textAlign: "center", paddingVertical: 8 },
    demoVault: { fontFamily: fonts.body, fontSize: 11, color: c.dim, textAlign: "center" },
  });
}
