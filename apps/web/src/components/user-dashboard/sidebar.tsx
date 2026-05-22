"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppSelector } from "@/hooks/redux";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Store, Package, Palette, ShoppingCart, Settings, LogOut, Sparkles } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/stores", label: "My Store", icon: Store },
  { href: "/dashboard/products", label: "Products", icon: Package },
  { href: "/dashboard/theme", label: "Theme", icon: Palette },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingCart },
  { href: "/dashboard/settings", label: "Settings", icon: Settings }
];

export function UserSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAppSelector((s) => s.user.profile);

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-zinc-200 bg-white shadow-sm">
      <div className="flex h-16 items-center gap-2.5 border-b border-zinc-100 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <span className="text-lg font-bold tracking-tight text-zinc-900">BornoLand</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">Menu</p>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive ? "bg-blue-50 text-blue-700" : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                  )}>
                  <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-blue-600" : "text-zinc-400")} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-zinc-100 p-3">
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-zinc-50 p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
            {user?.name?.split(" ").map((n) => n[0]).join("") ?? "U"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-zinc-900">{user?.name ?? "User"}</p>
            <p className="truncate text-xs text-zinc-500">{user?.email ?? ""}</p>
          </div>
        </div>
        <button onClick={() => router.push("/login")}
          className="flex w-full items-center gap-2 rounded-lg p-2 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600">
          <LogOut className="h-4 w-4" />
          <span className="text-sm">Sign out</span>
        </button>
      </div>
    </aside>
  );
}
