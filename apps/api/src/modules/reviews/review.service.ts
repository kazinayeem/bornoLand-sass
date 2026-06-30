import { connectDatabase } from "../../common/database/connection.js";
import { ReviewModel } from "./review.model.js";
import { z } from "zod";

const createReviewSchema = z.object({
  productId: z.string(),
  rating: z.number().min(1).max(5),
  title: z.string().max(200).optional().default(""),
  body: z.string().max(5000).optional().default(""),
  customerName: z.string().max(200).optional().default(""),
});

export async function listReviews(storeId: string, filters?: { productId?: string; status?: string }) {
  await connectDatabase();
  const query: Record<string, unknown> = { storeId };
  if (filters?.productId) query.productId = filters.productId;
  if (filters?.status) query.status = filters.status;
  const reviews = await ReviewModel.find(query).sort({ createdAt: -1 }).lean();
  return { ok: true as const, data: { reviews } };
}

export async function createReview(storeId: string, payload: unknown, customerId?: string) {
  const parsed = createReviewSchema.safeParse(payload);
  if (!parsed.success) return { ok: false as const, message: "Invalid review data" };
  await connectDatabase();
  const review = await ReviewModel.create({ storeId, customerId, ...parsed.data });
  return { ok: true as const, data: { review: review.toObject() } };
}

export async function updateReviewStatus(storeId: string, reviewId: string, status: string) {
  await connectDatabase();
  const review = await ReviewModel.findOneAndUpdate(
    { _id: reviewId, storeId },
    { $set: { status } },
    { new: true }
  ).lean();
  if (!review) return { ok: false as const, message: "Review not found" };
  return { ok: true as const, data: { review } };
}

export async function deleteReview(storeId: string, reviewId: string) {
  await connectDatabase();
  const review = await ReviewModel.findOneAndDelete({ _id: reviewId, storeId }).lean();
  if (!review) return { ok: false as const, message: "Review not found" };
  return { ok: true as const, message: "Review deleted" };
}
