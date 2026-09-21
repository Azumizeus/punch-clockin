import { useEffect, useCallback, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Easing,
  Alert,
  Image,
  Pressable,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { usePunch, useT, useColors } from "../../lib/punch/store";
import { fonts } from "../../lib/punch/fonts";
import { formatUsd, rankFromStake, isRealSig, txUrl } from "../../lib/punch/format";
import { NEARBY } from "../../lib/punch/shifts";
import { countryByCode } from "../../lib/punch/globe";
import { helloCountInPeriod, helloSkr } from "../../lib/punch/hellos";
import { Connection, PublicKey } from "@solana/web3.js";
import { sendPunchMemo } from "../../lib/solana/wallet";
import { lookTokens, lookShape } from "../../lib/punch/looks";

const appIcon = require("../../assets/images/icon.png");
const DIAL_SIZE = 208;
const RING_R = 86;
const RING_C = 2 * Math.PI * RING_R;
const COOLDOWN_TOTAL = 75000;

export default function HomeScreen() {
  const t = useT();
  const c = useColors();

  const router = useRouter();
  const streak = usePunch((s) => s.streak);
  const crewOnline = usePunch((s) => s.crewOnline);
  const todayEarnedUsd = usePunch((s) => s.todayEarnedUsd);
  const feed = usePunch((s) => s.feed) ?? [];
  const locale = usePunch((s) => s.locale);
  const punchedToday = usePunch((s) => s.punchedToday);
  const cooldownLeft = usePunch((s) => s.cooldownLeft);
  const punchIn = usePunch((s) => s.punchIn);
  const wallet = usePunch((s) => s.wallet);
  const pushFeed = usePunch((s) => s.pushFeed);
  const seenHow = usePunch((s) => s.seenHow);
  const dismissHow = usePunch((s) => s.dismissHow);
  const greetNearby = usePunch((s) => s.greetNearby);
  const greetedIds = usePunch((s) => s.greetedIds) ?? [];
  const helloEvents = usePunch((s) => s.helloEvents) ?? [];
  const country = usePunch((s) => s.country);
  const pulse = usePunch((s) => s.globePulse);
  const [greetingId, setGreetingId] = useState<string | null>(null);
  const place = countryByCode(country);
  const look = usePunch((st) => st.look);
  const shape = useMemo(() => lookShape(look), [look]);
  const lk = useMemo(() => lookTokens(look), [look]);
  const s = useMemo(() => makeStyles(c, shape, lk), [c, shape, lk]);

  async function handleGreet(id: string, name: string) {
    if (wallet.real && !wallet.authToken) {
      Alert.alert(t.needReconnect);
      return;
    }
    setGreetingId(id);
    try {
      const rec = await greetNearby(id, name);
      if (!rec) Alert.alert(t.txFailed);
    } finally {
      setGreetingId(null);
    }
  }
  const setTab = useCallback((tab: string) => {
    if (tab === "board") router.push("/board" as never);
    if (tab === "globe") router.push("/globe" as never);
  }, [router]);

  const rank = rankFromStake(wallet.stakedSkr);

  useEffect(() => {
    const id = setInterval(pushFeed, 12000);
    return () => clearInterval(id);
  }, []);

  const handlePunch = useCallback(async () => {
    if (punchedToday()) return;
    if (wallet.real && wallet.authToken) {
      try {
        const conn = new Connection("https://api.devnet.solana.com");
        const pubkey = new PublicKey(wallet.address);
        const day = new Date().toISOString().slice(0, 10);
        const sig = await sendPunchMemo(conn, wallet.authToken, pubkey, `PUNCH ${day}`);
        punchIn(sig);
      } catch {
        // Signature refusée ou réseau coupé : erreur propre, et surtout
        // JAMAIS de pointage simulé en secours (pas de cooldown, pas de frais,
        // pas de stats modifiées comme si la transaction avait réussi).
        Alert.alert(t.txFailed);
      }
    } else {
      punchIn();
    }
  }, [wallet.real, wallet.authToken, punchedToday()]);

  const cd = cooldownLeft();
  const punched = punchedToday();

  // Animation d'entrée du ticket IN (portage du CSS receipt-enter du web :
  // fondu + remontée + léger scale, 400 ms easing sort-cubic).
  const ticketIn = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (punched) {
      Animated.timing(ticketIn, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      ticketIn.setValue(0);
    }
  }, [punched, ticketIn]);
  const lastPunchAt = usePunch((s) => s.lastPunchAt);
  const time = lastPunchAt
    ? new Date(lastPunchAt).toLocaleTimeString(locale === "fr" ? "fr-FR" : "en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";
  // Horloge live pour les tags des habillages a (— HH:MM:SS —) et c (HH:MM:SS).
  const liveClock = useLiveClock();

  // Enfoncement du ticket au toucher (look b, transform du home.tsx source).
  const pressAnim = useRef(new Animated.Value(1)).current;
  const pressIn = () => Animated.spring(pressAnim, { toValue: 0.98, useNativeDriver: true }).start();
  const pressOut = () => Animated.spring(pressAnim, { toValue: 1, useNativeDriver: true }).start();

  return (
    <ScrollView style={s.wrap} contentContainerStyle={s.content}>
      {wallet.genesis && <Text style={s.genesis}>{t.genesis}</Text>}
      {/* Les rayons globaux suivent l'habillage (a = pilules, b = angles) */}

      {!punched ? (
        <View style={s.preWrap}>
          <Text
            style={[
              s.clockIn,
              // Le tracking du titre suit l'habillage pour TOUS les looks
              // (CSS skin C : h1 { letter-spacing: -0.04em } ; b : tight).
              { letterSpacing: lk.titleSpacing },
              lk.monoTitle && {
                fontFamily: fonts.mono,
                fontSize: 34,
              },
            ]}
          >
            {t.clockIn}
          </Text>
          <Text
            style={[
              s.nexusLine,
              lk.monoUi && { fontFamily: fonts.mono, textTransform: "uppercase" as const, letterSpacing: 1.5, fontSize: 11 },
            ]}
          >
            {lk.monoTitle ? "TIME-CLOCK PUNCH" : t.nexusLine}
          </Text>
          <PunchDial c={c} s={s} lk={lk} punched={false} cooldown={cd} onPress={handlePunch} />
          {/* Portage des compositions home.tsx : le CTA de la source n'est pas
              "Je me pointe" mais SESSION LEDGER — c'est lui qui rend les 3
              habillages méconnaissables entre eux. */}
          <Text
            style={[
              s.punchCtaLabel,
              lk.monoUi && { fontFamily: fonts.mono, textTransform: "uppercase" as const, letterSpacing: 2 },
            ]}
          >
            {locale === "fr" ? "Registre de session" : "Session ledger"}
          </Text>
          {lk.clockTag === "dash" && (
            <View style={[s.clockTagDash, { borderColor: c.accent }]}>
              <Text style={[s.clockTagDashTxt, { color: c.accent }]}>{liveClock}</Text>
            </View>
          )}
          {lk.clockTag === "mono" && (
            <Text style={[s.clockTagMono, { color: c.dim2 }]}>{liveClock}</Text>
          )}
          {lk.hwNav && (
            <View style={s.hwNav}>
              <View style={[s.hwTab, { borderColor: c.fg }]}>
                <Text style={[s.hwTabTxt, { color: c.fg }]}>‖ DOM</Text>
              </View>
              <View style={[s.hwTab, { borderColor: c.dim2 }]}>
                <Text style={[s.hwTabTxt, { color: c.dim2 }]}>2 VUE</Text>
              </View>
            </View>
          )}
          <Text style={s.placeLine}>
            {place.name[locale].toUpperCase()} · {streak} {t.days}
          </Text>
        </View>
      ) : (
        <View style={s.ticketWrap}>
          {/* Look b : le ticket s'enfonce au toucher (transform de home.tsx),
              avec sa bordure pointillée façon déchirure de ticket. */}
          <Pressable
            onPressIn={lk.pressTilt ? pressIn : undefined}
            onPressOut={lk.pressTilt ? pressOut : undefined}
          >
          <Animated.View style={lk.pressTilt ? { transform: [{ scale: pressAnim }] } : undefined}>
          <Animated.View
            style={[
              s.ticket,
              {
                backgroundColor: c.paper,
                borderRadius: lk.ticketRadius,
                opacity: ticketIn,
                ...(lk.ticketDashed
                  ? { borderWidth: 1, borderStyle: "dashed", borderColor: c.fg }
                  : lk.ticketBorder
                    ? { borderWidth: 1, borderColor: c.fg }
                    : null),
                transform: [
                  { translateY: ticketIn.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) },
                  { scale: ticketIn.interpolate({ inputRange: [0, 1], outputRange: [0.98, 1] }) },
                ],
              },
            ]}
          >
            <View style={s.ticketHead}>
              <Text style={[s.ticketApp, { color: c.paperMuted }]}>{t.app}</Text>
              <Image source={appIcon} style={s.ticketIcon} />
            </View>
            <Text style={[s.ticketIn, { color: c.paperFg }]}>{t.ticketIn}</Text>
            {lk.labels ? (
              <Text style={[s.ticketLabel, { color: c.paperMuted, marginTop: 18 }]}>{t.lblTime}</Text>
            ) : null}
            <Text
              style={[
                s.ticketTime,
                { color: c.paperFg },
                lk.ticketMono && { fontFamily: fonts.mono, fontSize: 26, marginTop: 6 },
              ]}
            >
              {time}
            </Text>
            {lk.labels ? (
              <Text style={[s.ticketLabel, { color: c.paperMuted, marginTop: 16 }]}>{t.lblCountry}</Text>
            ) : null}
            <Text
              style={[
                s.ticketPlace,
                { color: c.paperFg },
                lk.ticketMono && { fontFamily: fonts.mono, fontSize: 20, marginTop: 2 },
                lk.upper && { textTransform: "uppercase" as const, letterSpacing: 1.5 },
              ]}
            >
              {place.name[locale]}
            </Text>
            <View style={s.ruleWrap}>
              <View style={[s.ruleLine, { backgroundColor: c.paperFg, opacity: lk.ticketMono ? 1 : 0.25 }]} />
              <Text
                style={[
                  s.ticketRule,
                  { color: c.paperFg },
                  lk.labels && { marginTop: 10 },
                ]}
              >
                {lk.labels ? `${t.lblSplit}  92 / 3 / 5` : t.ticketRule}
              </Text>
            </View>
            {/* Tampon on-chain du pointage : ouvre la page tx de la preuve memo
                quand la signature est réelle (fictive en démo = texte simple). */}
            {pulse && isRealSig(pulse.sig) && (
              <TouchableOpacity onPress={() => Linking.openURL(txUrl(pulse.sig))} activeOpacity={0.7}>
                <Text style={[s.ticketStamp, s.ticketStampLink, { color: c.paperMuted }]} numberOfLines={1}>
                  {t.globeStamp} {pulse.sig.slice(0, 18)}… ↗
                </Text>
              </TouchableOpacity>
            )}
          </Animated.View>
          </Animated.View>
          </Pressable>
          <View style={s.twoBtnRow}>
            <TouchableOpacity
              style={[s.twoBtn, { borderRadius: lk.ctaRadius }]}
              onPress={() => setTab("board")}
              activeOpacity={0.8}
            >                <Text style={[s.twoBtnTxt, lk.monoUi && { fontFamily: fonts.mono, textTransform: "uppercase" as const, letterSpacing: 1, fontSize: 12 }]}>
                  {locale === "fr" ? "VOIR LES MISSIONS" : "SEE JOBS"}
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.twoBtn, s.twoBtnSecondary, { borderRadius: lk.ctaRadius }]}
              onPress={() => setTab("globe")}
              activeOpacity={0.8}
            >                <Text style={[s.twoBtnTxt, s.twoBtnTxtSecondary, lk.monoUi && { fontFamily: fonts.mono, textTransform: "uppercase" as const, letterSpacing: 1, fontSize: 12 }]}>
                  {locale === "fr" ? "VOIR LE MONDE" : "SEE WORLD"}
                </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {!seenHow && !punched && (
        <View style={s.howCard}>
          <Text style={s.howTitle}>{t.howTitle}</Text>
          <Text style={s.howLine}>{t.how1b}</Text>
          <Text style={s.howLine}>{t.how2b}</Text>
          <Text style={s.howLine}>{t.how3b}</Text>
          <TouchableOpacity style={s.howBtn} onPress={dismissHow} activeOpacity={0.8}>
            <Text style={s.howBtnTxt}>{t.done}</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={[s.stats]}>
        <Stat s={s} k={t.streak} v={`${streak}`} sub={t.days} r={shape.radius} />
        <Stat s={s} k={t.crew} v={crewOnline.toLocaleString()} sub={t.live} r={shape.radius} />
        <Stat s={s} k={t.today} v={formatUsd(todayEarnedUsd)} sub="USD" r={shape.radius} />
      </View>

      <Text style={s.sectionTitle}>{t.nearby}</Text>
      <Text style={s.sectionSub}>{t.greetPay}</Text>
      {/* Compteur de bonjours : cumuls et classement complets sur l'onglet Bonjours. */}
      <Text style={s.helloTally}>
        {t.hellos} · {helloCountInPeriod(helloEvents, "week")} {t.hellosWeek.toLowerCase()} · +
        {helloSkr(helloEvents).toLocaleString("fr-FR")} SKR
      </Text>
      {NEARBY.map((p) => {
        const done = greetedIds.includes(p.id);
        return (
          <View key={p.id} style={[s.nearbyRow, { borderRadius: shape.radius }]}>
            <View>
              <Text style={s.nearbyName}>{p.name}</Text>
              <Text style={s.nearbyMeta}>{p.meters} {t.meters}</Text>
            </View>
            <TouchableOpacity
              style={[s.greetBtn, done && s.greetBtnDone]}
              disabled={done || greetingId === p.id}
              onPress={() => handleGreet(p.id, p.name)}
              activeOpacity={0.8}
            >
              <Text style={[s.greetBtnTxt, done && s.greetBtnTxtDone]}>
                {done ? t.greeted : greetingId === p.id ? "…" : t.greet}
              </Text>
            </TouchableOpacity>
          </View>
        );
      })}

      <Text style={s.rankLine}>{t.rankLine}</Text>
      <Text style={s.rankSub}>
        {t.openRanks[rank]} · {streak >= 3 ? t.earlyAccess : t.earlyAccessOff}
      </Text>

      <Text style={s.sectionTitle}>{t.live}</Text>
      {feed.slice(0, 4).map((item) => (
        <View key={item.id} style={s.feedRow}>
          <Text style={s.feedText}>
            <Text style={s.feedName}>{item.name === "You" ? (locale === "fr" ? "Toi" : "You") : item.name}</Text>
            {" "}
            <Text style={s.feedBody}>{item.text[locale]}</Text>
          </Text>
          {item.amount != null && item.token && (
            <Text style={s.feedAmt}>{item.amount} {item.token}</Text>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

function Stat({
  s,
  k,
  v,
  sub,
  r,
}: {
  s: ReturnType<typeof makeStyles>;
  k: string;
  v: string;
  sub: string;
  r: number;
}) {
  return (
    <View style={[s.statCard, { borderRadius: r }]}>
      <Text style={s.statK}>{k}</Text>
      <Text style={[s.statV, { fontFamily: r === 999 ? fonts.mono : fonts.display }]}>{v}</Text>
      <Text style={s.statSub}>{sub}</Text>
    </View>
  );
}

function PunchDial({
  c,
  s,
  lk,
  punched,
  cooldown,
  onPress,
}: {
  c: ReturnType<typeof useColors>;
  s: ReturnType<typeof makeStyles>;
  lk: ReturnType<typeof lookTokens>;
  punched: boolean;
  cooldown: number;
  onPress: () => void;
}) {
  const pulse = useRef(new Animated.Value(1)).current;

  // Anneau du cadran : la maquette a.jpg + l'accent a.dark du CSS imposent
  // l'or machine #d4af37 quel que soit le thème pour l'habillage a.
  const ringColor = lk.dialRing === "gold" ? "#d4af37" : c.accent;
  useEffect(() => {
    if (punched) return;
    // pulse-ring du CSS source : 2,4 s ease-out infini, scale 1→1.18,
    // opacité 0.35→0 — le cycle repart doucement, sans saut.
    const loop = Animated.loop(
      Animated.timing(pulse, { toValue: 1.18, duration: 2400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [punched]);

  const progress = punched ? Math.min(1, cooldown / COOLDOWN_TOTAL) : 1;

  return (
    <View style={s.dialWrap}>
      {!punched && (
        <Animated.View
          pointerEvents="none"
          style={[
            s.pulseRing,
            { borderColor: c.border, transform: [{ scale: pulse }], opacity: pulse.interpolate({ inputRange: [1, 1.18], outputRange: [0.35, 0] }) },
          ]}
        />
      )}
      <RingProgress size={DIAL_SIZE} radius={RING_R} progress={progress} color={ringColor} trackColor={c.borderLight} />
      <TouchableOpacity
        style={[
          s.dialInner,
          punched
            ? s.dialInnerDone
            : !lk.dialInnerAccent
              ? s.dialInnerIvory // look a : gros disque ivoire comme la maquette
              : s.dialInnerActive,
        ]}
        onPress={onPress}
        disabled={punched}
        activeOpacity={0.85}
      >
        <Image source={appIcon} style={s.dialIcon} />
      </TouchableOpacity>
    </View>
  );
}

// Anneau de progression dessiné avec des Views en arc segmenté (pas de dépendance SVG)
function RingProgress({ size, radius, progress, color, trackColor }: { size: number; radius: number; progress: number; color: string; trackColor: string }) {
  const segments = 60;
  const active = Math.round(segments * progress);
  const dots = Array.from({ length: segments }, (_, i) => {
    const angle = (i / segments) * Math.PI * 2 - Math.PI / 2;
    const cx = size / 2 + Math.cos(angle) * radius - 1.5;
    const cy = size / 2 + Math.sin(angle) * radius - 1.5;
    return { cx, cy, on: i < active };
  });
  return (
    <View style={{ position: "absolute", width: size, height: size }}>
      {dots.map((d, i) => (
        <View
          key={i}
          style={{
            position: "absolute",
            left: d.cx,
            top: d.cy,
            width: 3,
            height: 3,
            borderRadius: 1.5,
            backgroundColor: d.on ? color : trackColor,
          }}
        />
      ))}
    </View>
  );
}

// Horloge temps réel (pour les tags — HH:MM:SS — de A et LOCAL TIME de C).
function useLiveClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function makeStyles(
  c: ReturnType<typeof useColors>,
  shape: ReturnType<typeof lookShape>,
  lk: ReturnType<typeof lookTokens>,
) {
  return StyleSheet.create({
    wrap: { flex: 1, backgroundColor: c.bg },
    content: { alignItems: "center", paddingTop: 8, paddingBottom: 140, paddingHorizontal: 20 },
    genesis: { fontFamily: fonts.bodySemi, fontSize: 12, color: c.dim2, alignSelf: "flex-start", marginBottom: 8 },
    preWrap: { width: "100%", alignItems: "center" },
    clockIn: { fontFamily: fonts.display, fontSize: 40, color: c.fg, textAlign: "center", letterSpacing: -0.5, marginTop: 8 },
    nexusLine: { fontFamily: fonts.body, fontSize: 13, color: c.dim2, textAlign: "center", marginTop: 6, marginBottom: 8 },
    punchCtaLabel: { fontFamily: fonts.display, fontSize: 20, color: c.fg, textAlign: "center", marginTop: 12 },
    placeLine: { fontFamily: fonts.body, fontSize: 12, color: c.dim, textAlign: "center", marginTop: 6 },
    clockTagDash: {
      marginTop: 14,
      borderWidth: 1,
      borderRadius: 999,
      paddingHorizontal: 18,
      paddingVertical: 8,
      alignSelf: "center",
    },
    clockTagDashTxt: { fontFamily: fonts.mono, fontSize: 15, letterSpacing: 2, fontVariant: ["tabular-nums"] },
    clockTagMono: { fontFamily: fonts.mono, fontSize: 13, letterSpacing: 3, marginTop: 14, fontVariant: ["tabular-nums"] },
    hwNav: { flexDirection: "row", gap: 8, alignSelf: "center", marginTop: 16 },
    hwTab: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 6 },
    hwTabTxt: { fontFamily: fonts.body, fontSize: 12, letterSpacing: 1.5 },
    dialWrap: { width: DIAL_SIZE, height: DIAL_SIZE, alignItems: "center", justifyContent: "center", marginTop: 20, marginBottom: 0 },
    pulseRing: { position: "absolute", width: DIAL_SIZE - 24, height: DIAL_SIZE - 24, borderRadius: (DIAL_SIZE - 24) / 2, borderWidth: 1 },
    dialInner: { width: 144, height: 144, borderRadius: 72, alignItems: "center", justifyContent: "center", paddingHorizontal: 16 },
    dialInnerActive: { backgroundColor: c.accent },
    dialInnerIvory: { backgroundColor: c.paper },
    dialInnerDone: { backgroundColor: c.input },
    dialIcon: { width: 48, height: 48, borderRadius: 10 },
    ticketWrap: { width: "100%", marginTop: 8 },
    ticket: { width: "100%", borderRadius: 6, paddingHorizontal: 20, paddingVertical: 24 },
    ticketHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    ticketApp: { fontFamily: fonts.mono, fontSize: 11, textTransform: "uppercase", letterSpacing: 2 },
    ticketIcon: { width: 22, height: 22, borderRadius: 5 },
    ticketIn: { fontFamily: fonts.display, fontSize: 58, lineHeight: 60, marginTop: 22 },
    ticketTime: { fontFamily: fonts.display, fontSize: 30, marginTop: 10 },
    ticketPlace: { fontFamily: fonts.body, fontSize: 17, marginTop: 6 },
    ticketRule: { fontFamily: fonts.mono, fontSize: 13, letterSpacing: 0.5, marginTop: 28 },
    ticketStamp: { fontFamily: fonts.mono, fontSize: 10, marginTop: 12 },
    ticketStampLink: { textDecorationLine: "underline" },
    ticketLabel: { fontFamily: fonts.mono, fontSize: 11, letterSpacing: 2 },
    ruleWrap: { marginTop: 18 },
    ruleLine: { height: 1, width: "100%" },
    twoBtnRow: { flexDirection: "row", gap: 8, width: "100%", marginTop: 12, marginBottom: 4 },
    twoBtn: { flex: 1, backgroundColor: c.accent, borderRadius: 16, paddingVertical: 14, alignItems: "center" },
    twoBtnSecondary: { backgroundColor: c.card },
    twoBtnTxt: { fontFamily: fonts.bodySemi, fontSize: 14, color: c.accentFg },
    twoBtnTxtSecondary: { color: c.fg },
    note: { fontFamily: fonts.body, fontSize: 12, color: c.dim, textAlign: "center", marginTop: 8, marginBottom: 16, lineHeight: 17 },
    howCard: { width: "100%", backgroundColor: c.card, borderRadius: shape.radius, padding: 18, marginBottom: 24 },
    howTitle: { fontFamily: fonts.display, fontSize: 18, color: c.fg, marginBottom: 8 },
    howLine: { fontFamily: fonts.body, fontSize: 14, color: c.dim2, lineHeight: 20, marginBottom: 4 },
    howBtn: { backgroundColor: c.accent, borderRadius: lk.ctaRadius, paddingVertical: 13, alignItems: "center", marginTop: 10 },
    howBtnTxt: { fontFamily: fonts.bodySemi, fontSize: 14, color: c.accentFg },
    stats: { flexDirection: "row", gap: 8, width: "100%", marginBottom: 28 },
    statCard: { flex: 1, backgroundColor: c.card, borderRadius: 16, padding: 12 },
    statK: { fontFamily: fonts.body, fontSize: 11, color: c.dim },
    statV: { fontFamily: fonts.display, fontSize: 17, color: c.fg, marginTop: 4 },
    statSub: { fontFamily: fonts.body, fontSize: 11, color: c.dim, marginTop: 2 },
    sectionTitle: { fontFamily: fonts.display, fontSize: 17, color: c.fg, alignSelf: "flex-start", marginBottom: 4 },
    sectionSub: { fontFamily: fonts.body, fontSize: 13, color: c.dim2, alignSelf: "flex-start", marginBottom: 4, lineHeight: 18 },
    helloTally: { fontFamily: fonts.mono, fontSize: 11, color: c.accent, alignSelf: "flex-start", letterSpacing: 0.5, marginBottom: 12 },
    nearbyRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      backgroundColor: c.card,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginBottom: 8,
    },
    nearbyName: { fontFamily: fonts.bodySemi, fontSize: 14, color: c.fg },
    nearbyMeta: { fontFamily: fonts.body, fontSize: 12, color: c.dim, marginTop: 2 },
    greetBtn: { backgroundColor: c.accent, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
    greetBtnDone: { backgroundColor: c.input },
    greetBtnTxt: { fontFamily: fonts.bodySemi, fontSize: 12, color: c.accentFg },
    greetBtnTxtDone: { color: c.dim },
    rankLine: { fontFamily: fonts.body, fontSize: 13, color: c.dim2, textAlign: "center", marginTop: 20, lineHeight: 18 },
    rankSub: { fontFamily: fonts.bodySemi, fontSize: 12, color: c.fg, textAlign: "center", marginTop: 4, marginBottom: 24 },
    feedRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.borderLight,
      width: "100%",
    },
    feedText: { flex: 1 },
    feedName: { fontFamily: fonts.bodySemi, fontSize: 13, color: c.fg },
    feedBody: { fontFamily: fonts.body, fontSize: 13, color: c.dim2 },
    feedAmt: { fontFamily: fonts.mono, fontSize: 12, color: c.fg },
  });
}
