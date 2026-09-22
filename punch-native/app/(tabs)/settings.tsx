import { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, TextInput, Alert } from "react-native";
import { useRouter } from "expo-router";
import { usePunch, useT, useColors } from "../../lib/punch/store";
import { DEFAULT_RPC, getRpcUrl, isCustomRpc, pingRpc, rebuildConnection, setRpcUrl } from "../../lib/solana/rpc";
import { fonts } from "../../lib/punch/fonts";
import { lookGallery, lookTokens } from "../../lib/punch/looks";
import { useLeaveNetwork } from "../../lib/punch/useLeaveNetwork";
import type { Locale } from "../../lib/punch/types";

export default function SettingsScreen() {
  const t = useT();
  const c = useColors();
  // Réglages : rayons (sections, pills, boutons) suivent l'habillage.
  const look = usePunch((st) => st.look);
  const lk = useMemo(() => lookTokens(look), [look]);
  const s = useMemo(() => makeStyles(c, lk), [c, lk]);
  const router = useRouter();

  const locale = usePunch((st) => st.locale);
  const setLocale = usePunch((st) => st.setLocale);
  const theme = usePunch((st) => st.theme);
  const setTheme = usePunch((st) => st.setTheme);
  const skin = usePunch((st) => st.skin);
  const setSkin = usePunch((st) => st.setSkin);
  const wallet = usePunch((st) => st.wallet);
  const { leaving, confirmLeave, walletReal } = useLeaveNetwork();

  // Réseau : l'endpoint RPC est un choix de l'utilisateur, persisté localement.
  // Sauver déclenche un ping de preuve — pas de bouton qui "espère".
  const [rpcDraft, setRpcDraft] = useState(() => getRpcUrl());
  const [rpcCustom, setRpcCustom] = useState(() => isCustomRpc());
  const [rpcTesting, setRpcTesting] = useState(false);
  const [rpcMsg, setRpcMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const testRpc = async (url: string) => {
    setRpcTesting(true);
    setRpcMsg(null);
    const r = await pingRpc(url);
    setRpcTesting(false);
    setRpcMsg(
      r.ok && r.ms != null
        ? { ok: true, text: t.netOk(r.ms) }
        : { ok: false, text: t.netFail(r.error ?? "?") },
    );
  };

  const saveRpc = () => {
    const url = rpcDraft.trim();
    if (!/^https?:\/\/.+/i.test(url)) {
      Alert.alert(t.netInvalid);
      return;
    }
    setRpcUrl(url);
    rebuildConnection();
    setRpcCustom(isCustomRpc());
    void testRpc(url); // preuve immédiate que ça répond
  };

  const resetRpc = () => {
    setRpcUrl(null);
    rebuildConnection();
    setRpcDraft(DEFAULT_RPC);
    setRpcCustom(false);
    setRpcMsg(null);
  };

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

      <Section title={t.identity} s={s}>
        {/* DEUX identités de couleur, UNE composition : l'or Seeker Premium
            est l'original, la Nuit est l'option lunaire. L'aperçu de chaque
            carte montre sa vraie palette (échantillons réels). */}
        <Text style={s.identityTag}>{t.identityTag}</Text>
        <TouchableOpacity
          style={[s.identityCard, { backgroundColor: c.card }, theme === "gold" && { borderColor: c.accent, borderWidth: 2 }]}
          onPress={() => setTheme("gold")}
          activeOpacity={0.85}
        >
          <View style={s.identitySwatchRow}>
            <View style={[s.identitySwatch, { backgroundColor: "#0b0a07", borderColor: c.borderLight }]} />
            <View style={[s.identitySwatch, { backgroundColor: "#d4af37" }]} />
            <View style={[s.identitySwatch, { backgroundColor: "#f3dc8e" }]} />
            <View style={[s.identitySwatch, { backgroundColor: "#f2e6c8" }]} />
          </View>
          <View style={s.identityTxt}>
            <Text style={s.identityMain}>✦ {t.identityGold}</Text>
            <Text style={s.identitySub}>{t.identityGoldSub}</Text>
          </View>
          {theme === "gold" && <Text style={[s.identityCheck, { color: c.accent }]}>✓</Text>}
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.identityCard, { backgroundColor: c.card }, theme === "nuit" && { borderColor: c.accent, borderWidth: 2 }]}
          onPress={() => setTheme("nuit")}
          activeOpacity={0.85}
        >
          <View style={s.identitySwatchRow}>
            <View style={[s.identitySwatch, { backgroundColor: "#07090d", borderColor: c.borderLight }]} />
            <View style={[s.identitySwatch, { backgroundColor: "#c0c7d1" }]} />
            <View style={[s.identitySwatch, { backgroundColor: "#f0f4f9" }]} />
            <View style={[s.identitySwatch, { backgroundColor: "#dfe3ea" }]} />
          </View>
          <View style={s.identityTxt}>
            <Text style={s.identityMain}>☾ {t.identityNuit}</Text>
            <Text style={s.identitySub}>{t.identityNuitSub}</Text>
          </View>
          {theme === "nuit" && <Text style={[s.identityCheck, { color: c.accent }]}>✓</Text>}
        </TouchableOpacity>
      </Section>

      <Section title={t.skin3dTitle} s={s}>
        {/* Le RENDU de la composition : à plat (héritage) ou en relief 3D
            vectoriel. La couleur reste portée par l'identité (or / nuit). */}
        <Text style={s.identityTag}>{t.skin3dTag}</Text>
        <TouchableOpacity
          style={[s.identityCard, { backgroundColor: c.card }, skin === "flat" && { borderColor: c.accent, borderWidth: 2 }]}
          onPress={() => setSkin("flat")}
          activeOpacity={0.85}
        >
          <View style={s.identityTxt}>
            <Text style={s.identityMain}>{t.skin3dFlat}</Text>
          </View>
          {skin === "flat" && <Text style={[s.identityCheck, { color: c.accent }]}>✓</Text>}
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.identityCard, { backgroundColor: c.card }, skin === "depth3d" && { borderColor: c.accent, borderWidth: 2 }]}
          onPress={() => setSkin("depth3d")}
          activeOpacity={0.85}
        >
          <View style={s.identityTxt}>
            <Text style={s.identityMain}>✦ {t.skin3dDepth}</Text>
          </View>
          {skin === "depth3d" && <Text style={[s.identityCheck, { color: c.accent }]}>✓</Text>}
        </TouchableOpacity>
      </Section>

      <Section title={t.look} s={s}>
        {/* La composition est unique (fusion B+C) — la vitrine reste
            consultable pour voir la palette complète. */}
        <TouchableOpacity style={s.looksBtn} onPress={() => router.push("/looks" as never)} activeOpacity={0.8}>
          <Text style={s.looksBtnMain}>{t.lookFixed}</Text>
          <Text style={s.looksBtnSub}>{t.lookTag}</Text>
        </TouchableOpacity>
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

      <Section title={t.netSection} s={s}>
        <Text style={s.identityTag}>{t.netTag}</Text>
        <TextInput
          style={s.rpcInput}
          value={rpcDraft}
          onChangeText={setRpcDraft}
          placeholder={t.netPlaceholder}
          placeholderTextColor={c.dim}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          numberOfLines={1}
        />
        <View style={s.row}>
          <TouchableOpacity style={s.rpcBtn} onPress={saveRpc} activeOpacity={0.8}>
            <Text style={s.rpcBtnTxt}>{t.netSave}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.rpcBtn} onPress={() => void testRpc(rpcDraft)} disabled={rpcTesting} activeOpacity={0.8}>
            {rpcTesting ? <ActivityIndicator size="small" color={c.accent} /> : <Text style={s.rpcBtnTxt}>{t.netTest}</Text>}
          </TouchableOpacity>
        </View>
        {rpcMsg && (
          <Text style={[s.rpcMsg, { color: rpcMsg.ok ? "#5fae6f" : "#e06060" }]}>
            {rpcMsg.text}
          </Text>
        )}
        <Text style={s.identityTag}>{rpcCustom ? t.netUsingCustom : t.netUsingDefault}</Text>
        {rpcCustom && (
          <TouchableOpacity style={s.rpcResetBtn} onPress={resetRpc} activeOpacity={0.8}>
            <Text style={s.rpcResetTxt}>{t.netReset}</Text>
          </TouchableOpacity>
        )}
      </Section>

      <Section title={t.settingsAbout} s={s}>
        <View style={s.infoRow}>
          <Text style={s.infoLabel}>{t.settingsVersion}</Text>
          <Text style={s.infoVal}>1.6.8</Text>
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

