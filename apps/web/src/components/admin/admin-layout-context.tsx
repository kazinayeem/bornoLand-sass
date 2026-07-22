"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type AdminLayoutContextValue = {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (value: boolean) => void;
};

const AdminLayoutContext = createContext<AdminLayoutContextValue | null>(null);

export function AdminLayoutProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <AdminLayoutContext.Provider value={{ collapsed, setCollapsed, mobileOpen, setMobileOpen }}>
      {children}
    </AdminLayoutContext.Provider>
  );
}

export function useAdminLayout() {
  const ctx = useContext(AdminLayoutContext);
  if (!ctx) throw new Error("useAdminLayout must be used within AdminLayoutProvider");
  return ctx;
}
