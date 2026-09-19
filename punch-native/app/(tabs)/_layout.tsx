import { Tabs } from "expo-router";
import { StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { usePunch, useT, useColors } from "../../lib/punch/store";
import { fonts } from "../../lib/punch/fonts";
import { lookShape } from "../../lib/punch/looks";
import { TopBar } from "../../components/TopBar";

export default function TabsLayout() {
  const t = useT();
  const c = useColors();
  // L'habillage relooke la barre d'onglets — présente sur TOUTES les pages :
  //  a = barre flottante en pilule + labels mono espacés (PUNCH-ABC skin-a)
  //  b = barre carrée posée + labels serif (skin-b)
  //  c = barre standard du design de base
  const look = usePunch((s) => s.look);
  const isA = look === "a";
  const isB = look === "b";

  return (
    <Tabs
      screenOptions={{
        header: () => <TopBar />,
        tabBarStyle: {
          // B = "ticket papier" : la barre devient papier (clair) même en thème
          // sombre — fidèle au CSS skin-b (.bg-surface → paper).
          backgroundColor: isB ? c.paper : c.bg,
          borderTopColor: isB ? c.border : c.borderLight,
          borderTopWidth: isB ? 2 : StyleSheet.hairlineWidth,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
          ...(isA
            ? {
                position: "absolute" as const,
                borderRadius: 999,
                marginHorizontal: 12,
                marginBottom: 10,
                borderTopWidth: 1,
                shadowColor: "#000",
                shadowOpacity: 0.35,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 4 },
                elevation: 10,
              }
            : {}),
        },
        tabBarActiveTintColor: isB ? c.paperFg : c.fg,
        tabBarInactiveTintColor: isB ? c.paperMuted : c.dim,
        tabBarLabelStyle: {
          fontFamily: isA ? fonts.mono : isB ? fonts.display : fonts.bodySemi,
          fontSize: 10,
          ...(isA ? { letterSpacing: 1 } : {}),
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: t.punch,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "radio-button-on" : "radio-button-on-outline"} size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="board"
        options={{
          tabBarLabel: t.board,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "list" : "list-outline"} size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="globe"
        options={{
          tabBarLabel: t.globe,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "globe" : "globe-outline"} size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          tabBarLabel: t.wallet,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "wallet" : "wallet-outline"} size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="split"
        options={{
          tabBarLabel: t.split,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "podium" : "podium-outline"} size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarLabel: t.settings,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "settings" : "settings-outline"} size={20} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
