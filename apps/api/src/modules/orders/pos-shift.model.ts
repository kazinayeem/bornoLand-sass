import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const posShiftSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    branchId: { type: Schema.Types.ObjectId, default: null, index: true },
    warehouseId: { type: Schema.Types.ObjectId, ref: "Warehouse", default: null },
    terminalId: { type: String, default: "TERM-01" },

    cashierId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    cashierName: { type: String, required: true },

    openingFloat: { type: Number, required: true, min: 0 },
    expectedClosingCash: { type: Number, default: 0 },
    actualClosingCash: { type: Number, default: null },
    cashDiscrepancy: { type: Number, default: null },

    totalCashSales: { type: Number, default: 0 },
    totalCardSales: { type: Number, default: 0 },
    totalMfsSales: { type: Number, default: 0 },
    totalRefunds: { type: Number, default: 0 },
    totalOrdersCount: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
      index: true,
    },
    openedAt: { type: Date, default: Date.now },
    closedAt: { type: Date, default: null },
    closingNotes: { type: String, default: "" },
  },
  { timestamps: true }
);

posShiftSchema.index({ storeId: 1, cashierId: 1, status: 1 });
posShiftSchema.index({ storeId: 1, createdAt: -1 });

export type PosShiftDocument = InferSchemaType<typeof posShiftSchema>;
export const PosShiftModel = models.PosShift ?? model("PosShift", posShiftSchema);
