"use client";

import { useEffect, useState } from "react";
import { Loader2, MapPin, Save } from "lucide-react";
import { toast } from "sonner";
import {
  useGetStoreContactQuery,
  useUpdateStoreContactMutation,
  type StoreContact,
  type UpdateStoreContactPayload,
} from "@/redux/api/store-contact-api";
import { getMutationErrorMessage } from "@/lib/api/envelope";
import { revalidateStorefrontForStore } from "@/lib/revalidate-storefront-client";
import { useStorePage } from "@/components/store-dashboard/store-page";

import { useLanguage } from "@/providers/language-provider";

type StoreContactTabProps = {
  storeId: string;
  storeSlug: string;
};

const emptySocial = {
  facebook: "",
  instagram: "",
  x: "",
  linkedin: "",
  youtube: "",
  telegram: "",
};

function contactToForm(contact: StoreContact, storeId: string): Omit<StoreContact, "_id" | "createdAt" | "updatedAt"> {
  return {
    storeId,
    businessName: contact.businessName ?? "",
    email: contact.email ?? "",
    phone: contact.phone ?? "",
    whatsapp: contact.whatsapp ?? "",
    address: contact.address ?? "",
    city: contact.city ?? "",
    country: contact.country ?? "",
    postalCode: contact.postalCode ?? "",
    googleMapsEmbedUrl: contact.googleMapsEmbedUrl ?? "",
    latitude: contact.latitude ?? "",
    longitude: contact.longitude ?? "",
    businessHours: contact.businessHours ?? "",
    socialLinks: { ...emptySocial, ...(contact.socialLinks ?? {}) },
  };
}

function formToPayload(form: Omit<StoreContact, "_id" | "createdAt" | "updatedAt">): UpdateStoreContactPayload {
  const { socialLinks, ...fields } = form;
  return { ...fields, socialLinks };
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  multiline?: boolean;
}) {
  const inputClass =
    "mt-1.5 w-full rounded-apple-lg border border-apple-hairline bg-apple-canvas px-4 py-2.5 text-body text-apple-ink placeholder:text-apple-ink-muted-48 focus:outline-none focus:ring-2 focus:ring-apple-primary/20";

  return (
    <label className="block">
      <span className="text-caption font-medium text-apple-ink-muted-48">{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          placeholder={placeholder}
          className={inputClass}
        />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputClass} />
      )}
    </label>
  );
}

