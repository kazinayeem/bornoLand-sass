"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Mail, Settings2, Palette, FileText, Send, Loader2,
  Save, Eye, RotateCcw, Copy, CheckCircle, XCircle,
  Shield, Server, Key, Globe, Clock, Monitor,
} from "lucide-react";
import { useCurrentStore } from "@/hooks/use-current-store";
import {
  useGetEmailConfigQuery, useUpdateEmailConfigMutation,
  useGetEmailTemplatesQuery, useUpdateEmailTemplateMutation,
  useResetEmailTemplateMutation, useDuplicateEmailTemplateMutation,
  useGetEmailBrandingQuery, useUpdateEmailBrandingMutation,
  useSendTestEmailMutation,
  useGetEmailLogsQuery,
  type StoreEmailConfig, type UpdateEmailConfigPayload,
  type StoreEmailTemplate, type UpdateEmailTemplatePayload,
  type StoreEmailBranding, type UpdateEmailBrandingPayload,
} from "@/redux/api/store-email-api";

type Tab = "smtp" | "templates" | "branding" | "logs" | "test";

const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "smtp", label: "SMTP", icon: Settings2 },
  { id: "templates", label: "Templates", icon: FileText },
  { id: "branding", label: "Branding", icon: Palette },
  { id: "test", label: "Test Email", icon: Send },
  { id: "logs", label: "Logs", icon: Mail },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-emerald-500" : "bg-zinc-200"}`}>
      <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${checked ? "left-6" : "left-1"}`} />
    </button>
  );
}

function SectionCard({ title, description, icon: Icon, children }: { title: string; description?: string; icon?: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-5">
      {(title || Icon) && (
        <div className="flex items-center gap-3">
          {Icon && <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100"><Icon className="h-5 w-5 text-blue-600" /></div>}
          <div>
            <h3 className="text-base font-semibold text-apple-ink">{title}</h3>
            {description && <p className="text-sm text-apple-ink-muted-48">{description}</p>}
          </div>
        </div>
      )}
      {children}
    </div>
  );
}

function InputField({ label, hint, type = "text", value, onChange, placeholder, disabled }: {
  label: string; hint?: string; type?: string; value: string; onChange: (v: string) => void; placeholder?: string; disabled?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-apple-ink-muted-80">{label}</label>
      {type === "textarea" ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={4}
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-apple-ink outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-y"
          placeholder={placeholder} disabled={disabled} />
      ) : type === "select" ? (
        <select value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-apple-ink outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          disabled={disabled}>
          {(placeholder?.split(",") ?? []).map((opt) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : (
        <div className="relative">
          {type === "password" && <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-apple-ink-muted-48" />}
          <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
            className={`w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-apple-ink outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100 ${type === "password" ? "pl-10" : ""}`}
            placeholder={placeholder} disabled={disabled} />
        </div>
      )}
      {hint && <p className="text-xs text-apple-ink-muted-48">{hint}</p>}
    </div>
  );
}

export default function EmailSettingsPage() {
  const { currentStoreId, currentStore } = useCurrentStore();
  const [activeTab, setActiveTab] = useState<Tab>("smtp");

  if (!currentStoreId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-apple-ink-muted-48">Select a store to configure email settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-apple-ink">Email Configuration</h2>
          <p className="mt-1 text-sm text-apple-ink-muted-48">
            Configure SMTP, templates, and branding for <span className="font-medium text-apple-ink">{currentStore?.name}</span>
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-2xl border border-zinc-200 bg-white p-1 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id ? "bg-zinc-900 text-white shadow-sm" : "text-apple-ink-muted-80 hover:text-apple-ink hover:bg-zinc-50"
              }`}>
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "smtp" && <SmtpConfigTab storeId={currentStoreId} />}
      {activeTab === "templates" && <TemplatesTab storeId={currentStoreId} />}
      {activeTab === "branding" && <BrandingTab storeId={currentStoreId} />}
      {activeTab === "test" && <TestEmailTab storeId={currentStoreId} />}
      {activeTab === "logs" && <EmailLogsTab storeId={currentStoreId} />}
    </div>
  );
}

