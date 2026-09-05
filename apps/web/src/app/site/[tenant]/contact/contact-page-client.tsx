"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Mail, Phone, MapPin, Send, Check, Clock, MessageCircle,
  Facebook, Instagram, Linkedin, Youtube,
} from "lucide-react";
import { toast } from "sonner";
import { useTenant } from "@/providers/tenant-provider";
import type { CmsPageData } from "@/lib/cms-page-types";
import type { StoreContactData } from "@/lib/server/store-contact";
import { getApiUrl } from "@/lib/urls";
import {
  StorefrontPage,
  StorefrontCard,
  StorefrontButton,
  useStorefrontSurface,
} from "@/components/storefront/storefront-ui";
import { useStorefrontTracking } from "@/hooks/use-storefront-tracking";

type CmsPage = CmsPageData;

function formatAddress(contact: StoreContactData) {
  return [contact.address, contact.city, contact.postalCode, contact.country].filter(Boolean).join(", ");
}

function SocialIcon({ platform }: { platform: string }) {
  switch (platform) {
    case "facebook": return <Facebook className="h-4 w-4" />;
    case "instagram": return <Instagram className="h-4 w-4" />;
    case "linkedin": return <Linkedin className="h-4 w-4" />;
    case "youtube": return <Youtube className="h-4 w-4" />;
    default: return <MessageCircle className="h-4 w-4" />;
  }
}

