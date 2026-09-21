import { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  PanResponder,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { usePunch, useT, useColors, useShape } from "../../lib/punch/store";
import { fonts } from "../../lib/punch/fonts";
import { COUNTRIES, countryByCode, totalSeekers, totalToday } from "../../lib/punch/globe";

// Physique de rotation du globe : theta = angle, omega = vitesse angulaire (rad/s).
// Au repos elle tend vers IDLE ; le doigt donne un élan (omega) qui s'amortit vers IDLE.
const IDLE = 0.12;
const DAMP = 1.85;
const MAX_OMEGA = 9;
// Le globe prend toute la largeur de l'écran (moins le padding), comme sur le web.
const SCREEN_W = Dimensions.get("window").width;
const DISC_SIZE = Math.min(420, SCREEN_W - 48);
const DISC_R = DISC_SIZE * 0.42;

function project(lat: number, lng: number, theta: number) {
  const lambda = (lng * Math.PI) / 180 + theta;
  const phi = (lat * Math.PI) / 180;
  const x = Math.cos(phi) * Math.sin(lambda);
  const z = Math.cos(phi) * Math.cos(lambda);
  const y = Math.sin(phi);
  if (z < 0.02) return null;
  return { x: DISC_SIZE / 2 + x * DISC_R, y: DISC_SIZE / 2 - y * DISC_R, z };
}

function GlobeCanvas({
  c,
  today,
  pulse,
  you,
  selected,
  onPick,
}: {
  c: ReturnType<typeof useColors>;
  today: Record<string, number>;
  pulse: { code: string; at: number } | null;
  you: string;
  selected: string;
  onPick: (code: string) => void;
}) {
  const theta = useRef(-0.55);
  const omega = useRef(IDLE);
  const dragging = useRef(false);
  const lastMoveX = useRef(0);
  const lastMoveT = useRef(Date.now());
  const movedTotal = useRef(0);
  const lastT = useRef(Date.now());
  const [, setTick] = useState(0);

  useEffect(() => {
    let raf: number;
    function loop() {
      const now = Date.now();
      const dt = Math.min(0.05, (now - lastT.current) / 1000);
      lastT.current = now;
      if (!dragging.current) {
        // Amortissement exponentiel (frame-rate independent), identique au web.
        omega.current += (IDLE - omega.current) * (1 - Math.exp(-DAMP * dt));
        theta.current += omega.current * dt;
      }
      setTick((n) => (n + 1) % 1_000_000);
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
          dragging.current = true;
          omega.current = 0;
          lastMoveX.current = evt.nativeEvent.pageX;
          lastMoveT.current = Date.now();
          movedTotal.current = 0;
        },
        onPanResponderMove: (evt) => {
          const now = Date.now();
          const dx = evt.nativeEvent.pageX - lastMoveX.current;
          const dt = Math.max(0.008, (now - lastMoveT.current) / 1000);
          const dTheta = dx / Math.max(80, DISC_R);
          theta.current += dTheta;
          omega.current = Math.max(-MAX_OMEGA, Math.min(MAX_OMEGA, dTheta / dt));
          lastMoveX.current = evt.nativeEvent.pageX;
          lastMoveT.current = now;
          movedTotal.current += Math.abs(dx);
        },
        onPanResponderRelease: (evt) => {
          dragging.current = false;
          if (movedTotal.current < 6) {
            const x = evt.nativeEvent.locationX;
            const y = evt.nativeEvent.locationY;
            let best: { code: string; d: number } | null = null;
            for (const cc of COUNTRIES) {
              const p = project(cc.lat, cc.lng, theta.current);
              if (!p) continue;
              const d = Math.hypot(p.x - x, p.y - y);
              if (d < 22 && (!best || d < best.d)) best = { code: cc.code, d };
            }
            if (best) onPick(best.code);
          }
        },
      }),
    [onPick],
  );

  const maxToday = Math.max(1, ...COUNTRIES.map((cc) => today[cc.code] ?? 0));
  const now = Date.now();

  return (
    <View style={gg.wrap} {...pan.panHandlers}>
      <View style={[gg.disc, { backgroundColor: c.card, borderColor: c.border }]}>
        {COUNTRIES.map((cc) => {
          const p = project(cc.lat, cc.lng, theta.current);
          if (!p) return null;
          const n = today[cc.code] ?? 0;
          let rad = 2.2 + (n / maxToday) * 5.5;
          if (pulse && pulse.code === cc.code) {
            const pt = Math.min(1, (now - pulse.at) / 1400);
            rad += (1 - pt) * 8;
          }
          const isAccent = cc.code === you || cc.code === selected;
          const opacity = cc.code === selected ? 1 : 0.55 + p.z * 0.35;
          return (
            <View
              key={cc.code}
              style={{
                position: "absolute",
                left: p.x - rad,
                top: p.y - rad,
                width: rad * 2,
                height: rad * 2,
                borderRadius: rad,
                backgroundColor: isAccent ? c.accent : c.fg,
                opacity,
              }}
            />
          );
        })}
      </View>
    </View>
  );
}

