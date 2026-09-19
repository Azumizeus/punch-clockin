import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  useWindowDimensions,
} from "react-native";
import * as Haptics from "expo-haptics";
import { useRouter, Stack } from "expo-router";
import { usePunch, useT, useColors } from "../lib/punch/store";
import { fonts } from "../lib/punch/fonts";
import type { Look } from "../lib/punch/types";

// Les 3 habillages viennent de l'export web (public/looks) : trois directions
// artistiques de l'écran d'accueil — a = pointeuse industrielle (cadran ivoire),
// b = ticket papier brutaliste, c = éditorial serif (habillage par défaut).
const LOOK_IMAGES = {
  a: require("../assets/images/looks/a.jpg"),
  b: require("../assets/images/looks/b.jpg"),
  c: require("../assets/images/looks/c.jpg"),
} as const;

const LOOK_ORDER: Look[] = ["c", "a", "b"];
const LOOK_NAME: Record<Look, { en: string; fr: string }> = {
  a: { en: "Industrial", fr: "Pointeuse" },
  b: { en: "Paper ticket", fr: "Ticket papier" },
  c: { en: "Editorial", fr: "Éditorial" },
};

export default function LooksScreen() {
  const t = useT();
  const c = useColors();
  const s = useMemo(() => makeStyles(c), [c]);
  const router = useRouter();
  const look = usePunch((st) => st.look);
  const setLook = usePunch((st) => st.setLook);
  const locale = usePunch((st) => st.locale);
  const { width } = useWindowDimensions();
  const [applied, setApplied] = useState<Look | null>(null);

  // Le bandeau de confirmation s'efface après 2,5 s.
  useEffect(() => {
    if (!applied) return;
    const id = setTimeout(() => setApplied(null), 2500);
    return () => clearTimeout(id);
  }, [applied]);

  // Cartes en 2 colonnes sur les grands écrans, 1 colonne sur téléphone serré.
  const cardW = width >= 760 ? (width - 24 * 3) / 2 : width - 48;

  function apply(l: Look) {
    setLook(l);
    setApplied(l);
    // Confirmation physique : l'utilisateur SENT que le changement est pris.
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }

  return (
    <View style={s.wrap}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={s.wrap} contentContainerStyle={s.content}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <Text style={s.backTxt}>{t.back}</Text>
        </TouchableOpacity>

        <Text style={s.title}>{t.looks}</Text>
        <Text style={s.tag}>{t.looksTag}</Text>

        {LOOK_ORDER.map((l) => {
          const active = look === l;
          return (
            <View key={l} style={[s.card, { width: cardW, borderColor: active ? c.accent : c.borderLight }]}>
              <Image source={LOOK_IMAGES[l]} style={s.img} resizeMode="cover" />
              <View style={s.cardBody}>
                <View style={s.cardHead}>
                  <Text style={s.cardName}>{LOOK_NAME[l][locale]}</Text>
                  {active && (
                    <View style={[s.chip, { backgroundColor: c.accent }]}>
                      <Text style={[s.chipTxt, { color: c.accentFg }]}>{t.looksUsed}</Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity
                  style={[
                    s.useBtn,
                    { backgroundColor: active ? c.input : c.accent },
                    applied === l && !active ? { borderWidth: 2, borderColor: c.accent } : null,
                  ]}
                  onPress={() => apply(l)}
                  activeOpacity={0.85}
                >
                  <Text style={[s.useBtnTxt, { color: active ? c.fg : c.accentFg }]}>
                    {active ? `✓ ${t.looksUsed}` : t.looksUse}
                  </Text>
                </TouchableOpacity>
                {applied === l ? (
                  <Text style={[s.appliedNote, { color: c.accent }]}>✓ {t.looksApplied}</Text>
                ) : null}
              </View>
            </View>
          );
        })}

        {applied ? (
          <View style={[s.banner, { backgroundColor: c.accent }]}>
            <Text style={[s.bannerTxt, { color: c.accentFg }]}>✓ {t.looksApplied}</Text>
          </View>
        ) : (
          <Text style={s.note}>{t.demoVault}</Text>
        )}
      </ScrollView>
    </View>
  );
}

function makeStyles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    wrap: { flex: 1, backgroundColor: c.bg },
    content: { paddingTop: 54, paddingHorizontal: 24, paddingBottom: 48, alignItems: "center" },
    backBtn: { alignSelf: "flex-start", paddingVertical: 8, paddingRight: 16, marginBottom: 4 },
    backTxt: { fontFamily: fonts.body, fontSize: 14, color: c.dim },
    title: { fontFamily: fonts.display, fontSize: 26, color: c.fg, alignSelf: "flex-start" },
    tag: { fontFamily: fonts.body, fontSize: 13, color: c.dim2, lineHeight: 19, alignSelf: "flex-start", marginTop: 4, marginBottom: 20 },
    card: {
      backgroundColor: c.card,
      borderRadius: 18,
      borderWidth: 1,
      marginBottom: 16,
      overflow: "hidden",
    },
    img: { width: "100%", height: 260 },
    cardBody: { padding: 14 },
    cardHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
    cardName: { fontFamily: fonts.display, fontSize: 18, color: c.fg },
    chip: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
    chipTxt: { fontFamily: fonts.bodySemi, fontSize: 11 },
    useBtn: { borderRadius: 12, paddingVertical: 12, alignItems: "center" },
    useBtnTxt: { fontFamily: fonts.bodySemi, fontSize: 14 },
    appliedNote: { fontFamily: fonts.bodySemi, fontSize: 12, textAlign: "center", marginTop: 8 },
    banner: {
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 16,
      alignItems: "center",
      marginTop: 8,
      alignSelf: "stretch",
    },
    bannerTxt: { fontFamily: fonts.bodySemi, fontSize: 14 },
    note: { fontFamily: fonts.body, fontSize: 12, color: c.dim, textAlign: "center", marginTop: 8, lineHeight: 17 },
  });
}
