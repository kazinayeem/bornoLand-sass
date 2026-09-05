import type { Response } from "express";
import mongoose from "mongoose";
import multer from "multer";
import path from "path";
import type { PermissionRequest } from "../../common/middleware/store-permission.middleware.js";
import { connectDatabase } from "../../common/database/connection.js";
import { EmployeeModel } from "./employee.model.js";
import { AttendanceModel } from "./attendance.model.js";
import { LeaveRequestModel } from "./leave.model.js";
import { PayrollModel } from "./payroll.model.js";
import { EmployeeRequestModel } from "./employee-request.model.js";
import { EmployeeDocumentModel } from "./employee-document.model.js";
import { NotificationModel } from "../notifications/notification.model.js";
import { OperationTaskModel } from "../operations/operation-task.model.js";
import { StoreModel } from "../stores/store.model.js";
import { getStorageProvider } from "../media/providers/index.js";
import { isEmployeeStatusAllowedForLogin } from "./employee-account.service.js";

function oid(id: string) {
  try {
    return new mongoose.Types.ObjectId(id);
  } catch {
    return null;
  }
}

// Multer in-memory upload configurations for profile photo and documents
export const photoUploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, and WebP images are allowed for profile photo"));
    }
  },
}).single("photo");

export const documentUploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Supported formats: PDF, DOCX, XLSX, JPEG, PNG, WebP"));
    }
  },
}).single("file");

/**
 * Helper to resolve the authenticated user's active Employee record within the store.
 * Strictly verifies status against EMPLOYEE_LOGIN_ALLOWED_STATUSES.
 */
export async function resolveCurrentEmployee(req: PermissionRequest) {
  const storeId = req.storeContext?.storeId;
  const userId = req.user?.userId;
  const email = req.user?.email?.toLowerCase().trim();

  if (!storeId || !userId) return null;
  const sid = oid(storeId);
  const uid = oid(userId);
  if (!sid || !uid) return null;

  const emp = await EmployeeModel.findOne({
    storeId: sid,
    $or: [{ userId: uid }, ...(email ? [{ email }] : [])],
  })
    .populate("departmentId", "name code")
    .populate("designationId", "name title code")
    .populate("shiftId", "name startTime endTime gracePeriodMinutes workingDays");

  if (!emp) return null;

  // Auto-link userId if missing
  if (!emp.userId) {
    emp.userId = uid as any;
    await emp.save();
  }

  // Security check: active status verification
  if (!isEmployeeStatusAllowedForLogin(emp.status)) {
    const err: any = new Error("Access denied. Your employee account is currently suspended, terminated, or inactive.");
    err.statusCode = 403;
    err.code = "EMPLOYEE_INACTIVE";
    throw err;
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
        message: "No active employee profile found linked to your account in this store.",
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
    const status = error?.statusCode || 500;
    return res.status(status).json({ ok: false, message: error?.message || "Failed to load employee profile" });
  }
}

// ── 1b. Update Permitted Profile Fields ──────────────────────────────────
export async function updateMyEmployeeProfile(req: PermissionRequest, res: Response) {
  try {
    await connectDatabase();
    const employee = await resolveCurrentEmployee(req);
    if (!employee) {
      return res.status(404).json({ ok: false, message: "Active employee profile not found" });
    }

    const { phone, address, presentAddress, emergencyContact, photoUrl } = req.body;

    // Only allow editing non-sensitive fields
    if (phone !== undefined) employee.phone = String(phone).trim();
    if (address !== undefined) employee.address = String(address).trim();
    else if (presentAddress !== undefined) employee.address = String(presentAddress).trim();
    if (photoUrl !== undefined) employee.photoUrl = String(photoUrl).trim();

    if (emergencyContact && typeof emergencyContact === "object") {
      employee.emergencyContact = {
        name: String(emergencyContact.name || "").trim(),
        relation: String(emergencyContact.relation || "").trim(),
        phone: String(emergencyContact.phone || "").trim(),
      };
    }

    await employee.save();

    return res.json({
      ok: true,
      message: "Personal profile updated successfully",
      data: employee,
    });
  } catch (error: any) {
    return res.status(400).json({ ok: false, message: error?.message || "Failed to update profile" });
  }
}

