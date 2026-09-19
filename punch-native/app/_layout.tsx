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
import { Screensaver } from "../components/Screensaver";

if (typeof globalThis.Buffer === "undefined") {
  (globalThis as any).Buffer = Buffer;
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

  // Sombre, Or noir et (par sécurité) tout thème inconnu → statusbar claire.
  const isDark = theme !== "light" && theme !== "goldLight";

  if (!fontsLoaded) {
    const bg = usePunch.getState();
    return <View style={{ flex: 1, backgroundColor: bg.theme === "light" ? "#efece6" : bg.theme === "goldLight" ? "#f6ecd2" : "#0c0c0d" }} />;
  }

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      {/* Veille : après N s d'inactivité, diaporama des 3 habillages ; un tap réveille. */}
      <Screensaver>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor:
                theme === "light" ? "#efece6" : theme === "goldLight" ? "#f6ecd2" : "#0c0c0d",
            },
            animation: "slide_from_bottom",
          }}
        />
      </Screensaver>
    </>
  );
}
