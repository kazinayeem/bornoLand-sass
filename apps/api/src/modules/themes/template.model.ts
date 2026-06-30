import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const templateSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    status: { type: String, enum: ["draft", "published"], default: "published" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    theme: {
      primaryColor: { type: String, default: "#2563eb" },
      secondaryColor: { type: String, default: "#0f172a" },
      font: { type: String, default: "Inter" },
      buttonStyle: { type: String, default: "rounded-lg" },
      layoutWidth: { type: String, default: "1200px" },
      darkMode: { type: Boolean, default: false },
      navbarStyle: { type: String, default: "fixed" }
    },
    sections: [{ type: Schema.Types.Mixed }],
    preview: { type: String, default: "" }
  },
  { timestamps: true }
);

export type TemplateDocument = InferSchemaType<typeof templateSchema>;
export const TemplateModel = models.Template ?? model("Template", templateSchema);