// ── 1c. Upload Profile Photo ─────────────────────────────────────────────
export async function uploadMyProfilePhoto(req: PermissionRequest, res: Response) {
  try {
    await connectDatabase();
    const employee = await resolveCurrentEmployee(req);
    if (!employee) {
      return res.status(404).json({ ok: false, message: "Active employee profile not found" });
    }

    const file = (req as any).file;
    if (!file) {
      return res.status(400).json({ ok: false, message: "No photo file uploaded" });
    }

    const store = await StoreModel.findById(employee.storeId).select("slug").lean();
    const storeSlug = (store as any)?.slug || "store";

    const provider = getStorageProvider();
    const ext = path.extname(file.originalname) || ".jpg";
    const storedName = `emp-${employee.employeeCode}-${Date.now()}${ext}`;

    const uploadResult = await provider.upload({
      storeSlug,
      folder: "employee-profiles",
      storedName,
      buffer: file.buffer,
      mimeType: file.mimetype,
    });

    employee.photoUrl = uploadResult.publicUrl;
    await employee.save();

    return res.json({
      ok: true,
      message: "Profile photo uploaded successfully",
      data: {
        photoUrl: uploadResult.publicUrl,
        employee,
      },
    });
  } catch (error: any) {
    return res.status(400).json({ ok: false, message: error?.message || "Failed to upload photo" });
  }
}

