"use client";

import { SectionWrapper, SectionTitle, type SectionData } from "./section-renderer";
import { buildMapsEmbedFromAddress, buildMapsEmbedFromCoords } from "@/lib/builder-media-urls";

export function GoogleMapSection({ section }: { section: SectionData }) {
  const p = section.props;
  const embed =
    p.mapEmbed
    || p.embedUrl
    || (p.latitude && p.longitude ? buildMapsEmbedFromCoords(p.latitude, p.longitude) : "")
    || (p.address ? buildMapsEmbedFromAddress(p.address) : "");

  return (
    <SectionWrapper section={section}>
      <div className="mx-auto max-w-5xl px-4">
        <SectionTitle title={p.title || ""} textColor={p.textColor} textAlignment={p.textAlignment} />
        {embed ? (
          <div className="overflow-hidden rounded-2xl border border-zinc-200">
            <iframe
              title={p.title || "Store location"}
              src={embed}
              className="h-[360px] w-full border-0 md:h-[420px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="flex h-56 items-center justify-center rounded-2xl border border-dashed border-zinc-200 text-sm text-zinc-400">
            Add a map address or embed URL
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}

export function ContactSection({ section }: { section: SectionData }) {
  const p = section.props;
  const embed =
    p.mapEmbed
    || (p.latitude && p.longitude ? buildMapsEmbedFromCoords(p.latitude, p.longitude) : "")
    || (p.address ? buildMapsEmbedFromAddress(p.address) : "");

  const rows = [
    { label: "Business", value: p.businessName },
    { label: "Phone", value: p.phone },
    { label: "Email", value: p.email },
    { label: "Address", value: p.address },
    { label: "Hours", value: p.businessHours },
  ].filter((row) => row.value);

  return (
    <SectionWrapper section={section}>
      <div className="mx-auto grid max-w-5xl gap-8 px-4 md:grid-cols-2">
        <div>
          <SectionTitle title={p.title || "Contact"} textColor={p.textColor} textAlignment="left" />
          <dl className="mt-4 space-y-3">
            {rows.map((row) => (
              <div key={row.label}>
                <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-400">{row.label}</dt>
                <dd className="mt-1 whitespace-pre-line text-sm text-zinc-800">{row.value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            {p.facebook ? <a href={p.facebook} className="text-blue-600 hover:underline">Facebook</a> : null}
            {p.instagram ? <a href={p.instagram} className="text-blue-600 hover:underline">Instagram</a> : null}
            {p.x ? <a href={p.x} className="text-blue-600 hover:underline">X</a> : null}
          </div>
        </div>
        {embed ? (
          <iframe title="Map" src={embed} className="h-72 w-full rounded-2xl border-0 md:h-full min-h-[280px]" loading="lazy" />
        ) : (
          <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-dashed border-zinc-200 text-sm text-zinc-400">
            Map preview
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}
