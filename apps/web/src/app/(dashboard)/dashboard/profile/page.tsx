"use client";

import { motion } from "framer-motion";
import { useAppSelector } from "@/hooks/redux";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Calendar, Shield } from "lucide-react";
import { Save } from "lucide-react";

export default function ProfilePage() {
  const user = useAppSelector((s) => s.user.profile);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Profile</h2>
          <p className="mt-1 text-sm text-zinc-500">Manage your personal information.</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700">
          <Save className="h-4 w-4" /> Save Changes
        </button>
      </motion.div>

      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-3xl font-bold text-white">
            {user?.name?.split(" ").map((n) => n[0]).join("") ?? "U"}
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-zinc-900">{user?.name ?? "User"}</h3>
            <p className="text-sm text-zinc-500">{user?.email ?? ""}</p>
          </div>
          <div className="flex gap-6 text-sm text-zinc-500">
            <span className="flex items-center gap-1.5"><Shield className="h-4 w-4" /> {user?.role ?? "user"}</span>
            <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Member</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-zinc-900">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">Full Name</label>
            <input type="text" defaultValue={user?.name ?? ""} placeholder="Your name"
              className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">Email</label>
            <input type="email" defaultValue={user?.email ?? ""} placeholder="your@email.com"
              className="h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-500" readOnly />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">Display Name</label>
            <input type="text" defaultValue={user?.name ?? ""} placeholder="Display name"
              className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
