"use client";

import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  User,
  Heart,
  PhoneCall,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  Flame,
  Package,
  Layers,
  MapPin,
  Clock,
  ArrowRight,
} from "lucide-react";
import type { RootState } from "@/redux/store";
import { openCart } from "@/redux/slices/cart-slice";
import { useTenant } from "@/providers/tenant-provider";
import { SmartImage } from "@/components/ui/smart-image";
import { StoreLink as Link } from "@/components/storefront/store-link";
import { formatCurrency } from "@/lib/format-currency";
import { useIsBuilder } from "@/lib/device-context";
import { cn } from "@/lib/utils";

export interface GroceryHeaderProps {
  headerSettings?: Record<string, unknown>;
}

export function GroceryHeader({ headerSettings = {} }: GroceryHeaderProps) {
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
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const announcementText = (headerSettings.announcementText as string) || "🌿 ১০০% খাঁটি ও নির্ভেজাল পণ্যের প্রতিশ্রুতি | সারাদেশে ক্যাশ অন ডেলিভারি";
  const showAnnouncement = headerSettings.showAnnouncement !== false;
  const storeName = store.name || "BornoLand Grocery";
  const logoUrl = (headerSettings.logoUrl as string) || store.logoUrl || "";

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || isBuilder) return;
    router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const sampleCategories = categories.length > 0 ? categories : [
    { _id: "c1", name: "মধু ও সুইটনার", slug: "honey-sweeteners" },
    { _id: "c2", name: "গাওয়া ঘি ও বাটার", slug: "ghee-butter" },
    { _id: "c3", name: "প্রিমিয়াম খেজুর", slug: "premium-dates" },
    { _id: "c4", name: "খাঁটি তেল", slug: "pure-oil" },
    { _id: "c5", name: "বাদাম ও বীজ", slug: "nuts-seeds" },
    { _id: "c6", name: "ঘানি ভাঙা সরিষার তেল", slug: "mustard-oil" },
    { _id: "c7", name: "অর্গানিক চাল ও ডাল", slug: "organic-rice-pulses" },
    { _id: "c8", name: "মসলাপাতি", slug: "spices" },
  ];

  return (
    <header className="w-full bg-white text-[#1c2826] border-b border-[#ede7df] shadow-xs select-none">
      {/* ── Top Announcement Bar ── */}
      {showAnnouncement && (
        <div className="bg-[#055c3a] text-white text-xs font-medium py-2 px-4 transition-colors">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 truncate">
              <span className="inline-flex items-center justify-center bg-white/20 text-white rounded-full p-0.5">
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
              <span className="truncate">{announcementText}</span>
            </div>
            <div className="hidden md:flex items-center gap-5 text-[11px] shrink-0 text-emerald-100">
              <div className="flex items-center gap-1.5 hover:text-white transition-colors">
                <PhoneCall className="w-3 h-3 text-[#f97316]" />
                <span>হটলাইন: 09613-800800</span>
              </div>
              <div className="h-3 w-px bg-white/20" />
              <div className="flex items-center gap-1.5 hover:text-white transition-colors">
                <Clock className="w-3 h-3 text-[#f97316]" />
                <span>সকাল ৯টা - রাত ১০টা</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Header ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4 md:gap-8">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            {logoUrl ? (
              <SmartImage
                src={logoUrl}
                alt={storeName}
                width={160}
                height={48}
                className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-102"
              />
            ) : (
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-gradient-to-br from-[#e05a00] to-[#f97316] text-white flex items-center justify-center font-bold text-xl shadow-md shadow-orange-500/20">
                  {storeName.charAt(0) || "B"}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-lg sm:text-xl tracking-tight text-[#055c3a]">
                    {storeName}
                  </span>
                  <span className="text-[10px] font-semibold text-[#e05a00] -mt-1 tracking-wider uppercase">
                    100% Pure & Organic
                  </span>
                </div>
              </div>
            )}
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="খাঁটি মধু, ঘি, খেজুর কিংবা পছন্দের পণ্য খুঁজুন..."
                className="w-full h-11 pl-4 pr-24 rounded-full border-2 border-[#ede7df] bg-[#faf8f5] text-sm text-[#1c2826] placeholder:text-zinc-400 focus:outline-none focus:border-[#e05a00] focus:bg-white transition-all shadow-inner"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 bottom-1.5 px-5 rounded-full bg-[#e05a00] hover:bg-[#c2410c] text-white font-medium text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search</span>
              </button>
            </form>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Account */}
            <Link
              href={customer.isAuthenticated ? "/account" : "/login"}
              className="hidden sm:flex items-center gap-2 p-2 rounded-xl text-zinc-700 hover:text-[#055c3a] hover:bg-[#f3ede3] transition-colors"
            >
              <div className="h-9 w-9 rounded-full bg-[#faf8f5] border border-[#ede7df] flex items-center justify-center text-[#055c3a]">
                <User className="w-4 h-4" />
              </div>
              <div className="hidden lg:flex flex-col text-left text-xs leading-tight">
                <span className="text-[10px] text-zinc-500">
                  {customer.isAuthenticated ? "স্বাগতম" : "লগইন / রেজিস্টার"}
                </span>
                <span className="font-semibold text-zinc-900 truncate max-w-[100px]">
                  {customer.customer?.name || "Account"}
                </span>
              </div>
            </Link>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="relative p-2.5 rounded-xl text-zinc-700 hover:text-[#e05a00] hover:bg-[#f3ede3] transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute 1 top-1 right-1 h-4 min-w-[16px] px-1 rounded-full bg-[#e05a00] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Button */}
            <button
              type="button"
              onClick={() => dispatch(openCart())}
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-[#055c3a] hover:bg-[#044a2e] text-white shadow-sm transition-all active:scale-95"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 h-4 min-w-[16px] px-1 rounded-full bg-[#e05a00] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-[#055c3a]">
                    {itemCount}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex flex-col text-left text-xs leading-none">
                <span className="text-[10px] text-emerald-200">আমার কার্ট</span>
                <span className="font-bold text-white mt-0.5">
                  {formatCurrency(cartTotal, settings)}
                </span>
              </div>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-zinc-700 hover:bg-zinc-100"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="mt-3 md:hidden">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="পণ্য খুঁজুন..."
              className="w-full h-10 pl-3 pr-20 rounded-full border border-[#ede7df] bg-[#faf8f5] text-xs text-[#1c2826] focus:outline-none focus:border-[#e05a00]"
            />
            <button
              type="submit"
              className="absolute right-1 top-1 bottom-1 px-3 rounded-full bg-[#e05a00] text-white text-xs font-medium flex items-center gap-1"
            >
              <Search className="w-3 h-3" />
              <span>Search</span>
            </button>
          </form>
        </div>
      </div>

      {/* ── Secondary Category & Links Bar ── */}
      <div className="hidden md:block bg-[#faf8f5] border-t border-[#ede7df]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Categories Dropdown Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setCategoriesDropdownOpen(!categoriesDropdownOpen)}
              className="flex items-center gap-2.5 px-5 py-2.5 bg-[#e05a00] text-white font-medium text-xs rounded-t-lg transition-colors hover:bg-[#c2410c]"
            >
              <Layers className="w-4 h-4" />
              <span>সকল ক্যাটাগরি</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${categoriesDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Menu */}
            {categoriesDropdownOpen && (
              <div className="absolute left-0 top-full mt-0 w-64 bg-white border border-[#ede7df] rounded-b-xl shadow-xl z-50 py-2 divide-y divide-zinc-100">
                {sampleCategories.map((cat) => (
                  <Link
                    key={cat._id}
                    href={`/category/${cat.slug}`}
                    onClick={() => setCategoriesDropdownOpen(false)}
                    className="flex items-center justify-between px-4 py-2.5 text-xs text-zinc-700 hover:text-[#055c3a] hover:bg-[#faf8f5] transition-colors"
                  >
                    <span>{cat.name}</span>
                    <ArrowRight className="w-3 h-3 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick Nav Links */}
          <nav className="flex items-center gap-1 sm:gap-6 text-xs font-semibold text-zinc-700">
            <Link href="/" className={cn("py-2.5 hover:text-[#e05a00] transition-colors", pathname === "/" && "text-[#e05a00]")}>
              হোমপেজ
            </Link>
            <Link href="/shop" className="py-2.5 hover:text-[#e05a00] transition-colors">
              সকল পণ্য
            </Link>
            <Link href="/offers" className="flex items-center gap-1 py-2.5 text-[#e05a00] hover:text-[#c2410c] transition-colors">
              <Flame className="w-3.5 h-3.5" />
              <span>ধামাকা অফার</span>
            </Link>
            <Link href="/combo-deals" className="flex items-center gap-1 py-2.5 hover:text-[#e05a00] transition-colors">
              <Package className="w-3.5 h-3.5 text-[#055c3a]" />
              <span>কম্বো প্যাক</span>
            </Link>
            <Link href="/best-sellers" className="py-2.5 hover:text-[#e05a00] transition-colors">
              টপ সেলিং
            </Link>
            <Link href="/about" className="py-2.5 hover:text-[#e05a00] transition-colors">
              আমাদের কথা
            </Link>
            <Link href="/contact" className="py-2.5 hover:text-[#e05a00] transition-colors">
              যোগাযোগ
            </Link>
          </nav>

          {/* Right Outlet Link */}
          <Link
            href="/branches"
            className="flex items-center gap-1 text-xs font-medium text-[#055c3a] hover:text-[#e05a00] transition-colors"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>আউটলেট সমূহ</span>
          </Link>
        </div>
      </div>

      {/* ── Mobile Navigation Drawer ── */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/50 flex">
          <div className="w-4/5 max-w-sm bg-white h-full overflow-y-auto p-4 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-200">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
                <span className="font-bold text-base text-[#055c3a]">{storeName}</span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 px-2 mb-2">
                  ক্যাটাগরি
                </p>
                {sampleCategories.map((cat) => (
                  <Link
                    key={cat._id}
                    href={`/category/${cat.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-xs font-medium text-zinc-700 hover:bg-[#faf8f5] hover:text-[#055c3a]"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>

              <div className="py-2 border-t border-zinc-100 space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 px-2 mb-2">
                  মেনু
                </p>
                <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-xs font-medium text-zinc-800">
                  হোম
                </Link>
                <Link href="/shop" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-xs font-medium text-zinc-800">
                  সকল পণ্য
                </Link>
                <Link href="/offers" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-xs font-medium text-[#e05a00]">
                  অফারসমূহ
                </Link>
                <Link href="/combo-deals" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-xs font-medium text-zinc-800">
                  কম্বো প্যাক
                </Link>
                <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-xs font-medium text-zinc-800">
                  আমাদের কথা
                </Link>
                <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-xs font-medium text-zinc-800">
                  যোগাযোগ
                </Link>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 text-xs text-zinc-500">
              <p className="font-semibold text-zinc-800">প্রয়োজনে কল করুন:</p>
              <p className="text-[#e05a00] font-bold text-sm mt-0.5">09613-800800</p>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}
    </header>
  );
}
