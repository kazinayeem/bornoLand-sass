"use client";

import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ShoppingCart, Menu, X, User, LogIn, Package, LogOut, Heart, Home, Grid3X3, Info, Mail, ChevronRight, Settings, ChevronDown } from "lucide-react";
import type { RootState } from "@/redux/store";
import { clearCustomer } from "@/redux/slices/customer-slice";
import { openCart } from "@/redux/slices/cart-slice";
import { CartDrawer } from "./cart-drawer";
import { useTenant } from "@/providers/tenant-provider";

export function StoreNavbar() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { store, theme } = useTenant();
  const itemCount = useSelector((state: RootState) => state.cart.items.reduce((sum, i) => sum + i.quantity, 0));
  const customer = useSelector((state: RootState) => state.customer);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const { primaryColor, font, navbarStyle } = theme;

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const handleStorage = () => {
      const token = localStorage.getItem("customer_token");
      if (!token && customer.isAuthenticated) dispatch(clearCustomer());
    };
    window.addEventListener("storage", handleStorage);
    window.addEventListener("auth-change", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("auth-change", handleStorage);
    };
  }, [dispatch, customer.isAuthenticated]);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) searchInputRef.current.focus();
  }, [searchOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { name: "Home", href: "/", icon: Home },
    { name: "Shop", href: "/shop", icon: Grid3X3 },
    { name: "Categories", href: "/categories", icon: Grid3X3 },
    { name: "About", href: "/about", icon: Info },
    { name: "Contact", href: "/contact", icon: Mail },
  ];

  const stickyClass = navbarStyle === "fixed" ? "fixed" : navbarStyle === "sticky" ? "sticky" : "static";

  const handleLogout = () => {
    localStorage.removeItem("customer_token");
    dispatch(clearCustomer());
    window.dispatchEvent(new Event("auth-change"));
    router.push("/");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    router.push(href);
  };

  const initials = customer.customer?.name?.charAt(0).toUpperCase() ?? "?";

  return (
    <>
      <nav className={`${stickyClass} top-0 z-40 w-full border-b border-zinc-100 bg-white/80 backdrop-blur-xl`} style={{ fontFamily: font }}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              {store.logoUrl ? (
                <img src={store.logoUrl} alt={store.name} className="h-8 w-8 rounded-lg object-cover" />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white" style={{ backgroundColor: primaryColor }}>
                  {store.name[0]}
                </div>
              )}
              <span className="text-lg font-bold text-zinc-900">{store.name}</span>
            </Link>
            <div className="hidden items-center gap-6 md:flex">
              {navLinks.map((link) => (
                <Link key={link.name} href={link.href}
                  className="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900">
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setSearchOpen(true)}
              className="hidden rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 sm:block">
              <Search className="h-5 w-5" />
            </button>
            <Link href="/account"
              className="hidden rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 sm:block">
              <Heart className="h-5 w-5" />
            </Link>
            <button onClick={() => dispatch(openCart())}
              className="relative rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: primaryColor }}>
                  {itemCount}
                </span>
              )}
            </button>
            {customer.isAuthenticated ? (
              <div className="relative hidden sm:block" ref={profileRef}>
                <button onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 rounded-xl p-1.5 pr-2 transition-colors hover:bg-zinc-100">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-xs font-bold text-white">
                    {initials}
                  </div>
                  <ChevronDown className={`h-3.5 w-3.5 text-zinc-400 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl"
                    >
                      <div className="border-b border-zinc-100 px-4 py-3">
                        <p className="text-sm font-semibold text-zinc-900 truncate">{customer.customer?.name}</p>
                        <p className="text-xs text-zinc-400 truncate">{customer.customer?.email}</p>
                      </div>
                      <div className="p-1.5 space-y-0.5">
                        <button onClick={() => { setProfileOpen(false); router.push("/account"); }}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-50">
                          <User className="h-4 w-4" /> My Account
                        </button>
                        <button onClick={() => { setProfileOpen(false); router.push("/orders"); }}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-50">
                          <Package className="h-4 w-4" /> My Orders
                        </button>
                        <button onClick={() => { setProfileOpen(false); router.push("/account"); }}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-50">
                          <Settings className="h-4 w-4" /> Profile Settings
                        </button>
                      </div>
                      <div className="border-t border-zinc-100 p-1.5">
                        <button onClick={() => { handleLogout(); setProfileOpen(false); }}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-500 transition-colors hover:bg-red-50">
                          <LogOut className="h-4 w-4" /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link href="/account/register"
                  className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 sm:flex">
                  <User className="h-4 w-4" /> Register
                </Link>
                <Link href="/account/login"
                  className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-white transition-colors sm:flex"
                  style={{ backgroundColor: primaryColor }}>
                  <LogIn className="h-4 w-4" /> Sign In
                </Link>
              </>
            )}
            <button onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 md:hidden">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Full-screen search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-md pt-24 px-4"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="w-full max-w-xl rounded-2xl border border-zinc-200 bg-white shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <form onSubmit={handleSearch} className="flex items-center gap-3 border-b border-zinc-100 px-4 py-3">
                <Search className="h-5 w-5 shrink-0 text-zinc-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="flex-1 text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
                />
                <button type="button" onClick={() => setSearchOpen(false)}
                  className="flex h-7 items-center rounded-md border border-zinc-200 bg-zinc-50 px-2 text-[10px] font-medium text-zinc-400 hover:text-zinc-600">
                  ESC
                </button>
              </form>
              <div className="p-4">
                <p className="text-xs text-zinc-400">Search across all products in this store</p>
                {searchQuery && (
                  <button type="submit" onClick={handleSearch}
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700">
                    Search for &ldquo;{searchQuery}&rdquo; <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile full-screen menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}>
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white"
                    style={{ backgroundColor: primaryColor }}>
                    {store.name[0]}
                  </div>
                  <span className="text-lg font-bold text-zinc-900">{store.name}</span>
                </div>
                <button onClick={() => setMobileOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex flex-col h-[calc(100%-4rem)] overflow-y-auto">
                <div className="p-4 space-y-1">
                  <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Navigation</p>
                  {navLinks.map((link, i) => (
                    <motion.button key={link.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => handleNavClick(link.href)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50">
                      <link.icon className="h-4 w-4 text-zinc-400" />
                      {link.name}
                    </motion.button>
                  ))}
                </div>

                <div className="border-t border-zinc-100 p-4 space-y-1">
                  <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Account</p>
                  {customer.isAuthenticated ? (
                    <>
                      <button onClick={() => handleNavClick("/account")}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50">
                        <User className="h-4 w-4 text-zinc-400" /> My Account
                      </button>
                      <button onClick={() => handleNavClick("/orders")}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50">
                        <Package className="h-4 w-4 text-zinc-400" /> Orders
                      </button>
                      <button onClick={() => { handleLogout(); setMobileOpen(false); }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-red-500 transition-colors hover:bg-red-50">
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleNavClick("/account/login")}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50">
                        <LogIn className="h-4 w-4 text-zinc-400" /> Sign In
                      </button>
                      <button onClick={() => handleNavClick("/account/register")}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50">
                        <User className="h-4 w-4 text-zinc-400" /> Register
                      </button>
                    </>
                  )}
                  <button onClick={() => handleNavClick("/account")}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50">
                    <Heart className="h-4 w-4 text-zinc-400" /> Wishlist
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CartDrawer primaryColor={primaryColor} />
    </>
  );
}
