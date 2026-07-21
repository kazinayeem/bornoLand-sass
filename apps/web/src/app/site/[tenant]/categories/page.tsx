"use client";

import { motion } from "framer-motion";
import { ArrowRight, ImageIcon } from "lucide-react";
import { useTenant } from "@/providers/tenant-provider";
import { StorefrontPage, StorefrontPageHeader, useStorefrontSurface } from "@/components/storefront/storefront-ui";
import { cn } from "@/lib/utils";

export default function CategoriesPage() {
  const { categories, products } = useTenant();
  const { classes, primaryColor } = useStorefrontSurface();

  const displayCategories = categories.filter((c) => c.active);

  const productCount = (catId: string) =>
    products.filter((p) => p.status === "active" && (p.categoryIds ?? []).includes(catId)).length;

  return (
    <StorefrontPage parchment>
      <StorefrontPageHeader title="Categories" description="Browse products by category" className="text-center" />

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {displayCategories.length === 0 ? (
          <div className="col-span-full py-16 text-center">
            <p className={cn("text-caption", classes.muted)}>No categories yet</p>
          </div>
        ) : (
          displayCategories.map((cat, idx) => {
            const count = productCount(cat._id);
            return (
              <motion.a
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={cat._id}
                href={`/category/${cat.slug}`}
                className={cn(
                  "storefront-utility-card group flex flex-col items-center gap-4 p-8 text-center transition-transform duration-300 ease-apple hover:-translate-y-0.5",
                  classes.card
                )}
              >
                <div
                  className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-apple-lg"
                  style={{ backgroundColor: `${primaryColor}12` }}
                >
                  {cat.imageUrl ? (
                    <img src={cat.imageUrl} alt={cat.name} className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-apple-primary" style={{ color: primaryColor }} />
                  )}
                </div>
                <div>
                  <h3 className={cn("text-tagline", classes.heading)}>{cat.name}</h3>
                  <p className={cn("mt-1 text-caption", classes.muted)}>
                    {count} {count === 1 ? "product" : "products"}
                  </p>
                </div>
                {cat.description && (
                  <p className={cn("line-clamp-2 text-fine-print", classes.muted)}>{cat.description}</p>
                )}
                <span
                  className="flex items-center gap-1 text-caption font-medium text-apple-primary transition-all group-hover:gap-2"
                  style={{ color: primaryColor }}
                >
                  Shop Now <ArrowRight className="h-3 w-3" />
                </span>
              </motion.a>
            );
          })
        )}
      </div>
    </StorefrontPage>
  );
}
