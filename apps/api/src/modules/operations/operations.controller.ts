import type { Request, Response } from "express";
import type { AuthRequest } from "../../common/middleware/auth.middleware.js";
import {
  listOperationTasks,
  createOperationTask,
  updateOperationTaskStatus,
} from "./operations.service.js";

function storeIdOf(request: Request) {
  return String(request.params.storeId ?? "");
}

export async function listOperationTasksController(request: Request, response: Response) {
  try {
    const result = await listOperationTasks(storeIdOf(request), request.query as any);
    response.json({ ok: true, data: result });
  } catch (error: any) {
    response.status(500).json({ ok: false, message: error?.message || "Failed to list tasks" });
  }
}

export async function createOperationTaskController(request: Request, response: Response) {
  try {
    const task = await createOperationTask(storeIdOf(request), request.body);
    response.status(201).json({ ok: true, data: task });
  } catch (error: any) {
    response.status(400).json({ ok: false, message: error?.message || "Failed to create task" });
  }
}

export async function updateOperationTaskStatusController(request: AuthRequest, response: Response) {
  try {
    const task = await updateOperationTaskStatus(storeIdOf(request), String(request.params.taskId), {
      status: request.body.status,
      approvedBy: request.user?.email || "Manager",
    });
    response.json({ ok: true, data: task });
  } catch (error: any) {
    response.status(400).json({ ok: false, message: error?.message || "Failed to update task" });
  }
}
