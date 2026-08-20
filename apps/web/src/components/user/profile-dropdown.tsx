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
import { getLoginUrlForCurrentPage } from "@/lib/auth-redirect-client";

const items = [
  { label: "Profile", href: "/dashboard/account", icon: UserRound },
  { label: "Account settings", href: "/dashboard/account#preferences", icon: Settings },
  { label: "Security", href: "/dashboard/security", icon: LockKeyhole },
  { label: "Activity log", href: "/dashboard/activity", icon: Activity },
  { label: "Billing", href: "/dashboard/billing", icon: CreditCard },
  { label: "Help center", href: "/dashboard/help", icon: BadgeHelp },
];

export function UserAvatar({ className = "h-9 w-9", showChevron = false }: { className?: string; showChevron?: boolean }) {
  const fallback = useAppSelector((state) => state.user.profile);
  const { data } = useGetProfileQuery();
  const profile = data?.data?.profile;
  const name = profile?.name || fallback?.name || "User";
  return <><span className={cn("flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-apple-ink text-sm font-semibold text-apple-on-primary", className)}>
    {profile?.avatarUrl ? <img src={profile.avatarUrl} alt={name} className="h-full w-full object-cover" /> : name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}
  </span>{showChevron && <ChevronDown className="h-3.5 w-3.5 text-apple-ink-muted-48" />}</>;
}

export function ProfileDropdown({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useNavigate();
  const dispatch = useAppDispatch();
  const fallback = useAppSelector((state) => state.user.profile);
  const { data } = useGetProfileQuery();
  const profile = data?.data?.profile;
  const [logout, { isLoading }] = useLogoutMutation();

  useEffect(() => {
    const outside = (event: MouseEvent) => open && ref.current && !ref.current.contains(event.target as Node) && setOpen(false);
    const escape = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", outside); document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("mousedown", outside); document.removeEventListener("keydown", escape); };
  }, [open]);

  const handleLogout = async () => {
    try { await logout().unwrap(); dispatch(clearUserProfile()); router.replace(getLoginUrlForCurrentPage()); }
    catch { toast.error("Could not sign out. Please try again."); }
  };


  return <div ref={ref} className="relative">
    <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label="Open profile menu" className={cn("flex items-center gap-1 rounded-full outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-apple-ink", compact && "rounded-sm border border-apple-hairline py-1 pl-1 pr-2")}><UserAvatar showChevron={compact}/></button>
    <AnimatePresence>{open && <motion.div initial={{ opacity: 0, y: -6, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: .98 }} transition={{ duration: .16 }} className="absolute right-0 top-[calc(100%+10px)] z-[70] w-64 overflow-hidden rounded-lg border border-apple-hairline bg-apple-canvas p-1.5">
      <div className="mb-1 flex items-center gap-3 rounded-lg bg-apple-canvas-parchment px-3 py-3"><UserAvatar className="h-10 w-10"/><div className="min-w-0"><p className="truncate text-sm font-semibold text-apple-ink">{profile?.name || fallback?.name || "User"}</p><p className="truncate text-xs text-apple-ink-muted-48">{profile?.email || fallback?.email}</p></div></div>
      <div className="py-1">{items.map((item, index) => <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={cn("flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-apple-ink-muted-80 transition hover:bg-apple-canvas-parchment hover:text-apple-ink", index === 4 && "mt-1 border-t border-apple-divider-soft pt-2")}><item.icon className="h-4 w-4 text-apple-ink-muted-48"/>{item.label}</Link>)}</div>
      <Button
        type="button"
        variant="ghost"
        loading={isLoading}
        loadingKey="logout"
        onClick={() => void handleLogout()}
        className="h-auto w-full justify-start gap-2.5 rounded-lg border-t border-apple-divider-soft px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-600"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </Button>
    </motion.div>}</AnimatePresence>
  </div>;
}
