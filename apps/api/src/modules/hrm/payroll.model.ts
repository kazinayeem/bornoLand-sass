import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const payrollSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    employeeId: { type: Schema.Types.ObjectId, ref: "Employee", required: true, index: true },

    month: { type: Number, required: true, min: 1, max: 12 }, // 1 - 12
    year: { type: Number, required: true, min: 2020 },
    payslipNumber: { type: String, required: true },

    // Earning components
    basicSalary: { type: Number, required: true, min: 0 },
    houseRent: { type: Number, default: 0, min: 0 },
    medical: { type: Number, default: 0, min: 0 },
    conveyance: { type: Number, default: 0, min: 0 },
    otherAllowances: { type: Number, default: 0, min: 0 },

    overtimeHours: { type: Number, default: 0, min: 0 },
    overtimeRate: { type: Number, default: 0, min: 0 },
    overtimePay: { type: Number, default: 0, min: 0 },

    bonus: { type: Number, default: 0, min: 0 },
    commission: { type: Number, default: 0, min: 0 },
    grossSalary: { type: Number, required: true, min: 0 },

    // Deductions
    unpaidLeaveDays: { type: Number, default: 0, min: 0 },
    unpaidLeaveDeduction: { type: Number, default: 0, min: 0 },
    lateDeduction: { type: Number, default: 0, min: 0 },
    taxDeduction: { type: Number, default: 0, min: 0 },
    providentFundDeduction: { type: Number, default: 0, min: 0 },
    loanOrAdvanceDeduction: { type: Number, default: 0, min: 0 },
    otherDeductions: { type: Number, default: 0, min: 0 },
    totalDeductions: { type: Number, required: true, min: 0 },

    // Final Net Pay
    netSalary: { type: Number, required: true, min: 0 },

    status: {
      type: String,
      enum: ["draft", "generated", "approved", "paid", "cancelled"],
      default: "generated",
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ["bank_transfer", "cash", "bkash", "nagad", "cheque"],
      default: "bank_transfer",
    },
    paidAt: { type: Date, default: null },
    approvedBy: { type: String, default: "" },
    approvedById: { type: Schema.Types.ObjectId, default: null },
    approvedAt: { type: Date, default: null },

    journalEntryId: { type: Schema.Types.ObjectId, default: null },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

payrollSchema.index({ storeId: 1, employeeId: 1, month: 1, year: 1 }, { unique: true });
payrollSchema.index({ storeId: 1, month: 1, year: 1, status: 1 });

export type PayrollDocument = InferSchemaType<typeof payrollSchema>;
export const PayrollModel = models.Payroll ?? model("Payroll", payrollSchema);
