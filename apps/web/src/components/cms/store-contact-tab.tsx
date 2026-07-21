"use client";

import { useEffect, useState } from "react";
import { Loader2, MapPin, Save } from "lucide-react";
import { toast } from "sonner";
import { useGetStoreContactQuery, useUpdateStoreContactMutation, type StoreContact } from "@/redux/api/store-contact-api";
import { revalidateStorefrontAction } from "@/lib/actions/revalidate-storefront";
import { useStorePage } from "@/components/store-dashboard/store-page";

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

export function StoreContactTab({ storeId, storeSlug }: StoreContactTabProps) {
  const { store } = useStorePage();
  const { data, isLoading } = useGetStoreContactQuery(storeId);
  const [updateContact] = useUpdateStoreContactMutation();
  const contact = data?.data?.contact;

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
    setForm({
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
    });
  }, [contact, storeId]);

  const setField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const setSocial = (key: keyof typeof emptySocial, value: string) => {
    setForm((prev) => ({ ...prev, socialLinks: { ...prev.socialLinks, [key]: value } }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateContact({ storeId, data: form }).unwrap();
      const tenantSlug = store?.subdomain || store?.slug || storeSlug;
      await revalidateStorefrontAction({ tenantSlug, storeId, scope: "cms", cmsSlugs: ["contact-us"] });
      toast.success("Contact information saved");
    } catch {
      toast.error("Failed to save contact information");
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
            <h2 className="text-body-strong text-apple-ink">Contact information</h2>
            <p className="mt-1 text-caption text-apple-ink-muted-48">
              This appears on your public contact page. Changes sync automatically.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Business name" value={form.businessName} onChange={(v) => setField("businessName", v)} placeholder="Your store name" />
          <Field label="Contact email" value={form.email} onChange={(v) => setField("email", v)} type="email" placeholder="hello@yourstore.com" />
          <Field label="Phone" value={form.phone} onChange={(v) => setField("phone", v)} placeholder="+1 555 123 4567" />
          <Field label="WhatsApp" value={form.whatsapp} onChange={(v) => setField("whatsapp", v)} placeholder="+1 555 123 4567" />
          <div className="sm:col-span-2">
            <Field label="Street address" value={form.address} onChange={(v) => setField("address", v)} placeholder="123 Main Street" />
          </div>
          <Field label="City" value={form.city} onChange={(v) => setField("city", v)} />
          <Field label="Country" value={form.country} onChange={(v) => setField("country", v)} />
          <Field label="Postal code" value={form.postalCode} onChange={(v) => setField("postalCode", v)} />
          <Field label="Google Maps embed URL" value={form.googleMapsEmbedUrl} onChange={(v) => setField("googleMapsEmbedUrl", v)} placeholder="https://www.google.com/maps/embed?..." />
          <Field label="Latitude" value={form.latitude} onChange={(v) => setField("latitude", v)} />
          <Field label="Longitude" value={form.longitude} onChange={(v) => setField("longitude", v)} />
          <div className="sm:col-span-2">
            <Field
              label="Business hours"
              value={form.businessHours}
              onChange={(v) => setField("businessHours", v)}
              multiline
              placeholder={"Mon–Fri: 9:00 AM – 6:00 PM\nSat: 10:00 AM – 4:00 PM\nSun: Closed"}
            />
          </div>
        </div>
      </div>

      <div className="rounded-apple-lg border border-apple-hairline bg-apple-canvas p-6">
        <h3 className="text-body-strong text-apple-ink">Social links</h3>
        <p className="mt-1 text-caption text-apple-ink-muted-48">Shown on your contact page when filled in.</p>
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
          Save changes
        </button>
      </div>
    </div>
  );
}
