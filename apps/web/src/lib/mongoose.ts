import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is required");
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseConnection: typeof mongoose | undefined;
}

const cached = globalThis.mongooseConnection ?? mongoose;

export async function connectWebDatabase() {
  if (cached.connection.readyState === 1) {
    return cached.connection;
  }

  const connection = await cached.connect(MONGODB_URI!, {
    dbName: process.env.MONGODB_DB ?? "bornoland"
  });

  globalThis.mongooseConnection = connection;
  return connection.connection;
}
