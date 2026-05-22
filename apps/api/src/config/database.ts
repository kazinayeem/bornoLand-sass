import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });

export async function connectDatabase() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is required");
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.MONGODB_DB ?? "bornoland"
  });

  return mongoose.connection;
}