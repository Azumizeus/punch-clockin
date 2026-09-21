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
import { ReceiptIn } from "../components/motion";
import { fonts } from "../lib/punch/fonts";
import { tokenColors } from "../lib/punch/theme";
import { formatAmt, shortAddr, isRealSig, txUrl, roundSkr } from "../lib/punch/format";
import { lookTokens } from "../lib/punch/looks";

export default function ReceiptScreen() {
  const t = useT();
  const c = useColors();
  // Reçu = ticket : rayon et mono pilotés par l'habillage (ticketRadius /
  // ticketMono), CTA et chip suivent ctaRadius — portage du web validé.
  const look = usePunch((st) => st.look);
  const lk = useMemo(() => lookTokens(look), [look]);
  const s = useMemo(() => makeStyles(c, lk), [c, lk]);
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

        {/* receipt-enter du CSS source : le ticket arrive du bas (16 px) en
            400 ms avec un léger dézoom 0.98 → 1. */}
        <ReceiptIn>
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

          {receipt.kind === "swap" && receipt.swapIn && receipt.swapOut ? (
            // Reçu d'échange : les VRAIS chiffres (payé / reçu), pas la découpe
            // 92/3/5 — un petit swap imprimait des 0,00 partout faute de détail.
            <View style={s.rows}>
              <Row s={s} k={t.youPay} v={`${formatAmt(receipt.swapIn.amount, receipt.swapIn.token)} ${receipt.swapIn.token}`} />
              <Row
                s={s}
                k={t.youGet}
                v={`${formatAmt(receipt.swapOut.amount, receipt.swapOut.token)} ${receipt.swapOut.token}`}
                strong
                last={!receipt.stakerSkrPaid && receipt.gross < 0.01}
              />
              {receipt.gross >= 0.01 ? (
                // Frais affichés seulement s'ils atteignent un centime —
                // sinon ce serait un « 0,00 $ » de plus sur le ticket.
                <Row s={s} k={t.swapFee} v={`${formatAmt(receipt.gross, "USDC")} $US`} last={!receipt.stakerSkrPaid} />
              ) : null}
              {receipt.stakerSkrPaid ? (
                // Détenteur de SKR staké : les 3 % de gardiens tombent
                // RÉELLEMENT dans ce wallet — affichés sur le ticket.
                <Row s={s} k={t.stakerPaid} v={`+${roundSkr(receipt.stakerSkrPaid)} SKR`} strong last />
              ) : null}
            </View>
          ) : receipt.kind === "stake" ? (
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
              {receipt.kind === "hello" && receipt.bonusSkr ? (
                // Bonus SKR du bonjour : visible sur le reçu, cumulé sur l'onglet Bonjours.
                <>
                  <Row s={s} k={t.protocol} v={`${formatAmt(receipt.protocol, receipt.token)}  5%`} />
                  <Row s={s} k={t.hellos} v={`+${roundSkr(receipt.bonusSkr)} SKR`} strong last />
                </>
              ) : (
                <Row s={s} k={t.protocol} v={`${formatAmt(receipt.protocol, receipt.token)}  5%`} last />
              )}
            </View>
          )}

          {/* La PREUVE que ça fonctionne : la signature réelle ouvre la page tx
              sur l'explorateur devnet. Une signature fictive (mode démo) n'a
              pas de page — elle reste du texte, pas un faux lien. */}
          {isRealSig(receipt.signature) ? (
            <TouchableOpacity onPress={() => Linking.openURL(txUrl(receipt.signature))} activeOpacity={0.7}>
              <Text style={[s.sig, s.sigLink]} numberOfLines={1}>{t.tx} {shortAddr(receipt.signature)} ↗</Text>
            </TouchableOpacity>
          ) : (
            <Text style={s.sig} numberOfLines={1}>{t.tx} {shortAddr(receipt.signature)}</Text>
          )}
        </View>
        </ReceiptIn>
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

function makeStyles(c: ReturnType<typeof useColors>, lk: ReturnType<typeof lookTokens>) {
  return StyleSheet.create({
    wrap: { flex: 1, backgroundColor: c.bg },
    content: { paddingTop: 64, paddingHorizontal: 24, paddingBottom: 24 },
    backBtn: { marginTop: 64, marginLeft: 24 },
    backText: { fontFamily: fonts.body, color: c.dim, fontSize: 14 },
    eyebrow: { fontFamily: fonts.mono, fontSize: 11, color: c.dim, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 16 },
    card: { backgroundColor: c.paper, borderRadius: lk.ticketRadius, padding: 20 },
    cardHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8 },
    cardHeadText: { flex: 1 },
    cardEyebrow: { fontFamily: fonts.body, fontSize: 11, color: c.paperMuted, textTransform: "uppercase", letterSpacing: 0.5 },
    cardTitle: { fontFamily: fonts.display, fontSize: 19, color: c.paperFg, marginTop: 4 },
    tokenChip: { backgroundColor: "rgba(0,0,0,0.06)", borderRadius: lk.ctaRadius, paddingHorizontal: 10, paddingVertical: 4 },
    tokenChipTxt: { fontFamily: lk.ticketMono ? fonts.mono : fonts.bodySemi, fontSize: 11, color: c.paperMuted },
    rows: { marginTop: 18 },
    row: {
      flexDirection: "row", justifyContent: "space-between", paddingVertical: 6,
      borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "rgba(26,25,22,0.08)",
    },
    rowLast: { borderBottomWidth: 0 },
    rowK: { fontFamily: lk.ticketMono ? fonts.mono : fonts.body, fontSize: 13, color: c.paperMuted },
    rowV: { fontFamily: lk.ticketMono ? fonts.mono : fonts.body, fontSize: 13, color: "rgba(26,25,22,0.8)" },
    rowVStrong: { fontFamily: lk.ticketMono ? fonts.mono : fonts.bodySemi, color: c.paperFg, fontWeight: "600" },
    sig: { fontFamily: lk.ticketMono ? fonts.mono : fonts.body, fontSize: 10, color: c.paperMuted, marginTop: 16 },
    sigLink: { textDecorationLine: "underline" },
    footerRow: { flexDirection: "row", gap: 8, paddingHorizontal: 24, paddingBottom: 24, paddingTop: 8 },
    footerBtnSecondary: { flex: 1, backgroundColor: c.card, borderRadius: lk.ctaRadius, paddingVertical: 14, alignItems: "center" },
    footerBtnSecondaryTxt: { fontFamily: fonts.bodySemi, fontSize: 14, color: c.fg },
    footerBtn: { flex: 1, backgroundColor: c.accent, borderRadius: lk.ctaRadius, paddingVertical: 14, alignItems: "center" },
    footerBtnTxt: { fontFamily: fonts.bodySemi, fontSize: 14, color: c.accentFg },
  });
}
