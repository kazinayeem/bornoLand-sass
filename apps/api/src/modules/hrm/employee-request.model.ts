import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

export const EMPLOYEE_REQUEST_TYPES = [
  "bank_account_change",
  "attendance_correction",
  "profile_update",
  "document_request",
  "general_hr",
] as const;

export type EmployeeRequestType = (typeof EMPLOYEE_REQUEST_TYPES)[number];

export const EMPLOYEE_REQUEST_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "cancelled",
] as const;

export type EmployeeRequestStatus = (typeof EMPLOYEE_REQUEST_STATUSES)[number];

const employeeRequestSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    employeeId: { type: Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

    type: {
      type: String,
      enum: EMPLOYEE_REQUEST_TYPES,
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },

    // Holds payload like proposed bank info, proposed clock times for attendance, or profile fields
    data: { type: Schema.Types.Mixed, default: {} },

    status: {
      type: String,
      enum: EMPLOYEE_REQUEST_STATUSES,
      default: "pending",
      index: true,
    },

    reviewedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    reviewerName: { type: String, default: "" },
    reviewedAt: { type: Date, default: null },
    reviewNote: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

employeeRequestSchema.index({ storeId: 1, employeeId: 1, createdAt: -1 });
employeeRequestSchema.index({ storeId: 1, status: 1, createdAt: -1 });

export type EmployeeRequestDocument = InferSchemaType<typeof employeeRequestSchema>;
export const EmployeeRequestModel =
  models.EmployeeRequest ?? model("EmployeeRequest", employeeRequestSchema);
