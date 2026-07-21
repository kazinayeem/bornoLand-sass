"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check, Clock3, KeyRound, Laptop, Loader2, LockKeyhole, LogOut, MapPin, MonitorSmartphone, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/workspace/page-header";
import { PasswordInput } from "@/components/ui/password-input";
import { Skeleton } from "@/components/ui/skeleton";
import { useChangePasswordMutation, useGetProfileQuery, useGetSessionsQuery, useLogoutAllSessionsMutation, useLogoutCurrentSessionMutation } from "@/redux/api/profile-api";
import { getLoginUrlForCurrentPage } from "@/lib/auth-redirect-client";

const rules = [
  { label: "At least 8 characters", test: (value: string) => value.length >= 8 },
  { label: "One uppercase letter", test: (value: string) => /[A-Z]/.test(value) },
  { label: "One lowercase letter", test: (value: string) => /[a-z]/.test(value) },
  { label: "One number", test: (value: string) => /[0-9]/.test(value) },
  { label: "One special character", test: (value: string) => /[^A-Za-z0-9]/.test(value) },
];

export default function SecurityPage() {
  const router = useRouter();
  const { data: profileData, isLoading: profileLoading } = useGetProfileQuery();
  const { data: sessionData, isLoading: sessionsLoading } = useGetSessionsQuery();
  const [changePassword, { isLoading: changing }] = useChangePasswordMutation();
  const [logoutCurrent, { isLoading: loggingCurrent }] = useLogoutCurrentSessionMutation();
  const [logoutAll, { isLoading: loggingAll }] = useLogoutAllSessionsMutation();
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const score = useMemo(() => rules.filter((rule) => rule.test(passwords.newPassword)).length, [passwords.newPassword]);
  const strength = ["Too weak", "Weak", "Fair", "Good", "Strong", "Excellent"][score];
  const colors = ["bg-zinc-200", "bg-red-500", "bg-orange-500", "bg-amber-500", "bg-lime-500", "bg-emerald-500"];
  const profile = profileData?.data?.profile; const sessions = sessionData?.data?.sessions ?? [];

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (score < 5) { toast.error("Your new password does not meet all requirements"); return; }
    if (passwords.newPassword !== passwords.confirmPassword) { toast.error("Passwords do not match"); return; }
    try { const result = await changePassword(passwords).unwrap(); setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" }); toast.success(result.message || "Password changed successfully"); }
    catch (error: any) { toast.error(error?.data?.message || "Could not change password"); }
  };
  const signOut = async (all: boolean) => {
    if (all && !window.confirm("Log out every device, including this one?")) return;
    try { await (all ? logoutAll() : logoutCurrent()).unwrap(); toast.success(all ? "All devices logged out" : "Session logged out"); router.replace(getLoginUrlForCurrentPage()); }
    catch { toast.error("Could not log out sessions"); }
  };

  return <div className="mx-auto max-w-5xl space-y-7 pb-16"><PageHeader title="Security" description="Manage your password, sign-in history, and active devices."/>
    <div className="grid gap-4 sm:grid-cols-2"><div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-2 text-sm font-medium text-apple-ink-muted-48"><Clock3 className="h-4 w-4"/>Last login</div>{profileLoading ? <Skeleton className="mt-3 h-6 w-40"/> : <p className="mt-2 font-semibold text-apple-ink">{profile?.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleString() : "No login recorded"}</p>}</div><div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-2 text-sm font-medium text-apple-ink-muted-48"><KeyRound className="h-4 w-4"/>Last password change</div>{profileLoading ? <Skeleton className="mt-3 h-6 w-40"/> : <p className="mt-2 font-semibold text-apple-ink">{profile?.passwordChangedAt ? new Date(profile.passwordChangedAt).toLocaleString() : "Not changed yet"}</p>}</div></div>
    <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm"><div className="border-b border-zinc-100 px-5 py-4 sm:px-6"><div className="flex items-center gap-2"><LockKeyhole className="h-4 w-4 text-apple-ink-muted-48"/><h2 className="font-semibold text-apple-ink">Change password</h2></div><p className="mt-1 text-sm text-apple-ink-muted-48">Changing your password signs out other devices and sends a security email.</p></div><form onSubmit={submit} className="grid gap-6 p-5 sm:grid-cols-[1fr_.9fr] sm:p-6"><div className="space-y-4"><label className="block space-y-1.5"><span className="text-sm font-medium text-apple-ink-muted-80">Current password</span><PasswordInput value={passwords.currentPassword} onChange={(value) => setPasswords((state) => ({ ...state, currentPassword: value }))} placeholder="Current password"/></label><label className="block space-y-1.5"><span className="text-sm font-medium text-apple-ink-muted-80">New password</span><PasswordInput value={passwords.newPassword} onChange={(value) => setPasswords((state) => ({ ...state, newPassword: value }))} placeholder="New password"/></label><label className="block space-y-1.5"><span className="text-sm font-medium text-apple-ink-muted-80">Confirm new password</span><PasswordInput value={passwords.confirmPassword} onChange={(value) => setPasswords((state) => ({ ...state, confirmPassword: value }))} placeholder="Confirm password"/></label><button type="submit" disabled={changing} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 text-sm font-medium text-white sm:w-auto">{changing ? <Loader2 className="h-4 w-4 animate-spin"/> : <ShieldCheck className="h-4 w-4"/>}Update password</button></div>
      <div className="rounded-2xl bg-apple-canvas-parchment p-4"><div className="flex items-center justify-between text-xs font-medium"><span>Password strength</span><span className="text-apple-ink-muted-80">{strength}</span></div><div className="mt-2 grid grid-cols-5 gap-1">{Array.from({ length: 5 }).map((_, index) => <span key={index} className={`h-1.5 rounded-full ${index < score ? colors[score] : "bg-zinc-200"}`}/>)}</div><div className="mt-4 space-y-2">{rules.map((rule) => { const passed = rule.test(passwords.newPassword); return <div key={rule.label} className={`flex items-center gap-2 text-xs ${passed ? "text-emerald-700" : "text-apple-ink-muted-48"}`}><span className={`flex h-4 w-4 items-center justify-center rounded-full ${passed ? "bg-emerald-100" : "bg-zinc-200"}`}>{passed && <Check className="h-3 w-3"/>}</span>{rule.label}</div>; })}<div className={`flex items-center gap-2 text-xs ${passwords.confirmPassword && passwords.newPassword === passwords.confirmPassword ? "text-emerald-700" : "text-apple-ink-muted-48"}`}><span className="flex h-4 w-4 items-center justify-center rounded-full bg-zinc-200">{passwords.confirmPassword && passwords.newPassword === passwords.confirmPassword && <Check className="h-3 w-3"/>}</span>Passwords match</div></div></div>
    </form></section>
    <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm"><div className="flex flex-col gap-3 border-b border-zinc-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"><div><div className="flex items-center gap-2"><MonitorSmartphone className="h-4 w-4 text-apple-ink-muted-48"/><h2 className="font-semibold text-apple-ink">Login devices</h2></div><p className="mt-1 text-sm text-apple-ink-muted-48">Review recent sessions and revoke access you don’t recognize.</p></div><button type="button" disabled={loggingAll || sessions.length === 0} onClick={() => void signOut(true)} className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-red-200 px-3 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50">{loggingAll ? <Loader2 className="h-3.5 w-3.5 animate-spin"/> : <LogOut className="h-3.5 w-3.5"/>}Logout all devices</button></div><div className="divide-y divide-zinc-100">
      {sessionsLoading ? Array.from({ length: 2 }).map((_, i) => <div key={i} className="flex gap-3 p-5"><Skeleton className="h-11 w-11"/><div className="flex-1 space-y-2"><Skeleton className="h-4 w-32"/><Skeleton className="h-3 w-64"/></div></div>) : sessions.length === 0 ? <div className="p-10 text-center text-sm text-apple-ink-muted-48">No active sessions found.</div> : sessions.map((session) => <div key={session.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-apple-ink-muted-80"><Laptop className="h-5 w-5"/></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-medium text-apple-ink">{session.browser} on {session.device}</p>{session.current && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">Current</span>}</div><div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-apple-ink-muted-48"><span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3"/>{session.location} · {session.ipAddress}</span><span>Signed in {new Date(session.createdAt).toLocaleString()}</span></div></div>{session.current && <button type="button" disabled={loggingCurrent} onClick={() => void signOut(false)} className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-zinc-200 px-3 text-xs font-medium text-apple-ink-muted-80 hover:bg-apple-canvas-parchment">{loggingCurrent ? <Loader2 className="h-3.5 w-3.5 animate-spin"/> : <LogOut className="h-3.5 w-3.5"/>}Logout current session</button>}</div>)}
    </div></section>
    <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0"/><p>If you see a device or location you don’t recognize, log out all devices and change your password immediately.</p></div>
  </div>;
}
