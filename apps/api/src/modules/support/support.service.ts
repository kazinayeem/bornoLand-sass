import mongoose from "mongoose";
import { connectDatabase } from "../../common/database/connection.js";
import { SupportTicketModel } from "./support-ticket.model.js";

function oid(id: string | mongoose.Types.ObjectId | null | undefined): mongoose.Types.ObjectId | null {
  if (!id) return null;
  if (typeof id !== "string") return id as mongoose.Types.ObjectId;
  if (mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id) {
    return new mongoose.Types.ObjectId(id);
  }
  return null;
}

function storeOid(storeId: string | mongoose.Types.ObjectId): mongoose.Types.ObjectId {
  if (typeof storeId !== "string") return storeId as mongoose.Types.ObjectId;
  if (mongoose.Types.ObjectId.isValid(storeId) && String(new mongoose.Types.ObjectId(storeId)) === storeId) {
    return new mongoose.Types.ObjectId(storeId);
  }
  return new mongoose.Types.ObjectId("000000000000000000000000");
}

export async function listSupportTickets(
  storeId: string,
  query?: { status?: string; priority?: string; page?: number; limit?: number }
) {
  await connectDatabase();
  const sid = storeOid(storeId);
  const page = Math.max(1, Number(query?.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(query?.limit) || 20));
  const skip = (page - 1) * limit;

  const filter: Record<string, any> = { storeId: sid };
  if (query?.status && query.status !== "all") filter.status = query.status;
  if (query?.priority && query.priority !== "all") filter.priority = query.priority;

  const [tickets, total] = await Promise.all([
    SupportTicketModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    SupportTicketModel.countDocuments(filter),
  ]);

  return {
    tickets,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function createSupportTicket(storeId: string, payload: any) {
  await connectDatabase();
  const sid = storeOid(storeId);
  const count = await SupportTicketModel.countDocuments({ storeId: sid });
  const ticketNumber = `TKT-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

  const initialMessage = payload.initialMessage
    ? [
        {
          sender: payload.customerName || "Customer",
          senderType: "customer" as const,
          content: payload.initialMessage,
          createdAt: new Date(),
        },
      ]
    : [];

  return SupportTicketModel.create({
    ...payload,
    storeId: sid,
    ticketNumber,
    customerId: payload.customerId ? oid(payload.customerId) : null,
    orderId: payload.orderId ? oid(payload.orderId) : null,
    messages: initialMessage,
    status: "open",
  });
}

export async function addTicketReply(
  storeId: string,
  ticketId: string,
  payload: { sender: string; senderType: "agent" | "customer"; content: string; status?: string }
) {
  await connectDatabase();
  const t = await SupportTicketModel.findOne({ _id: oid(ticketId), storeId: storeOid(storeId) });
  if (!t) throw new Error("Ticket not found");

  t.messages.push({
    sender: payload.sender,
    senderType: payload.senderType,
    content: payload.content,
    attachments: [],
    createdAt: new Date(),
  });

  if (payload.status) {
    t.status = payload.status as any;
    if (payload.status === "resolved" || payload.status === "closed") {
      t.resolvedAt = new Date();
    }
  } else if (payload.senderType === "agent") {
    t.status = "waiting_customer";
  }

  await t.save();
  return t;
}
