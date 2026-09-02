import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const leaveRequestSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    employeeId: { type: Schema.Types.ObjectId, ref: "Employee", required: true, index: true },

    leaveType: {
      type: String,
      enum: ["casual", "sick", "annual", "maternity", "paternity", "unpaid", "custom"],
      default: "casual",
      required: true,
    },
    startDate: { type: String, required: true }, // "YYYY-MM-DD"
    endDate: { type: String, required: true },   // "YYYY-MM-DD"
    daysCount: { type: Number, required: true, min: 0.5 },
    reason: { type: String, required: true },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
      index: true,
    },
    approvedBy: { type: String, default: "" },
    approvedById: { type: Schema.Types.ObjectId, default: null },
    approvedAt: { type: Date, default: null },
    managerRemarks: { type: String, default: "" },
  },
  { timestamps: true }
);

leaveRequestSchema.index({ storeId: 1, employeeId: 1, status: 1 });
leaveRequestSchema.index({ storeId: 1, createdAt: -1 });

export type LeaveRequestDocument = InferSchemaType<typeof leaveRequestSchema>;
export const LeaveRequestModel = models.LeaveRequest ?? model("LeaveRequest", leaveRequestSchema);
