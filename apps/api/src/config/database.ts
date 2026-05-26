import mongoose from "mongoose";
import { serverConfig } from "./server.js";

export async function connectDatabase() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  await mongoose.connect(serverConfig.MONGO_URI, {
    dbName: serverConfig.MONGODB_DB
  });

  return mongoose.connection;
}