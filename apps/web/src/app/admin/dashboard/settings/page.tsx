"use client";

import { motion } from "framer-motion";
import { Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const sections = [
  { title: "General", fields: ["Platform Name", "Support Email", "Default Plan", "Registration"] },
  { title: "SMTP Settings", fields: ["SMTP Host", "SMTP Port", "SMTP User", "SMTP Password"] },
  { title: "OAuth Providers", fields: ["Google Client ID", "Google Client Secret", "GitHub Client ID", "GitHub Client Secret"] },
  { title: "Cloudinary", fields: ["Cloud Name", "API Key", "API Secret"] },
  { title: "Stripe", fields: ["Publishable Key", "Secret Key", "Webhook Secret"] },
  { title: "Security", fields: ["Session Duration", "Max Login Attempts", "Password Policy", "2FA Required"] }
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Settings</h2>
          <p className="mt-1 text-sm text-zinc-500">Manage platform configuration and integrations.</p>
        </div>
        <Button className="gap-2"><Save className="h-4 w-4" /> Save Changes</Button>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {sections.map((section, i) => (
          <motion.div key={section.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-zinc-900">{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {section.fields.map((field) => (
                  <div key={field}>
                    <label className="mb-1.5 block text-sm font-medium text-zinc-700">{field}</label>
                    <input type="text" placeholder={`Enter ${field.toLowerCase()}`}
                      className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