function SmtpConfigTab({ storeId }: { storeId: string }) {
  const { data: config, isLoading } = useGetEmailConfigQuery(storeId);
  const [update, { isLoading: saving }] = useUpdateEmailConfigMutation();

  const [form, setForm] = useState<UpdateEmailConfigPayload>({});

  useEffect(() => {
    if (config) {
      setForm({
        senderName: config.senderName || "",
        senderEmail: config.senderEmail || "",
        smtpHost: config.smtpHost || "",
        smtpPort: config.smtpPort || 587,
        smtpUser: config.smtpUser || "",
        smtpPass: "",
        encryption: config.encryption || "tls",
        replyToEmail: config.replyToEmail || "",
        bccEmail: config.bccEmail || "",
        enabled: config.enabled,
        defaultLanguage: config.defaultLanguage || "en",
        timezone: config.timezone || "UTC",
      });
    }
  }, [config]);

  const set = (key: keyof UpdateEmailConfigPayload, value: string | number | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    try {
      const payload = { ...form };
      if (!payload.smtpPass) delete payload.smtpPass;
      await update({ storeId, data: payload }).unwrap();
      toast.success("SMTP configuration saved");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to save SMTP configuration");
    }
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-[300px]"><Loader2 className="h-6 w-6 animate-spin text-apple-ink-muted-48" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      {/* Enable Toggle */}
      <SectionCard title="SMTP Status" description="Enable or disable store-specific email sending">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {form.enabled ? (
              <CheckCircle className="h-5 w-5 text-emerald-500" />
            ) : (
              <XCircle className="h-5 w-5 text-zinc-300" />
            )}
            <div>
              <p className="text-sm font-medium text-apple-ink">{form.enabled ? "Email sending is active" : "Email sending is disabled"}</p>
              <p className="text-xs text-apple-ink-muted-48">
                {form.enabled ? "Emails will be sent using this SMTP configuration" : "Platform default SMTP will be used instead"}
              </p>
            </div>
          </div>
          <Toggle checked={form.enabled ?? false} onChange={(v) => set("enabled", v)} />
        </div>
      </SectionCard>

      {/* Sender Info */}
      <SectionCard title="Sender Information" icon={Mail}>
        <div className="grid gap-5 sm:grid-cols-2">
          <InputField label="Sender Name" value={form.senderName ?? ""} onChange={(v) => set("senderName", v)} placeholder="Store Name" />
          <InputField label="Sender Email" type="email" value={form.senderEmail ?? ""} onChange={(v) => set("senderEmail", v)} placeholder="noreply@yourstore.com" />
          <InputField label="Reply-To Email" type="email" value={form.replyToEmail ?? ""} onChange={(v) => set("replyToEmail", v)} placeholder="support@yourstore.com" hint="Optional. Replies will go to this address." />
          <InputField label="BCC Email" type="email" value={form.bccEmail ?? ""} onChange={(v) => set("bccEmail", v)} placeholder="archive@yourstore.com" hint="Optional. Blind copy all outgoing emails." />
        </div>
      </SectionCard>

      {/* SMTP Server */}
      <SectionCard title="SMTP Server" icon={Server}>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <InputField label="SMTP Host" value={form.smtpHost ?? ""} onChange={(v) => set("smtpHost", v)} placeholder="smtp.example.com" />
          <InputField label="SMTP Port" type="number" value={String(form.smtpPort ?? 587)} onChange={(v) => set("smtpPort", parseInt(v) || 587)} placeholder="587" />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-apple-ink-muted-80">Encryption</label>
            <select value={form.encryption ?? "tls"} onChange={(e) => set("encryption", e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-apple-ink outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
              <option value="tls">TLS</option>
              <option value="ssl">SSL</option>
              <option value="starttls">STARTTLS</option>
              <option value="none">None</option>
            </select>
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <InputField label="Username" value={form.smtpUser ?? ""} onChange={(v) => set("smtpUser", v)} placeholder="your@email.com" />
          <InputField label="Password" type="password" value={form.smtpPass ?? ""} onChange={(v) => set("smtpPass", v)}
            placeholder={config?.smtpPassSet ? "•••••••• (leave blank to keep current)" : "Enter SMTP password"} />
        </div>
        {config?.smtpPassSet && (
          <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5">
            <Shield className="h-4 w-4 text-amber-600 shrink-0" />
            <p className="text-xs text-amber-700">Password is stored encrypted. Enter a new password only if you want to change it.</p>
          </div>
        )}
      </SectionCard>

      {/* Localization */}
      <SectionCard title="Localization" icon={Globe}>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-apple-ink-muted-80">Default Language</label>
            <select value={form.defaultLanguage ?? "en"} onChange={(e) => set("defaultLanguage", e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-apple-ink outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
              <option value="en">English</option>
              <option value="bn">Bangla</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="ar">Arabic</option>
              <option value="hi">Hindi</option>
              <option value="zh">Chinese</option>
              <option value="ja">Japanese</option>
              <option value="ko">Korean</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-apple-ink-muted-80 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-apple-ink-muted-48" /> Timezone
            </label>
            <select value={form.timezone ?? "UTC"} onChange={(e) => set("timezone", e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-apple-ink outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
              <option value="UTC">UTC</option>
              <option value="Asia/Dhaka">Asia/Dhaka</option>
              <option value="Asia/Kolkata">Asia/Kolkata</option>
              <option value="America/New_York">America/New_York</option>
              <option value="Europe/London">Europe/London</option>
            </select>
          </div>
        </div>
      </SectionCard>

      {/* Save */}
      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving..." : "Save SMTP Configuration"}
        </button>
      </div>
    </motion.div>
  );
}

function TemplatesTab({ storeId }: { storeId: string }) {
  const { data: templates, isLoading } = useGetEmailTemplatesQuery(storeId);
  const [update] = useUpdateEmailTemplateMutation();
  const [reset] = useResetEmailTemplateMutation();
  const [duplicate] = useDuplicateEmailTemplateMutation();
  const [editing, setEditing] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ subject: "", body: "", description: "" });

  const startEdit = (t: StoreEmailTemplate) => {
    setEditing(t._id);
    setEditForm({ subject: t.subject, body: t.body, description: t.description });
  };

  const handleSave = async (templateId: string) => {
    try {
      await update({ storeId, templateId, data: editForm }).unwrap();
      toast.success("Template updated");
      setEditing(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update template");
    }
  };

  const handleReset = async (templateId: string) => {
    try {
      await reset({ storeId, templateId }).unwrap();
      toast.success("Template reset to default");
    } catch {
      toast.error("Failed to reset template");
    }
  };

  const handleDuplicate = async (templateId: string) => {
    try {
      await duplicate({ storeId, templateId }).unwrap();
      toast.success("Template duplicated");
    } catch {
      toast.error("Failed to duplicate template");
    }
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-[300px]"><Loader2 className="h-6 w-6 animate-spin text-apple-ink-muted-48" /></div>;

  const templateList = templates ?? [];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {templateList.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center">
          <FileText className="mx-auto h-8 w-8 text-apple-ink-muted-48" />
          <p className="mt-2 text-sm text-apple-ink-muted-48">No templates found. They will be created automatically.</p>
        </div>
      ) : (
        templateList.map((t) => (
          <div key={t._id} className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3">
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-apple-ink-muted-48" />
                <div>
                  <span className="text-sm font-medium text-apple-ink">{t.name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</span>
                  {t.isDefault && <span className="ml-2 rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-apple-ink-muted-48">Default</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {editing !== t._id && (
                  <>
                    <button onClick={() => startEdit(t)} className="rounded-lg px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors">
                      Edit
                    </button>
                    <button onClick={() => setPreview(preview === t._id ? null : t._id)} className="rounded-lg px-3 py-1.5 text-xs font-medium text-apple-ink-muted-80 hover:bg-zinc-50 transition-colors">
                      <Eye className="h-3.5 w-3.5 inline mr-1" />Preview
                    </button>
                    <button onClick={() => handleReset(t._id)} className="rounded-lg px-3 py-1.5 text-xs font-medium text-amber-600 hover:bg-amber-50 transition-colors">
                      <RotateCcw className="h-3.5 w-3.5 inline mr-1" />Reset
                    </button>
                    <button onClick={() => handleDuplicate(t._id)} className="rounded-lg px-3 py-1.5 text-xs font-medium text-apple-ink-muted-80 hover:bg-zinc-50 transition-colors">
                      <Copy className="h-3.5 w-3.5 inline mr-1" />Duplicate
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Subject */}
            <div className="px-5 py-3 border-b border-zinc-50">
              <span className="text-xs text-apple-ink-muted-48">Subject:</span>
              <span className="ml-2 text-sm text-apple-ink">{t.subject}</span>
            </div>

            {/* Edit form */}
            {editing === t._id && (
              <div className="p-5 space-y-4 bg-zinc-50">
                <InputField label="Subject" value={editForm.subject} onChange={(v) => setEditForm((p) => ({ ...p, subject: v }))} />
                <InputField label="Description" value={editForm.description} onChange={(v) => setEditForm((p) => ({ ...p, description: v }))} />
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-apple-ink-muted-80">HTML Body</label>
                  <textarea value={editForm.body} onChange={(e) => setEditForm((p) => ({ ...p, body: e.target.value }))} rows={12}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-apple-ink outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100 font-mono resize-y" />
                </div>
                {t.variables?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-apple-ink-muted-48 mb-1.5">Available variables:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {t.variables.map((v) => (
                        <code key={v} className="rounded-md bg-zinc-200 px-2 py-0.5 text-xs text-zinc-700 font-mono">{`{{${v}}}`}</code>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setEditing(null)} className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-apple-ink-muted-80 hover:bg-zinc-100 transition-colors">
                    Cancel
                  </button>
                  <button onClick={() => handleSave(t._id)} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
                    <Save className="h-3.5 w-3.5 inline mr-1" />Save
                  </button>
                </div>
              </div>
            )}

            {/* Preview */}
            {preview === t._id && editing !== t._id && (
              <div className="border-t border-zinc-100">
                <div className="flex items-center gap-2 border-b border-zinc-100 bg-zinc-50 px-5 py-2">
                  <Monitor className="h-3.5 w-3.5 text-apple-ink-muted-48" />
                  <span className="text-xs text-apple-ink-muted-48">Preview</span>
                </div>
                <div className="p-5 max-h-[400px] overflow-y-auto">
                  <div className="rounded-xl border border-zinc-200 bg-white p-6">
                    <div className="text-sm font-medium text-apple-ink mb-3">{t.subject}</div>
                    <div dangerouslySetInnerHTML={{ __html: t.body }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </motion.div>
  );
}

function BrandingTab({ storeId }: { storeId: string }) {
  const { data: branding, isLoading } = useGetEmailBrandingQuery(storeId);
  const [update, { isLoading: saving }] = useUpdateEmailBrandingMutation();
  const [form, setForm] = useState<UpdateEmailBrandingPayload>({});

  useEffect(() => {
    if (branding) {
      setForm({
        logo: branding.logo || "",
        primaryColor: branding.primaryColor || "#0066cc",
        buttonColor: branding.buttonColor || "#0066cc",
        footer: branding.footer || "",
        website: branding.website || "",
        supportEmail: branding.supportEmail || "",
        phone: branding.phone || "",
        address: branding.address || "",
        socialLinks: branding.socialLinks,
      });
    }
  }, [branding]);

  const set = (key: keyof UpdateEmailBrandingPayload, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    try {
      await update({ storeId, data: form }).unwrap();
      toast.success("Email branding saved");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to save branding");
    }
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-[300px]"><Loader2 className="h-6 w-6 animate-spin text-apple-ink-muted-48" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <SectionCard title="Branding" description="Customize the look and feel of your store's emails">
        <div className="grid gap-5 sm:grid-cols-2">
          <InputField label="Logo URL" value={form.logo ?? ""} onChange={(v) => set("logo", v)} placeholder="https://example.com/logo.png" hint="URL to your logo image" />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-apple-ink-muted-80">Primary Color</label>
            <div className="flex gap-3 items-center">
              <input type="color" value={form.primaryColor ?? "#0066cc"} onChange={(e) => set("primaryColor", e.target.value)}
                className="h-10 w-10 rounded-xl border border-zinc-200 cursor-pointer" />
              <input type="text" value={form.primaryColor ?? "#0066cc"} onChange={(e) => set("primaryColor", e.target.value)}
                className="flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-apple-ink outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-apple-ink-muted-80">Button Color</label>
            <div className="flex gap-3 items-center">
              <input type="color" value={form.buttonColor ?? "#0066cc"} onChange={(e) => set("buttonColor", e.target.value)}
                className="h-10 w-10 rounded-xl border border-zinc-200 cursor-pointer" />
              <input type="text" value={form.buttonColor ?? "#0066cc"} onChange={(e) => set("buttonColor", e.target.value)}
                className="flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-apple-ink outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Footer & Contact">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <InputField label="Footer HTML" type="textarea" value={form.footer ?? ""} onChange={(v) => set("footer", v)} placeholder="<p>Footer content here</p>" />
          </div>
          <InputField label="Website URL" value={form.website ?? ""} onChange={(v) => set("website", v)} placeholder="https://yourstore.com" />
          <InputField label="Support Email" type="email" value={form.supportEmail ?? ""} onChange={(v) => set("supportEmail", v)} placeholder="support@yourstore.com" />
          <InputField label="Phone" value={form.phone ?? ""} onChange={(v) => set("phone", v)} placeholder="+1 234 567 890" />
          <InputField label="Address" value={form.address ?? ""} onChange={(v) => set("address", v)} placeholder="123 Store Street" />
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving..." : "Save Branding"}
        </button>
      </div>
    </motion.div>
  );
}

function TestEmailTab({ storeId }: { storeId: string }) {
  const [sendTest, { isLoading: sending }] = useSendTestEmailMutation();
  const [recipient, setRecipient] = useState("");
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSend = async () => {
    if (!recipient) return toast.error("Enter a recipient email");
    setResult(null);
    try {
      const res = await sendTest({ storeId, recipient }).unwrap();
      setResult({ success: true, message: `Test email sent to ${res.recipient}` });
      toast.success("Test email sent!");
    } catch (err: any) {
      const msg = err?.data?.message || "Failed to send test email";
      setResult({ success: false, message: msg });
      toast.error(msg);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <SectionCard title="Send Test Email" description="Send a test email to verify your SMTP configuration is working correctly" icon={Send}>
        <div className="space-y-4">
          <InputField label="Recipient Email" type="email" value={recipient} onChange={setRecipient} placeholder="you@example.com" hint="A test message will be sent to this address" />
          <button onClick={handleSend} disabled={sending || !recipient}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {sending ? "Sending..." : "Send Test Email"}
          </button>
          {result && (
            <div className={`rounded-xl p-4 ${result.success ? "bg-emerald-50 border border-emerald-200" : "bg-red-50 border border-red-200"}`}>
              <div className="flex items-start gap-3">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                )}
                <div>
                  <p className={`text-sm font-medium ${result.success ? "text-emerald-800" : "text-red-800"}`}>
                    {result.success ? "Success" : "Failed"}
                  </p>
                  <p className={`text-xs mt-0.5 ${result.success ? "text-emerald-600" : "text-red-600"}`}>{result.message}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </SectionCard>
    </motion.div>
  );
}

function EmailLogsTab({ storeId }: { storeId: string }) {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const { data, isLoading } = useGetEmailLogsQuery({ storeId, page, limit: 20, status: statusFilter || undefined });

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex items-center gap-3">
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm text-apple-ink outline-none">
          <option value="">All Statuses</option>
          <option value="sent">Sent</option>
          <option value="failed">Failed</option>
          <option value="pending">Pending</option>
          <option value="bounced">Bounced</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[200px]"><Loader2 className="h-6 w-6 animate-spin text-apple-ink-muted-48" /></div>
      ) : !data?.logs?.length ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center">
          <Mail className="mx-auto h-8 w-8 text-apple-ink-muted-48" />
          <p className="mt-2 text-sm text-apple-ink-muted-48">No email logs yet</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-apple-ink-muted-48 uppercase tracking-wider">Recipient</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-apple-ink-muted-48 uppercase tracking-wider">Subject</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-apple-ink-muted-48 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-apple-ink-muted-48 uppercase tracking-wider">Retries</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-apple-ink-muted-48 uppercase tracking-wider">Sent At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {data.logs.map((log) => (
                <tr key={log._id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-apple-ink">{log.recipient}</td>
                  <td className="px-4 py-3 text-sm text-apple-ink-muted-80 max-w-[250px] truncate">{log.subject}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                      log.status === "sent" ? "bg-emerald-100 text-emerald-700" :
                      log.status === "failed" ? "bg-red-100 text-red-700" :
                      log.status === "pending" ? "bg-amber-100 text-amber-700" :
                      "bg-zinc-100 text-zinc-700"
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-apple-ink-muted-48">{log.retries}/{log.maxRetries}</td>
                  <td className="px-4 py-3 text-sm text-apple-ink-muted-48">{log.sentAt ? new Date(log.sentAt).toLocaleString() : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-zinc-100 px-4 py-3">
              <p className="text-xs text-apple-ink-muted-48">{data.total} total logs</p>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
                  className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-apple-ink-muted-80 hover:bg-zinc-50 disabled:opacity-50">
                  Previous
                </button>
                <span className="flex items-center text-xs text-apple-ink-muted-48 px-2">Page {page} of {data.totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))} disabled={page >= data.totalPages}
                  className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-apple-ink-muted-80 hover:bg-zinc-50 disabled:opacity-50">
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
