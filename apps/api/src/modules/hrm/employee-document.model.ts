import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

export const EMPLOYEE_DOCUMENT_TYPES = [
  "appointment_letter",
  "contract",
  "certificate",
  "id_proof",
  "payslip",
  "tax_document",
  "resume",
  "other",
] as const;

export type EmployeeDocumentType = (typeof EMPLOYEE_DOCUMENT_TYPES)[number];

const employeeDocumentSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    employeeId: { type: Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },

    title: { type: String, required: true, trim: true },
    documentType: {
      type: String,
      enum: EMPLOYEE_DOCUMENT_TYPES,
      default: "other",
      index: true,
    },

    fileUrl: { type: String, required: true },
    fileName: { type: String, default: "" },
    fileSize: { type: Number, default: 0 },
    mimeType: { type: String, default: "application/octet-stream" },

    uploadedBy: {
      type: String,
      enum: ["employee", "hr_admin"],
      default: "hr_admin",
    },
    uploadedById: { type: Schema.Types.ObjectId, ref: "User", default: null },

    description: { type: String, default: "" },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

employeeDocumentSchema.index({ storeId: 1, employeeId: 1, createdAt: -1 });

export type EmployeeDocumentRecord = InferSchemaType<typeof employeeDocumentSchema>;
export const EmployeeDocumentModel =
  models.EmployeeDocument ?? model("EmployeeDocument", employeeDocumentSchema);
