import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const optionTemplateSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    options: [
      {
        name: { type: String, required: true },
        values: [{ type: String, required: true }],
        displayType: {
          type: String,
          enum: ["dropdown", "button", "color_swatch", "image_swatch"],
          default: "button",
        },
      },
    ],
    isGlobal: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export type OptionTemplateDocument = InferSchemaType<typeof optionTemplateSchema>;
export const OptionTemplateModel = models.OptionTemplate ?? model("OptionTemplate", optionTemplateSchema);
