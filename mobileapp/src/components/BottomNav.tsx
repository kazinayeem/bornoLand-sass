import { useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../context/AppContext";
import { useTheme } from "../theme";
import type { ScreenName } from "../types/domain";

type Tab = {
  name: ScreenName;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  primary?: boolean;
};

const storeTabs: Tab[] = [
  { name: "dashboard", label: "Home", icon: "storefront-outline" },
  { name: "orders", label: "Orders", icon: "bag-handle-outline" },
  { name: "builder", label: "Builder", icon: "construct-outline", primary: true },
  { name: "products", label: "Products", icon: "cube-outline" },
  { name: "more", label: "More", icon: "ellipsis-horizontal-circle-outline" },
];

const workspaceTabs: Tab[] = [
  { name: "dashboard", label: "Home", icon: "storefront-outline" },
  { name: "stores", label: "Stores", icon: "layers-outline" },
  { name: "billing", label: "Billing", icon: "card-outline", primary: true },
  { name: "profile", label: "Account", icon: "person-circle-outline" },
  { name: "more", label: "More", icon: "ellipsis-horizontal-circle-outline" },
];

function PrimaryButton({ tab, active, onPress }: { tab: Tab; active: boolean; onPress: () => void }) {
  const { theme } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  return (
    <Pressable
      onPressIn={() => Animated.spring(scale, { toValue: 0.92, useNativeDriver: true }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={tab.label}
      style={styles.primaryTab}
    >
      <Animated.View style={[styles.primaryInner, { backgroundColor: theme.colors.primary, transform: [{ scale }] }]}>
        <Ionicons name={tab.icon} size={26} color="#fff" />
      </Animated.View>
      <Text style={[styles.primaryLabel, { color: active ? theme.colors.primary : theme.colors.textMuted }]}>
        {tab.label}
      </Text>
    </Pressable>
  );
}

function TabButton({ tab, active, onPress }: { tab: Tab; active: boolean; onPress: () => void }) {
  const { theme } = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="tab" accessibilityState={{ selected: active }} style={styles.tab}>
      <View style={[styles.iconWrap, active && { backgroundColor: theme.colors.primarySoft }]}>
        <Ionicons name={tab.icon} size={22} color={active ? theme.colors.primary : theme.colors.iconMuted} />
      </View>
      <Text style={[styles.label, { color: active ? theme.colors.primary : theme.colors.textMuted }, active && { fontWeight: "600" }]}>
        {tab.label}
      </Text>
    </Pressable>
  );
}

export function BottomNav() {
  const { navigation, switchTab, currentStore } = useApp();
  const { theme } = useTheme();
  const tabs = currentStore ? storeTabs : workspaceTabs;

  return (
    <View style={[styles.nav, { backgroundColor: "#ffffff", borderTopColor: "#E5E7EB" }]}>
      {tabs.map((tab) =>
        tab.primary ? (
          <PrimaryButton key={tab.name} tab={tab} active={navigation.name === tab.name} onPress={() => switchTab(tab.name)} />
        ) : (
          <TabButton key={tab.name} tab={tab} active={navigation.name === tab.name} onPress={() => switchTab(tab.name)} />
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    borderTopWidth: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    paddingTop: 4,
    paddingBottom: 12,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 1,
    paddingTop: 4,
  },
  iconWrap: {
    width: 36,
    height: 28,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 10,
    fontWeight: "400",
    letterSpacing: -0.1,
  },
  primaryTab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 1,
    marginTop: -14,
    paddingTop: 4,
  },
  primaryInner: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryLabel: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: -0.1,
    marginTop: 1,
  },
});
