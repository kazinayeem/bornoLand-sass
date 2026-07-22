import { sendStoreEmail } from "./email-engine.service.js";
import { StoreEmailLogModel } from "./store-email-log.model.js";
import { connectDatabase } from "../../common/database/connection.js";

type QueueOptions = {
  storeId: string;
  to: string;
  templateName?: string;
  subject?: string;
  html?: string;
  variables?: Record<string, string>;
  attachments?: Array<{ filename: string; content: Buffer; contentType?: string }>;
};

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 60_000;

let queueInterval: ReturnType<typeof setInterval> | null = null;

const pendingJobs: QueueOptions[] = [];

export function enqueueEmail(options: QueueOptions) {
  pendingJobs.push(options);
}

async function processQueue() {
  if (pendingJobs.length === 0) return;

  const job = pendingJobs.shift();
  if (!job) return;

  await sendStoreEmail(job);
}

async function retryFailedEmails() {
  try {
    await connectDatabase();
    const failedLogs = await StoreEmailLogModel.find({
      status: "failed",
      retries: { $lt: MAX_RETRIES },
    }).lean();

    for (const log of failedLogs) {
      await StoreEmailLogModel.findByIdAndUpdate(log._id, {
        $inc: { retries: 1 },
        $set: { status: "pending" },
      });
    }
  } catch (error) {
    console.error("[email-queue] Retry failed:", error);
  }
}

export function startEmailQueue(intervalMs = 1000) {
  if (queueInterval) return;
  queueInterval = setInterval(processQueue, intervalMs);

  const retryInterval = setInterval(retryFailedEmails, RETRY_DELAY_MS);

  return () => {
    if (queueInterval) {
      clearInterval(queueInterval);
      queueInterval = null;
    }
    clearInterval(retryInterval);
  };
}

export function stopEmailQueue() {
  if (queueInterval) {
    clearInterval(queueInterval);
    queueInterval = null;
  }
}