export function ContactPageClient({
  initialPage,
  initialContact,
}: {
  initialPage?: CmsPageData | null;
  initialContact?: StoreContactData | null;
}) {
  const { store } = useTenant();
  const { classes, dark, primaryColor } = useStorefrontSurface();

  const [page, setPage] = useState<CmsPage | null>(initialPage ?? null);
  const [contact, setContact] = useState<StoreContactData | null>(initialContact ?? null);

  useEffect(() => {
    if (!store._id || (initialPage && initialContact)) return;
    const apiUrl = getApiUrl();
    if (!apiUrl) return;

    const load = async () => {
      try {
        const [pageRes, contactRes] = await Promise.all([
          initialPage ? Promise.resolve(null) : fetch(`${apiUrl}/public/page/contact-us?storeId=${store._id}`, { cache: "no-store" }).then((r) => r.json()),
          initialContact ? Promise.resolve(null) : fetch(`${apiUrl}/public/contact?storeId=${store._id}`, { cache: "no-store" }).then((r) => r.json()),
        ]);
        if (pageRes?.success && pageRes.data?.page) setPage(pageRes.data.page);
        if (contactRes?.success && contactRes.data?.contact) setContact(contactRes.data.contact);
      } catch {
        // ignore
      }
    };

    void load();
  }, [store._id, initialPage, initialContact]);

  const { trackLead } = useStorefrontTracking();
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSending(true);
    try {
      const res = await fetch(`${getApiUrl()}/contact/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        trackLead({ formName: "Contact Us", email: form.email, phone: form.phone });
        setSent(true);
        toast.success("Message sent successfully!");
      } else {
        toast.error(data.message || "Failed to send message");
      }
    } catch {
      toast.error("Something went wrong. Try again.");
    } finally {
      setSending(false);
    }
  };

  const displayName = contact?.businessName || store.name;
  const fullAddress = contact ? formatAddress(contact) : "";
  const socialEntries = Object.entries(contact?.socialLinks ?? {}).filter(([, url]) => url?.trim());

  const contactItems = [
    contact?.email ? { icon: Mail, label: "Email", value: contact.email, href: `mailto:${contact.email}` } : null,
    contact?.phone ? { icon: Phone, label: "Phone", value: contact.phone, href: `tel:${contact.phone}` } : null,
    contact?.whatsapp ? { icon: MessageCircle, label: "WhatsApp", value: contact.whatsapp, href: `https://wa.me/${contact.whatsapp.replace(/\D/g, "")}` } : null,
    fullAddress ? { icon: MapPin, label: "Address", value: fullAddress } : null,
    contact?.businessHours ? { icon: Clock, label: "Business hours", value: contact.businessHours } : null,
  ].filter(Boolean) as Array<{ icon: typeof Mail; label: string; value: string; href?: string }>;

  return (
    <StorefrontPage parchment maxWidth="lg">
      <section className="py-16 text-center sm:py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span className={classes.chip + " inline-block px-3 py-1 text-caption font-medium"} style={{ color: primaryColor }}>
            Contact
          </span>
          <h1 className={`mt-4 text-display-md sm:text-display-lg ${classes.heading}`}>
            {page?.title || "Get in Touch"}
          </h1>
          <p className={`mx-auto mt-4 max-w-2xl text-lead ${classes.body}`}>
            Have a question? We&apos;d love to hear from you.
          </p>
        </motion.div>
      </section>

      {page?.html && (
        <section className="mx-auto max-w-3xl px-4 pb-8 sm:px-6">
          <div
            className={`prose max-w-none ${dark ? "prose-invert" : "prose-zinc"}`}
            dangerouslySetInnerHTML={{ __html: page.html }}
          />
        </section>
      )}

      <section className="pb-20">
        <div className="grid gap-10 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className={`text-tagline ${classes.heading}`}>Send us a message</h2>
            <p className={`mt-2 text-caption ${classes.muted}`}>
              Fill out the form and we&apos;ll get back to you soon.
            </p>

            {sent ? (
              <StorefrontCard className="mt-8 p-8 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: `${primaryColor}12` }}>
                  <Check className="h-8 w-8" style={{ color: primaryColor }} />
                </div>
                <h3 className={`mt-4 text-body-strong ${classes.heading}`}>Message sent!</h3>
                <p className={`mt-2 text-caption ${classes.muted}`}>We&apos;ll respond shortly.</p>
              </StorefrontCard>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 space-y-4" aria-label="Contact form">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className={`text-caption font-medium ${classes.muted}`}>Name *</span>
                    <input type="text" value={form.name} onChange={handleChange("name")} required className={classes.input + " mt-1.5"} />
                  </label>
                  <label className="block">
                    <span className={`text-caption font-medium ${classes.muted}`}>Email *</span>
                    <input type="email" value={form.email} onChange={handleChange("email")} required className={classes.input + " mt-1.5"} />
                  </label>
                </div>
                <label className="block">
                  <span className={`text-caption font-medium ${classes.muted}`}>Phone</span>
                  <input type="tel" value={form.phone} onChange={handleChange("phone")} className={classes.input + " mt-1.5"} />
                </label>
                <label className="block">
                  <span className={`text-caption font-medium ${classes.muted}`}>Subject</span>
                  <input type="text" value={form.subject} onChange={handleChange("subject")} className={classes.input + " mt-1.5"} />
                </label>
                <label className="block">
                  <span className={`text-caption font-medium ${classes.muted}`}>Message *</span>
                  <textarea value={form.message} onChange={handleChange("message")} required rows={5} className={classes.input + " mt-1.5 h-auto min-h-[140px] py-3"} />
                </label>
                <StorefrontButton type="submit" disabled={sending} className="w-full">
                  <Send className="h-4 w-4" />
                  {sending ? "Sending…" : "Send message"}
                </StorefrontButton>
              </form>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <StorefrontCard className="p-6">
              <h3 className={`mb-4 text-body-strong ${classes.heading}`}>{displayName}</h3>
              {contactItems.length > 0 ? (
                <div className="space-y-4">
                  {contactItems.map(({ icon: Icon, label, value, href }) => (
                    <div key={label} className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-apple-md" style={{ backgroundColor: `${primaryColor}12` }}>
                        <Icon className="h-4 w-4" style={{ color: primaryColor }} />
                      </div>
                      <div>
                        <p className={`text-caption font-medium ${classes.muted}`}>{label}</p>
                        {href ? (
                          <a href={href} className={`text-body ${classes.link}`}>{value}</a>
                        ) : (
                          <p className={`whitespace-pre-line text-body ${classes.heading}`}>{value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={`text-caption ${classes.muted}`}>Contact details will appear here once configured in your store dashboard.</p>
              )}

              {socialEntries.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2 border-t border-apple-hairline pt-4">
                  {socialEntries.map(([platform, url]) => (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-2 rounded-apple-pill border px-3 py-1.5 text-caption capitalize ${classes.divider} ${classes.heading} hover:opacity-80`}
                    >
                      <SocialIcon platform={platform} />
                      {platform === "x" ? "X" : platform}
                    </a>
                  ))}
                </div>
              )}
            </StorefrontCard>

            {contact?.googleMapsEmbedUrl ? (
              <div className={`aspect-video overflow-hidden rounded-apple-lg border ${classes.divider}`}>
                <iframe
                  title="Store location"
                  src={contact.googleMapsEmbedUrl}
                  className="h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            ) : contact?.latitude && contact?.longitude ? (
              <div className={`aspect-video overflow-hidden rounded-apple-lg border ${classes.divider}`}>
                <iframe
                  title="Store location"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(`${contact.latitude},${contact.longitude}`)}&z=15&output=embed`}
                  className="h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            ) : null}
          </motion.div>
        </div>
      </section>
    </StorefrontPage>
  );
}
