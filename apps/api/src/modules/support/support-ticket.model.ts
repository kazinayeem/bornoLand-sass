import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const ticketMessageSchema = new Schema(
  {
    sender: { type: String, required: true },
    senderType: { type: String, enum: ["customer", "agent", "system"], default: "customer" },
    content: { type: String, required: true },
    attachments: { type: [String], default: [] },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const supportTicketSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    ticketNumber: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },

    customerId: { type: Schema.Types.ObjectId, ref: "Customer", default: null, index: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, default: "" },
    customerPhone: { type: String, default: "" },
    orderId: { type: Schema.Types.ObjectId, ref: "Order", default: null },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
      index: true,
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "waiting_customer", "resolved", "closed"],
      default: "open",
      index: true,
    },
    channel: {
      type: String,
      enum: ["web", "email", "chat", "phone", "pos"],
      default: "web",
    },
    messages: { type: [ticketMessageSchema], default: [] },

    assignedTo: { type: String, default: "Support Team" },
    assignedToId: { type: Schema.Types.ObjectId, default: null },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

supportTicketSchema.index({ storeId: 1, ticketNumber: 1 }, { unique: true });
supportTicketSchema.index({ storeId: 1, status: 1 });
supportTicketSchema.index({ storeId: 1, priority: 1 });

export type SupportTicketDocument = InferSchemaType<typeof supportTicketSchema>;
export const SupportTicketModel = models.SupportTicket ?? model("SupportTicket", supportTicketSchema);
