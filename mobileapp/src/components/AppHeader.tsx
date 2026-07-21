import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../context/AppContext";
import { spacing, useTheme } from "../theme";
import { initials } from "../lib/format";

const titles: Record<string, string> = {
  "admin-dashboard": "Platform",
  dashboard: "Home",
  stores: "My Stores",
  products: "Products",
  "product-form": "Product",
  orders: "Orders",
  "order-detail": "Order",
  customers: "Customers",
  reviews: "Reviews",
  categories: "Categories",
  inventory: "Inventory",
  coupons: "Coupons",
  cms: "CMS",
  pages: "Pages",
  media: "Media",
  builder: "Builder",
  theme: "Theme",
  analytics: "Analytics",
  marketing: "Marketing",
  apps: "Apps",
  reports: "Reports",
  branding: "Branding",
  domain: "Domain",
  seo: "SEO",
  settings: "Settings",
  delivery: "Delivery",
  payments: "Payments",
  navigation: "Navigation",
  activity: "Activity",
  billing: "Billing",
  notifications: "Notifications",
  profile: "Profile",
  account: "Account",
  security: "Security",
  help: "Help",
  more: "More",
  invoices: "Invoices",
  "invoice-detail": "Invoice",
};

export function AppHeader() {
  const { navigation, canGoBack, goBack, currentStore, user, isAdmin, navigate } = useApp();
  const { theme } = useTheme();
  const title = titles[navigation.name] ?? "Bornoland";

  return (
    <View style={[styles.header, { backgroundColor: "#ffffff", borderBottomColor: "#E5E7EB" }]}>
      <View style={styles.content}>
        <View style={styles.left}>
          {canGoBack || navigation.name === "builder" ? (
            <Pressable
              onPress={canGoBack ? goBack : () => navigate("dashboard")}
              accessibilityLabel="Go back"
              style={styles.iconButton}
            >
              <Ionicons name="chevron-back-outline" size={24} color="#1d1d1f" />
            </Pressable>
          ) : (
            <Pressable
              onPress={() => (isAdmin ? navigate("admin-dashboard") : currentStore ? navigate("dashboard") : navigate("stores"))}
              style={styles.logoButton}
            >
              <Ionicons name="cube" size={22} color="#0066cc" />
            </Pressable>
          )}
        </View>

        <View style={styles.center}>
          <Text numberOfLines={1} style={styles.title}>{title}</Text>
        </View>

        <View style={styles.right}>
          {navigation.name !== "builder" && !navigation.name.startsWith("invoice") && (
            <Pressable
              onPress={() => navigate("notifications")}
              accessibilityLabel="Notifications"
              style={styles.iconButton}
            >
              <Ionicons name="notifications-outline" size={22} color="#1d1d1f" />
            </Pressable>
          )}
          <Pressable
            onPress={() => navigate("profile")}
            accessibilityLabel="Profile"
            style={[styles.avatar, { backgroundColor: theme.colors.control }]}
          >
            <Text style={styles.avatarText}>{initials(user?.name)}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: 1,
  },
  content: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
  },
  left: {
    width: 80,
    flexDirection: "row",
    alignItems: "center",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  right: {
    width: 80,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1d1d1f",
    letterSpacing: -0.2,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  logoButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1d1d1f",
  },
});
