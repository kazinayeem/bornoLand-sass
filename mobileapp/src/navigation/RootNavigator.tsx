import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, BackHandler, Easing, Platform, SafeAreaView, StyleSheet, View } from "react-native";
import { useApp } from "../context/AppContext";
import { motion, useTheme, useThemedStyles, type AppTheme } from "../theme";
import { AppHeader } from "../components/AppHeader";
import { BottomNav } from "../components/BottomNav";
import { AuthScreen, SplashScreen } from "../screens/AuthScreen";
import { DashboardScreen } from "../screens/DashboardScreen";
import { ProductsScreen, ProductFormScreen } from "../screens/ProductsScreen";
import { OrderDetailScreen, OrdersScreen } from "../screens/OrdersScreen";
import { AnalyticsScreen, CategoriesScreen, CustomersScreen, InventoryScreen } from "../screens/CommerceScreens";
import { MoreScreen } from "../screens/MoreScreen";
import { ModuleScreen } from "../screens/ModuleScreen";
import { BuilderScreen } from "../screens/BuilderHomeScreen";
import { AccountDetailsScreen, ProfileScreen, SecurityScreen, SettingsScreen, StoresScreen } from "../screens/AccountScreens";
import { AdminDashboardScreen } from "../screens/AdminDashboardScreen";
import { MediaLibraryScreen } from "../screens/MediaLibraryScreen";
import { CouponsScreen } from "../screens/CouponsScreen";
import { BillingScreen } from "../screens/BillingScreen";
import { InvoicesScreen } from "../screens/InvoicesScreen";
import { InvoiceDetailScreen } from "../screens/InvoiceDetailScreen";
import type { ScreenName } from "../types/domain";

const moduleScreens = new Set<ScreenName>(["reviews", "cms", "pages", "theme", "marketing", "apps", "reports", "activity", "notifications", "delivery", "payments", "navigation", "branding", "domain", "seo", "help"]);

export function RootNavigator() {
  const { booting, authenticated, isAdmin, navigation, canGoBack, goBack } = useApp();
  const { theme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const transition = useRef(new Animated.Value(1)).current;
  const [reduceMotion, setReduceMotion] = useState(true);
  useEffect(() => { let mounted = true; void AccessibilityInfo.isReduceMotionEnabled().then((value) => mounted && setReduceMotion(value)); return () => { mounted = false; }; }, []);
  useLayoutEffect(() => {
    if (booting || !authenticated || reduceMotion) { transition.setValue(1); return; }
    transition.setValue(0);
    const animation = Animated.timing(transition, { toValue: 1, duration: motion.screen, easing: Easing.out(Easing.cubic), useNativeDriver: true });
    animation.start(); return () => animation.stop();
  }, [authenticated, booting, navigation.name, reduceMotion, transition]);
  useEffect(() => {
    if (Platform.OS !== "android") return;
    const listener = BackHandler.addEventListener("hardwareBackPress", () => { if (!canGoBack) return false; goBack(); return true; });
    return () => listener.remove();
  }, [canGoBack, goBack]);
  if (booting) return <SplashScreen />;
  if (!authenticated) return <AuthScreen />;
  const screenStyle = { opacity: transition, transform: [{ translateY: transition.interpolate({ inputRange: [0, 1], outputRange: [6, 0] }) }] };
  return <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.header }]}><View style={styles.root}><AppHeader /><Animated.View key={navigation.name} style={[styles.body, screenStyle]}>{renderScreen(navigation.name, navigation)}</Animated.View>{!isAdmin ? <BottomNav /> : null}</View></SafeAreaView>;
}

function renderScreen(name: ScreenName, navigation?: { name: ScreenName; params?: Record<string, unknown> }) {
  if (moduleScreens.has(name)) return <ModuleScreen name={name} />;
  switch (name) {
    case "admin-dashboard": return <AdminDashboardScreen />;
    case "dashboard": return <DashboardScreen />;
    case "stores": return <StoresScreen />;
    case "products": return <ProductsScreen />;
    case "product-form": return <ProductFormScreen />;
    case "orders": return <OrdersScreen />;
    case "order-detail": return <OrderDetailScreen />;
    case "customers": return <CustomersScreen />;
    case "categories": return <CategoriesScreen />;
    case "inventory": return <InventoryScreen />;
    case "analytics": return <AnalyticsScreen />;
    case "media": return <MediaLibraryScreen />;
    case "coupons": return <CouponsScreen />;
    case "invoices": return <InvoicesScreen />;
    case "invoice-detail": {
      const params = navigation?.params as Record<string, unknown> | undefined;
      return <InvoiceDetailScreen invoiceId={String(params?.invoiceId || "")} />;
    }
    case "billing": return <BillingScreen />;
    case "settings": return <SettingsScreen />;
    case "profile": return <ProfileScreen />;
    case "account": return <AccountDetailsScreen />;
    case "security": return <SecurityScreen />;
    case "builder": return <BuilderScreen />;
    case "more": return <MoreScreen />;
    default: return <DashboardScreen />;
  }
}

const createStyles = (theme: AppTheme) => StyleSheet.create({ safe: { flex: 1, backgroundColor: theme.colors.header }, root: { flex: 1, backgroundColor: theme.colors.background }, body: { flex: 1 } });
