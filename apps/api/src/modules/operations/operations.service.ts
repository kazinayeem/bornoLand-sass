import mongoose from "mongoose";
import { connectDatabase } from "../../common/database/connection.js";
import { OperationTaskModel } from "./operation-task.model.js";

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

export async function listOperationTasks(
  storeId: string,
  query?: { module?: string; status?: string }
) {
  await connectDatabase();
  const sid = storeOid(storeId);
  const filter: Record<string, any> = { storeId: sid };
  if (query?.module && query.module !== "all") filter.module = query.module;
  if (query?.status && query.status !== "all") filter.status = query.status;

  const tasks = await OperationTaskModel.find(filter).sort({ createdAt: -1 }).lean();
  return {
    tasks,
    total: tasks.length,
    pendingApprovals: tasks.filter((t) => t.isApprovalWorkflow && t.status !== "completed").length,
  };
}

export async function createOperationTask(storeId: string, payload: any) {
  await connectDatabase();
  const sid = storeOid(storeId);
  const count = await OperationTaskModel.countDocuments({ storeId: sid });
  const taskNumber = `TASK-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

  return OperationTaskModel.create({
    ...payload,
    storeId: sid,
    taskNumber,
  });
}

export async function updateOperationTaskStatus(
  storeId: string,
  taskId: string,
  payload: { status: string; approvedBy?: string }
) {
  await connectDatabase();
  const task = await OperationTaskModel.findOne({ _id: oid(taskId), storeId: storeOid(storeId) });
  if (!task) throw new Error("Task not found");

  task.status = payload.status as any;
  if (payload.status === "completed" && task.isApprovalWorkflow) {
    task.approvedBy = payload.approvedBy || "Manager";
    task.approvedAt = new Date();
  }

  await task.save();
  return task;
}
