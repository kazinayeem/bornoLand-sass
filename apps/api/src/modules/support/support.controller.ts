import type { Request, Response } from "express";
import type { AuthRequest } from "../../common/middleware/auth.middleware.js";
import {
  listSupportTickets,
  createSupportTicket,
  addTicketReply,
} from "./support.service.js";

function storeIdOf(request: Request) {
  return String(request.params.storeId ?? "");
}

export async function listSupportTicketsController(request: Request, response: Response) {
  try {
    const result = await listSupportTickets(storeIdOf(request), request.query as any);
    response.json({ ok: true, data: result });
  } catch (error: any) {
    response.status(500).json({ ok: false, message: error?.message || "Failed to list tickets" });
  }
}

export async function createSupportTicketController(request: Request, response: Response) {
  try {
    const ticket = await createSupportTicket(storeIdOf(request), request.body);
    response.status(201).json({ ok: true, data: ticket });
  } catch (error: any) {
    response.status(400).json({ ok: false, message: error?.message || "Failed to create ticket" });
  }
}

export async function addTicketReplyController(request: AuthRequest, response: Response) {
  try {
    const ticket = await addTicketReply(storeIdOf(request), String(request.params.ticketId), {
      sender: request.user?.email || "Support Agent",
      senderType: "agent",
      content: request.body.content,
      status: request.body.status,
    });
    response.json({ ok: true, data: ticket });
  } catch (error: any) {
    response.status(400).json({ ok: false, message: error?.message || "Failed to post reply" });
  }
}
