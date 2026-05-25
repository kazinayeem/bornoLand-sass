"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/redux/store";
import { clearCustomer } from "@/redux/slices/customer-slice";
import { motion } from "framer-motion";
import { User, Package, Heart, LogOut, Mail, ChevronRight } from "lucide-react";

export default function AccountPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { customer, isAuthenticated, restored } = useSelector((s: RootState) => s.customer);

  useEffect(() => {
    if (restored && !isAuthenticated) {
      router.push("/account/login?redirect=/account");
    }
  }, [restored, isAuthenticated, router]);

  const handleLogout = () => {
    localStorage.removeItem("customer_token");
    dispatch(clearCustomer());
    window.dispatchEvent(new Event("auth-change"));
    router.push("/");
  };

  if (!restored || !isAuthenticated || !customer) return null;

  const links = [
    { icon: Package, label: "My Orders", desc: "View order history", href: "/orders" },
    { icon: Heart, label: "Wishlist", desc: "View saved items", href: "/shop" },
    { icon: User, label: "Account Details", desc: "Manage your profile", href: "#" },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-4 rounded-2xl border p-6"
          style={{ borderColor: "#e4e4e7" }}>
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 text-2xl font-bold text-zinc-700">
            {customer.name[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-zinc-900">{customer.name}</h1>
            <p className="mt-1 flex items-center gap-1 text-sm text-zinc-500">
              <Mail className="h-3.5 w-3.5" /> {customer.email}
            </p>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-50">
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>

        <div className="mt-8 space-y-3">
          {links.map((link) => (
            <Link key={link.label} href={link.href}
              className="flex items-center gap-4 rounded-xl border p-4 transition-all hover:shadow-sm"
              style={{ borderColor: "#e4e4e7" }}>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100">
                <link.icon className="h-5 w-5 text-zinc-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-zinc-900">{link.label}</p>
                <p className="text-xs text-zinc-500">{link.desc}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-zinc-300" />
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
