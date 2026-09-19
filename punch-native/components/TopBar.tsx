import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { usePunch, useT, useColors } from "../lib/punch/store";
import { fonts } from "../lib/punch/fonts";
import type { Look } from "../lib/punch/types";

const appIcon = require("../assets/images/icon.png");
const LOOKS: Look[] = ["a", "b", "c"];

export function TopBar() {
  const t = useT();
  const c = useColors();
  const locale = usePunch((s) => s.locale);
  const setLocale = usePunch((s) => s.setLocale);
  const theme = usePunch((s) => s.theme);
  const setTheme = usePunch((s) => s.setTheme);
  // L'habillage relooke aussi la barre du haut, sur toutes les pages :
  //  a = boutons pilules + marque mono espacée, b = angles vifs + serif.
  const look = usePunch((s) => s.look);
  const setLook = usePunch((s) => s.setLook);
  const isA = look === "a";
  const isB = look === "b";

  return (
    <View style={[st.wrap, { backgroundColor: c.bg }]}>
      <View style={st.brandRow}>
        <Image source={appIcon} style={[st.icon, isA && { borderRadius: 9 }]} />
        <Text style={[st.brand, { color: c.dim }, isB && { fontFamily: fonts.display, letterSpacing: 0.5, textTransform: "none", fontSize: 13 }]}>{t.app}</Text>
      </View>
      <View style={st.right}>
        {/* Portage de la bar web PUNCH : boutons A B C pour changer d'habillage
            en direct depuis n'importe quel écran. */}
        {LOOKS.map((l) => (
          <TouchableOpacity
            key={l}
            style={[st.skinBtn, look === l && { backgroundColor: c.accent }, isA && { borderRadius: 18 }, isB && { borderRadius: 2 }]}
            onPress={() => setLook(l)}
            accessibilityLabel={`Habillage ${l.toUpperCase()}`}
          >
            <Text style={[st.skinBtnTxt, { color: look === l ? c.accentFg : c.dim }, isA && { fontFamily: fonts.mono }, isB && { fontFamily: fonts.display }]}>{l.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[st.btn, theme === "dark" && { backgroundColor: c.input }, isA && { borderRadius: 18 }, isB && { borderRadius: 2 }]}
          onPress={() => setTheme("dark")}
        >
          <Text style={[st.btnTxt, { color: theme === "dark" ? c.fg : c.dim, fontFamily: fonts.bodySemi }]}>{t.themeDark}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[st.btn, theme === "light" && { backgroundColor: c.input }, isA && { borderRadius: 18 }, isB && { borderRadius: 2 }]}
          onPress={() => setTheme("light")}
        >
          <Text style={[st.btnTxt, { color: theme === "light" ? c.fg : c.dim, fontFamily: fonts.bodySemi }]}>{t.themeLight}</Text>
        </TouchableOpacity>
        {/* Or noir = ✦, Or clair = ✧ : deux boutons or compacts. */}
        <TouchableOpacity
          style={[st.btn, (theme === "gold" || theme === "goldLight") && { backgroundColor: c.input }, isA && { borderRadius: 18 }, isB && { borderRadius: 2 }]}
          onPress={() => setTheme(theme === "gold" ? "goldLight" : "gold")}
        >
          <Text style={[st.btnTxt, { color: (theme === "gold" || theme === "goldLight") ? "#d4af37" : c.dim, fontFamily: fonts.bodySemi }]}>
            {theme === "goldLight" ? "✧" : "✦"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={[st.btn, isA && { borderRadius: 18 }, isB && { borderRadius: 2 }]} onPress={() => setLocale(locale === "fr" ? "en" : "fr")}>
          <Text style={[st.btnTxt, { color: c.dim, fontFamily: fonts.bodySemi }]}>{locale === "fr" ? "EN" : "FR"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 54,
    paddingBottom: 8,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  icon: { width: 18, height: 18, borderRadius: 5 },
  brand: { fontFamily: fonts.mono, fontSize: 11, textTransform: "uppercase", letterSpacing: 2 },
  right: { flexDirection: "row", gap: 4, alignItems: "center" },
  skinBtn: { height: 36, minWidth: 32, borderRadius: 10, paddingHorizontal: 7, alignItems: "center", justifyContent: "center" },
  skinBtnTxt: { fontFamily: fonts.bodySemi, fontSize: 12, letterSpacing: 0.5 },
  btn: { height: 36, minWidth: 36, borderRadius: 10, paddingHorizontal: 10, alignItems: "center", justifyContent: "center" },
  btnTxt: { fontFamily: fonts.bodySemi, fontSize: 12 },
});
