import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const templateSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    category: { type: String, default: "landing-page" },
    previewImage: { type: String },
    blocks: { type: Schema.Types.Mixed, required: true },
    isPublic: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true, collection: "templates" }
);

export type TemplateDocument = InferSchemaType<typeof templateSchema>;

export const TemplateModel = models.Template ?? model("Template", templateSchema);
