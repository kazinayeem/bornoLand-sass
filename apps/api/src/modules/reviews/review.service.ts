import { connectDatabase } from "../../common/database/connection.js";
import { ReviewModel } from "./review.model.js";
import { z } from "zod";
import { parseListQuery, paginatedResponse, buildTextSearchFilter } from "../../common/utils/pagination.js";

const createReviewSchema = z.object({
  productId: z.string(),
  rating: z.number().min(1).max(5),
  title: z.string().max(200).optional().default(""),
  body: z.string().max(5000).optional().default(""),
  customerName: z.string().max(200).optional().default(""),
});

export async function listReviews(storeId: string, query: Record<string, unknown> = {}) {
  await connectDatabase();
  const params = parseListQuery(query);
  const clauses: Record<string, unknown>[] = [{ storeId }];
  if (query.productId) clauses.push({ productId: String(query.productId) });
  if (params.status) clauses.push({ status: params.status });
  const textFilter = buildTextSearchFilter(params.search, ["title", "body", "customerName"]);
  if (textFilter?.$or) clauses.push({ $or: textFilter.$or });
  const filter = clauses.length === 1 ? clauses[0] : { $and: clauses };

  const [reviews, total] = await Promise.all([
    ReviewModel.find(filter).sort(params.sort ?? { createdAt: -1 }).skip(params.skip).limit(params.limit).lean(),
    ReviewModel.countDocuments(filter),
  ]);

  const paginated = paginatedResponse(reviews, total, params);
  return {
    ok: true as const,
    data: {
      reviews: paginated.data,
      pagination: paginated.pagination,
      total,
      page: params.page,
      limit: params.limit,
      totalPages: paginated.pagination.totalPages,
    },
  };
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
