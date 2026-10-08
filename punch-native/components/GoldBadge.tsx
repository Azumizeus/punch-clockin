import { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { usePunch, useT } from "../lib/punch/store";
import { fonts } from "../lib/punch/fonts";
import { metalKit } from "../lib/punch/theme";

/**
 * SEEKER PREMIUM — le badge d'origine (celui de l'aperçu validé).
 *
 * Un lingot simple et net : dégradé métal en 3 nuances (reflet → métal →
 * ombre), liseré clair, ✦ scintillant, deux lignes gravées. Pas de stats :
 * c'est un blason, pas un tableau de bord.
 */
export function GoldBadge() {
  const t = useT();
  const theme = usePunch((s) => s.theme);
  const locale = usePunch((s) => s.locale);
  const wallet = usePunch((s) => s.wallet);
  const m = useMemo(() => metalKit(theme), [theme]);
  if (!wallet.connected) return null;

  return (
    <LinearGradient
      colors={[m.hi, m.mid, m.low]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[st.badge, { borderColor: m.rim }]}
    >
      <Text style={st.badgeSpark}>✦</Text>
      <View style={st.badgeTxtWrap}>
        <Text style={st.badgeTitle}>{theme === "nuit" ? "SEEKER NUIT" : "SEEKER PREMIUM"}</Text>
        <Text style={st.badgeSub}>
          {theme === "nuit"
            ? locale === "fr"
              ? "IDENTITÉ LUNE · v1.6"
              : "MOON IDENTITY · v1.6"
            : locale === "fr"
              ? "IDENTITÉ OR · v1.6"
              : "GOLD IDENTITY · v1.6"}
        </Text>
      </View>
    </LinearGradient>
  );
}

const st = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 2,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderWidth: 1,
    marginBottom: 12,
  },
  badgeSpark: { fontSize: 22, color: "#191510" },
  badgeTxtWrap: { flex: 1 },
  badgeTitle: { fontFamily: fonts.bodySemi, fontSize: 13, letterSpacing: 2, color: "#191510" },
  badgeSub: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1.5, color: "rgba(20, 16, 6, 0.6)", marginTop: 2 },
});
