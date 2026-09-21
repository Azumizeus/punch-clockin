import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { usePunch, useT, useColors } from "../lib/punch/store";
import { goldKit } from "../lib/punch/theme";
import { fonts } from "../lib/punch/fonts";

const appIcon = require("../assets/images/icon.png");

export function TopBar() {
  const t = useT();
  const c = useColors();
  const locale = usePunch((s) => s.locale);
  const setLocale = usePunch((s) => s.setLocale);

  return (
    <View style={[st.wrap, { backgroundColor: c.bg }]}>
      <View style={st.brandRow}>
        <Image source={appIcon} style={st.icon} />
        <Text style={st.brand}>{t.app}</Text>
        {/* Le blason or de l'identité Seeker Premium — dans la marque. */}
        <Text style={[st.mark, { color: goldKit.mid }]}>✦</Text>
      </View>
      <View style={st.right}>
        {/* UNE identité : Gold Seeker Premium. Plus aucun sélecteur — juste
            la bascule de langue. */}
        <TouchableOpacity style={st.btn} onPress={() => setLocale(locale === "fr" ? "en" : "fr")}>
          <Text style={[st.btnTxt, { color: c.dim }]}>{locale === "fr" ? "EN" : "FR"}</Text>
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
  brand: { fontFamily: fonts.display, fontSize: 13, letterSpacing: 0.5 },
  mark: { fontSize: 11, marginLeft: 2 },
  right: { flexDirection: "row", gap: 4, alignItems: "center" },
  btn: { height: 36, minWidth: 36, borderRadius: 2, paddingHorizontal: 10, alignItems: "center", justifyContent: "center" },
  btnTxt: { fontFamily: fonts.display, fontSize: 12 },
});
