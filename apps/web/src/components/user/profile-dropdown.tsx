"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useNavigate } from "@/hooks/use-navigate";
import { Activity, BadgeHelp, ChevronDown, CreditCard, LockKeyhole, LogOut, Settings, UserRound } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { clearUserProfile } from "@/redux/slices/user-slice";
import { useLogoutMutation } from "@/redux/api/auth-api";
import { useGetProfileQuery } from "@/redux/api/profile-api";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/providers/language-provider";

export function UserAvatar({
  className = "h-8 w-8",
  showChevron = false,
}: {
  className?: string;
  showChevron?: boolean;
}) {
  const { language } = useLanguage();
  const fallback = useAppSelector((state) => state.user.profile);
  const { data } = useGetProfileQuery();
  const profile = data?.data?.profile;
  const name = profile?.name || fallback?.name || (false ? "ইউজার" : "User");

  return (
    <>
      <span
        className={cn(
          "flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-900 text-xs font-semibold text-white dark:bg-white dark:text-zinc-900 shadow-2xs",
          className
        )}
      >
        {profile?.avatarUrl ? (
          <img src={profile.avatarUrl} alt={name} className="h-full w-full object-cover" />
        ) : (
          name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0])
            .join("")
            .toUpperCase()
        )}
      </span>
      {showChevron && <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />}
    </>
  );
}

export function ProfileDropdown({ compact = false }: { compact?: boolean }) {
  const { language, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useNavigate();
  const dispatch = useAppDispatch();
  const fallback = useAppSelector((state) => state.user.profile);
  const { data } = useGetProfileQuery();
  const profile = data?.data?.profile;
  const [logout, { isLoading }] = useLogoutMutation();

  const items = [
    { label: t.dropdowns.profile, href: "/dashboard/account", icon: UserRound },
    { label: t.dropdowns.accountSettings, href: "/dashboard/account#preferences", icon: Settings },
    { label: t.dropdowns.security, href: "/dashboard/security", icon: LockKeyhole },
    { label: t.dropdowns.activityLog, href: "/dashboard/activity", icon: Activity },
    { label: t.dropdowns.billing, href: "/dashboard/billing", icon: CreditCard },
    { label: t.dropdowns.helpCenter, href: "/dashboard/help", icon: BadgeHelp },
  ];

  useEffect(() => {
    const outside = (event: MouseEvent) =>
      open && ref.current && !ref.current.contains(event.target as Node) && setOpen(false);
    const escape = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("mousedown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      dispatch(clearUserProfile());
      toast.success(false ? "লগআউট সম্পন্ন হয়েছে" : "Signed out successfully");
      window.location.replace("/login");
    } catch {
      toast.error(false ? "লগআউট করা সম্ভব হয়নি। আবার চেষ্টা করুন।" : "Failed to sign out. Please try again.");
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={false ? "প্রোফাইল মেনু খুলুন" : "Open profile menu"}
        className={cn(
          "flex items-center gap-1.5 rounded-full p-0.5 outline-none transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-zinc-900/20 dark:focus-visible:ring-white/20",
          compact && "rounded-lg border border-zinc-200/80 bg-white p-1 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
        )}
      >
        <UserAvatar className="h-7.5 w-7.5" showChevron={compact} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-[calc(100%+8px)] z-[70] w-60 overflow-hidden rounded-xl border border-zinc-200/90 bg-white p-1.5 shadow-xl dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div className="mb-1 flex items-center gap-2.5 rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-900">
              <UserAvatar className="h-9 w-9" />
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-zinc-900 dark:text-white">
                  {profile?.name || fallback?.name || (false ? "ইউজার" : "User")}
                </p>
                <p className="truncate text-[11px] text-zinc-500 font-mono">
                  {profile?.email || fallback?.email}
                </p>
              </div>
            </div>

            <div className="py-1 space-y-0.5">
              {items.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white",
                    index === 4 && "mt-1 border-t border-zinc-100 pt-1.5 dark:border-zinc-800"
                  )}
                >
                  <item.icon className="h-3.5 w-3.5 text-zinc-400" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>

            <Button
              type="button"
              variant="ghost"
              loading={isLoading}
              loadingKey="logout"
              onClick={() => void handleLogout()}
              className="h-8 w-full justify-start gap-2 rounded-lg border-t border-zinc-100 px-2.5 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-zinc-800 dark:text-red-400 dark:hover:bg-red-950/30 font-medium mt-1"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>{t.dropdowns.logout}</span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
