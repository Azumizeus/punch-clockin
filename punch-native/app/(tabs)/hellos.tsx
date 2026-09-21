import { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { usePunch, useT, useColors, useShape } from "../../lib/punch/store";
import { fonts } from "../../lib/punch/fonts";
import { helloCounts, helloLeaderboard, helloSkr } from "../../lib/punch/hellos";
import type { HelloPeriod } from "../../lib/punch/hellos";
import { roundSkr } from "../../lib/punch/format";

const PERIODS: HelloPeriod[] = ["week", "month", "year", "all"];
const PERIOD_LABEL: Record<HelloPeriod, "hellosWeek" | "hellosMonth" | "hellosYear" | "hellosTotal"> = {
  week: "hellosWeek",
  month: "hellosMonth",
  year: "hellosYear",
  all: "hellosTotal",
};

// Rang ordinal avec suffixe mono — pas d'emoji, un simple 01 / 02 / 03.
function rankLabel(i: number) {
  return String(i + 1).padStart(2, "0");
}

export default function HellosScreen() {
  const t = useT();
  const c = useColors();
  const shape = useShape();
  const s = useMemo(() => makeStyles(c, shape), [c, shape]);
  const helloEvents = usePunch((st) => st.helloEvents) ?? [];
  const [period, setPeriod] = useState<HelloPeriod>("week");

  const counts = useMemo(() => helloCounts(helloEvents), [helloEvents]);
  const skr = useMemo(() => helloSkr(helloEvents), [helloEvents]);
  // « all » s'affiche comme le total — même chiffre, libellé différent.
  const countFor = (p: HelloPeriod) => (p === "all" ? counts.total : counts[p]);
  const board = useMemo(() => helloLeaderboard(countFor(period), period), [counts, period]);
  const myIndex = board.findIndex((r) => r.isYou);

  return (
    <ScrollView style={s.wrap} contentContainerStyle={s.content}>
      <Text style={s.title}>{t.hellos}</Text>
      <Text style={s.tag}>{t.hellosTag}</Text>

      <View style={s.countRow}>
        {PERIODS.map((p) => (
          <View key={p} style={[s.countCard, { borderRadius: shape.card }]}>
            <Text style={s.countVal}>{countFor(p)}</Text>
            <Text style={s.countLabel}>{t[PERIOD_LABEL[p]]}</Text>
          </View>
        ))}
      </View>

      <View style={[s.earnedCard, { borderRadius: shape.card }]}>
        <Text style={s.earnedVal}>{roundSkr(skr).toLocaleString("fr-FR")} SKR</Text>
        <Text style={s.earnedLabel}>{t.hellosEarned}</Text>
      </View>

      <Text style={s.boardTitle}>{t.hellosBoard}</Text>

      <View style={s.pillRow}>
        {PERIODS.map((p) => (
          <TouchableOpacity
            key={p}
            style={[s.pill, { borderRadius: 999 }, period === p && s.pillActive]}
            onPress={() => setPeriod(p)}
            activeOpacity={0.8}
          >
            <Text style={[s.pillTxt, period === p && s.pillTxtActive]}>{t[PERIOD_LABEL[p]]}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {helloEvents.length === 0 ? <Text style={s.empty}>{t.hellosEmpty}</Text> : null}

      {board.map((row, i) => (
        <View
          key={row.name}
          style={[
            s.row,
            { borderRadius: shape.chip },
            row.isYou && s.rowYou,
            myIndex === 0 && row.isYou && s.rowFirst,
          ]}
        >
          <Text style={[s.rank, row.isYou && s.rankYou]}>{rankLabel(i)}</Text>
          <Text style={[s.name, row.isYou && s.nameYou]} numberOfLines={1}>
            {row.isYou ? t.hellosYou : row.name}
          </Text>
          <Text style={[s.count, row.isYou && s.nameYou]}>{row.count}</Text>
        </View>
      ))}

      <Text style={s.note}>{t.hellosReward}</Text>
      <Text style={s.note}>{t.hellosReset}</Text>
    </ScrollView>
  );
}

function makeStyles(c: ReturnType<typeof useColors>, shape: ReturnType<typeof useShape>) {
  return StyleSheet.create({
    wrap: { flex: 1, backgroundColor: c.bg },
    content: { paddingTop: 16, paddingHorizontal: 24, paddingBottom: 140 },
    title: { fontFamily: fonts.display, fontSize: 26, color: c.fg, marginBottom: 4 },
    tag: { fontFamily: fonts.body, fontSize: 13, color: c.dim, lineHeight: 19, marginBottom: 16 },
    countRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
    countCard: {
      flex: 1,
      backgroundColor: c.card,
      paddingVertical: 14,
      alignItems: "center",
    },
    countVal: { fontFamily: fonts.mono, fontSize: 22, color: c.fg, fontVariant: ["tabular-nums"] },
    countLabel: { fontFamily: fonts.body, fontSize: 11, color: c.dim, marginTop: 4, textAlign: "center" },
    earnedCard: {
      backgroundColor: c.card,
      padding: 16,
      alignItems: "center",
      marginBottom: 24,
    },
    earnedVal: { fontFamily: fonts.mono, fontSize: 18, color: c.accent, letterSpacing: 0.5 },
    earnedLabel: { fontFamily: fonts.body, fontSize: 12, color: c.dim, marginTop: 4 },
    boardTitle: {
      fontFamily: fonts.bodySemi,
      fontSize: 11,
      color: c.dim,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 10,
    },
    pillRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 14 },
    pill: {
      borderWidth: 1,
      borderColor: c.border,
      paddingVertical: 7,
      paddingHorizontal: 12,
    },
    pillActive: { backgroundColor: c.accent, borderColor: c.accent },
    pillTxt: { fontFamily: fonts.body, fontSize: 12, color: c.dim },
    pillTxtActive: { fontFamily: fonts.bodySemi, color: c.accentFg },
    empty: { fontFamily: fonts.body, fontSize: 13, color: c.dim2, textAlign: "center", marginVertical: 12 },
    row: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: c.card,
      paddingVertical: 12,
      paddingHorizontal: 14,
      marginBottom: 6,
    },
    rowYou: { backgroundColor: c.input, borderWidth: 1, borderColor: c.accent },
    rowFirst: { borderColor: c.accent, borderWidth: 1 },
    rank: { width: 30, fontFamily: fonts.mono, fontSize: 12, color: c.dim2, fontVariant: ["tabular-nums"] },
    rankYou: { color: c.accent },
    name: { flex: 1, fontFamily: fonts.body, fontSize: 14, color: c.dim },
    nameYou: { fontFamily: fonts.bodySemi, color: c.fg },
    count: { fontFamily: fonts.mono, fontSize: 14, color: c.fg, fontVariant: ["tabular-nums"] },
    note: { fontFamily: fonts.body, fontSize: 11, color: c.dim2, lineHeight: 16, textAlign: "center", marginTop: 12 },
  });
}
