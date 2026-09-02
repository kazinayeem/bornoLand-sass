import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const expenseCategorySchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, default: "" },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

export const ExpenseCategoryModel = models.ExpenseCategory ?? model("ExpenseCategory", expenseCategorySchema);

const expenseSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    expenseNumber: { type: String, required: true, trim: true },
    category: { type: String, required: true }, // e.g. "Rent", "Utilities", "Marketing", "Packaging", "Office Supplies"
    categoryId: { type: Schema.Types.ObjectId, ref: "ExpenseCategory", default: null },

    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    taxAmount: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },

    paymentMethod: {
      type: String,
      enum: ["cash", "bank_transfer", "bkash", "nagad", "card", "credit"],
      default: "cash",
    },
    paymentStatus: {
      type: String,
      enum: ["paid", "pending", "overdue"],
      default: "paid",
      index: true,
    },
    expenseDate: { type: Date, default: Date.now, index: true },
    vendor: { type: String, default: "" },
    receiptUrl: { type: String, default: "" },
    notes: { type: String, default: "" },

    paidFromAccountId: { type: Schema.Types.ObjectId, ref: "Account", default: null },
    expenseAccountId: { type: Schema.Types.ObjectId, ref: "Account", default: null },
    journalEntryId: { type: Schema.Types.ObjectId, ref: "JournalEntry", default: null },
    recordedBy: { type: String, default: "admin" },
  },
  { timestamps: true }
);

expenseSchema.index({ storeId: 1, expenseDate: -1 });
expenseSchema.index({ storeId: 1, category: 1 });

export type ExpenseDocument = InferSchemaType<typeof expenseSchema>;
export const ExpenseModel = models.Expense ?? model("Expense", expenseSchema);
