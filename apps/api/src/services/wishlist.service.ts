import { connectDatabase } from "../config/database.js";
import { WishlistModel } from "../models/wishlist.model.js";

export async function getWishlist(storeId: string, customerId?: string, sessionId?: string) {
  await connectDatabase();

  let wishlist;
  if (customerId) {
    wishlist = await WishlistModel.findOne({ storeId, customerId }).lean() as any;
  } else if (sessionId) {
    wishlist = await WishlistModel.findOne({ storeId, sessionId }).lean() as any;
  }

  if (!wishlist) return { ok: true as const, data: { items: [] } };
  return { ok: true as const, data: { items: wishlist.items } };
}

export async function toggleWishlistItem(
  storeId: string,
  productId: string,
  payload: { name: string; price: number; image: string },
  customerId?: string,
  sessionId?: string
) {
  await connectDatabase();

  const identifier = customerId ? { customerId } : { sessionId };
  let wishlist = await WishlistModel.findOne({ storeId, ...identifier });

  if (!wishlist) {
    wishlist = await WishlistModel.create({ storeId, ...identifier, items: [] });
  }

  const existingIdx = wishlist.items.findIndex((i) => i.productId.toString() === productId);
  if (existingIdx >= 0) {
    wishlist.items.splice(existingIdx, 1);
    await wishlist.save();
    return { ok: true as const, data: { items: wishlist.items }, message: "Removed from wishlist" };
  } else {
    wishlist.items.push({ productId: productId as any, ...payload });
    await wishlist.save();
    return { ok: true as const, data: { items: wishlist.items }, message: "Added to wishlist" };
  }
}