export function StoreContactTab({ storeId }: StoreContactTabProps) {
  const { language, t } = useLanguage();
  const isBn = language === "bn";
  const { store } = useStorePage();
  const { data: contact, isLoading } = useGetStoreContactQuery(storeId);
  const [updateContact] = useUpdateStoreContactMutation();

  const [form, setForm] = useState<Omit<StoreContact, "_id" | "createdAt" | "updatedAt">>({
    storeId,
    businessName: "",
    email: "",
    phone: "",
    whatsapp: "",
    address: "",
    city: "",
    country: "",
    postalCode: "",
    googleMapsEmbedUrl: "",
    latitude: "",
    longitude: "",
    businessHours: "",
    socialLinks: { ...emptySocial },
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!contact) return;
    setForm(contactToForm(contact, storeId));
  }, [contact, storeId]);

  const setField = (key: keyof Omit<typeof form, "socialLinks" | "storeId">, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const setSocial = (key: keyof typeof emptySocial, value: string) => {
    setForm((prev) => ({ ...prev, socialLinks: { ...prev.socialLinks, [key]: value } }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const saved = await updateContact({ storeId, data: formToPayload(form) }).unwrap();
      setForm(contactToForm(saved, storeId));
      toast.success(isBn ? "যোগাযোগের তথ্য সফলভাবে সংরক্ষণ করা হয়েছে" : "Contact information saved");

      if (store) {
        try {
          await revalidateStorefrontForStore(store, { scope: "cms" });
        } catch {
          toast.warning(isBn ? "সংরক্ষিত হয়েছে, পাবলিক পেজ রিফ্রেশ হতে সামান্য সময় লাগতে পারে।" : "Saved, but the public contact page may take a moment to refresh.");
        }
      }
    } catch (error) {
      toast.error(getMutationErrorMessage(error, isBn ? "যোগাযোগের তথ্য সংরক্ষণ করা যায়নি" : "Failed to save contact information"));
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-apple-ink-muted-48" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-apple-lg border border-apple-hairline bg-apple-canvas p-6">
        <div className="mb-6 flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-apple-md bg-apple-primary/10 text-apple-primary">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-body-strong text-apple-ink">{t.settings.contact.title}</h2>
            <p className="mt-1 text-caption text-apple-ink-muted-48">
              {t.settings.contact.subtitle}
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={isBn ? "ব্যবসার নাম" : "Business name"} value={form.businessName} onChange={(v) => setField("businessName", v)} placeholder={isBn ? "আপনার স্টোরের নাম" : "Your store name"} />
          <Field label={t.settings.contact.email} value={form.email} onChange={(v) => setField("email", v)} type="email" placeholder="hello@yourstore.com" />
          <Field label={t.settings.contact.phone} value={form.phone} onChange={(v) => setField("phone", v)} placeholder="+880 1700 000000" />
          <Field label="WhatsApp" value={form.whatsapp} onChange={(v) => setField("whatsapp", v)} placeholder="+880 1700 000000" />
          <div className="sm:col-span-2">
            <Field label={t.settings.contact.address} value={form.address} onChange={(v) => setField("address", v)} placeholder={isBn ? "ধানমন্ডি, ঢাকা, বাংলাদেশ" : "123 Main Street"} />
          </div>
          <Field label={isBn ? "শহর" : "City"} value={form.city} onChange={(v) => setField("city", v)} placeholder={isBn ? "ঢাকা" : "Dhaka"} />
          <Field label={isBn ? "দেশ" : "Country"} value={form.country} onChange={(v) => setField("country", v)} placeholder={isBn ? "বাংলাদেশ" : "Bangladesh"} />
          <Field label={isBn ? "পোস্টাল কোড" : "Postal code"} value={form.postalCode} onChange={(v) => setField("postalCode", v)} placeholder="1205" />
          <Field label={isBn ? "গুগল ম্যাপস এমবেড URL" : "Google Maps embed URL"} value={form.googleMapsEmbedUrl} onChange={(v) => setField("googleMapsEmbedUrl", v)} placeholder="https://www.google.com/maps/embed?..." />
          <Field label={isBn ? "অক্ষাংশ (Latitude)" : "Latitude"} value={form.latitude} onChange={(v) => setField("latitude", v)} />
          <Field label={isBn ? "দ্রাঘিমাংশ (Longitude)" : "Longitude"} value={form.longitude} onChange={(v) => setField("longitude", v)} />
          <div className="sm:col-span-2">
            <Field
              label={t.settings.contact.businessHours}
              value={form.businessHours}
              onChange={(v) => setField("businessHours", v)}
              multiline
              placeholder={isBn ? "সোম–শুক্র: সকাল ৯:০০ – সন্ধ্যা ৬:০০\nশনি: সকাল ১০:০০ – বিকেল ৪:০০\nরবি: বন্ধ" : "Mon–Fri: 9:00 AM – 6:00 PM\nSat: 10:00 AM – 4:00 PM\nSun: Closed"}
            />
          </div>
        </div>
      </div>

      <div className="rounded-apple-lg border border-apple-hairline bg-apple-canvas p-6">
        <h3 className="text-body-strong text-apple-ink">{isBn ? "সোশ্যাল লিংক" : "Social links"}</h3>
        <p className="mt-1 text-caption text-apple-ink-muted-48">{isBn ? "আপনার যোগাযোগের পেজে লিংকগুলো প্রদর্শন করা হবে।" : "Shown on your contact page when filled in."}</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Facebook" value={form.socialLinks.facebook ?? ""} onChange={(v) => setSocial("facebook", v)} placeholder="https://facebook.com/..." />
          <Field label="Instagram" value={form.socialLinks.instagram ?? ""} onChange={(v) => setSocial("instagram", v)} placeholder="https://instagram.com/..." />
          <Field label="X (Twitter)" value={form.socialLinks.x ?? ""} onChange={(v) => setSocial("x", v)} placeholder="https://x.com/..." />
          <Field label="LinkedIn" value={form.socialLinks.linkedin ?? ""} onChange={(v) => setSocial("linkedin", v)} placeholder="https://linkedin.com/..." />
          <Field label="YouTube" value={form.socialLinks.youtube ?? ""} onChange={(v) => setSocial("youtube", v)} placeholder="https://youtube.com/..." />
          <Field label="Telegram" value={form.socialLinks.telegram ?? ""} onChange={(v) => setSocial("telegram", v)} placeholder="https://t.me/..." />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving}
          className="btn-press inline-flex items-center gap-2 rounded-apple-pill bg-apple-primary px-6 py-2.5 text-body font-medium text-apple-on-primary disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {t.common.save}
        </button>
      </div>
    </div>
  );
}
