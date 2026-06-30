import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const migrationStateSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    version: { type: Number, default: 0 },
    lastRunAt: { type: Date },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

export type MigrationStateDocument = InferSchemaType<typeof migrationStateSchema>;
export const MigrationStateModel =
  models.MigrationState ?? model("MigrationState", migrationStateSchema);

export const BOOTSTRAP_MIGRATION_VERSION = 2;
