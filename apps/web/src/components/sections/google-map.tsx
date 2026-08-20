"use client";

import { useState } from "react";
import { SectionWrapper, SectionTitle, type SectionData } from "./section-renderer";
import { buildMapsEmbedFromAddress, buildMapsEmbedFromCoords } from "@/lib/builder-media-urls";
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2 } from "lucide-react";

export function GoogleMapSection({ section }: { section: SectionData }) {
  const p = section.props;
  const embed =
    p.mapEmbed
    || p.embedUrl
    || (p.latitude && p.longitude ? buildMapsEmbedFromCoords(p.latitude, p.longitude) : "")
    || (p.address ? buildMapsEmbedFromAddress(p.address) : "");

  return (
    <SectionWrapper section={section}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <SectionTitle title={p.title || "Find Us"} textColor={p.textColor} textAlignment={p.textAlignment} />
        {embed ? (
          <div className="overflow-hidden rounded-3xl border border-zinc-200/80 shadow-lg shadow-zinc-900/5">
            <iframe
              title={p.title || "Store location"}
              src={embed}
              className="h-[380px] w-full border-0 md:h-[480px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center rounded-3xl border border-dashed border-zinc-200 text-sm text-zinc-400 bg-zinc-50">
            Add a store address or embed URL in settings
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}

export function ContactSection({ section }: { section: SectionData }) {
  const p = section.props;
  const [sent, setSent] = useState(false);
  const embed =
    p.mapEmbed
    || (p.latitude && p.longitude ? buildMapsEmbedFromCoords(p.latitude, p.longitude) : "")
    || (p.address ? buildMapsEmbedFromAddress(p.address) : "");

  const items = [
    { icon: Phone, label: "Phone", value: p.phone || "+880 1700-000000" },
    { icon: Mail, label: "Email", value: p.email || "support@store.com" },
    { icon: MapPin, label: "Address", value: p.address || "Dhaka, Bangladesh" },
    { icon: Clock, label: "Hours", value: p.businessHours || "Mon - Sat: 9:00 AM - 8:00 PM" },
  ];

  return (
    <SectionWrapper section={section}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left: Contact Info & Form */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">Get in Touch</span>
              <h2 className="mt-1 text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 leading-tight">
                {p.title || "Let's Start a Conversation"}
              </h2>
              <p className="mt-2 text-sm sm:text-base text-zinc-600 leading-relaxed">
                Have a question about our products or need assistance? Fill out the form or reach us directly.
              </p>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 rounded-2xl border border-zinc-200/80 bg-zinc-50/60 p-4 shadow-sm"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-600">{item.label}</span>
                    <p className="text-xs sm:text-sm font-medium text-zinc-900 truncate mt-0.5">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Contact Form */}
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-zinc-900 mb-4">Send us a direct message</h3>
              {!sent ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSent(true);
                  }}
                  className="space-y-3.5"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Your Name"
                      className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3.5 text-sm text-zinc-900 outline-none focus:border-zinc-900 focus:bg-white"
                    />
                    <input
                      type="email"
                      required
                      placeholder="Your Email"
                      className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3.5 text-sm text-zinc-900 outline-none focus:border-zinc-900 focus:bg-white"
                    />
                  </div>
                  <textarea
                    rows={3}
                    required
                    placeholder="How can we help you today?"
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 p-3.5 text-sm text-zinc-900 outline-none focus:border-zinc-900 focus:bg-white resize-none"
                  />
                  <button
                    type="submit"
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 text-sm font-semibold text-white shadow-md hover:bg-zinc-800 transition-all active:scale-[0.99]"
                  >
                    <span>Send Message</span>
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-2.5 rounded-xl bg-emerald-50 border border-emerald-200/60 p-4 text-emerald-700">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  <span className="text-xs sm:text-sm font-medium">Message sent successfully! We will get back to you shortly.</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Map Embed Container */}
          <div className="lg:col-span-6 h-full">
            {embed ? (
              <div className="h-full min-h-[380px] lg:min-h-[520px] overflow-hidden rounded-3xl border border-zinc-200/80 shadow-lg shadow-zinc-900/5">
                <iframe
                  title="Store Map"
                  src={embed}
                  className="h-full w-full border-0 min-h-[380px] lg:min-h-[520px]"
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="flex h-full min-h-[380px] lg:min-h-[520px] flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-zinc-200 bg-zinc-50 text-zinc-400 p-8 text-center">
                <MapPin className="h-10 w-10 text-zinc-300" />
                <p className="text-sm font-medium text-zinc-600">Location Map</p>
                <span className="text-xs text-zinc-400 max-w-xs">
                  {p.address || "Dhaka, Bangladesh"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}

