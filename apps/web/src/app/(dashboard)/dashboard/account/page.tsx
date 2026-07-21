"use client";

import { useEffect, useState } from "react";
import { Bell, Globe2, Loader2, Mail, Monitor, Save, UserRound } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/workspace/page-header";
import { AvatarEditor } from "@/components/user/avatar-editor";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetProfileQuery, useUpdateProfileMutation, type UserProfile } from "@/redux/api/profile-api";
import { useAppDispatch } from "@/hooks/redux";
import { setUserProfile } from "@/redux/slices/user-slice";

type EditableProfile = Pick<UserProfile, "name" | "username" | "email" | "phone" | "company" | "storeName" | "country" | "timezone" | "language" | "bio" | "preferences">;
const empty: EditableProfile = { name: "", username: "", email: "", phone: "", company: "", storeName: "", country: "", timezone: "Asia/Dhaka", language: "en", bio: "", preferences: { theme: "system", dateFormat: "DD/MM/YYYY", emailNotifications: true, browserNotifications: true, marketingEmails: false } };

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}{hint && <p className="text-xs text-apple-ink-muted-48">{hint}</p>}</div>;
}

function Toggle({ checked, onChange, label, description, icon: Icon }: { checked: boolean; onChange: (checked: boolean) => void; label: string; description: string; icon: typeof Bell }) {
  return <div className="flex items-center gap-3 rounded-2xl border border-apple-hairline p-4"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-apple-ink-muted-80"><Icon className="h-4 w-4"/></div><div className="min-w-0 flex-1"><p className="text-sm font-medium text-apple-ink">{label}</p><p className="text-xs leading-5 text-apple-ink-muted-48">{description}</p></div><button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-zinc-950" : "bg-zinc-200"}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${checked ? "left-6" : "left-1"}`}/></button></div>;
}

export default function AccountSettingsPage() {
  const { data, isLoading } = useGetProfileQuery();
  const [update, { isLoading: saving }] = useUpdateProfileMutation();
  const [form, setForm] = useState<EditableProfile>(empty);
  const dispatch = useAppDispatch();
  const profile = data?.data?.profile;
  useEffect(() => { if (profile) setForm({ name: profile.name, username: profile.username, email: profile.email, phone: profile.phone, company: profile.company, storeName: profile.storeName, country: profile.country, timezone: profile.timezone, language: profile.language, bio: profile.bio, preferences: profile.preferences }); }, [profile]);

  const change = (key: keyof Omit<EditableProfile, "preferences">, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const pref = <K extends keyof EditableProfile["preferences"]>(key: K, value: EditableProfile["preferences"][K]) => setForm((current) => ({ ...current, preferences: { ...current.preferences, [key]: value } }));
  const save = async () => {
    try {
      const result = await update(form).unwrap(); const next = result.data?.profile;
      if (next) dispatch(setUserProfile({ id: next.id, name: next.name, email: next.email, role: next.role, tenantId: next.tenantId, avatarUrl: next.avatarUrl }));
      if (form.preferences.theme !== "system") document.documentElement.classList.toggle("dark", form.preferences.theme === "dark");
      if (form.preferences.browserNotifications && "Notification" in window && Notification.permission === "default") await Notification.requestPermission();
      toast.success("Profile and preferences saved");
    } catch (error: any) { toast.error(error?.data?.message || "Could not save your profile"); }
  };

  if (isLoading) return <div className="mx-auto max-w-5xl space-y-6"><Skeleton className="h-20 w-full"/><Skeleton className="h-72 w-full"/><Skeleton className="h-72 w-full"/></div>;
  return <div className="mx-auto max-w-5xl space-y-7 pb-16">
    <PageHeader title="Profile & preferences" description="Manage your identity, contact details, and dashboard experience." actions={<button type="button" onClick={() => void save()} disabled={saving} className="inline-flex h-10 items-center gap-2 rounded-xl bg-zinc-950 px-4 text-sm font-medium text-white shadow-sm hover:bg-zinc-800 disabled:opacity-60">{saving ? <Loader2 className="h-4 w-4 animate-spin"/> : <Save className="h-4 w-4"/>}Save changes</button>}/>

    <section className="overflow-hidden rounded-3xl border border-apple-hairline bg-white shadow-sm"><div className="border-b border-zinc-100 bg-gradient-to-r from-zinc-50 to-white px-5 py-4 sm:px-6"><div className="flex items-center gap-2"><UserRound className="h-4 w-4 text-apple-ink-muted-48"/><h2 className="font-semibold text-apple-ink">Personal profile</h2></div><p className="mt-1 text-sm text-apple-ink-muted-48">This information identifies you across your workspace.</p></div><div className="space-y-7 p-5 sm:p-6">
      <AvatarEditor avatarUrl={profile?.avatarUrl ?? ""} name={form.name || "User"}/>
      <div className="grid gap-5 sm:grid-cols-2"><Field label="Full name"><Input value={form.name} onChange={(e) => change("name", e.target.value)} placeholder="Your full name"/></Field><Field label="Username" hint="3–30 characters: letters, numbers, dots, hyphens, or underscores."><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-apple-ink-muted-48">@</span><Input value={form.username} onChange={(e) => change("username", e.target.value.toLowerCase())} className="pl-8"/></div></Field>
      <Field label="Email address" hint="Must be unique across BornoLand."><Input type="email" value={form.email} onChange={(e) => change("email", e.target.value)}/></Field><Field label="Phone"><Input type="tel" value={form.phone} onChange={(e) => change("phone", e.target.value)} placeholder="+880 1XXX-XXXXXX"/></Field>
      <Field label="Company"><Input value={form.company} onChange={(e) => change("company", e.target.value)} placeholder="Company name"/></Field><Field label="Store name"><Input value={form.storeName} onChange={(e) => change("storeName", e.target.value)} placeholder="Primary store"/></Field>
      <Field label="Country"><Input value={form.country} onChange={(e) => change("country", e.target.value)} placeholder="Bangladesh"/></Field><Field label="Timezone"><select value={form.timezone} onChange={(e) => change("timezone", e.target.value)} className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900">{["Asia/Dhaka","Asia/Kolkata","Asia/Singapore","Europe/London","Europe/Berlin","America/New_York","America/Los_Angeles","UTC"].map((zone) => <option key={zone}>{zone}</option>)}</select></Field>
      <Field label="Language"><select value={form.language} onChange={(e) => change("language", e.target.value)} className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900"><option value="en">English</option><option value="bn">বাংলা</option><option value="hi">हिन्दी</option><option value="es">Español</option><option value="fr">Français</option></select></Field></div>
      <Field label="Bio" hint={`${form.bio.length}/500 characters`}><textarea value={form.bio} onChange={(e) => change("bio", e.target.value.slice(0, 500))} rows={4} placeholder="Tell your team a little about yourself…" className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"/></Field>
    </div></section>

    <section id="preferences" className="scroll-mt-24 overflow-hidden rounded-3xl border border-apple-hairline bg-white shadow-sm"><div className="border-b border-zinc-100 px-5 py-4 sm:px-6"><div className="flex items-center gap-2"><Globe2 className="h-4 w-4 text-apple-ink-muted-48"/><h2 className="font-semibold text-apple-ink">Dashboard preferences</h2></div><p className="mt-1 text-sm text-apple-ink-muted-48">Customize appearance, dates, and communications.</p></div><div className="grid gap-5 p-5 sm:grid-cols-3 sm:p-6">
      <Field label="Theme"><select value={form.preferences.theme} onChange={(e) => pref("theme", e.target.value as EditableProfile["preferences"]["theme"])} className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm"><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></Field>
      <Field label="Language"><select value={form.language} onChange={(e) => change("language", e.target.value)} className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm"><option value="en">English</option><option value="bn">বাংলা</option></select></Field>
      <Field label="Date format"><select value={form.preferences.dateFormat} onChange={(e) => pref("dateFormat", e.target.value as EditableProfile["preferences"]["dateFormat"])} className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm"><option>DD/MM/YYYY</option><option>MM/DD/YYYY</option><option>YYYY-MM-DD</option></select></Field>
      <div className="space-y-3 sm:col-span-3"><Toggle icon={Mail} label="Email notifications" description="Receive important account and store activity by email." checked={form.preferences.emailNotifications} onChange={(value) => pref("emailNotifications", value)}/><Toggle icon={Monitor} label="Browser notifications" description="Allow timely alerts while the dashboard is open." checked={form.preferences.browserNotifications} onChange={(value) => pref("browserNotifications", value)}/><Toggle icon={Bell} label="Marketing emails" description="Product news, education, and occasional offers." checked={form.preferences.marketingEmails} onChange={(value) => pref("marketingEmails", value)}/></div>
    </div></section>
    <div className="flex justify-end"><button type="button" onClick={() => void save()} disabled={saving} className="inline-flex h-11 items-center gap-2 rounded-xl bg-zinc-950 px-5 text-sm font-medium text-white">{saving ? <Loader2 className="h-4 w-4 animate-spin"/> : <Save className="h-4 w-4"/>}Save changes</button></div>
  </div>;
}
