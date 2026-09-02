import type { Response } from "express";
import mongoose from "mongoose";
import type { PermissionRequest } from "../../common/middleware/store-permission.middleware.js";
import { connectDatabase } from "../../common/database/connection.js";
import { EmployeeModel } from "./employee.model.js";
import { AttendanceModel } from "./attendance.model.js";
import { LeaveRequestModel } from "./leave.model.js";
import { PayrollModel } from "./payroll.model.js";
import { ShiftModel } from "./shift.model.js";

function oid(id: string) {
  try {
    return new mongoose.Types.ObjectId(id);
  } catch {
    return null;
  }
}

/**
 * Helper to resolve the authenticated user's Employee record within the store.
 */
async function resolveCurrentEmployee(req: PermissionRequest) {
  const storeId = req.storeContext?.storeId;
  const userId = req.user?.userId;
  const email = req.user?.email?.toLowerCase().trim();

  if (!storeId || !userId) return null;
  const sid = oid(storeId);
  const uid = oid(userId);
  if (!sid || !uid) return null;

  let emp = await EmployeeModel.findOne({
    storeId: sid,
    $or: [{ userId: uid }, ...(email ? [{ email }] : [])],
  })
    .populate("departmentId", "name code")
    .populate("designationId", "title code")
    .populate("shiftId", "name startTime endTime gracePeriodMinutes workingDays");

  if (emp && !emp.userId) {
    emp.userId = uid as any;
    await emp.save();
  }

  return emp;
}

