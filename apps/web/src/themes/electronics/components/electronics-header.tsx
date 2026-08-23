"use client";

import { useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  User,
  Heart,
  Tag,
  Cpu,
  Columns,
  Zap,
  PhoneCall,
  Gift,
  ChevronDown,
  Monitor,
  Laptop,
  HardDrive,
  Headphones,
  Tv,
  Camera,
  Layers,
} from "lucide-react";
import type { RootState } from "@/redux/store";
import { openCart } from "@/redux/slices/cart-slice";
import { useTenant } from "@/providers/tenant-provider";
import { SmartImage } from "@/components/ui/smart-image";
import { StoreLink as Link } from "@/components/storefront/store-link";
import { formatCurrency } from "@/lib/format-currency";
import { useIsBuilder } from "@/lib/device-context";
import { cn } from "@/lib/utils";

export interface ElectronicsHeaderProps {
  headerSettings?: Record<string, unknown>;
}

export function ElectronicsHeader({ headerSettings = {} }: ElectronicsHeaderProps) {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname() || "";
  const isBuilder = useIsBuilder();
  const { store, categories = [], settings } = useTenant();

  const cartItems = useSelector((state: RootState) => state.cart.items);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const wishlistCount = useSelector((state: RootState) => state.wishlist.items.length);
  const customer = useSelector((state: RootState) => state.customer);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMegaCategory, setActiveMegaCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const announcementText = (headerSettings.announcementText as string) || "⚡ Mega Tech Deals 2026: Up to ৳15,000 Cashback on Selected Gaming Laptops & GPUs | All BD Express Delivery";
  const showAnnouncement = headerSettings.showAnnouncement !== false;
  const storeName = store.name || "BornoLand Tech";
  const logoUrl = (headerSettings.logoUrl as string) || store.logoUrl || "";

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || isBuilder) return;
    router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const techCategories = categories.length > 0 ? categories : [
    { _id: "t1", name: "Laptop", slug: "laptop" },
    { _id: "t2", name: "Desktop", slug: "desktop" },
    { _id: "t3", name: "Component", slug: "components" },
    { _id: "t4", name: "Monitor", slug: "monitor" },
    { _id: "t5", name: "UPS", slug: "ups" },
    { _id: "t6", name: "Phone", slug: "phone" },
    { _id: "t7", name: "Tablet", slug: "tablet" },
    { _id: "t8", name: "Sound System", slug: "sound-system" },
    { _id: "t9", name: "Camera", slug: "camera" },
    { _id: "t10", name: "TV", slug: "tv" },
    { _id: "t11", name: "Networking", slug: "networking" },
    { _id: "t12", name: "Accessories", slug: "accessories" },
  ];

  return (
    <header className="w-full bg-[#081621] text-white border-b border-[#172b3c] shadow-md select-none sticky top-0 z-40">
      {/* ── Top Announcement Strip ── */}
      {showAnnouncement && (
        <div className="bg-gradient-to-r from-[#e2136e] to-[#ef4444] text-white text-[11px] font-semibold py-1.5 px-4 transition-colors">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 truncate">
              <Zap className="w-3.5 h-3.5 shrink-0 fill-current animate-pulse" />
              <span className="truncate">{announcementText}</span>
            </div>
            <div className="hidden lg:flex items-center gap-4 shrink-0 text-white/90 text-[10px]">
              <span className="hover:text-white cursor-pointer">Official Warranty Guaranteed</span>
              <span>•</span>
              <span className="hover:text-white cursor-pointer">0% EMI Available</span>
              <span>•</span>
              <span className="hover:text-white cursor-pointer">Helpline: 16789</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Nav & Tech Actions ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          {/* Brand / Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            {logoUrl ? (
              <SmartImage
                src={logoUrl}
                alt={storeName}
                width={150}
                height={40}
                className="h-9 sm:h-10 w-auto object-contain brightness-0 invert"
              />
            ) : (
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-gradient-to-br from-[#0071dc] to-[#ef4444] text-white flex items-center justify-center font-black text-lg shadow-md">
                  {storeName.charAt(0) || "T"}
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white uppercase leading-none">
                    {storeName}
                  </span>
                  <span className="text-[9px] font-bold text-[#ef4444] tracking-widest uppercase mt-0.5">
                    Tech & Gaming Hub
                  </span>
                </div>
              </div>
            )}
          </Link>

          {/* Search Box */}
          <div className="flex-1 max-w-xl hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for Laptop, Desktop, GPU, Monitor, Accessories..."
                className="w-full h-10 pl-4 pr-11 rounded-md border border-[#1e3448] bg-[#0c1e2d] text-xs text-white placeholder:text-zinc-400 focus:outline-none focus:border-[#0071dc] focus:bg-[#0f2438] transition-all shadow-inner"
              />
              <button
                type="submit"
                className="absolute right-1 top-1 bottom-1 px-3 rounded text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Search button"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Quick Action Shortcuts */}
          <div className="flex items-center gap-1 sm:gap-4 shrink-0">
            {/* Offers Link */}
            <Link
              href="/offers"
              className="hidden lg:flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/5 text-zinc-300 hover:text-white transition-colors"
            >
              <div className="h-8 w-8 rounded-lg bg-[#e2136e]/20 text-[#e2136e] flex items-center justify-center">
                <Tag className="w-4 h-4" />
              </div>
              <div className="flex flex-col text-left leading-tight text-[11px]">
                <span className="font-bold text-white">Offers</span>
                <span className="text-[10px] text-zinc-400">Latest Deals</span>
              </div>
            </Link>

            {/* PC Builder */}
            <Link
              href="/pc-builder"
              className="hidden lg:flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/5 text-zinc-300 hover:text-white transition-colors"
            >
              <div className="h-8 w-8 rounded-lg bg-[#0071dc]/20 text-[#0071dc] flex items-center justify-center">
                <Cpu className="w-4 h-4" />
              </div>
              <div className="flex flex-col text-left leading-tight text-[11px]">
                <span className="font-bold text-white">PC Builder</span>
                <span className="text-[10px] text-zinc-400">Build Your PC</span>
              </div>
            </Link>

            {/* Account */}
            <Link
              href={customer.isAuthenticated ? "/account" : "/login"}
              className="hidden sm:flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 text-zinc-300 hover:text-white transition-colors"
            >
              <div className="h-8 w-8 rounded-lg bg-white/10 text-zinc-300 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <div className="hidden xl:flex flex-col text-left leading-tight text-[11px]">
                <span className="font-bold text-white">{customer.isAuthenticated ? customer.customer?.name || "User" : "Account"}</span>
                <span className="text-[10px] text-zinc-400">{customer.isAuthenticated ? "Dashboard" : "Register / Login"}</span>
              </div>
            </Link>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="relative p-2 rounded-lg hover:bg-white/5 text-zinc-300 hover:text-white transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute 1 top-1 right-1 h-4 min-w-[16px] px-1 rounded-full bg-[#ef4444] text-white text-[10px] font-bold flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Button */}
            <button
              type="button"
              onClick={() => dispatch(openCart())}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-md bg-[#0071dc] hover:bg-[#005bb5] text-white shadow-sm transition-all active:scale-95"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 h-4 min-w-[16px] px-1 rounded-full bg-[#ef4444] text-white text-[10px] font-bold flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex flex-col text-left text-xs leading-none">
                <span className="text-[10px] text-sky-200">Cart Total</span>
                <span className="font-bold text-white mt-0.5">
                  {formatCurrency(cartTotal, settings)}
                </span>
              </div>
            </button>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded text-zinc-300 hover:text-white hover:bg-white/10"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="mt-2 md:hidden">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tech products..."
              className="w-full h-9 pl-3 pr-9 rounded bg-[#0c1e2d] border border-[#1e3448] text-xs text-white placeholder:text-zinc-400 focus:outline-none focus:border-[#0071dc]"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1 bottom-1 px-2 text-zinc-400 hover:text-white"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* ── Category Mega Navigation Bar ── */}
      <div className="hidden md:block bg-[#0e1b26] border-t border-[#1a2d3e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between overflow-x-auto scrollbar-none py-1.5">
            <div className="flex items-center gap-1 sm:gap-2">
              {techCategories.map((category) => (
                <Link
                  key={category._id}
                  href={`/category/${category.slug}`}
                  className="px-2.5 py-1 rounded text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/10 transition-colors whitespace-nowrap"
                >
                  {category.name}
                </Link>
              ))}
            </div>

            <Link
              href="/branches"
              className="hidden xl:flex items-center gap-1 text-xs font-semibold text-[#0071dc] hover:text-sky-300 transition-colors shrink-0 ml-4"
            >
              <span>20+ Outlets</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Mobile Menu Drawer ── */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 flex">
          <div className="w-4/5 max-w-sm bg-[#081621] text-white h-full overflow-y-auto p-4 flex flex-col justify-between shadow-2xl border-r border-[#172b3c] animate-in slide-in-from-left duration-200">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#172b3c]">
                <span className="font-extrabold text-base uppercase text-white tracking-wide">{storeName}</span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Quick Action Buttons */}
              <div className="grid grid-cols-2 gap-2 my-3">
                <Link
                  href="/offers"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2 rounded bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#e2136e]"
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>Offers</span>
                </Link>
                <Link
                  href="/pc-builder"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2 rounded bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#0071dc]"
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>PC Builder</span>
                </Link>
              </div>

              <div className="py-2 space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 px-2 mb-1">
                  Product Categories
                </p>
                {techCategories.map((cat) => (
                  <Link
                    key={cat._id}
                    href={`/category/${cat.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded text-xs font-medium text-zinc-300 hover:bg-white/5 hover:text-white"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[#172b3c] text-xs text-zinc-400 space-y-1">
              <p className="text-zinc-200 font-semibold">Helpline & Support</p>
              <p className="text-[#ef4444] font-bold text-sm">16789 (9 AM - 8 PM)</p>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}
    </header>
  );
}
