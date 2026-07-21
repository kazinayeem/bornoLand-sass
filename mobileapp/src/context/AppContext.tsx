import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { api, apiRequest, clearApiCache, setAccessToken, setAccessTokenListener } from "../lib/api";
import { clearAuthSession, loadAuthSession, saveAuthSession, updateStoredAccessToken } from "../lib/auth-storage";
import type { ApiEnvelope, Category, FeatureAccessItem, NavigationEntry, Order, OrderAnalytics, Product, ScreenName, SessionPayload, SessionUser, Store, StoreFeatureAccess } from "../types/domain";

type LoginOptions = { loginType?: "user" | "admin"; rememberMe?: boolean };

type AppContextValue = {
  booting: boolean;
  authenticated: boolean;
  isAdmin: boolean;
  isDemo: boolean;
  session: SessionPayload | null;
  user: SessionUser | null;
  stores: Store[];
  currentStore: Store | null;
  products: Product[];
  orders: Order[];
  orderAnalytics: OrderAnalytics | null;
  categories: Category[];
  featureAccess: StoreFeatureAccess | null;
  getFeature(key: string): FeatureAccessItem | undefined;
  refreshing: boolean;
  navigation: NavigationEntry;
  canGoBack: boolean;
  signIn(email: string, password: string, options?: LoginOptions): Promise<void>;
  register(body: { name: string; email: string; password: string; tenantName?: string }): Promise<void>;
  forgotPassword(email: string): Promise<string>;
  createStore(body: { name: string; slug: string; description?: string; category?: string; plan?: string }): Promise<Store>;
  signOut(): Promise<void>;
  selectStore(store: Store, destination?: ScreenName): void;
  openWorkspace(): void;
  navigate(name: ScreenName, params?: Record<string, unknown>): void;
  switchTab(name: ScreenName): void;
  goBack(): void;
  refresh(): Promise<void>;
  mutate<T>(path: string, method: "POST" | "PUT" | "PATCH" | "DELETE", body?: unknown): Promise<T>;
  replaceProduct(product: Product): void;
  replaceOrder(order: Order): void;
};

const AppContext = createContext<AppContextValue | null>(null);

function userFromSession(session: SessionPayload): SessionUser {
  return { id: session.userId, name: session.name, email: session.email, role: session.role, tenantId: session.tenantId };
}

