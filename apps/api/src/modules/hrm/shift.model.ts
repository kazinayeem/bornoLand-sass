import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const shiftSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, default: "", trim: true },
    startTime: { type: String, required: true, default: "09:00" }, // "HH:mm"
    endTime: { type: String, required: true, default: "18:00" },   // "HH:mm"
    breakMinutes: { type: Number, default: 60, min: 0 },
    gracePeriodMinutes: { type: Number, default: 15, min: 0 },
    overtimeThresholdMinutes: { type: Number, default: 60, min: 0 },
    workDays: {
      type: [String],
      default: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
    },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

shiftSchema.index({ storeId: 1, name: 1 });

export type ShiftDocument = InferSchemaType<typeof shiftSchema>;
export const ShiftModel = models.Shift ?? model("Shift", shiftSchema);
