import { connectDatabase } from "../config/database.js";
import { StoreModel } from "../models/store.model.js";
import { HomepageSliderModel } from "../models/homepage-slider.model.js";
import { createHomepageSliderSchema, updateHomepageSliderSchema } from "../validators/homepage-slider.validator.js";

export async function listHomepageSliders(storeId: string, userId?: string) {
  await connectDatabase();
  if (userId) {
    const store = await StoreModel.findOne({ _id: storeId, userId }).lean();
    if (!store) return { ok: false as const, message: "Store not found" };
  }
  const sliders = await HomepageSliderModel.find({ storeId }).sort({ sortOrder: 1, createdAt: 1 }).lean();
  return { ok: true as const, data: { sliders } };
}

export async function createHomepageSlider(storeId: string, userId: string, payload: unknown) {
  const parsed = createHomepageSliderSchema.safeParse(payload);
  if (!parsed.success) return { ok: false as const, message: "Invalid slider data" };

  await connectDatabase();
  const store = await StoreModel.findOne({ _id: storeId, userId }).lean();
  if (!store) return { ok: false as const, message: "Store not found" };

  const slider = await HomepageSliderModel.create({ storeId, ...parsed.data });
  return { ok: true as const, data: { slider: slider.toObject() } };
}

export async function updateHomepageSlider(storeId: string, userId: string, sliderId: string, payload: unknown) {
  const parsed = updateHomepageSliderSchema.safeParse(payload);
  if (!parsed.success) return { ok: false as const, message: "Invalid slider data" };

  await connectDatabase();
  const store = await StoreModel.findOne({ _id: storeId, userId }).lean();
  if (!store) return { ok: false as const, message: "Store not found" };

  const slider = await HomepageSliderModel.findOneAndUpdate(
    { _id: sliderId, storeId },
    { $set: parsed.data },
    { new: true }
  ).lean();

  if (!slider) return { ok: false as const, message: "Slider not found" };
  return { ok: true as const, data: { slider } };
}

export async function deleteHomepageSlider(storeId: string, userId: string, sliderId: string) {
  await connectDatabase();
  const store = await StoreModel.findOne({ _id: storeId, userId }).lean();
  if (!store) return { ok: false as const, message: "Store not found" };

  const slider = await HomepageSliderModel.findOneAndDelete({ _id: sliderId, storeId }).lean();
  if (!slider) return { ok: false as const, message: "Slider not found" };
  return { ok: true as const, message: "Slider deleted" };
}