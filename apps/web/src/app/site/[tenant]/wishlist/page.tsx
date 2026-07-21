"use client";

import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/redux/store";
import { removeFromWishlist } from "@/redux/slices/wishlist-slice";
import { Heart, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import {
  StorefrontPage,
  StorefrontPageHeader,
  StorefrontEmptyState,
  StorefrontButtonLink,
  useStorefrontSurface,
} from "@/components/storefront/storefront-ui";
import { formatCurrency } from "@/lib/format-currency";
import { useTenant } from "@/providers/tenant-provider";
import { SmartImage } from "@/components/ui/smart-image";
import { StoreLink as Link } from "@/components/storefront/store-link";
import { cn } from "@/lib/utils";

export default function WishlistPage() {
  const dispatch = useDispatch();
  const items = useSelector((s: RootState) => s.wishlist.items);
  const { settings } = useTenant();
  const { classes, primaryColor } = useStorefrontSurface();
  const currency = settings?.currencyCode ?? "USD";

  if (items.length === 0) {
    return (
      <StorefrontPage>
        <StorefrontEmptyState
          icon={<Heart className="h-12 w-12" />}
          title="Your wishlist is empty"
          description="Save products you love and find them here later."
          action={<StorefrontButtonLink href="/shop">Browse shop</StorefrontButtonLink>}
        />
      </StorefrontPage>
    );
  }

  return (
    <StorefrontPage parchment>
      <StorefrontPageHeader
        title="Wishlist"
        description={`${items.length} saved ${items.length === 1 ? "item" : "items"}`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <motion.div
            key={item.productId}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className={cn("overflow-hidden", classes.card)}
          >
            <Link href={`/products/${item.productId}`} className="block">
              <div className={cn("relative aspect-square", classes.imageWell)}>
                {item.image ? (
                  <SmartImage src={item.image} alt={item.name} fill className="object-cover" sizes="(max-width:768px) 50vw, 33vw" />
                ) : null}
              </div>
            </Link>
            <div className="flex items-start justify-between gap-3 p-4">
              <div className="min-w-0">
                <Link href={`/products/${item.productId}`} className={cn("line-clamp-2 text-body-strong", classes.heading)}>
                  {item.name}
                </Link>
                <p className="mt-1 text-caption" style={{ color: primaryColor }}>
                  {formatCurrency(item.price, currency)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => dispatch(removeFromWishlist(item.productId))}
                className={cn("flex h-10 w-10 shrink-0 items-center justify-center", classes.iconBtn)}
                aria-label={`Remove ${item.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </StorefrontPage>
  );
}
