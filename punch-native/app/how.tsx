import { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { usePunch, useT, useColors } from "../lib/punch/store";
import { fonts } from "../lib/punch/fonts";
import { lookTokens } from "../lib/punch/looks";

export default function HowScreen() {
  const t = useT();
  const c = useColors();
  // Cartes étapes et CTA suivent les rayons de l'habillage.
  const look = usePunch((st) => st.look);
  const lk = useMemo(() => lookTokens(look), [look]);
  const s = useMemo(() => makeStyles(c, lk), [c, lk]);
  const dismissHow = usePunch((s) => s.dismissHow);
  const router = useRouter();

  const steps = [
    { title: t.how1t, body: t.how1b },
    { title: t.how2t, body: t.how2b },
    { title: t.how3t, body: t.how3b },
  ];

  function handleDismiss() {
    dismissHow();
    router.replace("/");
  }

  return (
    <ScrollView style={s.wrap} contentContainerStyle={s.content}>
      <Text style={s.heading}>{t.howTitle}</Text>

      {steps.map((step, i) => (
        <View key={i} style={s.step}>
          <Text style={s.stepTitle}>{step.title}</Text>
          <Text style={s.stepBody}>{step.body}</Text>
        </View>
      ))}

      <TouchableOpacity style={s.ctaBtn} onPress={handleDismiss}>
        <Text style={s.ctaText}>{t.howCta}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function makeStyles(c: ReturnType<typeof useColors>, lk: ReturnType<typeof lookTokens>) {
  return StyleSheet.create({
    wrap: { flex: 1, backgroundColor: c.bg },
    content: { paddingTop: 80, paddingBottom: 40, paddingHorizontal: 24 },
    heading: {
      fontFamily: fonts.display,
      fontSize: 26,
      lineHeight: 32,
      color: c.fg,
      textAlign: "center",
      marginBottom: 48,
    },
    step: {
      backgroundColor: c.card,
      borderRadius: lk.ctaRadius,
      padding: 20,
      marginBottom: 16,
    },
    stepTitle: {
      fontFamily: fonts.display,
      fontSize: 17,
      color: c.fg,
      marginBottom: 8,
    },
    stepBody: {
      fontFamily: fonts.body,
      fontSize: 15,
      color: c.dim2,
      lineHeight: 22,
    },
    ctaBtn: {
      backgroundColor: c.accent,
      borderRadius: lk.ctaRadius,
      paddingVertical: 16,
      alignItems: "center",
      marginTop: 32,
    },
    ctaText: { fontFamily: fonts.bodySemi, fontSize: 16, color: c.accentFg },
  });
}