export function AppProvider({ children }: PropsWithChildren) {
  const [booting, setBooting] = useState(true);
  const [session, setSession] = useState<SessionPayload | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [currentStore, setCurrentStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderAnalytics, setOrderAnalytics] = useState<OrderAnalytics | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featureAccess, setFeatureAccess] = useState<StoreFeatureAccess | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [stack, setStack] = useState<NavigationEntry[]>([{ name: "dashboard" }]);

  const resetStoreState = useCallback(() => {
    setStores([]); setCurrentStore(null); setProducts([]); setOrders([]); setOrderAnalytics(null); setCategories([]); setFeatureAccess(null);
  }, []);

  const loadStoreData = useCallback(async (store: Store) => {
    const [productResult, orderResult, categoryResult, featureResult] = await Promise.allSettled([
      api.products(store._id), api.orders(store._id, { limit: 50 }), api.categories(store._id), apiRequest<ApiEnvelope<StoreFeatureAccess>>(`/features/stores/${store._id}/access`),
    ]);
    if (productResult.status === "fulfilled") setProducts(productResult.value.data?.products ?? []);
    if (orderResult.status === "fulfilled") { setOrders(orderResult.value.data.orders ?? []); setOrderAnalytics(orderResult.value.data.analytics ?? null); }
    if (categoryResult.status === "fulfilled") setCategories(categoryResult.value.data?.categories ?? []);
    if (featureResult.status === "fulfilled") setFeatureAccess(featureResult.value.data ?? null);
  }, []);

  const loadStores = useCallback(async () => {
    const result = await api.stores();
    const nextStores = result.data?.stores ?? [];
    setStores(nextStores);
    setCurrentStore(null);
    setProducts([]); setOrders([]); setOrderAnalytics(null); setCategories([]); setFeatureAccess(null);
  }, []);

  const establishSession = useCallback(async (accessToken: string, nextSession: SessionPayload, loginUser?: SessionUser) => {
    setAccessToken(accessToken);
    const profileResult = await api.profile().catch(() => null);
    const profile = profileResult?.data?.profile;
    const nextUser: SessionUser = profile ? {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: profile.role,
      tenantId: profile.tenantId,
      avatarUrl: profile.avatarUrl,
    } : loginUser ?? userFromSession(nextSession);

    await saveAuthSession({ accessToken, session: nextSession, user: nextUser });
    setSession(nextSession); setUser(nextUser); clearApiCache();
    if (nextSession.loginType === "admin") {
      resetStoreState();
      setStack([{ name: "admin-dashboard" }]);
    } else {
      try { await loadStores(); } catch { resetStoreState(); }
      setStack([{ name: "dashboard" }]);
    }
  }, [loadStores, resetStoreState]);

  useEffect(() => {
    setAccessTokenListener(updateStoredAccessToken);
    (async () => {
      try {
        const stored = await loadAuthSession();
        if (stored) setAccessToken(stored.accessToken);
        const result = await api.me();
        const nextSession = result.data?.session;
        const token = result.data?.accessToken ?? stored?.accessToken;
        if (!nextSession || !token) {
          setAccessToken(null);
          await clearAuthSession();
          return;
        }
        await establishSession(token, nextSession, stored?.user);
      } catch {
        setAccessToken(null);
        await clearAuthSession();
      } finally {
        setBooting(false);
      }
    })();
    return () => setAccessTokenListener(null);
  }, [establishSession]);

  const signIn = useCallback(async (email: string, password: string, options: LoginOptions = {}) => {
    const loginType = options.loginType ?? "user";
    const result = await api.login(email.trim().toLowerCase(), password, loginType, options.rememberMe ?? false);
    if (!result.data?.accessToken || !result.data.session || !result.data.user) throw new Error("Invalid login response");
    await establishSession(result.data.accessToken, result.data.session, result.data.user);
  }, [establishSession]);

  const register = useCallback(async (body: { name: string; email: string; password: string; tenantName?: string }) => {
    await api.register({ ...body, email: body.email.trim().toLowerCase() });
    await signIn(body.email, body.password, { loginType: "user", rememberMe: false });
  }, [signIn]);

  const forgotPassword = useCallback(async (email: string) => {
    const result = await api.forgotPassword(email.trim().toLowerCase());
    return result.message || "If that email exists, reset instructions have been sent.";
  }, []);

  const createStore = useCallback(async (body: { name: string; slug: string; description?: string; category?: string; plan?: string }) => {
    const result = await apiRequest<ApiEnvelope<{ store: Store }>>("/stores/create", { method: "POST", body: { ...body, subdomain: body.slug } });
    if (!result.data?.store) throw new Error(result.message || "Store creation failed.");
    const store = result.data.store;
    setStores((items) => [store, ...items]); setCurrentStore(null); setProducts([]); setOrders([]); setCategories([]); setFeatureAccess(null); setOrderAnalytics(null); setStack([{ name: "dashboard" }]);
    return store;
  }, []);

  const signOut = useCallback(async () => {
    try { await api.logout(); } catch { /* Local session must still be cleared. */ }
    setAccessToken(null); setAccessTokenListener(null); clearApiCache(); await clearAuthSession();
    setSession(null); setUser(null); resetStoreState(); setStack([{ name: "dashboard" }]);
    setAccessTokenListener(updateStoredAccessToken);
  }, [resetStoreState]);

  const selectStore = useCallback((store: Store, destination: ScreenName = "dashboard") => {
    setCurrentStore(store); setStack([{ name: destination }]); void loadStoreData(store);
  }, [loadStoreData]);

  const openWorkspace = useCallback(() => {
    setCurrentStore(null); setProducts([]); setOrders([]); setOrderAnalytics(null); setCategories([]); setFeatureAccess(null); setStack([{ name: "dashboard" }]);
  }, []);

  const navigate = useCallback((name: ScreenName, params?: Record<string, unknown>) => setStack((value) => [...value, { name, params }]), []);
  const switchTab = useCallback((name: ScreenName) => setStack([{ name }]), []);
  const goBack = useCallback(() => setStack((value) => value.length > 1 ? value.slice(0, -1) : value), []);

  const refresh = useCallback(async () => {
    setRefreshing(true); clearApiCache();
    try { if (currentStore) await loadStoreData(currentStore); else await loadStores(); } finally { setRefreshing(false); }
  }, [currentStore, loadStoreData, loadStores]);

  const mutate = useCallback(async <T,>(path: string, method: "POST" | "PUT" | "PATCH" | "DELETE", body?: unknown) => apiRequest<T>(path, { method, body }), []);
  const isAdmin = session?.loginType === "admin";
  const isDemo = user?.email === "demo@bornoland.com" || user?.email === "admin@bornoland.com";
  const getFeature = useCallback((key: string) => featureAccess?.features.find((feature) => feature.key === key), [featureAccess]);

  const value = useMemo<AppContextValue>(() => ({
    booting, authenticated: Boolean(user && session), isAdmin, isDemo, session, user, stores, currentStore, products, orders, orderAnalytics, categories, featureAccess, getFeature, refreshing,
    navigation: stack[stack.length - 1], canGoBack: stack.length > 1, signIn, register, forgotPassword, createStore, signOut,
    selectStore, openWorkspace, navigate, switchTab, goBack, refresh, mutate,
    replaceProduct: (product) => setProducts((items) => items.some((item) => item._id === product._id) ? items.map((item) => item._id === product._id ? product : item) : [product, ...items]),
    replaceOrder: (order) => setOrders((items) => items.map((item) => item._id === order._id ? order : item)),
  }), [booting, categories, createStore, currentStore, featureAccess, forgotPassword, getFeature, goBack, isAdmin, isDemo, mutate, navigate, openWorkspace, orderAnalytics, orders, products, refresh, refreshing, register, session, signIn, signOut, stack, stores, user, selectStore, switchTab]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error("useApp must be used inside AppProvider");
  return value;
}
