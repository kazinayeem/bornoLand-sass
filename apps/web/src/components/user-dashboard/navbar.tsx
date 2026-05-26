"use client";
import { Bell, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/hooks/redux";

export function UserNavbar() {
  const pathname = usePathname();
  const user = useAppSelector((s) => s.user.profile);

  const segments = pathname.split("/").filter(Boolean);
  const crumbs = segments.map((s, i) => ({
    label: s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    href: "/" + segments.slice(0, i + 1).join("/"),
  }));

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200 bg-white/80 px-6 backdrop-blur-xl">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-zinc-900">
          {crumbs.length > 1 ? crumbs[crumbs.length - 1].label : "Dashboard"}
        </h1>
        <p className="text-xs text-zinc-500">
          {crumbs.map((c, i) => (
            <span key={c.href}>
              {i > 0 && <span className="mx-1 text-zinc-300">/</span>}
              {c.label}
            </span>
          ))}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input type="text" placeholder="Search..."
            className="h-9 w-56 rounded-xl border border-zinc-200 bg-zinc-50 pl-9 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
        </div>
        <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-500 transition-colors hover:bg-zinc-50">
          <Bell className="h-4 w-4" />
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
          {user?.name?.split(" ").map((n) => n[0]).join("") ?? "U"}
        </div>
      </div>
    </header>
  );
}
