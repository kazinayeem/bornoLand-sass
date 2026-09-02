import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const departmentSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, default: "", trim: true },
    description: { type: String, default: "" },
    headOfDepartmentId: { type: Schema.Types.ObjectId, ref: "Employee", default: null },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

departmentSchema.index({ storeId: 1, name: 1 });

export type DepartmentDocument = InferSchemaType<typeof departmentSchema>;
export const DepartmentModel = models.Department ?? model("Department", departmentSchema);

const designationSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    departmentId: { type: Schema.Types.ObjectId, ref: "Department", default: null, index: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, default: "", trim: true },
    description: { type: String, default: "" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

designationSchema.index({ storeId: 1, name: 1 });

export type DesignationDocument = InferSchemaType<typeof designationSchema>;
export const DesignationModel = models.Designation ?? model("Designation", designationSchema);
