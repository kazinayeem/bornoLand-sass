import { syncAllAutoTrackingShipments } from "./shipment.service.js";

const INTERVAL_MS = 5 * 60 * 1000; // 5 minutes — providers with 15/30 min still get checked; cheap filter inside

let started = false;

export function startShipmentSyncScheduler() {
  if (started) return;
  started = true;

  const run = async () => {
    try {
      await syncAllAutoTrackingShipments();
    } catch (error) {
      console.error("[shipment-sync] Error:", error);
    }
  };

  // Delay first run so boot isn't blocked
  setTimeout(() => {
    void run();
    setInterval(run, INTERVAL_MS);
  }, 30_000);
}
