"use client";

import { motion } from "framer-motion";
import { useAppSelector } from "@/hooks/redux";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Mail, Shield, Bell, Globe } from "lucide-react";

const sections = [
  { title: "Notifications", icon: Bell, fields: ["Email notifications", "Product updates", "Marketing emails"] },
  { title: "Privacy", icon: Shield, fields: ["Profile visibility", "Show email on profile"] },
  { title: "Region", icon: Globe, fields: ["Timezone", "Language", "Currency"] }
];

export default function SettingsPage() {
  const user = useAppSelector((s) => s.user.profile);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Settings</h2>
          <p className="mt-1 text-sm text-zinc-500">Manage your account preferences.</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700">
          <Save className="h-4 w-4" /> Save
        </button>
      </motion.div>

      {sections.map((section) => (
        <Card key={section.title}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <section.icon className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg font-semibold text-zinc-900">{section.title}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {section.fields.map((field) => (
              <div key={field} className="flex items-center justify-between">
                <label className="text-sm font-medium text-zinc-700">{field}</label>
                <input type="text" placeholder={field}
                  className="h-9 w-56 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:w-64" />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
