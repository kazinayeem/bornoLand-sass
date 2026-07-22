import type { Response } from "express";
import type { AuthRequest } from "../../common/middleware/auth.middleware.js";
import { getEmailLogs, getEmailLog } from "./store-email-log.service.js";
import { sendFailure, sendSuccess } from "../../common/utils/api-response.js";

export async function listEmailLogsController(request: AuthRequest, response: Response) {
  const userId = request.user?.userId;
  const storeId = request.params.storeId as string;
  if (!userId) return sendFailure(response, "Unauthorized", 401);

  const { status, search, page = "1", limit = "20" } = request.query as Record<string, string>;

  const result = await getEmailLogs(storeId, userId, {
    page: parseInt(page),
    limit: parseInt(limit),
    status,
    search,
  });

  return result.ok ? sendSuccess(response, result.data) : sendFailure(response, result.message, 404);
}

export async function getEmailLogController(request: AuthRequest, response: Response) {

  const userId = request.user?.userId;
  const storeId = request.params.storeId as string;
  const logId = request.params.logId as string;
  if (!userId) return sendFailure(response, "Unauthorized", 401);

  const result = await getEmailLog(storeId, logId, userId);
  return result.ok ? sendSuccess(response, result.data) : sendFailure(response, result.message, 404);
}
