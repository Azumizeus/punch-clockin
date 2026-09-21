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
  // Identité unique Seeker Premium : la barre d'onglets est le bord déchiré
  // du ticket — papier ivoire, bordure or pointillée 2 px, labels serif.

  return (
    <Tabs
      screenOptions={{
        header: () => <TopBar />,
        tabBarStyle: {
          // La barre est PAPIER (ivoire) même sur fond monolithe noir —
          // l'argent vit sur le ticket, fidèle au CSS skin-b.
          backgroundColor: c.paper,
          borderTopColor: c.border,
          borderTopWidth: 2,
          // La déchirure de ticket traverse TOUTE la barre (nav.punch-nav du CSS).
          borderStyle: "dashed",
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: c.paperFg,
        tabBarInactiveTintColor: c.paperMuted,
        tabBarLabelStyle: {
          fontFamily: fonts.display,
          fontSize: 10,
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
        name="hellos"
        options={{
          tabBarLabel: t.hellos,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "happy" : "happy-outline"} size={20} color={color} />
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
