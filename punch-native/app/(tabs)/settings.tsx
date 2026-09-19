import { useMemo } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { usePunch, useT, useColors } from "../../lib/punch/store";
import { fonts } from "../../lib/punch/fonts";
import { lookGallery } from "../../lib/punch/looks";
import { useLeaveNetwork } from "../../lib/punch/useLeaveNetwork";
import type { Locale, Theme } from "../../lib/punch/types";

export default function SettingsScreen() {
  const t = useT();
  const c = useColors();
  const s = useMemo(() => makeStyles(c), [c]);
  const router = useRouter();

  const locale = usePunch((st) => st.locale);
  const setLocale = usePunch((st) => st.setLocale);
  const theme = usePunch((st) => st.theme);
  const setTheme = usePunch((st) => st.setTheme);
  const look = usePunch((st) => st.look);
  const screensaverSecs = usePunch((st) => st.screensaverSecs);
  const setScreensaver = usePunch((st) => st.setScreensaver);
  const wallet = usePunch((st) => st.wallet);
  const { leaving, confirmLeave, walletReal } = useLeaveNetwork();

  return (
    <ScrollView style={s.wrap} contentContainerStyle={s.content}>
      <Text style={s.title}>{t.settings}</Text>

      <Section title={t.settingsLanguage} s={s}>
        <Row s={s}>
          <OptionPill
            label="Français"
            active={locale === "fr"}
            onPress={() => setLocale("fr" as Locale)}
            s={s}
          />
          <OptionPill
            label="English"
            active={locale === "en"}
            onPress={() => setLocale("en" as Locale)}
            s={s}
          />
        </Row>
      </Section>

      <Section title={t.settingsAppearance} s={s}>
        <Row s={s}>
          <OptionPill
            label={t.themeDark}
            active={theme === "dark"}
            onPress={() => setTheme("dark" as Theme)}
            s={s}
          />
          <OptionPill
            label={t.themeLight}
            active={theme === "light"}
            onPress={() => setTheme("light" as Theme)}
            s={s}
          />
          <OptionPill
            label={`✦ ${t.themeGold}`}
            active={theme === "gold"}
            onPress={() => setTheme("gold" as Theme)}
            s={s}
          />
          <OptionPill
            label={`✧ ${t.themeGoldLight}`}
            active={theme === "goldLight"}
            onPress={() => setTheme("goldLight" as Theme)}
            s={s}
          />
        </Row>
      </Section>

      <Section title={t.looks} s={s}>
        <TouchableOpacity style={s.looksBtn} onPress={() => router.push("/looks" as never)} activeOpacity={0.8}>
          <Text style={s.looksBtnMain}>{lookGallery[look].name}</Text>
          <Text style={s.looksBtnSub}>{lookGallery[look].desc[locale]}</Text>
        </TouchableOpacity>
      </Section>

      <Section title={t.settingsScreensaver} s={s}>
        <Row s={s}>
          <OptionPill label={t.screensaverOff} active={screensaverSecs === 0} onPress={() => setScreensaver(0)} s={s} />
          <OptionPill label={t.screensaverSecs(10)} active={screensaverSecs === 10} onPress={() => setScreensaver(10)} s={s} />
          <OptionPill label={t.screensaverSecs(30)} active={screensaverSecs === 30} onPress={() => setScreensaver(30)} s={s} />
          <OptionPill label={t.screensaverSecs(60)} active={screensaverSecs === 60} onPress={() => setScreensaver(60)} s={s} />
        </Row>
      </Section>

      <Section title={t.settingsAccount} s={s}>
        <View style={s.infoRow}>
          <Text style={s.infoLabel}>{t.settingsWalletMode}</Text>
          <Text style={s.infoVal}>
            {wallet.real ? t.settingsWalletReal : t.settingsWalletDemo}
          </Text>
        </View>
        <View style={s.infoRow}>
          <Text style={s.infoLabel}>{t.wallet}</Text>
          <Text style={s.infoVal} numberOfLines={1} ellipsizeMode="middle">
            {wallet.address}
          </Text>
        </View>
      </Section>

      <Section title={t.guideStart} s={s}>
        <TouchableOpacity style={s.guideBtn} onPress={() => router.push("/guide" as never)} activeOpacity={0.8}>
          <Text style={s.guideBtnTxt}>{t.guideStart}</Text>
        </TouchableOpacity>
      </Section>

      <Section title={t.settingsAbout} s={s}>
        <View style={s.infoRow}>
          <Text style={s.infoLabel}>{t.settingsVersion}</Text>
          <Text style={s.infoVal}>1.0.0</Text>
        </View>
      </Section>

      <TouchableOpacity style={s.dangerBtn} onPress={confirmLeave} activeOpacity={0.8} disabled={leaving}>
        {leaving ? (
          <ActivityIndicator color="#e06060" />
        ) : (
          <Text style={s.dangerText}>{t.leaveNetwork}</Text>
        )}
      </TouchableOpacity>
      {walletReal && <Text style={s.dangerHint}>{t.leaveNetworkHint}</Text>}
    </ScrollView>
  );
}

function Section({
  title,
  children,
  s,
}: {
  title: string;
  children: React.ReactNode;
  s: ReturnType<typeof makeStyles>;
}) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Row({ children, s }: { children: React.ReactNode; s: ReturnType<typeof makeStyles> }) {
  return <View style={s.row}>{children}</View>;
}

function OptionPill({
  label,
  active,
  onPress,
  s,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  s: ReturnType<typeof makeStyles>;
}) {
  return (
    <TouchableOpacity
      style={[s.pill, active && s.pillActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[s.pillText, active && s.pillTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function makeStyles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    wrap: { flex: 1, backgroundColor: c.bg },
    content: { paddingTop: 16, paddingHorizontal: 24, paddingBottom: 40 },
    title: { fontFamily: fonts.display, fontSize: 26, color: c.fg, marginBottom: 24 },
    section: {
      backgroundColor: c.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
    },
    sectionTitle: {
      fontFamily: fonts.bodySemi,
      fontSize: 12,
      color: c.dim,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 12,
    },
    row: { flexDirection: "row", gap: 8 },
    pill: {
      flex: 1,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: "center",
    },
    pillActive: { borderColor: c.accent, backgroundColor: c.accent },
    pillText: { fontFamily: fonts.bodySemi, fontSize: 14, color: c.dim },
    pillTextActive: { color: c.accentFg },
    infoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 8,
    },
    infoLabel: { fontFamily: fonts.body, fontSize: 14, color: c.dim },
    infoVal: { fontFamily: fonts.bodySemi, fontSize: 14, color: c.fg, maxWidth: "60%" },
    dangerBtn: {
      borderWidth: 1,
      borderColor: "#e06060",
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: "center",
      marginTop: 8,
    },
    dangerText: { fontFamily: fonts.bodySemi, fontSize: 15, color: "#e06060" },
    looksBtn: { alignItems: "center", paddingVertical: 6 },
    looksBtnMain: { fontFamily: fonts.bodySemi, fontSize: 15, color: c.fg },
    looksBtnSub: { fontFamily: fonts.body, fontSize: 12, color: c.dim, marginTop: 3 },
    guideBtn: { backgroundColor: c.accent, borderRadius: 12, paddingVertical: 13, alignItems: "center" },
    guideBtnTxt: { fontFamily: fonts.bodySemi, fontSize: 14, color: c.accentFg },
    dangerHint: { fontFamily: fonts.body, fontSize: 11, color: c.dim, textAlign: "center", marginTop: 8, lineHeight: 15 },
  });
}
