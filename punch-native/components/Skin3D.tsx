import { useEffect, useMemo, type ReactNode } from "react";
import { Animated, Easing, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { usePunch } from "../lib/punch/store";
import { fonts } from "../lib/punch/fonts";
import { metalKit } from "../lib/punch/theme";
import { skin3d } from "../lib/punch/skin3d";

/**
 * SKIN 3D VECTORIEL — les composants de relief de l'identité Seeker Premium.
 * Le même design (monolithe, tickets ivoire, or machine) rendu en volume :
 *  - MetalBadge3D : le badge ✦ avec biseau métal (reflet → métal → ombre),
 *    liseré clair et ombre portée — la version en volume du badge wallet.
 *  - Dial3D : le cadran Clock In en relief — bague métal, assiette sombre,
 *    disque accent flottant, anneau de progression ET pulse-ring.
 *  - PaperShadow : l'ombre portée du ticket papier (iOS shadow / Android elev).
 *  - IsoTilt : le tirage isométrique du bloc-titre (léger, jamais gadget).
 *
 * AUCUNE couleur nouvelle : tout dérive des 13 tokens (Palette) et du
 * metalKit du thème actif — gold et nuit restent les deux seules lumières.
 */

/** Le skin 3D actif ? Un seul selector, réutilisé partout. */
export function useSkin3d(): boolean {
  return usePunch((s) => s.skin) === "depth3d";
}

/** Kit 3D prêt à l'emploi pour le thème actif (écrans qui veulent les tokens). */
export function useSkin3dKit(theme: "gold" | "nuit", c?: Parameters<typeof skin3d>[1]) {
  return skin3d(theme, c);
}

/** Ombre portée multi-plateforme à appliquer sur une View "qui flotte". */
export const floatShadow = Platform.select({
  ios: { shadowColor: "#000000", shadowOpacity: 0.45, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
  android: { elevation: 7 },
  default: {},
}) as Record<string, number | string | { width: number; height: number }>;

/** Ombre plus douce pour les cartes stats / rangées. */
export const liftShadow = Platform.select({
  ios: { shadowColor: "#000000", shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  android: { elevation: 4 },
  default: {},
}) as Record<string, number | string | { width: number; height: number }>;

/** Tirage isométrique du bloc-titre (perspective + rotations légères). */
export const isoTilt = (k: ReturnType<typeof skin3d>) =>
  ({ transform: [{ perspective: 900 }, { rotateX: k.iso.rx }, { rotateY: k.iso.ry }, { rotateZ: k.iso.rz }] }) as const;

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Le badge métallique en volume. Même contenu que GoldBadge (✦, titre,
 * sous-titre gravé) mais avec biseau clair/sombre, liseré et ombre : c'est
 * une pièce posée sur le monolithe, pas une étiquette.
 */
export function MetalBadge3D({
  theme,
  title,
  sub,
  spark = "✦",
}: {
  theme: "gold" | "nuit";
  title: string;
  sub: string;
  spark?: string;
}) {
  const m = metalKit(theme);
  const k = skin3d(theme); // biseau : dérivé du métal uniquement
  return (
    <View style={[st.badgeShadowWrap, floatShadow]}>
      <LinearGradient
        colors={[m.hi, m.mid, m.low]}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={st.badgeGrad}
      >
        {/* Biseau : le bord haut attrape la lumière, le bord bas plonge. */}
        <View style={[st.bevelTop, { backgroundColor: k.badgeBevel.hi }]} />
        <View style={[st.bevelBottom, { backgroundColor: k.badgeBevel.low }]} />
        <View style={[st.badgeInner, { backgroundColor: m.badgeBg }]}>
          <Text style={[st.badgeSpark, { color: m.hi }]}>{spark}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[st.badgeTitle, { color: m.hi }]}>{title}</Text>
            <Text style={[st.badgeSub, { color: m.mid }]}>{sub}</Text>
          </View>
          {/* Rivet : le point de forge du badge. */}
          <View style={[st.rivet, { backgroundColor: m.mid, borderColor: m.rim }]} />
        </View>
      </LinearGradient>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const DIAL = 232;
const INNER = 148;
const RING_R = 98;
const RING_SEGMENTS = 60;

/**
 * Le cadran Clock In en relief : bague métal (l'or machine), assiette sombre
 * en dessous (le disque "flotte"), anneau de progression segmenté ET anneaux
 * de pulse. Le disque central reste LE bouton : appui = pointage.
 */
export function Dial3D({
  theme,
  progress,
  active,
  onPress,
  children,
}: {
  theme: "gold" | "nuit";
  /** 0…1 — remplissage de l'anneau (cooldown écoulé). */
  progress: number;
  /** false = déjà pointé : le pulse s'arrête, la bague se fige. */
  active: boolean;
  onPress: () => void;
  children: ReactNode;
}) {
  const m = metalKit(theme);
  const k = skin3d(theme);
  // Animated.Value stables via useMemo (pattern lint-safe, même sémantique).
  const pulse = useMemo(() => new Animated.Value(1), []);
  const pulse2 = useMemo(() => new Animated.Value(1), []);

  useEffect(() => {
    if (!active) return;
    const mk = (v: Animated.Value, dur: number) =>
      Animated.loop(Animated.timing(v, { toValue: 1.16, duration: dur, easing: Easing.out(Easing.quad), useNativeDriver: true }));
    const l1 = mk(pulse, 2400);
    const l2 = mk(pulse2, 2400);
    l1.start();
    // Deuxième anneau déphasé de moitié : la respiration du métal.
    const stagger = setTimeout(() => l2.start(), 1200);
    return () => {
      l1.stop();
      l2.stop();
      clearTimeout(stagger);
    };
  }, [active, pulse, pulse2]);

  // Segments de l'anneau — calculés dans l'espace du CŒUR de bague (DIAL-6),
  // c'est dans cette vue qu'ils sont posés en absolu.
  const CORE = DIAL - 6;
  const segs = Array.from({ length: RING_SEGMENTS }, (_, i) => {
    const a = (i / RING_SEGMENTS) * Math.PI * 2 - Math.PI / 2;
    const on = i < Math.round(RING_SEGMENTS * progress);
    return {
      x: CORE / 2 + Math.cos(a) * RING_R - 1.5,
      y: CORE / 2 + Math.sin(a) * RING_R - 1.5,
      on,
    };
  });

  const ringColor = active ? k.dial.ringOn : m.low;
  const pulseOpacity = pulse.interpolate({ inputRange: [1, 1.16], outputRange: [0.35, 0] });
  const pulseOpacity2 = pulse2.interpolate({ inputRange: [1, 1.16], outputRange: [0.28, 0] });

  return (
    <View style={{ width: DIAL, height: DIAL, alignItems: "center", justifyContent: "center" }}>
      {/* Assiette sombre : le disque accent se détache du monolithe. */}
      <View style={[st.plate, { backgroundColor: k.dial.plate }]} />
      {/* Bague métal avec dégradé reflet → ombre (comme un vrai cerclage). */}
      <LinearGradient
        colors={[m.hi, m.mid, m.low]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={st.bezel}
      >
        <View style={[st.bezelCore, { backgroundColor: k.dial.plate }]}>
          {/* Anneau de progression (segmenté, pas de dépendance SVG). */}
          {segs.map((d, i) => (
            <View
              key={i}
              style={{
                position: "absolute",
                left: d.x + (DIAL - INNER) / 2 - (DIAL / 2 - INNER / 2 - 2) * 0 + (DIAL / 2 - RING_R) - (DIAL / 2 - RING_R),
                top: d.y,
                width: 3,
                height: 3,
                borderRadius: 1.5,
                backgroundColor: d.on ? ringColor : k.dial.ringTrack,
              }}
            />
          ))}
          {/* Disque central : LE bouton de pointage. */}
          <TouchableOpacity
            style={[st.disc, floatShadow]}
            onPress={onPress}
            disabled={!active}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[m.hi, m.mid, m.low]}
              start={{ x: 0.25, y: 0 }}
              end={{ x: 0.75, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            {children}
          </TouchableOpacity>
        </View>
      </LinearGradient>
      {/* Les deux anneaux de pulse (pointerEvents none). */}
      <Animated.View
        pointerEvents="none"
        style={[st.pulse, { borderColor: m.mid, opacity: pulseOpacity, transform: [{ scale: pulse }] }]}
      />
      <Animated.View
        pointerEvents="none"
        style={[st.pulse2, { borderColor: m.hi, opacity: pulseOpacity2, transform: [{ scale: pulse2 }] }]}
      />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

/** Ombre portée du ticket papier : une View qui ne dessine rien d'elle-même. */
export function PaperShadow({ children, style }: { children: ReactNode; style?: Record<string, unknown> }) {
  return <View style={[style, floatShadow]}>{children}</View>;
}

const st = StyleSheet.create({
  badgeShadowWrap: { borderRadius: 3, marginBottom: 12 },
  badgeGrad: { borderRadius: 3, padding: 2 },
  bevelTop: { position: "absolute", top: 0, left: 2, right: 2, height: 1, opacity: 0.9 },
  bevelBottom: { position: "absolute", bottom: 0, left: 2, right: 2, height: 1, opacity: 0.6 },
  badgeInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 2,
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  badgeSpark: { fontSize: 22 },
  badgeTitle: { fontFamily: fonts.bodySemi, fontSize: 13, letterSpacing: 2 },
  badgeSub: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1.5, marginTop: 2, opacity: 0.75 },
  rivet: { width: 8, height: 8, borderRadius: 4, borderWidth: 1 },
  plate: { position: "absolute", width: DIAL + 12, height: DIAL + 12, borderRadius: (DIAL + 12) / 2, bottom: -6 },
  bezel: { width: DIAL, height: DIAL, borderRadius: DIAL / 2, padding: 3, alignItems: "center", justifyContent: "center" },
  bezelCore: { width: DIAL - 6, height: DIAL - 6, borderRadius: (DIAL - 6) / 2, alignItems: "center", justifyContent: "center" },
  disc: { width: INNER, height: INNER, borderRadius: INNER / 2, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  pulse: { position: "absolute", width: DIAL - 16, height: DIAL - 16, borderRadius: (DIAL - 16) / 2, borderWidth: 1.5 },
  pulse2: { position: "absolute", width: DIAL - 40, height: DIAL - 40, borderRadius: (DIAL - 40) / 2, borderWidth: 1 },
});
