import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const homepageSliderSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, default: "", trim: true },
    imageUrl: { type: String, required: true, trim: true },
    mobileImageUrl: { type: String, default: "", trim: true },
    buttonText: { type: String, default: "Shop Now", trim: true },
    buttonLink: { type: String, default: "/shop", trim: true },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    overlayColor: { type: String, default: "rgba(15, 23, 42, 0.45)" },
    textAlignment: { type: String, enum: ["left", "center", "right"], default: "left" }
  },
  { timestamps: true }
);

homepageSliderSchema.index({ storeId: 1, sortOrder: 1 });

export type HomepageSliderDocument = InferSchemaType<typeof homepageSliderSchema>;
export const HomepageSliderModel = models.HomepageSlider ?? model("HomepageSlider", homepageSliderSchema);