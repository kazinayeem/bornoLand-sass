"use client";

import { useTenant } from "@/providers/tenant-provider";
import { StoreLink as Link } from "@/components/storefront/store-link";
import { SmartImage } from "@/components/ui/smart-image";
import {
  PhoneCall,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  Facebook,
  Instagram,
  Youtube,
} from "lucide-react";

export interface GroceryFooterProps {
  footerSettings?: Record<string, unknown>;
}

export function GroceryFooter({ footerSettings = {} }: GroceryFooterProps) {
  const { store } = useTenant();
  const storeName = store.name || "BornoLand Grocery";
  const logoUrl = (footerSettings.logoUrl as string) || store.logoUrl || "";

  return (
    <footer className="w-full bg-[#11261f] text-[#e2e8f0] border-t border-[#1d3d32]">
      {/* ── Value Guarantees Banner ── */}
      <div className="border-b border-[#1d3d32] py-8 bg-[#0c1d18]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-[#055c3a]/40 border border-[#055c3a] flex items-center justify-center text-[#f97316] shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white">১০০% খাঁটি পণ্য</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">গুণগত মানের সর্বোচ্চ নিশ্চয়তা</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-[#055c3a]/40 border border-[#055c3a] flex items-center justify-center text-[#f97316] shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white">দ্রুত ডেলিভারি</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">সারাদেশে নিরাপদ হোম ডেলিভারি</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-[#055c3a]/40 border border-[#055c3a] flex items-center justify-center text-[#f97316] shrink-0">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white">সহজ রিটার্ন</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">পণ্য অপছন্দ হলে পরিবর্তনের সুযোগ</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-[#055c3a]/40 border border-[#055c3a] flex items-center justify-center text-[#f97316] shrink-0">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white">কাস্টমার সাপোর্ট</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">যেকোনো তথ্যের জন্য ২৪/৭ পাশে</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Multi-Column Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Col 1: Brand & Bio */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2">
              {logoUrl ? (
                <SmartImage
                  src={logoUrl}
                  alt={storeName}
                  width={140}
                  height={40}
                  className="h-10 w-auto object-contain brightness-0 invert"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-xl bg-[#e05a00] text-white flex items-center justify-center font-bold text-lg">
                    {storeName.charAt(0) || "B"}
                  </div>
                  <span className="font-bold text-lg text-white">{storeName}</span>
                </div>
              )}
            </Link>
            <p className="text-xs leading-relaxed text-zinc-300">
              আমরা প্রতিশ্রুতিবদ্ধ আপনাদের কাছে প্রাকৃতিক, ভেজালমুক্ত এবং পুষ্টিকর খাদ্যপণ্য সুলভ মূল্যে পৌঁছে দিতে। প্রতিটি পণ্য নিজস্ব তত্ত্বাবধানে পরীক্ষা করে সরবরাহ করা হয়।
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="#" className="h-8 w-8 rounded-full bg-white/10 hover:bg-[#e05a00] text-white flex items-center justify-center transition-colors" aria-label="Facebook">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="h-8 w-8 rounded-full bg-white/10 hover:bg-[#e05a00] text-white flex items-center justify-center transition-colors" aria-label="Instagram">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="h-8 w-8 rounded-full bg-white/10 hover:bg-[#e05a00] text-white flex items-center justify-center transition-colors" aria-label="Youtube">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Popular Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#f97316] mb-4">
              জনপ্রিয় ক্যাটাগরি
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-300">
              <li>
                <Link href="/category/honey" className="hover:text-white hover:underline transition-colors">
                  খাঁটি সুন্দরবনের মধু
                </Link>
              </li>
              <li>
                <Link href="/category/ghee" className="hover:text-white hover:underline transition-colors">
                  গাওয়া ঘি ও মাখন
                </Link>
              </li>
              <li>
                <Link href="/category/dates" className="hover:text-white hover:underline transition-colors">
                  প্রিমিয়াম মরিয়ম ও আজওয়া খেজুর
                </Link>
              </li>
              <li>
                <Link href="/category/oil" className="hover:text-white hover:underline transition-colors">
                  ঘানি ভাঙা সরিষার তেল
                </Link>
              </li>
              <li>
                <Link href="/category/nuts" className="hover:text-white hover:underline transition-colors">
                  কাঠবাদাম, কাজুবাদাম ও পেস্তা
                </Link>
              </li>
              <li>
                <Link href="/category/spices" className="hover:text-white hover:underline transition-colors">
                  প্রাকৃতিক গুঁড়া মসলা
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Care & Policies */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#f97316] mb-4">
              গ্রাহক সেবা ও নিয়মাবলী
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-300">
              <li>
                <Link href="/track-order" className="hover:text-white hover:underline transition-colors">
                  অর্ডার ট্র্যাকিং
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="hover:text-white hover:underline transition-colors">
                  ডেলিভারি পলিসি
                </Link>
              </li>
              <li>
                <Link href="/return-policy" className="hover:text-white hover:underline transition-colors">
                  রিটার্ন ও রিফান্ড নীতিমালা
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-white hover:underline transition-colors">
                  গোপনীয়তা নীতিমালা
                </Link>
              </li>
              <li>
                <Link href="/terms-and-conditions" className="hover:text-white hover:underline transition-colors">
                  শর্তাবলী
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white hover:underline transition-colors">
                  সাধারণ প্রশ্নোত্তর (FAQ)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Hotlines */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#f97316] mb-4">
              যোগাযোগের ঠিকানা
            </h4>
            <div className="flex items-start gap-2.5 text-xs text-zinc-300">
              <PhoneCall className="w-4 h-4 text-[#f97316] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white text-sm">09613-800800</p>
                <p className="text-[11px] text-zinc-400">সকাল ৯:০০টা - রাত ১০:০০টা</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-zinc-300">
              <Mail className="w-4 h-4 text-[#f97316] shrink-0 mt-0.5" />
              <a href="mailto:support@bornoland.com" className="hover:text-white">
                support@bornoland.com
              </a>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-zinc-300">
              <MapPin className="w-4 h-4 text-[#f97316] shrink-0 mt-0.5" />
              <p>বাড়ি #২৪, রোড #১২, ব্লক-ডি, বনানী, ঢাকা-১২১৩</p>
            </div>
          </div>
        </div>

        {/* ── Bottom Bar & Payment Icons ── */}
        <div className="mt-12 pt-8 border-t border-[#1d3d32] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <p>© {new Date().getFullYear()} {storeName}. সর্বস্বত্ব সংরক্ষিত। Powered by BornoLand.</p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-medium text-zinc-400 mr-2">পেমেন্ট মেথড:</span>
            <span className="px-2.5 py-1 rounded bg-white/10 text-white font-semibold text-[10px]">ক্যাশ অন ডেলিভারি</span>
            <span className="px-2.5 py-1 rounded bg-[#e2136e] text-white font-semibold text-[10px]">বিকাশ</span>
            <span className="px-2.5 py-1 rounded bg-[#f7941d] text-white font-semibold text-[10px]">নগদ</span>
            <span className="px-2.5 py-1 rounded bg-[#8c3494] text-white font-semibold text-[10px]">রকেট</span>
            <span className="px-2.5 py-1 rounded bg-[#1a1f71] text-white font-semibold text-[10px]">VISA / Master</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
