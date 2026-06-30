"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ImagePlus, Loader2, Palette, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  useDeleteStoreFaviconMutation,
  useDeleteStoreLogoMutation,
  useGetStoreBrandingQuery,
  useUpdateStoreBrandingMutation,
  type StoreBranding,
} from "@/redux/api/store-api";
import { MediaPicker } from "@/components/media/media-picker";
import { StoreBrandMark } from "@/components/store-dashboard/store-brand-mark";
import { selectionMediaId, type MediaSelection } from "@/lib/media-selection";
import { SmartImage } from "@/components/ui/smart-image";
import { revalidateStorefrontForStore } from "@/lib/revalidate-storefront-client";
import { useStorePage } from "@/components/store-dashboard/store-page";

type BrandingTabProps = {
  storeId: string;
  storeSlug: string;
};

function normalizeColor(value: string, fallback: string) {
  const trimmed = value.trim();
  return /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(trimmed) ? trimmed : fallback;
}

export function BrandingTab({ storeId, storeSlug }: BrandingTabProps) {
  const { store } = useStorePage();
  const { data, isLoading } = useGetStoreBrandingQuery(storeId);
  const [updateBranding] = useUpdateStoreBrandingMutation();
  const [deleteLogo] = useDeleteStoreLogoMutation();
  const [deleteFavicon] = useDeleteStoreFaviconMutation();
  const branding = data?.data?.branding;

  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [tagline, setTagline] = useState("");
  const [brandColor, setBrandColor] = useState("#2563eb");
  const [accentColor, setAccentColor] = useState("#0f172a");
  const [logo, setLogo] = useState<MediaSelection | null>(null);
  const [favicon, setFavicon] = useState<MediaSelection | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!branding) return;
    setName(branding.name || "");
    setShortName(branding.shortName || "");
    setTagline(branding.tagline || "");
    setBrandColor(branding.brandColor || "#2563eb");
    setAccentColor(branding.accentColor || "#0f172a");
    setLogo(branding.logoUrl ? { mediaId: branding.logoMediaId ?? undefined, url: branding.logoUrl } : null);
    setFavicon(branding.faviconUrl ? { mediaId: branding.faviconMediaId ?? undefined, url: branding.faviconUrl } : null);
  }, [branding]);

  const billingHref = `/store/${storeSlug}/billing`;
  const previewStore = useMemo(
    () =>
      ({
        name: name || branding?.name || "Store",
        shortName,
        logoUrl: logo?.url || "",
        brandColor,
        accentColor,
      }) as NonNullable<StoreBranding>,
    [name, shortName, logo, brandColor, accentColor, branding]
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateBranding({
        id: storeId,
        data: {
          name,
          shortName,
          tagline,
          logoUrl: logo?.url || "",
          logoMediaId: selectionMediaId(logo) ?? null,
          faviconUrl: favicon?.url || logo?.url || "",
          faviconMediaId: selectionMediaId(favicon) ?? null,
          brandColor: normalizeColor(brandColor, "#2563eb"),
          accentColor: normalizeColor(accentColor, "#0f172a"),
        },
      }).unwrap();
      if (store) {
        await revalidateStorefrontForStore(store, { scope: "theme" });
      }
      toast.success("Branding updated");
    } catch {
      toast.error("Failed to save branding");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLogo = async () => {
    try {
      await deleteLogo(storeId).unwrap();
      setLogo(null);
      toast.success("Logo removed");
    } catch {
      toast.error("Failed to remove logo");
    }
  };

  const handleDeleteFavicon = async () => {
    try {
      await deleteFavicon(storeId).unwrap();
      setFavicon(null);
      toast.success("Favicon removed");
    } catch {
      toast.error("Failed to remove favicon");
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-zinc-400" /></div>;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
              <Palette className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-900">Brand identity</h2>
              <p className="text-sm text-zinc-500">Configure the visual identity for this store dashboard and storefront.</p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-600">Store name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-600">Short name</label>
              <input value={shortName} onChange={(e) => setShortName(e.target.value)} placeholder="NS" className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-zinc-600">Tagline</label>
              <input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Premium home essentials for modern living" className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm" />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-zinc-900">Store logo</h3>
              <p className="text-sm text-zinc-500">PNG, SVG, WEBP, JPG. Recommended 512x512 or wider transparent asset.</p>
            </div>
            {logo?.url && (
              <button type="button" onClick={handleDeleteLogo} className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                <Trash2 className="h-4 w-4" /> Delete Logo
              </button>
            )}
          </div>
          <div className="mt-5 grid gap-6 lg:grid-cols-[220px_1fr]">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-500">Current preview</p>
              <div className="flex flex-col items-start gap-3">
                <StoreBrandMark store={previewStore} size={72} roundedClassName="rounded-2xl" />
                <div>
                  <p className="text-sm font-semibold text-zinc-900">{shortName || name || "Store"}</p>
                  <p className="text-xs text-zinc-500">{tagline || "No tagline set"}</p>
                </div>
              </div>
            </div>
            <MediaPicker
              storeId={storeId}
              billingHref={billingHref}
              folder="branding"
              label="Store logo"
              value={logo}
              onChange={(selection) => setLogo(selection)}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-zinc-900">Browser icon</h3>
              <p className="text-sm text-zinc-500">Used for favicon, browser tab, and PWA-style icon fallback.</p>
            </div>
            {favicon?.url && (
              <button type="button" onClick={handleDeleteFavicon} className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                <Trash2 className="h-4 w-4" /> Delete Favicon
              </button>
            )}
          </div>
          <div className="mt-5 grid gap-6 lg:grid-cols-[220px_1fr]">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-500">Favicon preview</p>
              <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
                {favicon?.url ? <SmartImage src={favicon.url} alt="Favicon" fill sizes="64px" className="object-cover" /> : <StoreBrandMark store={previewStore} size={64} roundedClassName="rounded-2xl" />}
              </div>
              <p className="mt-3 text-xs text-zinc-500">Generated sizes: 16, 32, 64, 128, 256</p>
            </div>
            <MediaPicker
              storeId={storeId}
              billingHref={billingHref}
              folder="branding"
              label="Store favicon"
              value={favicon}
              onChange={(selection) => setFavicon(selection)}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-zinc-900">Brand colors</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-600">Brand color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={brandColor} onChange={(e) => setBrandColor(e.target.value)} className="h-10 w-10 rounded-xl border border-zinc-200 bg-white p-1" />
                <input value={brandColor} onChange={(e) => setBrandColor(e.target.value)} className="h-10 flex-1 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-mono" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-600">Accent color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="h-10 w-10 rounded-xl border border-zinc-200 bg-white p-1" />
                <input value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="h-10 flex-1 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-mono" />
              </div>
            </div>
          </div>
        </section>
      </div>

      <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-zinc-900">Live preview</h3>
          <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200">
            <div className="flex items-center gap-3 px-4 py-3" style={{ background: `linear-gradient(90deg, ${brandColor}, ${accentColor})` }}>
              <StoreBrandMark store={previewStore} size={40} roundedClassName="rounded-xl" />
              <div>
                <p className="text-sm font-semibold text-white">{shortName || name || "Store"}</p>
                <p className="text-xs text-white/80">{tagline || "Your store tagline"}</p>
              </div>
            </div>
            <div className="space-y-3 bg-white p-4">
              <div className="h-3 w-24 rounded" style={{ backgroundColor: brandColor }} />
              <div className="h-3 w-full rounded bg-zinc-100" />
              <div className="h-9 rounded-xl text-white" style={{ backgroundColor: accentColor }} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-600" />
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">Branding notes</h3>
              <ul className="mt-2 space-y-1 text-xs text-zinc-500">
                <li>Use transparent PNG or SVG for best dashboard rendering.</li>
                <li>Use a square image for favicon and browser icon consistency.</li>
                <li>Changes update navbar, sidebar, switcher, and favicon immediately.</li>
              </ul>
            </div>
          </div>
        </div>

        <button onClick={handleSave} disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          Save Branding
        </button>
      </aside>
    </div>
  );
}
