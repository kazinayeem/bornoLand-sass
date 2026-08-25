"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Language = "bn" | "en";

export type Dictionary = {
  navigation: {
    workspace: string;
    dashboard: string;
    stores: string;
    createStore: string;
    allStores: string;
    archived: string;
    billing: string;
    team: string;
    activity: string;
    notifications: string;
    analytics: string;
    visitors: string;
    liveVisitors: string;
    trafficSources: string;
    reports: string;
    store: string;
    account: string;
    settings: string;
    security: string;
    help: string;
    signOut: string;
    selectStore: string;
    noStoreSelected: string;
    myWorkspace: string;
    storesCount: (count: number) => string;
    expandSidebar: string;
    collapseSidebar: string;
  };
  header: {
    searchPlaceholder: string;
    quickCreate: string;
    newStore: string;
    importStore: string;
    inviteMember: string;
    upgradePlan: string;
    noResultsFound: string;
    language: string;
    bengali: string;
    english: string;
  };
  dropdowns: {
    profile: string;
    accountSettings: string;
    security: string;
    activityLog: string;
    billing: string;
    helpCenter: string;
    logout: string;
    notifications: string;
    unread: (count: number) => string;
    allCaughtUp: string;
    updating: string;
    markAllRead: string;
    viewAllNotifications: string;
    noNotifications: string;
  };
  common: {
    refresh: string;
    create: string;
    edit: string;
    delete: string;
    cancel: string;
    confirm: string;
    back: string;
    save: string;
    loading: string;
    active: string;
    trial: string;
    expired: string;
    awaitingApproval: string;
  };
};

const bn: Dictionary = {
  navigation: {
    workspace: "ওয়ার্কস্পেস",
    dashboard: "ড্যাশবোর্ড",
    stores: "দোকানসমূহ",
    createStore: "দোকান তৈরি করুন",
    allStores: "সব দোকান",
    archived: "আর্কাইভ",
    billing: "বিলিং",
    team: "টিম",
    activity: "কার্যক্রম",
    notifications: "নোটিফিকেশন",
    analytics: "অ্যানালিটিক্স",
    visitors: "ভিজিটর",
    liveVisitors: "লাইভ ভিজিটর",
    trafficSources: "ট্রাফিক সোর্স",
    reports: "রিপোর্ট",
    store: "দোকান",
    account: "অ্যাকাউন্ট",
    settings: "সেটিংস",
    security: "নিরাপত্তা",
    help: "সহায়তা",
    signOut: "লগআউট",
    selectStore: "দোকান বেছে নিন",
    noStoreSelected: "কোনো দোকান নির্বাচন করা হয়নি",
    myWorkspace: "আমার ওয়ার্কস্পেস",
    storesCount: (count) => `${count}টি দোকান`,
    expandSidebar: "সাইডবার প্রসারিত করুন",
    collapseSidebar: "সাইডবার সংকুচিত করুন",
  },
  header: {
    searchPlaceholder: "খুঁজুন... (⌘K)",
    quickCreate: "দ্রুত তৈরি",
    newStore: "নতুন দোকান",
    importStore: "ইমপোর্ট করুন",
    inviteMember: "সদস্য যোগ করুন",
    upgradePlan: "প্ল্যান আপগ্রেড",
    noResultsFound: "কোনো ফলাফল পাওয়া যায়নি",
    language: "ভাষা",
    bengali: "বাংলা",
    english: "English",
  },
  dropdowns: {
    profile: "প্রোফাইল",
    accountSettings: "অ্যাকাউন্ট সেটিংস",
    security: "নিরাপত্তা",
    activityLog: "কার্যক্রম লগ",
    billing: "বিলিং",
    helpCenter: "সহায়তা কেন্দ্র",
    logout: "লগআউট",
    notifications: "নোটিফিকেশন",
    unread: (count) => `${count}টি অপঠিত`,
    allCaughtUp: "সব নোটিফিকেশন পড়া শেষ",
    updating: "আপডেট হচ্ছে",
    markAllRead: "সব পড়া হয়েছে",
    viewAllNotifications: "সব নোটিফিকেশন দেখুন",
    noNotifications: "কোনো নতুন নোটিফিকেশন নেই",
  },
  common: {
    refresh: "রিফ্রেশ",
    create: "তৈরি করুন",
    edit: "এডিট করুন",
    delete: "মুছে ফেলুন",
    cancel: "বাতিল",
    confirm: "নিশ্চিত করুন",
    back: "পেছনে যান",
    save: "সংরক্ষণ করুন",
    loading: "লোড হচ্ছে...",
    active: "সক্রিয়",
    trial: "ট্রায়াল",
    expired: "মেয়াদ শেষ",
    awaitingApproval: "অনুমোদনের অপেক্ষায়",
  },
};