// ── 2. Today's Attendance Status ─────────────────────────────────────────
export async function getMyTodayAttendance(req: PermissionRequest, res: Response) {
  try {
    await connectDatabase();
    const employee = await resolveCurrentEmployee(req);
    if (!employee) {
      return res.status(404).json({ ok: false, message: "Active employee profile not found" });
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const attendance = (await AttendanceModel.findOne({
      storeId: employee.storeId,
      employeeId: employee._id,
      date: todayStr,
    }).lean()) as any;

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
        isClockedIn: Boolean(attendance?.checkIn),
        isClockedOut: Boolean(attendance?.checkOut),
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
      return res.status(404).json({ ok: false, message: "Active employee profile not found" });
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
      return res.status(404).json({ ok: false, message: "Active employee profile not found" });
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
      return res.status(404).json({ ok: false, message: "Active employee profile not found" });
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

// ── 5b. Request Attendance Correction ────────────────────────────────────
export async function requestAttendanceCorrection(req: PermissionRequest, res: Response) {
  try {
    await connectDatabase();
    const employee = await resolveCurrentEmployee(req);
    if (!employee) {
      return res.status(404).json({ ok: false, message: "Active employee profile not found" });
    }

    const { date, requestedCheckIn, requestedCheckOut, proposedCheckIn, proposedCheckOut, reason } = req.body;
    if (!date || !reason) {
      return res.status(400).json({ ok: false, message: "Date and reason are required for attendance correction" });
    }

    const checkInVal = requestedCheckIn || proposedCheckIn;
    const checkOutVal = requestedCheckOut || proposedCheckOut;

    const request = await EmployeeRequestModel.create({
      storeId: employee.storeId,
      employeeId: employee._id,
      userId: req.user?.userId || employee.userId,
      type: "attendance_correction",
      title: `Attendance Correction for ${date}`,
      description: String(reason).trim(),
      data: {
        date: String(date).slice(0, 10),
        requestedCheckIn: checkInVal,
        requestedCheckOut: checkOutVal,
        reason: String(reason).trim(),
      },
      status: "pending",
    });

    return res.status(201).json({
      ok: true,
      message: "Attendance correction request submitted for HR approval",
      data: request,
    });
  } catch (error: any) {
    return res.status(400).json({ ok: false, message: error?.message || "Failed to submit attendance correction" });
  }
}

// ── 6. My Leaves & Balances ──────────────────────────────────────────────
export async function getMyLeaves(req: PermissionRequest, res: Response) {
  try {
    await connectDatabase();
    const employee = await resolveCurrentEmployee(req);
    if (!employee) {
      return res.status(404).json({ ok: false, message: "Active employee profile not found" });
    }

    const leaves = (await LeaveRequestModel.find({
      storeId: employee.storeId,
      employeeId: employee._id,
    })
      .sort({ createdAt: -1 })
      .lean()) as any[];

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
      return res.status(404).json({ ok: false, message: "Active employee profile not found" });
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
      return res.status(404).json({ ok: false, message: "Active employee profile not found" });
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
      return res.status(404).json({ ok: false, message: "Active employee profile not found" });
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

// ── 10. My Bank Account & Change Workflow ────────────────────────────────
export async function getMyBankAccount(req: PermissionRequest, res: Response) {
  try {
    await connectDatabase();
    const employee = await resolveCurrentEmployee(req);
    if (!employee) {
      return res.status(404).json({ ok: false, message: "Active employee profile not found" });
    }

    const pendingRequest = await EmployeeRequestModel.findOne({
      storeId: employee.storeId,
      employeeId: employee._id,
      type: "bank_account_change",
      status: "pending",
    }).lean();

    const history = await EmployeeRequestModel.find({
      storeId: employee.storeId,
      employeeId: employee._id,
      type: "bank_account_change",
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return res.json({
      ok: true,
      data: {
        bankInfo: employee.bankInfo || {},
        pendingRequest,
        history,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ ok: false, message: error?.message || "Failed to fetch bank account" });
  }
}

export async function requestBankAccountChange(req: PermissionRequest, res: Response) {
  try {
    await connectDatabase();
    const employee = await resolveCurrentEmployee(req);
    if (!employee) {
      return res.status(404).json({ ok: false, message: "Active employee profile not found" });
    }

    const {
      bankName,
      accountName,
      accountNumber,
      branchName,
      routingNumber,
      mobileWalletNumber,
      walletProvider,
      reason,
    } = req.body;

    if (!accountNumber && !mobileWalletNumber) {
      return res.status(400).json({
        ok: false,
        message: "Either bank account number or mobile wallet number is required",
      });
    }

    // Check if there is already a pending bank change request
    const existingPending = await EmployeeRequestModel.findOne({
      storeId: employee.storeId,
      employeeId: employee._id,
      type: "bank_account_change",
      status: "pending",
    });

    if (existingPending) {
      return res.status(400).json({
        ok: false,
        message: "You already have a pending bank account update request awaiting HR review.",
      });
    }

    const request = await EmployeeRequestModel.create({
      storeId: employee.storeId,
      employeeId: employee._id,
      userId: req.user!.userId,
      type: "bank_account_change",
      title: "Bank Account Information Update",
      description: String(reason || "Employee requested bank information change").trim(),
      data: {
        bankName: String(bankName || "").trim(),
        accountName: String(accountName || "").trim(),
        accountNumber: String(accountNumber || "").trim(),
        branchName: String(branchName || "").trim(),
        routingNumber: String(routingNumber || "").trim(),
        mobileWalletNumber: String(mobileWalletNumber || "").trim(),
        walletProvider: String(walletProvider || "bKash").trim(),
        reason: String(reason || "").trim(),
      },
      status: "pending",
    });

    return res.status(201).json({
      ok: true,
      message: "Bank account change request submitted for HR approval",
      data: request,
    });
  } catch (error: any) {
    return res.status(400).json({ ok: false, message: error?.message || "Failed to submit bank change request" });
  }
}

// ── 11. My Documents ─────────────────────────────────────────────────────
export async function getMyDocuments(req: PermissionRequest, res: Response) {
  try {
    await connectDatabase();
    const employee = await resolveCurrentEmployee(req);
    if (!employee) {
      return res.status(404).json({ ok: false, message: "Active employee profile not found" });
    }

    const documents = await EmployeeDocumentModel.find({
      storeId: employee.storeId,
      employeeId: employee._id,
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      ok: true,
      data: {
        documents,
        total: documents.length,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ ok: false, message: error?.message || "Failed to fetch documents" });
  }
}

export async function uploadMyDocument(req: PermissionRequest, res: Response) {
  try {
    await connectDatabase();
    const employee = await resolveCurrentEmployee(req);
    if (!employee) {
      return res.status(404).json({ ok: false, message: "Active employee profile not found" });
    }

    const file = (req as any).file;
    if (!file) {
      return res.status(400).json({ ok: false, message: "No document file uploaded" });
    }

    const title = String(req.body.title || file.originalname || "Employee Document").trim();
    const documentType = String(req.body.documentType || "other").trim();

    const store = await StoreModel.findById(employee.storeId).select("slug").lean();
    const storeSlug = (store as any)?.slug || "store";

    const provider = getStorageProvider();
    const ext = path.extname(file.originalname) || ".pdf";
    const storedName = `doc-${employee.employeeCode}-${Date.now()}${ext}`;

    const uploadResult = await provider.upload({
      storeSlug,
      folder: "employee-documents",
      storedName,
      buffer: file.buffer,
      mimeType: file.mimetype,
    });

    const doc = await EmployeeDocumentModel.create({
      storeId: employee.storeId,
      employeeId: employee._id,
      userId: req.user!.userId,
      title,
      documentType,
      fileUrl: uploadResult.publicUrl,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      uploadedBy: "employee",
      uploadedById: req.user!.userId,
      description: String(req.body.description || "").trim(),
    });

    return res.status(201).json({
      ok: true,
      message: "Document uploaded successfully",
      data: doc,
    });
  } catch (error: any) {
    return res.status(400).json({ ok: false, message: error?.message || "Failed to upload document" });
  }
}

// ── 12. My Requests (Centralized) ────────────────────────────────────────
export async function getMyRequests(req: PermissionRequest, res: Response) {
  try {
    await connectDatabase();
    const employee = await resolveCurrentEmployee(req);
    if (!employee) {
      return res.status(404).json({ ok: false, message: "Active employee profile not found" });
    }

    const hrRequests = (await EmployeeRequestModel.find({
      storeId: employee.storeId,
      employeeId: employee._id,
    })
      .sort({ createdAt: -1 })
      .lean()) as any[];

    const leaveRequests = (await LeaveRequestModel.find({
      storeId: employee.storeId,
      employeeId: employee._id,
    })
      .sort({ createdAt: -1 })
      .lean()) as any[];

    // Normalize leave requests into the centralized requests shape
    const normalizedLeaves = leaveRequests.map((lr) => ({
      _id: lr._id,
      type: "leave_request",
      title: `Leave: ${lr.leaveType.toUpperCase()} (${lr.daysCount} days)`,
      description: lr.reason,
      status: lr.status,
      data: {
        leaveType: lr.leaveType,
        startDate: lr.startDate,
        endDate: lr.endDate,
        daysCount: lr.daysCount,
      },
      createdAt: lr.createdAt,
      reviewedBy: lr.approvedBy,
      reviewedAt: lr.approvedAt,
      reviewNote: lr.managerRemarks,
    }));

    const combined = [...hrRequests, ...normalizedLeaves].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return res.json({
      ok: true,
      data: {
        requests: combined,
        total: combined.length,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ ok: false, message: error?.message || "Failed to fetch requests" });
  }
}

export async function cancelMyRequest(req: PermissionRequest, res: Response) {
  try {
    await connectDatabase();
    const employee = await resolveCurrentEmployee(req);
    if (!employee) {
      return res.status(404).json({ ok: false, message: "Active employee profile not found" });
    }

    const requestId = req.params.requestId;
    const request = await EmployeeRequestModel.findOne({
      _id: requestId,
      storeId: employee.storeId,
      employeeId: employee._id,
    });

    if (!request) {
      return res.status(404).json({ ok: false, message: "Request not found or not owned by you" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        ok: false,
        message: `Only pending requests can be cancelled. Current status is ${request.status}.`,
      });
    }

    request.status = "cancelled";
    await request.save();

    return res.json({
      ok: true,
      message: "Request cancelled successfully",
      data: request,
    });
  } catch (error: any) {
    return res.status(400).json({ ok: false, message: error?.message || "Failed to cancel request" });
  }
}

// ── 13. My Notifications ─────────────────────────────────────────────────
export async function getMyNotifications(req: PermissionRequest, res: Response) {
  try {
    await connectDatabase();
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ ok: false, message: "Unauthorized" });
    }

    const unreadOnly = req.query.unreadOnly === "true";
    const filter: Record<string, unknown> = {
      userId: oid(userId),
    };

    if (unreadOnly) {
      filter.isRead = false;
    }

    const notifications = await NotificationModel.find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const unreadCount = await NotificationModel.countDocuments({
      userId: oid(userId),
      isRead: false,
    });

    return res.json({
      ok: true,
      data: {
        notifications,
        unreadCount,
        total: notifications.length,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ ok: false, message: error?.message || "Failed to fetch notifications" });
  }
}

export async function markMyNotificationRead(req: PermissionRequest, res: Response) {
  try {
    await connectDatabase();
    const userId = req.user?.userId;
    const notificationId = req.params.id;

    const notif = await NotificationModel.findOneAndUpdate(
      { _id: notificationId, userId },
      { $set: { isRead: true } },
      { new: true }
    );

    if (!notif) {
      return res.status(404).json({ ok: false, message: "Notification not found" });
    }

    return res.json({ ok: true, message: "Marked as read", data: notif });
  } catch (error: any) {
    return res.status(400).json({ ok: false, message: error?.message || "Failed to mark as read" });
  }
}

export async function markAllMyNotificationsRead(req: PermissionRequest, res: Response) {
  try {
    await connectDatabase();
    const userId = req.user?.userId;

    await NotificationModel.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true } }
    );

    return res.json({ ok: true, message: "All notifications marked as read" });
  } catch (error: any) {
    return res.status(400).json({ ok: false, message: error?.message || "Failed to mark all as read" });
  }
}

// ── 14. My Tasks ─────────────────────────────────────────────────────────
export async function getMyTasks(req: PermissionRequest, res: Response) {
  try {
    await connectDatabase();
    const employee = await resolveCurrentEmployee(req);
    if (!employee) {
      return res.status(404).json({ ok: false, message: "Active employee profile not found" });
    }

    const tasks = await OperationTaskModel.find({
      storeId: employee.storeId,
      $or: [
        { assignedToId: employee._id },
        { assignedToId: req.user!.userId },
      ],
    })
      .sort({ dueDate: 1, createdAt: -1 })
      .lean();

    return res.json({
      ok: true,
      data: {
        tasks,
        total: tasks.length,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ ok: false, message: error?.message || "Failed to fetch tasks" });
  }
}

export async function updateMyTaskStatus(req: PermissionRequest, res: Response) {
  try {
    await connectDatabase();
    const employee = await resolveCurrentEmployee(req);
    if (!employee) {
      return res.status(404).json({ ok: false, message: "Active employee profile not found" });
    }

    const taskId = req.params.taskId;
    const { status } = req.body;
    const allowedStatuses = ["todo", "in_progress", "under_review", "completed"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        ok: false,
        message: `Invalid status. Allowed: ${allowedStatuses.join(", ")}`,
      });
    }

    const task = await OperationTaskModel.findOne({
      _id: taskId,
      storeId: employee.storeId,
      $or: [
        { assignedToId: employee._id },
        { assignedToId: req.user!.userId },
      ],
    });

    if (!task) {
      return res.status(404).json({ ok: false, message: "Task not found or not assigned to you" });
    }

    task.status = status;
    await task.save();

    return res.json({
      ok: true,
      message: "Task status updated successfully",
      data: task,
    });
  } catch (error: any) {
    return res.status(400).json({ ok: false, message: error?.message || "Failed to update task status" });
  }
}
