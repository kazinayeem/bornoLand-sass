"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ShoppingCart, Menu, X, User, LogIn, Package, LogOut, Heart } from "lucide-react";
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

  const { primaryColor, font, navbarStyle } = theme;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleStorage = () => {
      const token = localStorage.getItem("customer_token");
      if (!token && customer.isAuthenticated) {
        dispatch(clearCustomer());
      }
    };
    window.addEventListener("storage", handleStorage);
    window.addEventListener("auth-change", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("auth-change", handleStorage);
    };
  }, [dispatch, customer.isAuthenticated]);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "Categories", href: "/categories" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
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
      <nav className={`${stickyClass} top-0 z-40 w-full border-b border-zinc-100 bg-white/80 backdrop-blur-xl`}
        style={{ fontFamily: font }}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              {store.logoUrl ? (
                <img src={store.logoUrl} alt={store.name} className="h-8 w-8 rounded-lg object-cover" />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white"
                  style={{ backgroundColor: primaryColor }}>
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
            <button onClick={() => setSearchOpen(!searchOpen)}
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
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white"
                  style={{ backgroundColor: primaryColor }}>{itemCount}</span>
              )}
            </button>
            {customer.isAuthenticated ? (
              <div className="hidden items-center gap-1 sm:flex">
                <Link href="/orders"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100">
                  <Package className="h-4 w-4" /> Orders
                </Link>
                <button onClick={handleLogout}
                  className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-red-500">
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link href="/account/login"
                className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 sm:flex">
                <LogIn className="h-4 w-4" /> Sign In
              </Link>
            )}
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
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    autoFocus
                    className="h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-9 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </form>
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
                <span className="text-lg font-bold text-zinc-900">{store.name}</span>
                <button onClick={() => setMobileOpen(false)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-4">
                <div className="space-y-1">
                  {navLinks.map((link) => (
                    <button key={link.name} onClick={() => handleNavClick(link.href)}
                      className="block w-full text-left rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900">
                      {link.name}
                    </button>
                  ))}
                </div>
                <div className="mt-6 border-t border-zinc-100 pt-4">
                  {customer.isAuthenticated ? (
                    <>
                      <button onClick={() => handleNavClick("/orders")}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50">
                        <Package className="h-4 w-4" /> My Orders
                      </button>
                      <button onClick={() => { handleLogout(); setMobileOpen(false); }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50">
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </>
                  ) : (
                    <button onClick={() => handleNavClick("/account/login")}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50">
                      <User className="h-4 w-4" /> Sign In
                    </button>
                  )}
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
