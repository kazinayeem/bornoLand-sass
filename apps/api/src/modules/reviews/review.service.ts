import { connectDatabase } from "../../common/database/connection.js";
import { ReviewModel } from "./review.model.js";
import { OrderModel } from "../../models/order.model.js";
import { z } from "zod";
import { parseListQuery, paginatedResponse, buildTextSearchFilter } from "../../common/utils/pagination.js";
import mongoose from "mongoose";

const createReviewSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  orderId: z.string().optional(),
  rating: z.number().min(1).max(5),
  title: z.string().max(200).optional().default(""),
  body: z.string().max(5000).optional().default(""),
  customerName: z.string().max(200).min(1, "Customer name is required"),
  customerEmail: z.string().email().optional().or(z.literal("")),
  imageUrl: z.string().optional(),
  images: z.array(z.string()).optional().default([]),
});

export async function listReviews(storeId: string, query: Record<string, unknown> = {}) {
  await connectDatabase();
  const params = parseListQuery(query);
  const clauses: Record<string, unknown>[] = [{ storeId }];
  
  if (query.productId) clauses.push({ productId: String(query.productId) });
  if (params.status && params.status !== "all") clauses.push({ status: params.status });
  
  const textFilter = buildTextSearchFilter(params.search, ["title", "body", "customerName", "customerEmail"]);
  if (textFilter?.$or) clauses.push({ $or: textFilter.$or });
  
  const filter = clauses.length === 1 ? clauses[0] : { $and: clauses };

  const [reviews, total, pendingCount, approvedCount, rejectedCount, avgStats] = await Promise.all([
    ReviewModel.find(filter).sort(params.sort ?? { createdAt: -1 }).skip(params.skip).limit(params.limit).lean(),
    ReviewModel.countDocuments(filter),
    ReviewModel.countDocuments({ storeId, status: "pending" }),
    ReviewModel.countDocuments({ storeId, status: "approved" }),
    ReviewModel.countDocuments({ storeId, status: "rejected" }),
    ReviewModel.aggregate([
      { $match: { storeId: new mongoose.Types.ObjectId(storeId), status: "approved" } },
      { $group: { _id: null, avgRating: { $avg: "$rating" } } },
    ]),
  ]);

  const paginated = paginatedResponse(reviews, total, params);
  const averageRating = avgStats[0]?.avgRating ? Math.round(avgStats[0].avgRating * 10) / 10 : 0;

  return {
    ok: true as const,
    data: {
      reviews: paginated.data,
      pagination: paginated.pagination,
      total,
      pendingCount,
      approvedCount,
      rejectedCount,
      averageRating,
      page: params.page,
      limit: params.limit,
      totalPages: paginated.pagination.totalPages,
    },
  };
}

export async function getPublicReviews(storeId: string, query: Record<string, unknown> = {}) {
  await connectDatabase();
  const params = parseListQuery(query);
  const clauses: Record<string, unknown>[] = [{ storeId, status: "approved" }];

  if (query.productId) {
    clauses.push({ productId: String(query.productId) });
  }

  const filter = clauses.length === 1 ? clauses[0] : { $and: clauses };

  const [reviews, total, ratingCounts, avgStats] = await Promise.all([
    ReviewModel.find(filter).sort({ createdAt: -1 }).skip(params.skip).limit(params.limit).lean(),
    ReviewModel.countDocuments(filter),
    ReviewModel.aggregate([
      { $match: filter },
      { $group: { _id: "$rating", count: { $sum: 1 } } },
    ]),
    ReviewModel.aggregate([
      { $match: filter },
      { $group: { _id: null, avgRating: { $avg: "$rating" } } },
    ]),
  ]);

  const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  for (const item of ratingCounts) {
    if (item._id >= 1 && item._id <= 5) {
      distribution[item._id] = item.count;
    }
  }

  const averageRating = avgStats[0]?.avgRating ? Math.round(avgStats[0].avgRating * 10) / 10 : 0;

  return {
    ok: true as const,
    data: {
      reviews,
      total,
      averageRating,
      distribution,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(total / (params.limit || 10)),
    },
  };
}

export async function createReview(storeId: string, payload: unknown, customerId?: string) {
  const parsed = createReviewSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false as const, message: parsed.error.issues[0]?.message || "Invalid review data" };
  }

  await connectDatabase();

  let verifiedPurchase = false;
  let verifiedOrderId: string | undefined = undefined;

  // Verify purchase if orderId is provided or by customer lookup
  if (parsed.data.orderId && mongoose.Types.ObjectId.isValid(parsed.data.orderId)) {
    const existingOrder = await OrderModel.findOne({
      _id: parsed.data.orderId,
      storeId,
    }).lean();

    if (existingOrder) {
      const containsProduct = existingOrder.items?.some(
        (item: { productId?: string | mongoose.Types.ObjectId }) =>
          String(item.productId) === String(parsed.data.productId)
      );
      if (containsProduct) {
        verifiedPurchase = true;
        verifiedOrderId = String(existingOrder._id);

        // Check for duplicate review on same order & product
        const duplicate = await ReviewModel.findOne({
          storeId,
          productId: parsed.data.productId,
          orderId: existingOrder._id,
        }).lean();

        if (duplicate) {
          return { ok: false as const, message: "You have already submitted a review for this product from this order." };
        }
      }
    }
  }

  const images = [...(parsed.data.images || [])];
  if (parsed.data.imageUrl && !images.includes(parsed.data.imageUrl)) {
    images.push(parsed.data.imageUrl);
  }

  const review = await ReviewModel.create({
    storeId,
    productId: parsed.data.productId,
    orderId: verifiedOrderId,
    customerId,
    customerName: parsed.data.customerName.trim(),
    customerEmail: parsed.data.customerEmail?.trim() || "",
    rating: parsed.data.rating,
    title: parsed.data.title.trim(),
    body: parsed.data.body.trim(),
    images,
    status: "pending",
    verifiedPurchase,
  });

  return { ok: true as const, data: { review: review.toObject() } };
}

export async function updateReviewStatus(storeId: string, reviewId: string, status: string) {
  if (!["pending", "approved", "rejected"].includes(status)) {
    return { ok: false as const, message: "Invalid status value" };
  }

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
