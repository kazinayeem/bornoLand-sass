"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingCart, Menu, X, User, LogIn } from "lucide-react";

type StoreNavbarProps = {
  storeName: string;
  logoUrl?: string;
  primaryColor: string;
  font: string;
  navbarStyle: string;
};

export function StoreNavbar({ storeName, logoUrl, primaryColor, font, navbarStyle }: StoreNavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const navLinks = ["Home", "Shop", "Categories", "About", "Contact"];
  const stickyClass = navbarStyle === "fixed" ? "fixed" : navbarStyle === "sticky" ? "sticky" : "static";

  return (
    <>
      <nav className={`${stickyClass} top-0 z-40 w-full border-b border-zinc-100 bg-white/80 backdrop-blur-xl`}
        style={{ fontFamily: font }}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <a href="/" className="flex items-center gap-2">
              {logoUrl ? (
                <img src={logoUrl} alt={storeName} className="h-8 w-8 rounded-lg object-cover" />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white"
                  style={{ backgroundColor: primaryColor }}>
                  {storeName[0]}
                </div>
              )}
              <span className="text-lg font-bold text-zinc-900">{storeName}</span>
            </a>
            <div className="hidden items-center gap-6 md:flex">
              {navLinks.map((link) => (
                <a key={link} href="#"
                  className="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900">
                  {link}
                </a>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setSearchOpen(!searchOpen)}
              className="hidden rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 sm:block">
              <Search className="h-5 w-5" />
            </button>
            <button className="relative rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white"
                style={{ backgroundColor: primaryColor }}>0</span>
            </button>
            <a href="/login"
              className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 sm:flex">
              <LogIn className="h-4 w-4" /> Sign In
            </a>
            <button onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 md:hidden">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {searchOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="border-t border-zinc-100 bg-white">
              <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-9 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}>
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              className="fixed right-0 top-0 h-full w-72 bg-white shadow-xl"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between border-b border-zinc-100 p-4">
                <span className="text-lg font-bold text-zinc-900">{storeName}</span>
                <button onClick={() => setMobileOpen(false)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-4">
                <div className="space-y-1">
                  {navLinks.map((link) => (
                    <a key={link} href="#"
                      className="block rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900">
                      {link}
                    </a>
                  ))}
                </div>
                <div className="mt-6 border-t border-zinc-100 pt-4">
                  <a href="/login"
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50">
                    <User className="h-4 w-4" /> Sign In
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
