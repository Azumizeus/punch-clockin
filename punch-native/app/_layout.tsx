import "../lib/punch/storage";
import "react-native-get-random-values";
import { Buffer } from "buffer";
import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { useFonts, Fraunces_500Medium, Fraunces_600SemiBold } from "@expo-google-fonts/fraunces";
import { Figtree_400Regular, Figtree_500Medium, Figtree_600SemiBold } from "@expo-google-fonts/figtree";
import { IBMPlexMono_400Regular } from "@expo-google-fonts/ibm-plex-mono";
import { usePunch, rehydratePunch } from "../lib/punch/store";

const g = globalThis as any;
if (typeof g.Buffer === "undefined") {
  g.Buffer = Buffer;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Fraunces_500Medium,
    Fraunces_600SemiBold,
    Figtree_400Regular,
    Figtree_500Medium,
    Figtree_600SemiBold,
    IBMPlexMono_400Regular,
  });
  // Le thème affiché est celui persisté (dark/light/gold), rechargé depuis
  // MMKV via rehydratePunch() — jamais écrasé par le thème du système, sinon
  // le thème choisi ne survivrait pas à la fermeture complète de l'app.
  const theme = usePunch((s) => s.theme);
  const connected = usePunch((s) => s.wallet.connected);
  const localeChosen = usePunch((s) => s.localeChosen);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    rehydratePunch();
  }, []);

  useEffect(() => {
    const seg = segments[0];
    const inLanguage = seg === "language";
    const inConnect = seg === "connect";

    if (!localeChosen) {
      if (!inLanguage) router.replace("/language");
      return;
    }
    if (!connected && !inConnect) {
      router.replace("/connect");
    } else if (connected && (inConnect || inLanguage)) {
      router.replace("/");
    }
  }, [connected, localeChosen, segments]);

  // Identité unique gold : toujours statusbar claire sur noir chaud.
  const isDark = true;

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: "#0b0a07" }} />;
  }

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      {/* Veille retirée (v1.6.1) : elle s'armait en plein milieu des
          transactions lentes et avalait les taps — le téléphone garde son
          réglage système, l'app ne la remplace plus. */}
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: "#0b0a07", // noir chaud de l'identité gold
          },
          animation: "slide_from_bottom",
        }}
      />
    </>
  );
}
