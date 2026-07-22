"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useLogoutMutation } from "@/redux/api/auth-api";
import { useGetProfileQuery } from "@/redux/api/profile-api";
import { getLoginUrlForCurrentPage } from "@/lib/auth-redirect-client";
import { ADMIN_PROFILE_MENU } from "@/lib/admin/admin-nav-config";
import { Button } from "@/components/ui/button";

function AdminAvatar({ name, className }: { name: string; className?: string }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-apple-primary text-sm font-semibold text-apple-on-primary",
        className,
      )}
    >
      {initials || "SA"}
    </span>
  );
}

export function AdminProfileDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [logout, { isLoading }] = useLogoutMutation();
  const { data } = useGetProfileQuery();
  const profile = data?.data?.profile;
  const name = profile?.name ?? "Super Admin";
  const email = profile?.email ?? "admin@bornoland.com";

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
      router.replace(getLoginUrlForCurrentPage("/admin/login"));
      router.refresh();
    } catch {
      toast.error("Could not sign out. Please try again.");
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label="Open platform admin menu"
        className="flex items-center gap-2 rounded-full outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-apple-primary"
      >
        <AdminAvatar name={name} className="h-9 w-9" />
        <ChevronDown className="hidden h-3.5 w-3.5 text-apple-ink-muted-48 sm:block" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 top-[calc(100%+10px)] z-[70] w-72 overflow-hidden rounded-xl border border-apple-hairline bg-apple-canvas shadow-lg"
          >
            <div className="border-b border-apple-divider-soft bg-apple-canvas-parchment px-4 py-3">
              <div className="flex items-center gap-3">
                <AdminAvatar name={name} className="h-10 w-10" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-apple-ink">{name}</p>
                  <p className="truncate text-xs text-apple-ink-muted-48">{email}</p>
                  <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-apple-primary">
                    Platform Admin
                  </p>
                </div>
              </div>
            </div>

            <div className="p-1.5">
              {ADMIN_PROFILE_MENU.map((item, index) => (
                <Link
                  key={item.href + item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-apple-ink-muted-80 transition hover:bg-apple-canvas-parchment hover:text-apple-ink",
                    index === 6 && "mt-1 border-t border-apple-divider-soft pt-2",
                  )}
                >
                  <item.icon className="h-4 w-4 text-apple-ink-muted-48" />
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="border-t border-apple-divider-soft p-1.5">
              <Button
                type="button"
                variant="ghost"
                loading={isLoading}
                loadingKey="logout"
                onClick={() => void handleLogout()}
                className="h-auto w-full justify-start gap-2.5 rounded-lg px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
