"use client";

import Link from "next/link";
import { Users, Mail, Plus } from "lucide-react";
import { PageHeader } from "@/components/workspace/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppSelector } from "@/hooks/redux";

export default function TeamPage() {
  const user = useAppSelector((s) => s.user.profile);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Team"
        description="Invite members and manage workspace access."
        actions={
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white opacity-60"
          >
            <Plus className="h-4 w-4" />
            Invite Member
          </button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>People with access to this workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 rounded-2xl border border-zinc-100 bg-apple-canvas-parchment/80 p-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white">
              {user?.name?.split(" ").map((n) => n[0]).join("") ?? "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-apple-ink">{user?.name ?? "You"}</p>
              <p className="flex items-center gap-1.5 text-sm text-apple-ink-muted-48">
                <Mail className="h-3.5 w-3.5" />
                {user?.email}
              </p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">Owner</span>
          </div>

          <div className="mt-6 rounded-2xl border border-dashed border-zinc-200 p-8 text-center">
            <Users className="mx-auto h-8 w-8 text-zinc-300" />
            <p className="mt-3 text-sm font-medium text-apple-ink">Team invites coming soon</p>
            <p className="mt-1 text-sm text-apple-ink-muted-48">
              You&apos;re currently the only member. Team management will be available in a future update.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
