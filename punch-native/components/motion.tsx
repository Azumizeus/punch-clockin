import { Children, useEffect, useRef, type ReactNode } from "react";
import { Animated, Easing, StyleSheet, View, ViewStyle } from "react-native";

/**
 * MOTION — portage des animations du CSS source validé
 * (punch app grok/PUNCH-ABC/src/styles.css) :
 *
 *   @keyframes punch-in   : opacity 0→1, translateY 10→0, blur 3→0 — 420 ms
 *                           cubic-bezier(0.22, 1, 0.36, 1), délais 40…290 ms
 *   @keyframes receipt-in : opacity 0→1, translateY 16→0, scale 0.98→1 — 400 ms
 *   @keyframes pulse-ring : scale 1→1.18, opacity 0.35→0 — 2,4 s ease-out infini
 *
 * (Le blur CSS est omis : pas d'équivalent fiable en RN sans blur natif.)
 */
export const MOTION_CURVE = Easing.bezier(0.22, 1, 0.36, 1);

/** Délais du stagger CSS : .stagger-in > *:nth-child(1..6). */
const STAGGER_DELAYS = [40, 90, 140, 190, 240, 290];

/** Enveloppe animée d'UN enfant du stagger (punch-in 420 ms). */
function StaggerItem({ delay, children }: { delay: number; children: ReactNode }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, {
      toValue: 1,
      duration: 420,
      delay,
      easing: MOTION_CURVE,
      useNativeDriver: true,
    }).start();
  }, [v, delay]);
  return (
    <Animated.View style={{ opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }}>
      {children}
    </Animated.View>
  );
}

/**
 * Entrée en cascade des cartes, fidèle à .stagger-in du CSS source.
 * Les 6 premiers enfants suivent les délais 40–290 ms ; au-delà, 0 ms
 * (comportement CSS : pas de règle nth-child(7+) → délai nul).
 */
export function StaggerIn({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  const kids = Children.toArray(children);
  return (
    <View style={style}>
      {kids.map((k, i) => (
        <StaggerItem key={i} delay={i < STAGGER_DELAYS.length ? STAGGER_DELAYS[i] : 0}>
          {k}
        </StaggerItem>
      ))}
    </View>
  );
}

/** Réception du ticket : receipt-in 400 ms (translateY 16, scale 0.98). */
export function ReceiptIn({ children }: { children: ReactNode }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, {
      toValue: 1,
      duration: 400,
      easing: MOTION_CURVE,
      useNativeDriver: true,
    }).start();
  }, [v]);
  return (
    <Animated.View
      style={{
        opacity: v,
        transform: [
          { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) },
          { scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.98, 1] }) },
        ],
      }}
    >
      {children}
    </Animated.View>
  );
}

/**
 * Anneau de pulse du cadran AVANT pointage (pulse-ring 2,4 s infini).
 * À placer DANS le conteneur du cadran : il se dessine en absolu, décalé
 * de `inset` px du bord, avec le rayon du cadran de l'habillage.
 */
export function PulseRing({ inset = 12, radius = 999, color }: { inset?: number; radius?: number; color: string }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(v, {
        toValue: 1,
        duration: 2400,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [v]);
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        {
          // inset-3 du web (12 px) : l'anneau respire juste au-dessus du métal.
          top: inset,
          left: inset,
          right: inset,
          bottom: inset,
          borderRadius: radius,
          borderWidth: 1.5,
          borderColor: color,
          opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] }),
          transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] }) }],
        },
      ]}
    />
  );
}
