import { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { usePunch, useT, useColors } from "../lib/punch/store";
import { fonts } from "../lib/punch/fonts";
import { connectSeedVault } from "../lib/solana/wallet";
import { TopBar } from "../components/TopBar";

const appIcon = require("../assets/images/icon.png");

export default function ConnectScreen() {
  const t = useT();
  const c = useColors();
  const s = useMemo(() => makeStyles(c), [c]);
  const connect = usePunch((s) => s.connect);
  const connectReal = usePunch((s) => s.connectReal);
  const look = usePunch((s) => s.look);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Enfoncement du ticket au toucher (look b, transform du connect.tsx source).
  const pressAnim = useRef(new Animated.Value(1)).current;
  const pressIn = () => Animated.spring(pressAnim, { toValue: 0.985, useNativeDriver: true }).start();
  const pressOut = () => Animated.spring(pressAnim, { toValue: 1, useNativeDriver: true }).start();

  async function handleConnect() {
    setLoading(true);
    try {
      const { address, authToken } = await connectSeedVault();
      await connectReal(address, authToken);
      router.replace("/");
    } catch {
      Alert.alert("Wallet", "Mobile Wallet Adapter not available. Entering demo mode.", [
        { text: "OK", onPress: () => { connect("punch"); router.replace("/"); } },
      ]);
    } finally {
      setLoading(false);
    }
  }

  // Portage des 3 compositions connect.tsx de la source :
  //   a = titre énorme « — CLOCK IN — », CTA en anneau bordé, footer mécanique
  //   b = icône dans un ticket carré, CTA rectangle encre, footer pointillés
  //   c = épuré, icône nue, CTA standard (design de base)
  const isA = look === "a";
  const isB = look === "b";

  const btn = (
    <Pressable
      onPressIn={isB ? pressIn : undefined}
      onPressOut={isB ? pressOut : undefined}
      onPress={handleConnect}
      disabled={loading}
    >
      {({ pressed }) => (
        <Animated.View
          style={[
            s.btn,
            isA && { backgroundColor: "transparent", borderWidth: 2, borderColor: c.fg, borderRadius: 999, paddingVertical: 16 },
            isB && { borderRadius: 2, transform: [{ scale: pressed ? 0.985 : pressAnim }] },
            loading && s.btnBusy,
          ]}
        >
          {loading ? (
            <ActivityIndicator color={isA ? c.fg : c.accentFg} />
          ) : (
            <Text
              style={[
                s.btnText,
                isA && { color: c.fg, fontFamily: fonts.mono, letterSpacing: 4, fontSize: 14 },
                isB && { fontFamily: fonts.displaySemi, letterSpacing: 0.5 },
              ]}
            >
              {t.connectCta}
            </Text>
          )}
        </Animated.View>
      )}
    </Pressable>
  );

  return (
    <View style={s.screen}>
      <TopBar />
      <View style={s.wrap}>
        {isB ? (
          <View style={[s.boltTicket, { backgroundColor: c.accent, transform: [{ scale: 1 }] }]}>
            <Image source={appIcon} style={s.boltTicketIcon} />
          </View>
        ) : (
          <Image source={appIcon} style={isA ? { ...s.bolt, borderRadius: 999 } : s.bolt} />
        )}
        <Text style={[s.title, isA && { fontFamily: fonts.mono, fontSize: 30, letterSpacing: 6 }, isB && { fontSize: 34 }]}>
          {isA ? `— ${t.clockIn.toUpperCase()} —` : t.clockIn}
        </Text>
        <Text style={[s.body, isA && { fontFamily: fonts.mono, fontSize: 11, letterSpacing: 2, textTransform: "uppercase" as const }, isB && { fontStyle: "italic" as const }]}>
          {t.nexusLine}
        </Text>

        {btn}
        <Text style={[s.foot, isA && { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase" as const }, isB && { fontStyle: "italic" as const, borderTopWidth: 1, borderTopColor: c.borderLight, borderStyle: "dashed", paddingTop: 14, width: "100%", textAlign: "center" }]}>
          {t.demoVault}
        </Text>
      </View>
    </View>
  );
}

function makeStyles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.bg },
    wrap: {
      flex: 1,
      paddingHorizontal: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    bolt: { width: 40, height: 40, marginBottom: 32, borderRadius: 8 },
    boltTicket: {
      width: 72,
      height: 72,
      borderRadius: 2,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 28,
    },
    boltTicketIcon: { width: 44, height: 44, borderRadius: 6 },
    title: {
      fontFamily: fonts.display,
      fontSize: 44,
      lineHeight: 48,
      color: c.fg,
      textAlign: "center",
      letterSpacing: -0.5,
    },
    body: {
      fontFamily: fonts.body,
      fontSize: 14,
      lineHeight: 20,
      color: c.dim2,
      textAlign: "center",
      marginTop: 10,
      marginBottom: 40,
    },
    btn: {
      backgroundColor: c.accent,
      borderRadius: 16,
      paddingVertical: 18,
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
    },
    btnBusy: { opacity: 0.8 },
    btnText: { fontFamily: fonts.bodySemi, fontSize: 16, color: c.accentFg },
    foot: {
      marginTop: 12,
      fontFamily: fonts.body,
      fontSize: 12,
      color: c.dim,
      textAlign: "center",
    },
  });
}