// ── 1. My Profile ────────────────────────────────────────────────────────
export async function getMyEmployeeProfile(req: PermissionRequest, res: Response) {
  try {
    await connectDatabase();
    const employee = await resolveCurrentEmployee(req);

    if (!employee) {
      return res.status(404).json({
        ok: false,
        message: "No employee profile found linked to your account in this store.",
        code: "EMPLOYEE_NOT_FOUND",
      });
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const todayAttendance = await AttendanceModel.findOne({
      storeId: employee.storeId,
      employeeId: employee._id,
      date: todayStr,
    }).lean();

    return res.json({
      ok: true,
      data: {
        employee,
        todayAttendance,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ ok: false, message: error?.message || "Failed to load employee profile" });
  }
}

// ── 2. Today's Attendance Status ─────────────────────────────────────────
export async function getMyTodayAttendance(req: PermissionRequest, res: Response) {
  try {
    await connectDatabase();
    const employee = await resolveCurrentEmployee(req);
    if (!employee) {
      return res.status(404).json({ ok: false, message: "Employee profile not found" });
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const attendance = await AttendanceModel.findOne({
      storeId: employee.storeId,
      employeeId: employee._id,
      date: todayStr,
    }).lean() as any;

    let status = "not_clocked_in";
    if (attendance?.checkIn && !attendance.checkOut) {
      status = "working";
    } else if (attendance?.checkIn && attendance.checkOut) {
      status = "completed";
    }

    return res.json({
      ok: true,
      data: {
        date: todayStr,
        attendance,
        status,
        serverTime: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ ok: false, message: error?.message || "Failed to get attendance" });
  }
}

// ── 3. Clock In ──────────────────────────────────────────────────────────
export async function clockInMyAttendance(req: PermissionRequest, res: Response) {
  try {
    await connectDatabase();
    const employee = await resolveCurrentEmployee(req);
    if (!employee) {
      return res.status(404).json({ ok: false, message: "Employee profile not found" });
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const now = new Date();

    let att = await AttendanceModel.findOne({
      storeId: employee.storeId,
      employeeId: employee._id,
      date: todayStr,
    });

    if (att && att.checkIn) {
      return res.status(400).json({
        ok: false,
        message: `You have already clocked in today at ${new Date(att.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
      });
    }

    // Check shift start time for late calculation
    let lateMinutes = 0;
    let attendanceStatus = "present";
    if (employee.shiftId && typeof employee.shiftId === "object" && (employee.shiftId as any).startTime) {
      const shift = employee.shiftId as any;
      const [shHour, shMin] = String(shift.startTime).split(":").map(Number);
      const shiftStart = new Date(now);
      shiftStart.setHours(shHour || 9, shMin || 0, 0, 0);

      const gracePeriod = Number(shift.gracePeriodMinutes ?? 15);
      const graceEnd = new Date(shiftStart.getTime() + gracePeriod * 60 * 1000);

      if (now > graceEnd) {
        lateMinutes = Math.max(0, Math.floor((now.getTime() - shiftStart.getTime()) / (60 * 1000)));
        attendanceStatus = "late";
      }
    }

    if (!att) {
      att = new AttendanceModel({
        storeId: employee.storeId,
        employeeId: employee._id,
        date: todayStr,
        checkIn: now,
        status: attendanceStatus,
        lateMinutes,
        ipAddress: req.ip || "",
        device: req.get("user-agent") || "",
        verifiedBy: "self-service",
      });
    } else {
      att.checkIn = now;
      att.status = attendanceStatus as any;
      att.lateMinutes = lateMinutes;
      att.ipAddress = req.ip || "";
      att.device = req.get("user-agent") || "";
    }

    await att.save();

    return res.json({
      ok: true,
      message: "Clock-in successful",
      data: att,
    });
  } catch (error: any) {
    return res.status(400).json({ ok: false, message: error?.message || "Failed to clock in" });
  }
}

// ── 4. Clock Out ─────────────────────────────────────────────────────────
export async function clockOutMyAttendance(req: PermissionRequest, res: Response) {
  try {
    await connectDatabase();
    const employee = await resolveCurrentEmployee(req);
    if (!employee) {
      return res.status(404).json({ ok: false, message: "Employee profile not found" });
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const now = new Date();

    const att = await AttendanceModel.findOne({
      storeId: employee.storeId,
      employeeId: employee._id,
      date: todayStr,
    });

    if (!att || !att.checkIn) {
      return res.status(400).json({
        ok: false,
        message: "You cannot clock out without clocking in first.",
      });
    }

    if (att.checkOut) {
      return res.status(400).json({
        ok: false,
        message: `You have already clocked out today at ${new Date(att.checkOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
      });
    }

    att.checkOut = now;
    const diffMs = now.getTime() - new Date(att.checkIn).getTime();
    att.workedMinutes = Math.max(0, Math.floor(diffMs / (60 * 1000)));

    // Standard 8 hours (480 mins) shift overtime calculation
    if (att.workedMinutes > 480) {
      att.overtimeMinutes = att.workedMinutes - 480;
    }

    await att.save();

    return res.json({
      ok: true,
      message: "Clock-out recorded successfully",
      data: att,
    });
  } catch (error: any) {
    return res.status(400).json({ ok: false, message: error?.message || "Failed to clock out" });
  }
}

// ── 5. Attendance History ────────────────────────────────────────────────
export async function getMyAttendanceHistory(req: PermissionRequest, res: Response) {
  try {
    await connectDatabase();
    const employee = await resolveCurrentEmployee(req);
    if (!employee) {
      return res.status(404).json({ ok: false, message: "Employee profile not found" });
    }

    const limit = Math.min(100, Math.max(1, Number(req.query.limit || 31)));
    const filter: Record<string, unknown> = {
      storeId: employee.storeId,
      employeeId: employee._id,
    };

    if (req.query.month && req.query.year) {
      const y = String(req.query.year);
      const m = String(req.query.month).padStart(2, "0");
      filter.date = new RegExp(`^${y}-${m}`);
    }

    const attendanceList = await AttendanceModel.find(filter)
      .sort({ date: -1 })
      .limit(limit)
      .lean();

    return res.json({
      ok: true,
      data: {
        attendance: attendanceList,
        total: attendanceList.length,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ ok: false, message: error?.message || "Failed to fetch attendance history" });
  }
}

// ── 6. My Leaves & Balances ──────────────────────────────────────────────
export async function getMyLeaves(req: PermissionRequest, res: Response) {
  try {
    await connectDatabase();
    const employee = await resolveCurrentEmployee(req);
    if (!employee) {
      return res.status(404).json({ ok: false, message: "Employee profile not found" });
    }

    const leaves = await LeaveRequestModel.find({
      storeId: employee.storeId,
      employeeId: employee._id,
    })
      .sort({ createdAt: -1 })
      .lean() as any[];

    // Calculate taken vs remaining leaves for current year
    const currentYear = new Date().getFullYear();
    const approvedThisYear = leaves.filter(
      (l) => l.status === "approved" && l.startDate?.startsWith(String(currentYear))
    );

    const usedCasual = approvedThisYear
      .filter((l) => l.leaveType === "casual")
      .reduce((sum, l) => sum + (l.daysCount || 0), 0);
    const usedSick = approvedThisYear
      .filter((l) => l.leaveType === "sick")
      .reduce((sum, l) => sum + (l.daysCount || 0), 0);
    const usedAnnual = approvedThisYear
      .filter((l) => l.leaveType === "annual")
      .reduce((sum, l) => sum + (l.daysCount || 0), 0);

    // Standard annual entitlement quotas
    const balances = {
      casual: { quota: 10, used: usedCasual, remaining: Math.max(0, 10 - usedCasual) },
      sick: { quota: 14, used: usedSick, remaining: Math.max(0, 14 - usedSick) },
      annual: { quota: 15, used: usedAnnual, remaining: Math.max(0, 15 - usedAnnual) },
    };

    return res.json({
      ok: true,
      data: {
        leaves,
        balances,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ ok: false, message: error?.message || "Failed to fetch leaves" });
  }
}

// ── 7. Apply for Leave ───────────────────────────────────────────────────
export async function applyMyLeave(req: PermissionRequest, res: Response) {
  try {
    await connectDatabase();
    const employee = await resolveCurrentEmployee(req);
    if (!employee) {
      return res.status(404).json({ ok: false, message: "Employee profile not found" });
    }

    const { leaveType, startDate, endDate, daysCount, reason } = req.body;
    if (!startDate || !endDate || !reason) {
      return res.status(400).json({ ok: false, message: "Start date, end date, and reason are required" });
    }

    const count = Number(daysCount) || 1;
    const leave = await LeaveRequestModel.create({
      storeId: employee.storeId,
      employeeId: employee._id,
      leaveType: leaveType || "casual",
      startDate: String(startDate).slice(0, 10),
      endDate: String(endDate).slice(0, 10),
      daysCount: Math.max(0.5, count),
      reason: String(reason).trim(),
      status: "pending",
    });

    return res.status(201).json({
      ok: true,
      message: "Leave application submitted successfully",
      data: leave,
    });
  } catch (error: any) {
    return res.status(400).json({ ok: false, message: error?.message || "Failed to submit leave application" });
  }
}

// ── 8. Cancel My Pending Leave ───────────────────────────────────────────
export async function cancelMyLeave(req: PermissionRequest, res: Response) {
  try {
    await connectDatabase();
    const employee = await resolveCurrentEmployee(req);
    if (!employee) {
      return res.status(404).json({ ok: false, message: "Employee profile not found" });
    }

    const leaveId = req.params.leaveId;
    const leave = await LeaveRequestModel.findOne({
      _id: leaveId,
      storeId: employee.storeId,
      employeeId: employee._id,
    });

    if (!leave) {
      return res.status(404).json({ ok: false, message: "Leave request not found or not owned by you" });
    }

    if (leave.status !== "pending") {
      return res.status(400).json({
        ok: false,
        message: `Only pending leave requests can be cancelled. Current status is ${leave.status}.`,
      });
    }

    leave.status = "cancelled";
    await leave.save();

    return res.json({
      ok: true,
      message: "Leave request cancelled successfully",
      data: leave,
    });
  } catch (error: any) {
    return res.status(400).json({ ok: false, message: error?.message || "Failed to cancel leave request" });
  }
}

// ── 9. My Payslips & Salary ──────────────────────────────────────────────
export async function getMyPayslips(req: PermissionRequest, res: Response) {
  try {
    await connectDatabase();
    const employee = await resolveCurrentEmployee(req);
    if (!employee) {
      return res.status(404).json({ ok: false, message: "Employee profile not found" });
    }

    const payslips = await PayrollModel.find({
      storeId: employee.storeId,
      employeeId: employee._id,
      status: { $in: ["approved", "paid", "generated"] },
    })
      .populate("employeeId", "firstName lastName employeeCode photoUrl departmentId designationId")
      .sort({ year: -1, month: -1 })
      .lean();

    return res.json({
      ok: true,
      data: {
        payslips,
        salaryStructure: employee.salaryStructure,
        bankInfo: employee.bankInfo,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ ok: false, message: error?.message || "Failed to fetch payslips" });
  }
}
