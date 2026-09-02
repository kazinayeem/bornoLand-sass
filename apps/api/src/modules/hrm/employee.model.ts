import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const salaryStructureSchema = new Schema(
  {
    basic: { type: Number, default: 0, min: 0 },
    houseRent: { type: Number, default: 0, min: 0 },
    medical: { type: Number, default: 0, min: 0 },
    conveyance: { type: Number, default: 0, min: 0 },
    allowances: { type: Number, default: 0, min: 0 },
    grossSalary: { type: Number, default: 0, min: 0 },
    overtimeHourlyRate: { type: Number, default: 0, min: 0 },
    taxDeduction: { type: Number, default: 0, min: 0 },
    providentFund: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const bankInfoSchema = new Schema(
  {
    bankName: { type: String, default: "" },
    accountName: { type: String, default: "" },
    accountNumber: { type: String, default: "" },
    branchName: { type: String, default: "" },
    routingNumber: { type: String, default: "" },
    mobileWalletNumber: { type: String, default: "" },
    walletProvider: { type: String, default: "bKash" },
  },
  { _id: false }
);

const emergencyContactSchema = new Schema(
  {
    name: { type: String, default: "" },
    relation: { type: String, default: "" },
    phone: { type: String, default: "" },
  },
  { _id: false }
);

const employeeSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    employeeCode: { type: String, required: true, trim: true },

    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, default: "", trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: "", trim: true },
    photoUrl: { type: String, default: "" },
    dateOfBirth: { type: Date, default: null },
    gender: { type: String, enum: ["male", "female", "other"], default: "male" },
    address: { type: String, default: "" },

    departmentId: { type: Schema.Types.ObjectId, ref: "Department", default: null, index: true },
    designationId: { type: Schema.Types.ObjectId, ref: "Designation", default: null, index: true },
    branchId: { type: Schema.Types.ObjectId, default: null, index: true },
    managerId: { type: Schema.Types.ObjectId, ref: "Employee", default: null },
    shiftId: { type: Schema.Types.ObjectId, ref: "Shift", default: null },

    employmentType: {
      type: String,
      enum: ["full_time", "part_time", "contractual", "intern", "probation"],
      default: "full_time",
    },
    status: {
      type: String,
      enum: ["active", "on_leave", "resigned", "terminated", "suspended"],
      default: "active",
      index: true,
    },
    joiningDate: { type: Date, default: Date.now },
    resignationDate: { type: Date, default: null },

    salaryStructure: salaryStructureSchema,
    bankInfo: bankInfoSchema,
    emergencyContact: emergencyContactSchema,
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

employeeSchema.index({ storeId: 1, employeeCode: 1 }, { unique: true });
employeeSchema.index({ storeId: 1, email: 1 });
employeeSchema.index({ storeId: 1, status: 1 });

export type EmployeeDocument = InferSchemaType<typeof employeeSchema>;
export const EmployeeModel = models.Employee ?? model("Employee", employeeSchema);
