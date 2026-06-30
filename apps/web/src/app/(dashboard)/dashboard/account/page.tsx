"use client";

import { useMeQuery } from "@/redux/api/auth-api";
import { PageHeader } from "@/components/workspace/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function AccountSettingsPage() {
  const { data, isLoading } = useMeQuery();
  const session = data?.data?.session;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader
        title="Workspace Settings"
        description="Manage your account and workspace preferences."
      />

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your account information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Name</p>
            <p className="mt-1 text-sm font-medium text-zinc-900">{session?.name ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Email</p>
            <p className="mt-1 text-sm font-medium text-zinc-900">{session?.email ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Role</p>
            <p className="mt-1 text-sm font-medium capitalize text-zinc-900">{session?.role ?? "—"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
