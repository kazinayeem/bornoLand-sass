"use client";

import { useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useGetStoreContactQuery } from "@/redux/api/store-contact-api";
import { Field, SectionBlock, TextField } from "./shared";
import {
  buildMapsEmbedFromAddress,
  buildMapsEmbedFromCoords,
  isGoogleMapsEmbed,
  type SectionEditorProps,
} from "./types";

export function ContactEditor({
  section,
  storeId,
  onPropChange,
}: SectionEditorProps) {
  const p = section.props;
  const { data: contact, isFetching, refetch } = useGetStoreContactQuery(storeId);

  const syncFromCms = () => {
    if (!contact) {
      toast.error("Store contact not found");
      return;
    }
    onPropChange("businessName", contact.businessName || "");
    onPropChange("phone", contact.phone || contact.whatsapp || "");
    onPropChange("email", contact.email || "");
    onPropChange("address", [contact.address, contact.city, contact.country].filter(Boolean).join(", "));
    onPropChange("businessHours", contact.businessHours || "");
    onPropChange("mapEmbed", contact.googleMapsEmbedUrl || "");
    onPropChange("latitude", contact.latitude || "");
    onPropChange("longitude", contact.longitude || "");
    onPropChange("facebook", contact.socialLinks?.facebook || "");
    onPropChange("instagram", contact.socialLinks?.instagram || "");
    onPropChange("x", contact.socialLinks?.x || "");
    toast.success("Synced from CMS Contact");
  };

  return (
    <div>
      <SectionBlock title="Store contact">
        <button
          type="button"
          onClick={() => { void refetch().then(syncFromCms); }}
          disabled={isFetching}
          className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-apple-hairline text-[12px] font-medium text-apple-ink hover:bg-apple-canvas-parchment disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
          Sync from CMS Contact
        </button>
        <Field label="Business name">
          <TextField value={p.businessName ?? ""} onChange={(v) => onPropChange("businessName", v)} />
        </Field>
        <Field label="Phone">
          <TextField value={p.phone ?? ""} onChange={(v) => onPropChange("phone", v)} placeholder="+880..." />
        </Field>
        <Field label="Email">
          <TextField value={p.email ?? ""} onChange={(v) => onPropChange("email", v)} placeholder="hello@store.com" />
        </Field>
        <Field label="Address">
          <TextField value={p.address ?? ""} onChange={(v) => onPropChange("address", v)} multiline />
        </Field>
        <Field label="Working hours">
          <TextField value={p.businessHours ?? ""} onChange={(v) => onPropChange("businessHours", v)} placeholder="Mon–Fri 9am–6pm" multiline />
        </Field>
      </SectionBlock>

      <SectionBlock title="Social links">
        <Field label="Facebook"><TextField value={p.facebook ?? ""} onChange={(v) => onPropChange("facebook", v)} placeholder="https://facebook.com/..." /></Field>
        <Field label="Instagram"><TextField value={p.instagram ?? ""} onChange={(v) => onPropChange("instagram", v)} placeholder="https://instagram.com/..." /></Field>
        <Field label="X / Twitter"><TextField value={p.x ?? ""} onChange={(v) => onPropChange("x", v)} placeholder="https://x.com/..." /></Field>
      </SectionBlock>

      <GoogleMapFields
        mapEmbed={p.mapEmbed ?? ""}
        address={p.address ?? ""}
        latitude={p.latitude ?? ""}
        longitude={p.longitude ?? ""}
        onChange={(key, value) => onPropChange(key, value)}
      />
    </div>
  );
}

export function GoogleMapEditor({
  section,
  onPropChange,
}: SectionEditorProps) {
  const p = section.props;
  return (
    <div>
      <SectionBlock title="Map">
        <Field label="Title">
          <TextField value={p.title ?? ""} onChange={(v) => onPropChange("title", v)} placeholder="Find us" />
        </Field>
      </SectionBlock>
      <GoogleMapFields
        mapEmbed={p.mapEmbed || p.embedUrl || ""}
        address={p.address ?? ""}
        latitude={p.latitude ?? ""}
        longitude={p.longitude ?? ""}
        onChange={onPropChange}
      />
    </div>
  );
}

function GoogleMapFields({
  mapEmbed,
  address,
  latitude,
  longitude,
  onChange,
}: {
  mapEmbed: string;
  address: string;
  latitude: string;
  longitude: string;
  onChange: (key: string, value: string) => void;
}) {
  const [mode, setMode] = useState<"address" | "embed" | "coords">(
    mapEmbed ? "embed" : latitude && longitude ? "coords" : "address",
  );

  const resolvedEmbed = useMemo(() => {
    if (mode === "embed" && mapEmbed) return mapEmbed;
    if (mode === "coords" && latitude && longitude) return buildMapsEmbedFromCoords(latitude, longitude);
    if (mode === "address" && address.trim()) return buildMapsEmbedFromAddress(address);
    if (mapEmbed) return mapEmbed;
    return "";
  }, [mode, mapEmbed, address, latitude, longitude]);

  const embedError = mode === "embed" && mapEmbed && !isGoogleMapsEmbed(mapEmbed)
    ? "Paste a valid Google Maps embed URL"
    : undefined;

  const setAddress = (value: string) => {
    onChange("address", value);
    if (value.trim()) onChange("mapEmbed", buildMapsEmbedFromAddress(value));
  };

  const setLat = (value: string) => {
    onChange("latitude", value);
    if (value && longitude) onChange("mapEmbed", buildMapsEmbedFromCoords(value, longitude));
  };

  const setLng = (value: string) => {
    onChange("longitude", value);
    if (latitude && value) onChange("mapEmbed", buildMapsEmbedFromCoords(latitude, value));
  };

  return (
    <SectionBlock title="Google Map">
      <div className="flex gap-1 rounded-lg border border-apple-hairline p-1">
        {([
          ["address", "Address"],
          ["embed", "Embed URL"],
          ["coords", "Lat / Lng"],
        ] as const).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setMode(id)}
            className={`flex-1 rounded-md px-2 py-1.5 text-[11px] font-medium ${mode === id ? "bg-apple-ink text-white" : "text-apple-ink-muted-80 hover:bg-apple-canvas-parchment"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === "address" && (
        <Field label="Business address" hint="Map preview updates as you type">
          <TextField value={address} onChange={setAddress} multiline placeholder="123 Main St, City" />
        </Field>
      )}
      {mode === "embed" && (
        <Field label="Google Maps embed URL" error={embedError}>
          <TextField value={mapEmbed} onChange={(v) => onChange("mapEmbed", v)} placeholder="https://www.google.com/maps/embed?..." multiline />
        </Field>
      )}
      {mode === "coords" && (
        <div className="grid grid-cols-2 gap-2">
          <Field label="Latitude">
            <TextField value={latitude} onChange={setLat} placeholder="23.8103" />
          </Field>
          <Field label="Longitude">
            <TextField value={longitude} onChange={setLng} placeholder="90.4125" />
          </Field>
        </div>
      )}

      {resolvedEmbed && !embedError ? (
        <div className="overflow-hidden rounded-xl border border-apple-hairline">
          <iframe title="Map preview" src={resolvedEmbed} className="h-48 w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        </div>
      ) : (
        <p className="text-[11px] text-apple-ink-muted-48">Add an address, embed URL, or coordinates to preview the map.</p>
      )}
    </SectionBlock>
  );
}
