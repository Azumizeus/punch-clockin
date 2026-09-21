import { useMemo } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Linking } from "react-native";
import { useRouter, Stack } from "expo-router";
import { usePunch, useT, useColors, useShape } from "../lib/punch/store";
import { fonts } from "../lib/punch/fonts";
import { tokenColors } from "../lib/punch/theme";
import { formatAmt, isRealSig, txUrl } from "../lib/punch/format";
import type { Receipt } from "../lib/punch/types";

/**
 * Historique : chaque ticket reçu, gardé sur le téléphone (100 max), rouvrable.
 * Un ticket = une vraie contrepartie (mission, bonjour, échange, stake, pli) —
 * on ne liste ici QUE ce qui a été réellement encaissé ou signé.
 */

function amountOf(r: Receipt): { text: string; color: string; plus: boolean } | null {
  if (r.kind === "swap" && r.swapOut) {
    return { text: `${formatAmt(r.swapOut.amount, r.swapOut.token)} ${r.swapOut.token}`, color: r.swapOut.token, plus: true };
  }
  if (r.kind === "hello") {
    return { text: `${formatAmt(r.worker, "USDC")} USDC`, color: "USDC", plus: true };
  }
  if (r.kind === "stake") {
    // stake : l'argent part sous séquestre ; unstake : il revient (net).
    if (r.worker === 0) return { text: `${formatAmt(r.gross, "SKR")} SKR`, color: "SKR", plus: false };
    return { text: `${formatAmt(r.worker, "SKR")} SKR`, color: "SKR", plus: true };
  }
  if (r.worker > 0) {
    return { text: `${formatAmt(r.worker, r.token)} ${r.token}`, color: r.token, plus: true };
  }
  return null;
}

function when(at: number, locale: string) {
  return new Date(at).toLocaleString(locale === "fr" ? "fr-FR" : "en-US", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HistoryScreen() {
  const t = useT();
  const c = useColors();
  const shape = useShape();
  const s = useMemo(() => makeStyles(c, shape), [c, shape]);
  const router = useRouter();
  const locale = usePunch((st) => st.locale);
  const receipts = usePunch((st) => st.receipts) ?? [];
  const openReceipt = usePunch((st) => st.openReceipt);

  return (
    <View style={s.wrap}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={s.wrap} contentContainerStyle={s.content}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <Text style={s.backTxt}>{t.back}</Text>
        </TouchableOpacity>

        <Text style={s.title}>{t.history}</Text>
        <Text style={s.tag}>{t.historyTag}</Text>

        {receipts.length === 0 ? <Text style={s.empty}>{t.historyEmpty}</Text> : null}

        {receipts.map((r) => {
          const amt = amountOf(r);
          return (
            <TouchableOpacity
              key={r.id}
              style={[s.row, { borderRadius: shape.card }]}
              onPress={() => {
                openReceipt(r.id);
                router.push("/receipt");
              }}
              activeOpacity={0.75}
            >
              <View style={s.rowHead}>
                <Text style={s.rowTitle} numberOfLines={1}>
                  {r.title}
                </Text>
                <Text style={s.rowDate}>{when(r.at, locale)}</Text>
              </View>
              <View style={s.rowFoot}>
                {amt ? (
                  <Text style={[s.rowAmt, { color: tokenColors[amt.color as keyof typeof tokenColors] ?? c.fg }]}>
                    {amt.plus ? "+" : "−"} {amt.text}
                  </Text>
                ) : null}
                {isRealSig(r.signature) ? (
                  <TouchableOpacity
                    onPress={() => Linking.openURL(txUrl(r.signature))}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={s.rowSig}>↗ {r.signature.slice(0, 10)}…</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={s.rowSig}>{r.signature.slice(0, 10)}…</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

function makeStyles(c: ReturnType<typeof useColors>, shape: ReturnType<typeof useShape>) {
  return StyleSheet.create({
    wrap: { flex: 1, backgroundColor: c.bg },
    content: { paddingTop: 54, paddingHorizontal: 24, paddingBottom: 40 },
    backBtn: { alignSelf: "flex-start", paddingVertical: 8, paddingRight: 16, marginBottom: 4 },
    backTxt: { fontFamily: fonts.body, fontSize: 14, color: c.dim },
    title: { fontFamily: fonts.display, fontSize: 26, color: c.fg },
    tag: { fontFamily: fonts.body, fontSize: 13, color: c.dim, lineHeight: 18, marginTop: 4, marginBottom: 20 },
    empty: { fontFamily: fonts.body, fontSize: 13, color: c.dim2, textAlign: "center", marginTop: 24 },
    row: {
      backgroundColor: c.card,
      paddingVertical: 12,
      paddingHorizontal: 16,
      marginBottom: 8,
    },
    rowHead: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: 8 },
    rowTitle: { flex: 1, fontFamily: fonts.bodySemi, fontSize: 14, color: c.fg },
    rowDate: { fontFamily: fonts.mono, fontSize: 11, color: c.dim2, fontVariant: ["tabular-nums"] },
    rowFoot: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", marginTop: 4 },
    rowAmt: { fontFamily: fonts.mono, fontSize: 13, fontVariant: ["tabular-nums"] },
    rowSig: { fontFamily: fonts.mono, fontSize: 10, color: c.dim2 },
  });
}
