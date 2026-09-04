"use client";

import Link from "next/link";
import { Users, Mail, Plus } from "lucide-react";
import { PageHeader } from "@/components/workspace/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppSelector } from "@/hooks/redux";
import { useLanguage } from "@/providers/language-provider";

export default function TeamPage() {
  const { language } = useLanguage();
  const user = useAppSelector((s) => s.user.profile);
  const isBn = false;

  return (
    <div className="space-y-8">
      <PageHeader
        title={isBn ? "টিম সদস্যসমূহ" : "Team Members"}
        description={isBn ? "আপনার ওয়ার্কস্পেসে সহকর্মীদের আমন্ত্রণ জানান এবং অ্যাক্সেস পরিচালনা করুন।" : "Invite team members and manage workspace access."}
        actions={
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white opacity-60 cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
            {isBn ? "সদস্য আমন্ত্রণ করুন" : "Invite Member"}
          </button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>{isBn ? "টিম সদস্য তালিকা" : "Member List"}</CardTitle>
          <CardDescription>{isBn ? "যাদের এই ওয়ার্কস্পেসে প্রবেশাধিকার রয়েছে।" : "People with access to this workspace."}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 rounded-2xl border border-zinc-100 bg-apple-canvas-parchment/80 p-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white">
              {user?.name?.split(" ").map((n) => n[0]).join("") ?? (isBn ? "ইউ" : "U")}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-apple-ink">{user?.name ?? (isBn ? "আপনি" : "You")}</p>
              <p className="flex items-center gap-1.5 text-sm text-apple-ink-muted-48">
                <Mail className="h-3.5 w-3.5" />
                {user?.email}
              </p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">{isBn ? "মালিক / এডমিন" : "Owner / Admin"}</span>
          </div>

          <div className="mt-6 rounded-2xl border border-dashed border-zinc-200 p-8 text-center">
            <Users className="mx-auto h-8 w-8 text-zinc-300" />
            <p className="mt-3 text-sm font-medium text-apple-ink">{isBn ? "টিম ইনভাইট সুবিধা শীঘ্রই আসছে" : "Team invites coming soon"}</p>
            <p className="mt-1 text-sm text-apple-ink-muted-48 max-w-md mx-auto">
              {isBn
                ? "বর্তমানে আপনি একা এই ওয়ার্কস্পেস পরিচালনা করছেন। একাধিক সদস্য যুক্ত করার সুবিধা দ্রুত যোগ করা হবে।"
                : "You are currently the only member. Team management features will be added soon."}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
