import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const attendanceSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    employeeId: { type: Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    date: { type: String, required: true, index: true }, // "YYYY-MM-DD"

    checkIn: { type: Date, default: null },
    checkOut: { type: Date, default: null },

    lateMinutes: { type: Number, default: 0, min: 0 },
    earlyLeaveMinutes: { type: Number, default: 0, min: 0 },
    overtimeMinutes: { type: Number, default: 0, min: 0 },
    workedMinutes: { type: Number, default: 0, min: 0 },

    status: {
      type: String,
      enum: ["present", "late", "half_day", "absent", "on_leave", "holiday", "off_day"],
      default: "present",
      index: true,
    },
    ipAddress: { type: String, default: "" },
    device: { type: String, default: "" },
    verifiedBy: { type: String, default: "system" },
    verifiedById: { type: Schema.Types.ObjectId, default: null },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

attendanceSchema.index({ storeId: 1, employeeId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ storeId: 1, date: 1, status: 1 });

export type AttendanceDocument = InferSchemaType<typeof attendanceSchema>;
export const AttendanceModel = models.Attendance ?? model("Attendance", attendanceSchema);
