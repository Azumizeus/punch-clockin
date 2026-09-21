import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
} from "react-native";
import * as Haptics from "expo-haptics";
import { useRouter, Stack } from "expo-router";
import { usePunch, useT, useColors } from "../lib/punch/store";
import { fonts } from "../lib/punch/fonts";
import { lookGallery } from "../lib/punch/looks";

// L'IDENTITÉ UNIQUE — Seeker Premium. Ancienne galerie d'habillages (A/B/C ×
// thèmes) réduite à une vitrine : l'app a un seul design, celui d'un Seeker.
const HERO_IMG = require("../assets/images/looks/b.jpg");

export default function LooksScreen() {
  const t = useT();
  const c = useColors();
  const s = useMemo(() => makeStyles(c), [c]);
  const router = useRouter();
  const locale = usePunch((st) => st.locale);
  const [feted, setFeted] = useState(false);

  useEffect(() => {
    if (!feted) return;
    const id = setTimeout(() => setFeted(false), 2500);
    return () => clearTimeout(id);
  }, [feted]);

  return (
    <View style={s.wrap}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={s.wrap} contentContainerStyle={s.content}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <Text style={s.backTxt}>{t.back}</Text>
        </TouchableOpacity>

        <Text style={s.title}>{t.look}</Text>
        <Text style={s.tag}>{t.lookTag}</Text>

        <View style={[s.card, { borderColor: c.accent }]}>
          <Image source={HERO_IMG} style={s.img} resizeMode="cover" />
          <View style={s.cardBody}>
            <Text style={s.cardSub}>{lookGallery.b.sub}</Text>
            <View style={s.cardHead}>
              <Text style={s.cardName}>{lookGallery.b.name}</Text>
              <View style={[s.chip, { backgroundColor: c.accent }]}>
                <Text style={[s.chipTxt, { color: c.accentFg }]}>{t.lookWorn}</Text>
              </View>
            </View>
            <Text style={s.cardDesc}>{lookGallery.b.desc[locale]}</Text>

            {/* La palette de l'identité, échantillonnée — transparence totale. */}
            <View style={s.swatches}>
              {[
                { hex: "#0b0a07", label: locale === "fr" ? "Monolithe" : "Monolith" },
                { hex: "#d4af37", label: "Or · #d4af37" },
                { hex: "#f3dc8e", label: locale === "fr" ? "Reflet" : "Highlight" },
                { hex: "#8a6d1f", label: locale === "fr" ? "Ombre" : "Shadow" },
                { hex: "#f2e6c8", label: locale === "fr" ? "Ticket" : "Ticket" },
              ].map((sw) => (
                <View key={sw.hex} style={s.swatchWrap}>
                  <View style={[s.swatch, { backgroundColor: sw.hex, borderColor: c.borderLight }]} />
                  <Text style={s.swatchLabel}>{sw.label}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={[s.useBtn, { backgroundColor: c.input, borderWidth: 2, borderColor: c.accent }]}
              onPress={() => {
                setFeted(true);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
              }}
              activeOpacity={0.85}
            >
              <Text style={[s.useBtnTxt, { color: c.accent }]}>✦ {lookGallery.b.name}</Text>
            </TouchableOpacity>
            {feted ? <Text style={[s.appliedNote, { color: c.accent }]}>✦ {t.lookApplied}</Text> : null}
          </View>
        </View>

        <Text style={s.note}>{t.demoVault}</Text>
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
      borderRadius: 2,
      borderWidth: 1,
      marginBottom: 16,
      overflow: "hidden",
      width: "100%",
    },
    img: { width: "100%", height: 260 },
    cardBody: { padding: 14 },
    cardSub: { fontFamily: fonts.mono, fontSize: 11, color: c.dim, textTransform: "uppercase", letterSpacing: 2, marginBottom: 4 },
    cardHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
    cardDesc: { fontFamily: fonts.body, fontSize: 13, color: c.dim2, lineHeight: 18, marginBottom: 12 },
    cardName: { fontFamily: fonts.display, fontSize: 18, color: c.fg },
    chip: { borderRadius: 2, paddingHorizontal: 10, paddingVertical: 4 },
    chipTxt: { fontFamily: fonts.bodySemi, fontSize: 11 },
    swatches: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 14 },
    swatchWrap: { alignItems: "center", gap: 4 },
    swatch: { width: 44, height: 44, borderRadius: 2, borderWidth: 1 },
    swatchLabel: { fontFamily: fonts.mono, fontSize: 9, color: c.dim, letterSpacing: 0.5 },
    useBtn: { borderRadius: 2, paddingVertical: 12, alignItems: "center" },
    useBtnTxt: { fontFamily: fonts.bodySemi, fontSize: 14 },
    appliedNote: { fontFamily: fonts.bodySemi, fontSize: 12, textAlign: "center", marginTop: 8 },
    note: { fontFamily: fonts.body, fontSize: 12, color: c.dim, textAlign: "center", marginTop: 8, lineHeight: 17 },
  });
}
