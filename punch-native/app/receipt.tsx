import { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { usePunch, useT, useColors } from "../lib/punch/store";
import { fonts } from "../lib/punch/fonts";
import { tokenColors } from "../lib/punch/theme";
import { formatAmt, shortAddr } from "../lib/punch/format";

export default function ReceiptScreen() {
  const t = useT();
  const c = useColors();
  const s = useMemo(() => makeStyles(c), [c]);
  const lastReceiptId = usePunch((s) => s.lastReceiptId);
  const receipts = usePunch((s) => s.receipts);
  const setTab = usePunch((s) => s.setTab);
  const router = useRouter();

  const receipt = receipts.find((x) => x.id === lastReceiptId);

  if (!receipt) {
    return (
      <View style={s.wrap}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backText}>{t.back}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={s.wrap}>
      <ScrollView contentContainerStyle={s.content}>
        <Text style={s.eyebrow}>{t.cashed}</Text>

        <View style={s.card}>
          <View style={s.cardHead}>
            <View style={s.cardHeadText}>
              <Text style={s.cardEyebrow}>{t.receipt}</Text>
              <Text style={s.cardTitle}>{receipt.title}</Text>
            </View>
            <View style={[s.tokenChip, { backgroundColor: tokenColors[receipt.token] + "26" }]}>
              <Text style={[s.tokenChipTxt, { color: tokenColors[receipt.token] }]}>{receipt.token}</Text>
            </View>
          </View>

          {receipt.kind === "stake" ? (
            // Reçu stake/unstake : pas de découpe 92/3/5 — montant, frais, net.
            <View style={s.rows}>
              {receipt.worker === 0 ? (
                <Row s={s} k={t.stakeLocked} v={`${formatAmt(receipt.gross, receipt.token)} ${receipt.token}`} strong last />
              ) : (
                <>
                  <Row s={s} k={t.gross} v={`${formatAmt(receipt.gross, receipt.token)} ${receipt.token}`} />
                  <Row s={s} k={t.stakeFee} v={`${formatAmt(receipt.stakers, receipt.token)} ${receipt.token}`} />
                  <Row s={s} k={t.stakeNet} v={`${formatAmt(receipt.worker, receipt.token)} ${receipt.token}`} strong last />
                </>
              )}
            </View>
          ) : (
            <View style={s.rows}>
              <Row s={s} k={t.gross} v={`${formatAmt(receipt.gross, receipt.token)} ${receipt.token}`} />
              <Row s={s} k={t.worker} v={`${formatAmt(receipt.worker, receipt.token)}  92%`} strong />
              <Row s={s} k={t.stakers} v={`${formatAmt(receipt.stakers, receipt.token)}  3%`} />
              <Row s={s} k={t.protocol} v={`${formatAmt(receipt.protocol, receipt.token)}  5%`} last />
            </View>
          )}

          <TouchableOpacity
            onPress={() =>
              Linking.openURL(`https://explorer.solana.com/tx/${receipt.signature}?cluster=devnet`)
            }
          >
            <Text style={s.sig} numberOfLines={1}>{t.tx} {shortAddr(receipt.signature)} ↗</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={s.footerRow}>
        <TouchableOpacity
          style={s.footerBtnSecondary}
          onPress={() => { router.replace("/board" as never); setTab("board"); }}
          activeOpacity={0.8}
        >
          <Text style={s.footerBtnSecondaryTxt}>{t.seeJobs}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={s.footerBtn}
          onPress={() => { router.replace("/split" as never); setTab("split"); }}
          activeOpacity={0.8}
        >
          <Text style={s.footerBtnTxt}>{t.split}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Row({ s, k, v, strong, last }: { s: ReturnType<typeof makeStyles>; k: string; v: string; strong?: boolean; last?: boolean }) {
  return (
    <View style={[s.row, last && s.rowLast]}>
      <Text style={s.rowK}>{k}</Text>
      <Text style={[s.rowV, strong && s.rowVStrong]}>{v}</Text>
    </View>
  );
}

function makeStyles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    wrap: { flex: 1, backgroundColor: c.bg },
    content: { paddingTop: 64, paddingHorizontal: 24, paddingBottom: 24 },
    backBtn: { marginTop: 64, marginLeft: 24 },
    backText: { fontFamily: fonts.body, color: c.dim, fontSize: 14 },
    eyebrow: { fontFamily: fonts.mono, fontSize: 11, color: c.dim, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 16 },
    card: { backgroundColor: c.paper, borderRadius: 24, padding: 20 },
    cardHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8 },
    cardHeadText: { flex: 1 },
    cardEyebrow: { fontFamily: fonts.body, fontSize: 11, color: c.paperMuted, textTransform: "uppercase", letterSpacing: 0.5 },
    cardTitle: { fontFamily: fonts.display, fontSize: 19, color: c.paperFg, marginTop: 4 },
    tokenChip: { backgroundColor: "rgba(0,0,0,0.06)", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
    tokenChipTxt: { fontFamily: fonts.mono, fontSize: 11, color: c.paperMuted },
    rows: { marginTop: 18 },
    row: {
      flexDirection: "row", justifyContent: "space-between", paddingVertical: 6,
      borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "rgba(26,25,22,0.08)",
    },
    rowLast: { borderBottomWidth: 0 },
    rowK: { fontFamily: fonts.mono, fontSize: 13, color: c.paperMuted },
    rowV: { fontFamily: fonts.mono, fontSize: 13, color: "rgba(26,25,22,0.8)" },
    rowVStrong: { fontFamily: fonts.mono, color: c.paperFg, fontWeight: "600" },
    sig: { fontFamily: fonts.mono, fontSize: 10, color: c.paperMuted, marginTop: 16 },
    footerRow: { flexDirection: "row", gap: 8, paddingHorizontal: 24, paddingBottom: 24, paddingTop: 8 },
    footerBtnSecondary: { flex: 1, backgroundColor: c.card, borderRadius: 12, paddingVertical: 14, alignItems: "center" },
    footerBtnSecondaryTxt: { fontFamily: fonts.bodySemi, fontSize: 14, color: c.fg },
    footerBtn: { flex: 1, backgroundColor: c.accent, borderRadius: 12, paddingVertical: 14, alignItems: "center" },
    footerBtnTxt: { fontFamily: fonts.bodySemi, fontSize: 14, color: c.accentFg },
  });
}
