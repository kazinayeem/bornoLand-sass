"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { Heart, Trash2, ShoppingBag } from "lucide-react";

import { CustomerAccountShell } from "@/components/storefront/customer-account-shell";
import { SmartImage } from "@/components/ui/smart-image";
import { StoreLink as Link } from "@/components/storefront/store-link";
import {
  StorefrontEmptyState,
  StorefrontButtonLink,
  useStorefrontSurface,
} from "@/components/storefront/storefront-ui";
import { formatCurrency } from "@/lib/format-currency";
import { cn } from "@/lib/utils";
import { useTenant } from "@/providers/tenant-provider";

import { removeFromWishlist } from "@/redux/slices/wishlist-slice";
import { addToCart, type CartItem } from "@/redux/slices/cart-slice";
import type { RootState } from "@/redux/store";
import { useRouter, usePathname } from "next/navigation";
import { resolveStoreHref } from "@/lib/store-href";

export default function WishlistAccountPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname() || "";
  const items = useSelector((s: RootState) => s.wishlist.items);
  const { settings } = useTenant();
  const { classes, primaryColor } = useStorefrontSurface();
  const currency = settings?.currencyCode ?? "USD";

  if (items.length === 0) {
    return (
      <CustomerAccountShell>
        <div className="space-y-4">
          <StorefrontEmptyState
            icon={<Heart className="h-12 w-12" />}
            title="Your wishlist is empty"
            description="Save products you love and move them to your cart later."
            action={<StorefrontButtonLink href="/shop">Browse shop</StorefrontButtonLink>}
          />
        </div>
      </CustomerAccountShell>
    );
  }

  return (
    <CustomerAccountShell>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Wishlist</h1>
          <p className="mt-1 text-sm" style={{ color: "#6B7280" }}>
            Move saved items to your cart.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, idx) => (
            <motion.div
              key={item.productId}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className={cn("overflow-hidden", classes.card)}
            >
              <Link href={`/products/${item.productId}`} className="block">
                <div className={cn("relative aspect-square", classes.imageWell)}>
                  {item.image ? (
                    <SmartImage
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="(max-width:768px) 50vw, 33vw"
                    />
                  ) : null}
                </div>
              </Link>

              <div className="flex items-start justify-between gap-3 p-4">
                <div className="min-w-0 flex-1">
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

              <div className="px-4 pb-4">
                <button
                  type="button"
                  className="w-full rounded-xl bg-zinc-900 px-4 py-2 text-xs font-medium text-white transition-all hover:opacity-90 inline-flex items-center justify-center gap-2"
                  onClick={() => {
                    dispatch(
                      addToCart({
                        productId: item.productId,
                        quantity: 1,
                        name: item.name,
                        price: item.price,
                        image: item.image,
                      } as CartItem),
                    );
                    toast.success("Added to cart");
                    router.push(resolveStoreHref("/cart", pathname));
                  }}
                >
                  <ShoppingBag className="h-4 w-4" /> Add to cart
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </CustomerAccountShell>
  );
}
