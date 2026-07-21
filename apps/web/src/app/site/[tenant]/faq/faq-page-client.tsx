"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle, Loader2 } from "lucide-react";
import { useTenant } from "@/providers/tenant-provider";
import { getApiUrl } from "@/lib/urls";
import {
  StorefrontPage,
  StorefrontPageHeader,
  StorefrontEmptyState,
  useStorefrontSurface,
} from "@/components/storefront/storefront-ui";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

type FaqItem = {
  _id: string;
  question: string;
  answer: string;
  category?: string;
};

export default function FaqPageClient({
  initialFaqs = [],
  introHtml,
}: {
  initialFaqs?: FaqItem[];
  introHtml?: string;
}) {
  const { store } = useTenant();
  const { classes, primaryColor } = useStorefrontSurface();
  const [faqs, setFaqs] = useState<FaqItem[]>(initialFaqs);
  const [loading, setLoading] = useState(initialFaqs.length === 0);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    if (initialFaqs.length > 0 || !store._id) {
      setLoading(false);
      return;
    }
    const apiUrl = getApiUrl();
    if (!apiUrl) return;
    setLoading(true);
    fetch(`${apiUrl}/public/faqs?storeId=${store._id}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data?.faqs)) {
          setFaqs(json.data.faqs);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [store._id, initialFaqs.length]);

  if (loading) {
    return (
      <StorefrontPage maxWidth="md">
        <div className="flex justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: primaryColor }} />
        </div>
      </StorefrontPage>
    );
  }

  return (
    <StorefrontPage maxWidth="md">
      <StorefrontPageHeader title="FAQ" description="Answers to common questions" />

      {introHtml ? (
        <div
          className="storefront-prose prose mb-apple-xl max-w-none"
          dangerouslySetInnerHTML={{ __html: introHtml }}
        />
      ) : null}

      {faqs.length === 0 ? (
        <StorefrontEmptyState
          icon={<HelpCircle className="h-12 w-12" />}
          title="No questions yet"
          description="Check back soon — we’re adding helpful answers."
          className="min-h-[40vh]"
        />
      ) : (
        <div className="space-y-3">
          {faqs.map((faq) => {
            const open = openId === faq._id;
            return (
              <div key={faq._id} className={cn("overflow-hidden", classes.card)}>
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : faq._id)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  aria-expanded={open}
                >
                  <span className={cn("text-body-strong", classes.heading)}>{faq.question}</span>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 shrink-0 transition-transform duration-200",
                      classes.muted,
                      open && "rotate-180",
                    )}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {open ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className={cn("border-t px-5 py-4 text-body", classes.divider, classes.body)}>
                        {faq.answer}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </StorefrontPage>
  );
}
