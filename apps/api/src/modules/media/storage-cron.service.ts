import { verifyStorageUsage } from "./media-storage.service.js";

export async function runStorageCron() {
  const results = await verifyStorageUsage();
  return results;
}

export function startStorageCronScheduler() {
  // Run every 24 hours
  const INTERVAL_MS = 24 * 60 * 60 * 1000;

  const run = async () => {
    try {
      const result = await runStorageCron();
      if (result.fixed > 0) {
        console.log(
          `[StorageCron] Checked: ${result.checked}, Mismatched: ${result.mismatched}, Fixed: ${result.fixed}, Errors: ${result.errors}`
        );
      }
    } catch (error) {
      console.error("[StorageCron] Error:", error);
    }
  };

  // Run immediately on start
  run();

  // Then run on interval
  setInterval(run, INTERVAL_MS);
}