const gg = StyleSheet.create({
  wrap: { alignItems: "center", marginTop: 12, marginBottom: 8 },
  disc: {
    width: DISC_SIZE,
    height: DISC_SIZE,
    borderRadius: DISC_SIZE / 2,
    borderWidth: 1,
    overflow: "hidden",
  },
});

export default function GlobeScreen() {
  const t = useT();
  const c = useColors();
  const shape = useShape();
  const s = useMemo(() => makeStyles(c, shape), [c, shape]);
  const router = useRouter();
  const locale = usePunch((st) => st.locale);
  const country = usePunch((st) => st.country);
  const setCountry = usePunch((st) => st.setCountry);
  const globeToday = usePunch((st) => st.globeToday);
  const globePulse = usePunch((st) => st.globePulse);
  const lastPunchAt = usePunch((st) => st.lastPunchAt);
  const [picked, setPicked] = useState(country);

  const punched = !!lastPunchAt;
  const selected = countryByCode(picked);
  const you = countryByCode(country);

  const ranked = useMemo(() => {
    return [...COUNTRIES]
      .sort((a, b) => (globeToday[b.code] ?? 0) + b.seekers - ((globeToday[a.code] ?? 0) + a.seekers))
      .slice(0, 8);
  }, [globeToday]);

  const totalPunched = totalToday(globeToday);
  const totalS = totalSeekers();

  return (
    <ScrollView style={s.wrap} contentContainerStyle={s.content}>
      <Text style={s.title}>{t.globeTag}</Text>
      <Text style={s.privacy}>{t.globePrivacy}</Text>

      <GlobeCanvas c={c} today={globeToday} pulse={globePulse} you={country} selected={picked} onPick={setPicked} />

      <View style={s.heroRow}>
        <View style={s.heroCard}>
          <Text style={s.heroVal}>{totalS.toLocaleString()}</Text>
          <Text style={s.heroLabel}>{t.globeAll}</Text>
        </View>
        <View style={s.heroCard}>
          <Text style={s.heroVal}>{totalPunched.toLocaleString()}</Text>
          <Text style={s.heroLabel}>{t.globeToday}</Text>
        </View>
      </View>

      <View style={s.selCard}>
        <Text style={s.selName}>{selected.name[locale]}</Text>
        <Text style={s.selVal}>
          {(globeToday[selected.code] ?? 0).toLocaleString()} · {t.globeToday}
        </Text>
        <Text style={s.selSeekers}>
          {selected.seekers.toLocaleString()} {t.globeAll}
        </Text>
        {globePulse && globePulse.code === selected.code ? (
          <Text style={s.selStamp} numberOfLines={1}>
            {t.globeStamp} {globePulse.sig.slice(0, 20)}…
          </Text>
        ) : null}
      </View>

      {punched ? (
        <Text style={s.youLine}>
          {t.globeYou} · {you.name[locale]}
        </Text>
      ) : (
        <TouchableOpacity onPress={() => router.push("/")}>
          <Text style={s.needLine}>{t.globeNeed}</Text>
        </TouchableOpacity>
      )}

      <Text style={s.listTitle}>{t.globePick}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.pickRow}>
        {COUNTRIES.map((cc) => {
          const active = country === cc.code;
          return (
            <TouchableOpacity
              key={cc.code}
              style={[s.pickPill, active && s.pickPillActive]}
              onPress={() => {
                setCountry(cc.code);
                setPicked(cc.code);
              }}
              activeOpacity={0.8}
            >
              <Text style={[s.pickText, active && s.pickTextActive]}>{cc.name[locale]}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Text style={s.listTitle}>{t.globeLive}</Text>
      {ranked.map((cc) => (
        <TouchableOpacity key={cc.code} style={s.row} onPress={() => setPicked(cc.code)} activeOpacity={0.7}>
          <Text style={[s.rowName, cc.code === country && s.rowNameYou]}>{cc.name[locale]}</Text>
          <Text style={s.rowPunches}>{(globeToday[cc.code] ?? 0).toLocaleString()}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

function makeStyles(c: ReturnType<typeof useColors>, shape: ReturnType<typeof useShape>) {
  return StyleSheet.create({
    wrap: { flex: 1, backgroundColor: c.bg },
    content: { paddingTop: 16, paddingHorizontal: 24, paddingBottom: 140 },
    title: { fontFamily: fonts.display, fontSize: 26, color: c.fg, marginBottom: 4 },
    privacy: { fontFamily: fonts.body, fontSize: 13, color: c.dim, lineHeight: 19 },
    heroRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
    heroCard: {
      flex: 1,
      backgroundColor: c.card,
      borderRadius: shape.card,
      padding: 16,
      alignItems: "center",
    },
    heroVal: { fontFamily: fonts.display, fontSize: 22, color: c.fg },
    heroLabel: { fontFamily: fonts.body, fontSize: 12, color: c.dim, marginTop: 4, textAlign: "center" },
    selCard: {
      backgroundColor: c.card,
      borderRadius: shape.card,
      padding: 16,
      marginBottom: 16,
    },
    selName: { fontFamily: fonts.bodySemi, fontSize: 11, color: c.dim, textTransform: "uppercase", letterSpacing: 0.5 },
    selVal: { fontFamily: fonts.display, fontSize: 20, color: c.fg, marginTop: 4 },
    selSeekers: { fontFamily: fonts.body, fontSize: 13, color: c.dim2, marginTop: 2 },
    selStamp: { fontFamily: fonts.mono, fontSize: 10, color: c.dim, marginTop: 8 },
    youLine: { fontFamily: fonts.body, fontSize: 14, color: c.fg, textAlign: "center", marginBottom: 24 },
    needLine: { fontFamily: fonts.body, fontSize: 14, color: c.dim, textAlign: "center", marginBottom: 24, textDecorationLine: "underline" },
    listTitle: {
      fontFamily: fonts.bodySemi,
      fontSize: 11,
      color: c.dim,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 10,
      marginTop: 4,
    },
    pickRow: { marginBottom: 24 },
    pickPill: {
      backgroundColor: c.card,
      borderRadius: 999,
      paddingVertical: 10,
      paddingHorizontal: 16,
      marginRight: 8,
    },
    pickPillActive: { backgroundColor: c.accent },
    pickText: { fontFamily: fonts.body, fontSize: 13, color: c.dim },
    pickTextActive: { fontFamily: fonts.bodySemi, color: c.accentFg },
    row: {
      flexDirection: "row",
      alignItems: "baseline",
      justifyContent: "space-between",
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.borderLight,
    },
    rowName: { fontFamily: fonts.body, fontSize: 14, color: c.dim },
    rowNameYou: { fontFamily: fonts.bodySemi, color: c.fg },
    rowPunches: { fontFamily: fonts.mono, fontSize: 13, color: c.fg },
  });
}
