import { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Animated,
  Image,
} from "react-native";
import { usePunch, useT, useColors, useShape } from "../lib/punch/store";
import { fonts } from "../lib/punch/fonts";
import type { Look } from "../lib/punch/types";

// Écran de veille = le MIROIR de l'app réglée par l'utilisateur : UNE seule
// apparence — l'habillage choisi, dans le thème choisi. Chaque thème a donc
// SA veille (Sombre → veille sombre, Or noir → veille or-noir, etc.) et chaque
// habillage sa composition (A pilule ivoire mono, B ticket carré serif, C
// éditorial). L'horloge tourne en temps réel ; un tap réveille l'app.
export function Screensaver({ children }: { children: React.ReactNode }) {
  const t = useT();
  const secs = usePunch((s) => s.screensaverSecs);
  const look = usePunch((s) => s.look);
  const [idle, setIdle] = useState(false);
  const [activity, setActivity] = useState(0);
  const fade = useRef(new Animated.Value(0)).current;

  const poke = useCallback(() => {
    setActivity((a) => a + 1);
    setIdle(false);
  }, []);

  useEffect(() => {
    if (idle) return;
    if (!secs) return;
    const timer = setTimeout(() => setIdle(true), secs * 1000);
    return () => clearTimeout(timer);
  }, [idle, secs, activity]);

  useEffect(() => {
    if (!idle) return;
    fade.setValue(0);
    Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [idle, fade]);

  if (!secs) return <>{children}</>;

  return (
    <View style={st.root}>
      <View
        style={st.fill}
        onStartShouldSetResponderCapture={() => {
          poke();
          return false; // on observe sans consommer : les enfants restent cliquables
        }}
      >
        {children}
      </View>
      {idle && (
        <TouchableWithoutFeedback onPress={poke}>
          <Animated.View style={[st.overlay, { opacity: fade }]}>
            <SaverSlide look={look} />
            <Text style={st.hint}>{t.tapToWake}</Text>
          </Animated.View>
        </TouchableWithoutFeedback>
      )}
    </View>
  );
}

function SaverSlide({ look }: { look: Look }) {
  const c = useColors();
  const sh = useShape();
  const mono = look === "a";
  const serif = look === "b";
  const bodyFont = mono ? fonts.mono : serif ? fonts.display : fonts.body;
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const hh = now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const brand = look === "a" ? "TIME-CLOCK PUNCH" : "Nexus pays presence.";

  return (
    <View style={[st.slide, { backgroundColor: c.bg }]}>
      <View style={[st.slideCard, { backgroundColor: mono ? c.paper : c.card, borderRadius: look === "b" ? 2 : look === "a" ? 999 : sh.card, padding: mono ? 40 : 28 }]}>
        <Image source={require("../assets/images/icon.png")} style={st.slideIcon} />
        <Text
          style={[
            st.slideTitle,
            { color: mono ? c.paperFg : c.fg, fontFamily: mono ? fonts.mono : serif ? fonts.display : fonts.display },
            mono && { letterSpacing: 4, fontSize: 30 },
          ]}
        >
          CLOCK IN
        </Text>
        <Text style={[st.slideSub, { color: mono ? c.paperMuted : c.dim, fontFamily: bodyFont }, mono && { letterSpacing: 2, fontSize: 10 }]}>
          {brand}
        </Text>
        {/* Le cadran : ivoire plein pour A, accent pour B/C — comme l'écran réel */}
        <View
          style={[
            st.slideDial,
            {
              backgroundColor: mono ? c.fg : c.accent,
              borderRadius: mono ? 999 : look === "b" ? 2 : 72,
            },
          ]}
        >
          <Text style={[st.slideClock, { color: mono ? c.paperFg : c.accentFg, fontFamily: mono ? fonts.mono : serif ? fonts.display : fonts.mono }]}>
            {hh}
          </Text>
        </View>
      </View>
      <Text style={[st.slideTag, { color: c.dim, fontFamily: bodyFont }]}>
        {look.toUpperCase()} · {mono ? "HORLOGE D'USINE" : serif ? "TICKET DE POINTEUSE" : "HARDWARE SEEKER"}
      </Text>
    </View>
  );
}

const st = StyleSheet.create({
  root: { flex: 1 },
  fill: { flex: 1 },
  overlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#000" },
  slide: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  slideCard: { width: "100%", alignItems: "center" },
  slideIcon: { width: 36, height: 36, borderRadius: 8, marginBottom: 14 },
  slideTitle: { fontSize: 40, lineHeight: 46 },
  slideSub: { fontSize: 13, marginTop: 6, marginBottom: 26 },
  slideDial: { width: 150, height: 150, alignItems: "center", justifyContent: "center" },
  slideClock: { fontSize: 34 },
  slideTag: { position: "absolute", bottom: 76, fontSize: 11, letterSpacing: 2 },
  hint: { position: "absolute", bottom: 40, left: 0, right: 0, textAlign: "center", color: "rgba(255,255,255,0.55)", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", fontFamily: "IBMPlexMono_400Regular" },
});
