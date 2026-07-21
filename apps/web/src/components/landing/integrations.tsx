"use client";

import { motion } from "framer-motion";
import { CreditCard, Truck, Mail } from "lucide-react";
import { SectionHeading } from "./section-heading";

const integrations = [
  {
    category: "Payment Gateways",
    icon: CreditCard,
    items: ["bKash", "Nagad", "Rocket", "Stripe", "SSLCommerz", "PayPal"],
  },
  {
    category: "Delivery Partners",
    icon: Truck,
    items: ["Pathao", "SteadFast", "RedX", "Paperfly"],
  },
  {
    category: "Email & Marketing",
    icon: Mail,
    items: ["Resend", "Mailchimp", "Brevo"],
  },
];

export function Integrations() {
  return (
    <section className="relative px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Integrations"
          title="Connect Your Favorite Tools"
          description="BornoLand integrates with leading payment gateways, delivery services, and marketing platforms out of the box."
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 grid gap-5 sm:grid-cols-3"
        >
          {integrations.map((group) => (
            <div key={group.category} className="rounded-lg border border-apple-hairline bg-apple-canvas p-5">
              <div className="mb-4 flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-apple-canvas-parchment">
                  <group.icon className="h-4.5 w-4.5 text-blue-600" />
                </div>
                <h3 className="text-sm font-bold text-apple-ink">{group.category}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="rounded-lg border border-apple-divider-soft bg-apple-canvas-parchment px-3 py-1.5 text-xs font-medium text-apple-ink-muted-80"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
