import { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { usePunch, useT, useColors, useShape } from "../../lib/punch/store";
import { fonts } from "../../lib/punch/fonts";
import { tokenColors } from "../../lib/punch/theme";
import { formatAmt, rankMeets } from "../../lib/punch/format";
import type { Token } from "../../lib/punch/types";

function tokenChipStyle(token: Token) {
  const color = tokenColors[token];
  return { backgroundColor: color + "26", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 } as const;
}

const FILTERS: (Token | "ALL")[] = ["ALL", "USDC", "USDT", "SKR"];

export default function BoardScreen() {
  const t = useT();
  const c = useColors();
  const sh = useShape();
  const s = useMemo(() => makeStyles(c, sh), [c, sh]);
  const locale = usePunch((st) => st.locale);
  const shifts = usePunch((st) => st.shifts);
  const wallet = usePunch((st) => st.wallet);
  const lastPunchAt = usePunch((st) => st.lastPunchAt);
  const completedIds = usePunch((st) => st.completedIds);
  const openShift = usePunch((st) => st.openShift);
  const rank = usePunch((st) => st.rank);
  const [filter, setFilter] = useState<Token | "ALL">("ALL");
  const router = useRouter();

  const list = shifts.filter((sh) => filter === "ALL" || sh.token === filter);

  function handleOpen(id: string) {
    const err = openShift(id);
    if (!err) {
      router.push("/shift");
      return;
    }
    if (err === "punch") {
      Alert.alert(t.needPunch, undefined, [
        { text: t.punchCta, onPress: () => router.push("/") },
        { text: t.back, style: "cancel" },
      ]);
    } else if (err === "genesis") {
      Alert.alert(t.lockedGenesis);
    } else if (err === "rank") {
      Alert.alert(t.lockedRank);
    } else if (err === "full") {
      Alert.alert(t.locked);
    } else if (err === "done") {
      Alert.alert(t.cashed);
    }
  }

  return (
    <View style={s.wrap}>
      <ScrollView contentContainerStyle={s.content}>
        <Text style={s.title}>{lastPunchAt ? t.boardUnlocked : t.needPunch}</Text>
        <Text style={s.subtitle}>{t.splitBody}</Text>

        <TouchableOpacity style={s.postBtn} activeOpacity={0.8} onPress={() => router.push("/post")}>
          <Text style={s.postBtnTxt}>{t.postShift}</Text>
        </TouchableOpacity>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={s.filters}
          contentContainerStyle={s.filtersInner}
        >
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[s.filterBtn, filter === f && s.filterActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[s.filterTxt, filter === f && s.filterTxtActive]}>
                {f === "ALL" ? t.filterAll : f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {list.length === 0 && <Text style={s.empty}>{t.emptyBoard}</Text>}

        {list.map((sh) => {
          const lockedRank = !rankMeets(rank(), sh.rank);
          const lockedGen = sh.genesisRequired && !wallet.genesis;
          const done = completedIds.includes(sh.id) && !sh.userPosted;
          const full = sh.taken >= sh.spots;
          const locked = lockedRank || lockedGen || done || full;
          const status = done
            ? t.cashed
            : lockedGen
              ? t.lockedGenesis
              : lockedRank
                ? t.lockedRank
                : full
                  ? t.locked
                  : null;
          return (
            <View key={sh.id} style={s.card}>
              <View style={s.cardHead}>
                <View style={s.cardHeadText}>
                  <Text style={s.cardSponsor}>
                    {sh.sponsor} · {sh.city[locale]}
                  </Text>
                  <Text style={s.cardTitle}>{sh.title[locale]}</Text>
                </View>
                <View style={tokenChipStyle(sh.token)}>
                  <Text style={[s.tokenChipTxt, { color: tokenColors[sh.token] }]}>{sh.token}</Text>
                </View>
              </View>

              <Text style={s.cardPayout}>
                {formatAmt(sh.payout, sh.token)} {sh.token}
              </Text>
              <Text style={s.cardMeta}>
                {sh.durationMin} {t.min} · {sh.spots - sh.taken} {t.spots} · {t.kinds[sh.kind]}
              </Text>
              {sh.userPosted ? <Text style={s.cardPosted}>{t.posted}</Text> : null}

              <TouchableOpacity
                style={[s.ctaBtn, locked && s.ctaBtnLocked]}
                onPress={() => handleOpen(sh.id)}
                activeOpacity={0.8}
              >
                <Text style={[s.ctaTxt, locked && s.ctaTxtLocked]}>{status ?? t.startShift}</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

function makeStyles(c: ReturnType<typeof useColors>, sh: ReturnType<typeof useShape>) {
  return StyleSheet.create({
    wrap: { flex: 1, backgroundColor: c.bg },
    content: { paddingTop: 16, paddingHorizontal: 24, paddingBottom: 40 },
    title: { fontFamily: fonts.display, fontSize: 26, color: c.fg, marginBottom: 8 },
    subtitle: { fontFamily: fonts.body, fontSize: 14, color: c.dim2, lineHeight: 20, marginBottom: 16 },
    postBtn: {
      backgroundColor: c.card,
      borderRadius: sh.card,
      paddingVertical: 14,
      alignItems: "center",
      marginBottom: 16,
    },
    postBtnTxt: { fontFamily: fonts.bodySemi, fontSize: 15, color: c.fg },
    filters: { maxHeight: 44, marginBottom: 16 },
    filtersInner: { gap: 8 },
    filterBtn: {
      backgroundColor: c.card,
      borderRadius: sh.chip,
      paddingHorizontal: 16,
      height: 44,
      justifyContent: "center",
    },
    filterActive: { backgroundColor: c.accent },
    filterTxt: { fontFamily: fonts.bodySemi, fontSize: 13, color: c.dim },
    filterTxtActive: { color: c.accentFg },
    empty: { fontFamily: fonts.body, fontSize: 14, color: c.dim, textAlign: "center", marginTop: 40 },
    card: {
      backgroundColor: c.card,
      borderRadius: sh.card + 4,
      padding: 16,
      marginBottom: 12,
    },
    cardHead: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 8,
    },
    cardHeadText: { flex: 1 },
    cardSponsor: { fontFamily: fonts.body, fontSize: 11, color: c.dim, textTransform: "uppercase" },
    cardTitle: { fontFamily: fonts.display, fontSize: 19, color: c.fg, marginTop: 2 },
    tokenChip: {
      backgroundColor: c.input,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    tokenChipTxt: { fontFamily: fonts.mono, fontSize: 11, color: c.dim2 },
    cardPayout: { fontFamily: fonts.display, fontSize: 22, color: c.fg, marginTop: 10 },
    cardMeta: { fontFamily: fonts.body, fontSize: 13, color: c.dim2, marginTop: 4 },
    cardPosted: { fontFamily: fonts.body, fontSize: 13, color: c.fg, marginTop: 4 },
    ctaBtn: {
      backgroundColor: c.accent,
      borderRadius: sh.btn,
      paddingVertical: 14,
      alignItems: "center",
      marginTop: 14,
    },
    ctaBtnLocked: { backgroundColor: c.input },
    ctaTxt: { fontFamily: fonts.bodySemi, fontSize: 15, color: c.accentFg },
    ctaTxtLocked: { color: c.dim },
  });
}
