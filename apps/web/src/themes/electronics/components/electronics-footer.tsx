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
  Linkedin,
  Map,
  Cpu,
  Tv,
} from "lucide-react";

export interface ElectronicsFooterProps {
  footerSettings?: Record<string, unknown>;
}

export function ElectronicsFooter({ footerSettings = {} }: ElectronicsFooterProps) {
  const { store } = useTenant();
  const storeName = store.name || "BornoLand Electronics";
  const logoUrl = (footerSettings.logoUrl as string) || store.logoUrl || "";

  return (
    <footer className="w-full bg-[#081621] text-[#94a3b8] border-t border-[#172b3c]">
      {/* ── Top Support Strip ── */}
      <div className="border-b border-[#172b3c] py-8 bg-[#050e15]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Hotline */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="h-12 w-12 rounded-xl bg-[#ef4444]/20 text-[#ef4444] flex items-center justify-center shrink-0">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Helpline & Hotline</span>
              <h4 className="text-lg font-black text-white tracking-wide mt-0.5">16789</h4>
              <p className="text-[10px] text-zinc-400">9:00 AM to 8:00 PM (Everyday)</p>
            </div>
          </div>

          {/* Store Locator */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="h-12 w-12 rounded-xl bg-[#0071dc]/20 text-[#0071dc] flex items-center justify-center shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Physical Outlets</span>
              <h4 className="text-sm font-bold text-white tracking-wide mt-0.5">20+ Stores Nationwide</h4>
              <Link href="/branches" className="text-[10px] text-[#0071dc] hover:underline font-semibold">
                Find Nearest Store →
              </Link>
            </div>
          </div>

          {/* Online Service */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="h-12 w-12 rounded-xl bg-[#e2136e]/20 text-[#e2136e] flex items-center justify-center shrink-0">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Warranty & Support</span>
              <h4 className="text-sm font-bold text-white tracking-wide mt-0.5">Authorized Service Center</h4>
              <Link href="/support" className="text-[10px] text-[#e2136e] hover:underline font-semibold">
                Raise RMA / Complaint →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Footer Columns ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Col 1: About & Contact */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2">
              {logoUrl ? (
                <SmartImage
                  src={logoUrl}
                  alt={storeName}
                  width={140}
                  height={40}
                  className="h-9 w-auto object-contain brightness-0 invert"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-lg bg-[#0071dc] text-white flex items-center justify-center font-bold text-lg">
                    {storeName.charAt(0) || "T"}
                  </div>
                  <span className="font-bold text-lg text-white">{storeName}</span>
                </div>
              )}
            </Link>
            <p className="text-xs leading-relaxed text-zinc-400">
              {storeName} is the leading computer, laptop, gaming PC component & gadgets retail chain in Bangladesh with 100% authentic products and manufacturer warranty.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="#" className="h-8 w-8 rounded-lg bg-white/10 hover:bg-[#0071dc] text-white flex items-center justify-center transition-colors" aria-label="Facebook">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="h-8 w-8 rounded-lg bg-white/10 hover:bg-[#e2136e] text-white flex items-center justify-center transition-colors" aria-label="Instagram">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="h-8 w-8 rounded-lg bg-white/10 hover:bg-[#ef4444] text-white flex items-center justify-center transition-colors" aria-label="Youtube">
                <Youtube className="w-4 h-4" />
              </a>
              <a href="#" className="h-8 w-8 rounded-lg bg-white/10 hover:bg-[#0071dc] text-white flex items-center justify-center transition-colors" aria-label="LinkedIn">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: About & Information */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              About & Policies
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              <li>
                <Link href="/about" className="hover:text-white hover:underline transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/terms-and-conditions" className="hover:text-white hover:underline transition-colors">
                  Terms and Conditions
                </Link>
              </li>
              <li>
                <Link href="/warranty-policy" className="hover:text-white hover:underline transition-colors">
                  Warranty & RMA Policy
                </Link>
              </li>
              <li>
                <Link href="/emi-terms" className="hover:text-white hover:underline transition-colors">
                  0% EMI Terms
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-white hover:underline transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/star-point-policy" className="hover:text-white hover:underline transition-colors">
                  Reward Points Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Care & Services */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Customer Support
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              <li>
                <Link href="/support" className="hover:text-white hover:underline transition-colors">
                  Raise a Complaint
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="hover:text-white hover:underline transition-colors">
                  Order Status Tracking
                </Link>
              </li>
              <li>
                <Link href="/laptop-finder" className="hover:text-white hover:underline transition-colors">
                  Laptop Finder Guide
                </Link>
              </li>
              <li>
                <Link href="/pc-builder" className="hover:text-white hover:underline transition-colors">
                  Online PC Builder
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white hover:underline transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white hover:underline transition-colors">
                  Help Center / FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Corporate Head Office */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Head Office
            </h4>
            <div className="flex items-start gap-2.5 text-xs text-zinc-400">
              <MapPin className="w-4 h-4 text-[#0071dc] shrink-0 mt-0.5" />
              <p>6th Floor, Multiplan Center, 69-71 New Elephant Road, Dhaka-1205</p>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-zinc-400">
              <Mail className="w-4 h-4 text-[#0071dc] shrink-0 mt-0.5" />
              <a href="mailto:support@bornoland.com" className="hover:text-white">
                info@bornoland-tech.com
              </a>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-zinc-400">
              <Clock className="w-4 h-4 text-[#0071dc] shrink-0 mt-0.5" />
              <p>Friday - Thursday: 9:00 AM - 8:00 PM</p>
            </div>
          </div>
        </div>

        {/* ── Bottom Bar ── */}
        <div className="mt-12 pt-8 border-t border-[#172b3c] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} {storeName}. All rights reserved. Powered by BornoLand SaaS.</p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-medium text-zinc-400 mr-2">Secure Payments:</span>
            <span className="px-2.5 py-1 rounded bg-white/10 text-white font-semibold text-[10px]">Cash on Delivery</span>
            <span className="px-2.5 py-1 rounded bg-[#e2136e] text-white font-semibold text-[10px]">bKash</span>
            <span className="px-2.5 py-1 rounded bg-[#f7941d] text-white font-semibold text-[10px]">Nagad</span>
            <span className="px-2.5 py-1 rounded bg-[#0071dc] text-white font-semibold text-[10px]">VISA / Master / Amex</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
