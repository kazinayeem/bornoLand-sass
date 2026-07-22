"use client";

import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { useStorefrontSurface } from "@/components/storefront/storefront-ui";
import { CustomerAddressBook } from "@/components/storefront/customer-address-book";
import { cn } from "@/lib/utils";
import { CustomerAccountShell } from "@/components/storefront/customer-account-shell";

export default function SavedAddressesPage() {
  const { classes } = useStorefrontSurface();

  return (
    <CustomerAccountShell>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div>
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-apple-canvas-parchment text-apple-primary">
            <MapPin className="h-5 w-5" />
          </div>
          <h1 className={cn("text-tagline", classes.heading)}>Saved Addresses</h1>
          <p className={cn("mt-1 text-sm", classes.muted)}>
            Manage up to two delivery addresses for faster checkout.
          </p>
        </div>
        <CustomerAddressBook mode="account" />
      </motion.div>
    </CustomerAccountShell>
  );
}
