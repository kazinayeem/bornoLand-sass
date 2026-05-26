"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/redux/store";
import { clearCustomer } from "@/redux/slices/customer-slice";
import { motion } from "framer-motion";
import { User, Package, Heart, LogOut, Mail, ChevronRight, Save, Loader2, X, Check } from "lucide-react";
import { toast } from "sonner";
import { getApiUrl } from "@/utils/url";

export default function AccountPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { customer, isAuthenticated, restored } = useSelector((s: RootState) => s.customer);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (restored && !isAuthenticated) {
      router.push("/account/login?redirect=/account");
    }
  }, [restored, isAuthenticated, router]);

  useEffect(() => {
    if (customer?.name) setName(customer.name);
  }, [customer]);

  const handleLogout = () => {
    localStorage.removeItem("customer_token");
    dispatch(clearCustomer());
    window.dispatchEvent(new Event("auth-change"));
    router.push("/");
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    try {
      const token = localStorage.getItem("customer_token");
      const res = await fetch(getApiUrl(`/customers/${customer?._id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) throw new Error("Failed to update");
      toast.success("Profile updated");
      setEditing(false);
    } catch { toast.error("Failed to update profile"); }
    finally { setSaving(false); }
  };

  if (!restored || !isAuthenticated || !customer) return null;

  const links = [
    { icon: Package, label: "My Orders", desc: "View order history and track orders", href: "/orders" },
    { icon: Heart, label: "Wishlist", desc: "View and manage saved items", href: "/shop" },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Profile card */}
        <div className="rounded-2xl border p-6" style={{ borderColor: "#e4e4e7" }}>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-2xl font-bold text-zinc-700">
              {customer.name[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              {editing ? (
                <div className="flex items-center gap-2">
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                    className="h-9 flex-1 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-900 outline-none focus:border-zinc-400"
                    autoFocus />
                  <button onClick={handleSaveProfile} disabled={saving}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-50">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  </button>
                  <button onClick={() => { setEditing(false); setName(customer.name); }}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border text-zinc-400 hover:bg-zinc-50">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-zinc-900 truncate">{customer.name}</h1>
                  <button onClick={() => setEditing(true)}
                    className="shrink-0 rounded-lg p-1 text-zinc-300 hover:text-zinc-600 transition-colors">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                </div>
              )}
              <p className="mt-0.5 flex items-center gap-1 text-sm text-zinc-500">
                <Mail className="h-3.5 w-3.5" /> {customer.email}
              </p>
            </div>
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 shrink-0">
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </div>
        </div>

        {/* Quick links */}
        <div className="space-y-3">
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
