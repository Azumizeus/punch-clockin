import { useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { usePunch, useColors } from "../lib/punch/store";
import { fonts } from "../lib/punch/fonts";
import { lookTokens } from "../lib/punch/looks";
import type { Locale } from "../lib/punch/types";

export default function LanguageScreen() {
  const chooseLocale = usePunch((s) => s.chooseLocale);
  const router = useRouter();
  const c = useColors();
  // Le tout premier écran suit déjà l'habillage (rayons des boutons langue).
  const look = usePunch((s) => s.look);
  const lk = useMemo(() => lookTokens(look), [look]);
  const s = useMemo(() => makeStyles(c, lk), [c, lk]);

  function pick(locale: Locale) {
    chooseLocale(locale);
    router.replace("/connect");
  }

  return (
    <View style={s.wrap}>
      <Text style={s.logoIcon}>⚡</Text>
      <Text style={s.title}>PUNCH</Text>
      <Text style={s.sub}>Choisis ta langue{"\n"}Choose your language</Text>

      <TouchableOpacity style={s.btn} onPress={() => pick("fr")} activeOpacity={0.8}>
        <Text style={s.flag}>🇫🇷</Text>
        <Text style={s.btnText}>Français</Text>
      </TouchableOpacity>

      <TouchableOpacity style={s.btn} onPress={() => pick("en")} activeOpacity={0.8}>
        <Text style={s.flag}>🇬🇧</Text>
        <Text style={s.btnText}>English</Text>
      </TouchableOpacity>
    </View>
  );
}

function makeStyles(c: ReturnType<typeof useColors>, lk: ReturnType<typeof lookTokens>) {
  return StyleSheet.create({
    wrap: {
      flex: 1,
      backgroundColor: c.bg,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 32,
    },
    logoIcon: { fontSize: 48, marginBottom: 8 },
    title: {
      fontFamily: fonts.display,
      fontSize: 28,
      color: c.fg,
      letterSpacing: 3,
      marginBottom: 16,
    },
    sub: {
      fontFamily: fonts.body,
      fontSize: 15,
      color: c.dim,
      textAlign: "center",
      lineHeight: 22,
      marginBottom: 40,
    },
    btn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      backgroundColor: c.accent,
      borderRadius: lk.ctaRadius,
      paddingVertical: 18,
      paddingHorizontal: 32,
      width: "100%",
      marginBottom: 14,
    },
    flag: { fontSize: 22 },
    btnText: { fontFamily: fonts.bodySemi, fontSize: 17, color: c.accentFg },
  });
}
