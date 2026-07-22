import { app } from "./app.js";
import { connectDatabase } from "./common/database/connection.js";
import { CartModel } from "./modules/cart/cart.model.js";
import { startBillingCronScheduler } from "./modules/subscriptions/billing-cron.service.js";
import { startStorageCronScheduler } from "./modules/media/storage-cron.service.js";
import { startEmailQueue } from "./modules/email/email-queue.service.js";
import { runSafeMigration } from "./bootstrap/safe-migrate.js";
import mongoose from "mongoose";

const port = Number(process.env.PORT ?? 4000);

async function startServer() {
  try {
    await connectDatabase();
    await CartModel.syncIndexes();

    startBillingCronScheduler();
    startStorageCronScheduler();
    startEmailQueue();
    const server = app.listen(port, "0.0.0.0", () => {
      console.log(`BornoLand API listening on port ${port}`);
      console.log("MongoDB connection established");

      void runSafeMigration().catch((error) => {
        console.error("[bootstrap] Safe migration failed:", error);
      });
    });

    const shutdown = async (signal: string) => {
      console.log(`\n[shutdown] ${signal} received. Starting graceful shutdown...`);
      server.close(() => {
        console.log("[shutdown] HTTP server closed.");
      });

      try {
        await mongoose.connection.close();
        console.log("[shutdown] MongoDB connection closed.");
      } catch (error) {
        console.error("[shutdown] Error closing MongoDB:", error);
      }

      process.exit(0);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    console.error("Failed to start API server", error);
    process.exit(1);
  }
}

void startServer();
