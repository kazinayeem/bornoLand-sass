import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const journalLineSchema = new Schema(
  {
    accountId: { type: Schema.Types.ObjectId, ref: "Account", required: true },
    debit: { type: Number, default: 0, min: 0 },
    credit: { type: Number, default: 0, min: 0 },
    description: { type: String, default: "" },
  },
  { _id: false }
);

const journalEntrySchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    entryNumber: { type: String, required: true, trim: true },
    date: { type: Date, default: Date.now, index: true },
    reference: { type: String, default: "" },
    source: {
      type: String,
      enum: [
        "pos_sale",
        "online_order",
        "purchase_receiving",
        "waste_loss",
        "payroll",
        "expense",
        "manual",
        "transfer",
      ],
      default: "manual",
      index: true,
    },
    lines: {
      type: [journalLineSchema],
      required: true,
      validate: {
        validator(lines: { debit: number; credit: number }[]) {
          if (!lines || lines.length < 2) return false;
          const totalDebit = lines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
          const totalCredit = lines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0);
          return Math.abs(totalDebit - totalCredit) < 0.01;
        },
        message: "Total Debits must exactly equal Total Credits",
      },
    },
    totalAmount: { type: Number, required: true, min: 0 },
    notes: { type: String, default: "" },
    postedBy: { type: String, default: "system" },
    status: {
      type: String,
      enum: ["draft", "posted", "voided"],
      default: "posted",
      index: true,
    },
  },
  { timestamps: true }
);

journalEntrySchema.index({ storeId: 1, entryNumber: 1 }, { unique: true });
journalEntrySchema.index({ storeId: 1, date: -1 });

export type JournalEntryDocument = InferSchemaType<typeof journalEntrySchema>;
export const JournalEntryModel = models.JournalEntry ?? model("JournalEntry", journalEntrySchema);