const en: Dictionary = {
  navigation: {
    workspace: "WORKSPACE",
    dashboard: "Dashboard",
    stores: "Stores",
    createStore: "Create Store",
    allStores: "All Stores",
    archived: "Archived",
    billing: "Billing",
    team: "Team",
    activity: "Activity",
    notifications: "Notifications",
    analytics: "Analytics",
    visitors: "Visitors",
    liveVisitors: "Live Visitors",
    trafficSources: "Traffic Sources",
    reports: "Reports",
    store: "STORE",
    account: "ACCOUNT",
    settings: "Settings",
    security: "Security",
    help: "Help",
    signOut: "Sign out",
    selectStore: "Select Store",
    noStoreSelected: "No store selected",
    myWorkspace: "My Workspace",
    storesCount: (count) => `${count} store${count !== 1 ? "s" : ""}`,
    expandSidebar: "Expand sidebar",
    collapseSidebar: "Collapse sidebar",
  },
  header: {
    searchPlaceholder: "Search... (⌘K)",
    quickCreate: "Quick Create",
    newStore: "New Store",
    importStore: "Import Store",
    inviteMember: "Invite Member",
    upgradePlan: "Upgrade Plan",
    noResultsFound: "No results found",
    language: "Language",
    bengali: "বাংলা",
    english: "English",
  },
  dropdowns: {
    profile: "Profile",
    accountSettings: "Account Settings",
    security: "Security",
    activityLog: "Activity Log",
    billing: "Billing",
    helpCenter: "Help Center",
    logout: "Logout",
    notifications: "Notifications",
    unread: (count) => `${count} unread`,
    allCaughtUp: "You're all caught up",
    updating: "Updating",
    markAllRead: "Mark all read",
    viewAllNotifications: "View all notifications",
    noNotifications: "No notifications yet",
  },
  common: {
    refresh: "Refresh",
    create: "Create",
    edit: "Edit",
    delete: "Delete",
    cancel: "Cancel",
    confirm: "Confirm",
    back: "Back",
    save: "Save",
    loading: "Loading...",
    active: "Active",
    trial: "Trial",
    expired: "Expired",
    awaitingApproval: "Awaiting Approval",
  },
};

const dictionaries: Record<Language, Dictionary> = { bn, en };
const STORAGE_KEY = "bornoland.language";

type LanguageContextValue = {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: Dictionary;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("bn");

  useEffect(() => {
    try {
      const saved = (localStorage.getItem(STORAGE_KEY) || localStorage.getItem("language")) as Language | null;
      if (saved === "en" || saved === "bn") {
        setLanguageState(saved);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language === "bn" ? "bn" : "en";
  }, [language]);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
      localStorage.setItem("language", next);
    } catch {
      /* ignore */
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => {
      const next = prev === "bn" ? "en" : "bn";
      try {
        localStorage.setItem(STORAGE_KEY, next);
        localStorage.setItem("language", next);
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t: dictionaries[language],
    }),
    [language, setLanguage, toggleLanguage]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