function makeStyles(c: ReturnType<typeof useColors>, lk: ReturnType<typeof lookTokens>) {
  return StyleSheet.create({
    wrap: { flex: 1, backgroundColor: c.bg },
    content: { paddingTop: 16, paddingHorizontal: 24, paddingBottom: 140 },
    title: { fontFamily: fonts.display, fontSize: 26, color: c.fg, marginBottom: 24 },
    section: {
      backgroundColor: c.card,
      borderRadius: lk.ctaRadius,
      borderWidth: 1,
      borderColor: c.borderLight,
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
      borderRadius: lk.ctaRadius,
      paddingVertical: 12,
      alignItems: "center",    },
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
      borderRadius: lk.ctaRadius,
      paddingVertical: 14,
      alignItems: "center",
      marginTop: 8,
    },
    dangerText: { fontFamily: fonts.bodySemi, fontSize: 15, color: "#e06060" },
    looksBtn: { alignItems: "center", paddingVertical: 6 },
    looksBtnMain: { fontFamily: fonts.bodySemi, fontSize: 15, color: c.fg },
    looksBtnSub: { fontFamily: fonts.body, fontSize: 12, color: c.dim, marginTop: 3 },
    identityTag: { fontFamily: fonts.body, fontSize: 12, color: c.dim, marginBottom: 10 },
    identityCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      borderRadius: 2,
      borderWidth: 1,
      borderColor: c.borderLight,
      padding: 12,
      marginBottom: 10,
    },
    identitySwatchRow: { flexDirection: "row", gap: 5 },
    identitySwatch: { width: 26, height: 26, borderRadius: 2, borderWidth: 0.5, borderColor: c.borderLight },
    identityTxt: { flex: 1 },
    identityMain: { fontFamily: fonts.bodySemi, fontSize: 14, color: c.fg },
    identitySub: { fontFamily: fonts.body, fontSize: 11, color: c.dim, marginTop: 2 },
    identityCheck: { fontFamily: fonts.bodySemi, fontSize: 16 },
    rpcInput: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: lk.ctaRadius,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontFamily: fonts.bodySemi,
      fontSize: 12,
      color: c.fg,
      marginBottom: 10,
    },
    rpcBtn: {
      flex: 1,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: lk.ctaRadius,
      paddingVertical: 11,
      alignItems: "center",
    },
    rpcBtnTxt: { fontFamily: fonts.bodySemi, fontSize: 13, color: c.fg },
    rpcMsg: { fontFamily: fonts.bodySemi, fontSize: 12, marginTop: 10 },
    rpcResetBtn: { alignItems: "center", paddingVertical: 8 },
    rpcResetTxt: { fontFamily: fonts.body, fontSize: 12, color: c.dim },
    guideBtn: { backgroundColor: c.accent, borderRadius: lk.ctaRadius, paddingVertical: 13, alignItems: "center" },
    guideBtnTxt: { fontFamily: fonts.bodySemi, fontSize: 14, color: c.accentFg },
    dangerHint: { fontFamily: fonts.body, fontSize: 11, color: c.dim, textAlign: "center", marginTop: 8, lineHeight: 15 },
  });
}
