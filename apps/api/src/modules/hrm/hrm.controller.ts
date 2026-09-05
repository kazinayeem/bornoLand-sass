import type { Request, Response } from "express";
import type { AuthRequest } from "../../common/middleware/auth.middleware.js";
import {
  listEmployees,
  createEmployee,
  updateEmployee,
  getEmployeeById,
  provisionExistingEmployeeLogin,
  listDepartments,
  createDepartment,
  listDesignations,
  createDesignation,
  listShifts,
  createShift,
  clockInEmployee,
  clockOutEmployee,
  listDailyAttendance,
  applyLeaveRequest,
  approveOrRejectLeave,
  listLeaveRequests,
  generateMonthlyPayroll,
  listPayrolls,
  approvePayroll,
  markPayrollPaid,
} from "./hrm.service.js";

function storeIdOf(request: Request) {
  return String(request.params.storeId ?? (request as any).storeContext?.storeId ?? "");
}

// ── Employees ──
export async function listEmployeesController(request: Request, response: Response) {
  try {
    const storeId = storeIdOf(request);
    const result = await listEmployees(storeId, request.query as any);
    response.json({ ok: true, data: result });
  } catch (error: any) {
    response.status(500).json({ ok: false, message: error?.message || "Failed to list employees" });
  }
}

export async function createEmployeeController(request: Request, response: Response) {
  try {
    const storeId = storeIdOf(request);
    const result = await createEmployee(storeId, request.body);
    response.status(201).json({
      ok: true,
      message: result.loginAccount.created
        ? "Employee created successfully. Login account created."
        : "Employee created successfully. Existing login account linked.",
      data: result,
    });
  } catch (error: any) {
    const status = typeof error?.statusCode === "number" ? error.statusCode : 400;
    response.status(status).json({ ok: false, message: error?.message || "Failed to create employee" });
  }
}

export async function updateEmployeeController(request: Request, response: Response) {
  try {
    const storeId = storeIdOf(request);
    const employee = await updateEmployee(storeId, String(request.params.employeeId), request.body);
    response.json({ ok: true, data: employee });
  } catch (error: any) {
    response.status(400).json({ ok: false, message: error?.message || "Failed to update employee" });
  }
}

export async function provisionEmployeeLoginController(request: Request, response: Response) {
  try {
    const storeId = storeIdOf(request);
    const loginAccount = await provisionExistingEmployeeLogin(
      storeId,
      String(request.params.employeeId),
      request.body?.memberRole,
    );
    response.json({
      ok: true,
      message: loginAccount.created
        ? "Login account created. The employee can sign in with their email. The temporary password is their registered mobile number."
        : "Existing login account linked.",
      data: { loginAccount },
    });
  } catch (error: any) {
    const status = typeof error?.statusCode === "number" ? error.statusCode : 400;
    response.status(status).json({ ok: false, message: error?.message || "Failed to provision login account" });
  }
}

export async function getEmployeeController(request: Request, response: Response) {
  try {
    const storeId = storeIdOf(request);
    const employee = await getEmployeeById(storeId, String(request.params.employeeId));
    if (!employee) return void response.status(404).json({ ok: false, message: "Employee not found" });
    response.json({ ok: true, data: employee });
  } catch (error: any) {
    response.status(500).json({ ok: false, message: error?.message || "Failed to get employee" });
  }
}

// ── Organization ──
export async function listDepartmentsController(request: Request, response: Response) {
  try {
    const departments = await listDepartments(storeIdOf(request));
    response.json({ ok: true, data: { departments } });
  } catch (error: any) {
    response.status(500).json({ ok: false, message: error?.message || "Failed to list departments" });
  }
}

export async function createDepartmentController(request: Request, response: Response) {
  try {
    const department = await createDepartment(storeIdOf(request), request.body);
    response.status(201).json({ ok: true, data: department });
  } catch (error: any) {
    response.status(400).json({ ok: false, message: error?.message || "Failed to create department" });
  }
}

export async function listDesignationsController(request: Request, response: Response) {
  try {
    const designations = await listDesignations(storeIdOf(request));
    response.json({ ok: true, data: { designations } });
  } catch (error: any) {
    response.status(500).json({ ok: false, message: error?.message || "Failed to list designations" });
  }
}

export async function createDesignationController(request: Request, response: Response) {
  try {
    const designation = await createDesignation(storeIdOf(request), request.body);
    response.status(201).json({ ok: true, data: designation });
  } catch (error: any) {
    response.status(400).json({ ok: false, message: error?.message || "Failed to create designation" });
  }
}

// ── Shifts ──
export async function listShiftsController(request: Request, response: Response) {
  try {
    const shifts = await listShifts(storeIdOf(request));
    response.json({ ok: true, data: { shifts } });
  } catch (error: any) {
    response.status(500).json({ ok: false, message: error?.message || "Failed to list shifts" });
  }
}

export async function createShiftController(request: Request, response: Response) {
  try {
    const shift = await createShift(storeIdOf(request), request.body);
    response.status(201).json({ ok: true, data: shift });
  } catch (error: any) {
    response.status(400).json({ ok: false, message: error?.message || "Failed to create shift" });
  }
}

// ── Attendance ──
export async function clockInController(request: AuthRequest, response: Response) {
  try {
    const storeId = storeIdOf(request);
    const employeeId = String(request.body.employeeId || request.params.employeeId);
    const result = await clockInEmployee(storeId, employeeId, {
      ipAddress: request.ip,
      device: request.get("user-agent"),
    });
    response.json({ ok: true, data: result });
  } catch (error: any) {
    response.status(400).json({ ok: false, message: error?.message || "Failed to clock in" });
  }
}

export async function clockOutController(request: AuthRequest, response: Response) {
  try {
    const storeId = storeIdOf(request);
    const employeeId = String(request.body.employeeId || request.params.employeeId);
    const result = await clockOutEmployee(storeId, employeeId, {});
    response.json({ ok: true, data: result });
  } catch (error: any) {
    response.status(400).json({ ok: false, message: error?.message || "Failed to clock out" });
  }
}

export async function listDailyAttendanceController(request: Request, response: Response) {
  try {
    const result = await listDailyAttendance(storeIdOf(request), String(request.query.date ?? ""));
    response.json({ ok: true, data: result });
  } catch (error: any) {
    response.status(500).json({ ok: false, message: error?.message || "Failed to list attendance" });
  }
}

// ── Leaves ──
export async function applyLeaveController(request: AuthRequest, response: Response) {
  try {
    const leave = await applyLeaveRequest(storeIdOf(request), request.body);
    response.status(201).json({ ok: true, data: leave });
  } catch (error: any) {
    response.status(400).json({ ok: false, message: error?.message || "Failed to apply leave" });
  }
}

export async function approveLeaveController(request: AuthRequest, response: Response) {
  try {
    const leave = await approveOrRejectLeave(storeIdOf(request), String(request.params.leaveId), {
      status: request.body.status,
      approvedBy: request.user?.email || "Manager",
      managerRemarks: request.body.managerRemarks,
    });
    response.json({ ok: true, data: leave });
  } catch (error: any) {
    response.status(400).json({ ok: false, message: error?.message || "Failed to process leave" });
  }
}

export async function listLeavesController(request: Request, response: Response) {
  try {
    const result = await listLeaveRequests(storeIdOf(request), request.query as any);
    response.json({ ok: true, data: result });
  } catch (error: any) {
    response.status(500).json({ ok: false, message: error?.message || "Failed to list leaves" });
  }
}

// ── Payroll ──
export async function generatePayrollController(request: AuthRequest, response: Response) {
  try {
    const result = await generateMonthlyPayroll(storeIdOf(request), request.body);
    response.json({ ok: true, data: result });
  } catch (error: any) {
    response.status(400).json({ ok: false, message: error?.message || "Failed to generate payroll" });
  }
}

export async function listPayrollsController(request: Request, response: Response) {
  try {
    const result = await listPayrolls(storeIdOf(request), request.query as any);
    response.json({ ok: true, data: result });
  } catch (error: any) {
    response.status(500).json({ ok: false, message: error?.message || "Failed to list payrolls" });
  }
}

export async function approvePayrollController(request: AuthRequest, response: Response) {
  try {
    const payroll = await approvePayroll(storeIdOf(request), String(request.params.payrollId), request.user?.email || "HR Manager");
    response.json({ ok: true, data: payroll });
  } catch (error: any) {
    response.status(400).json({ ok: false, message: error?.message || "Failed to approve payroll" });
  }
}

export async function markPaidPayrollController(request: Request, response: Response) {
  try {
    const payroll = await markPayrollPaid(storeIdOf(request), String(request.params.payrollId), request.body);
    response.json({ ok: true, data: payroll });
  } catch (error: any) {
    response.status(400).json({ ok: false, message: error?.message || "Failed to mark payroll paid" });
  }
}

// ── HR Requests Review (Bank Account changes, Attendance corrections, etc.) ──
export async function listHrmRequestsController(request: Request, response: Response) {
  try {
    const storeId = storeIdOf(request);
    const { status, type, employeeId, page = 1, limit = 50 } = request.query as any;
    const filter: Record<string, unknown> = { storeId };
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (employeeId) filter.employeeId = employeeId;

    const skip = (Number(page) - 1) * Number(limit);
    const { EmployeeRequestModel } = await import("./employee-request.model.js");

    const [requests, total] = await Promise.all([
      EmployeeRequestModel.find(filter)
        .populate("employeeId", "firstName lastName employeeCode photoUrl email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      EmployeeRequestModel.countDocuments(filter),
    ]);

    response.json({ ok: true, data: { requests, total, page: Number(page), limit: Number(limit) } });
  } catch (error: any) {
    response.status(500).json({ ok: false, message: error?.message || "Failed to list requests" });
  }
}

export async function reviewHrmRequestController(request: AuthRequest, response: Response) {
  try {
    const storeId = storeIdOf(request);
    const requestId = String(request.params.requestId);
    const effectiveStatus = (request.body?.status || (request.body?.action === "approve" ? "approved" : request.body?.action === "reject" ? "rejected" : request.body?.action)) as string;
    const reviewNote = request.body?.reviewNote;

    if (!["approved", "rejected"].includes(effectiveStatus)) {
      return response.status(400).json({ ok: false, message: "Status must be 'approved' or 'rejected'" });
    }
    const status = effectiveStatus;

    const { EmployeeRequestModel } = await import("./employee-request.model.js");
    const { EmployeeModel } = await import("./employee.model.js");
    const { AttendanceModel } = await import("./attendance.model.js");
    const { NotificationModel } = await import("../notifications/notification.model.js");

    const reqDoc = await EmployeeRequestModel.findOne({ _id: requestId, storeId });
    if (!reqDoc) {
      return response.status(404).json({ ok: false, message: "Request not found" });
    }

    if (reqDoc.status !== "pending") {
      return response.status(400).json({ ok: false, message: `Request is already ${reqDoc.status}` });
    }

    reqDoc.status = status;
    reqDoc.reviewedBy = request.user?.userId as any;
    reqDoc.reviewerName = (request.user as any)?.name || request.user?.email || "HR Admin";
    reqDoc.reviewedAt = new Date();
    reqDoc.reviewNote = String(reviewNote || "").trim();

    // If approved, update official source of truth
    if (status === "approved") {
      if (reqDoc.type === "bank_account_change" && reqDoc.data) {
        await EmployeeModel.updateOne(
          { _id: reqDoc.employeeId, storeId },
          {
            $set: {
              "bankInfo.bankName": reqDoc.data.bankName || "",
              "bankInfo.accountName": reqDoc.data.accountName || "",
              "bankInfo.accountNumber": reqDoc.data.accountNumber || "",
              "bankInfo.branchName": reqDoc.data.branchName || "",
              "bankInfo.routingNumber": reqDoc.data.routingNumber || "",
              "bankInfo.mobileWalletNumber": reqDoc.data.mobileWalletNumber || "",
              "bankInfo.walletProvider": reqDoc.data.walletProvider || "bKash",
            },
          }
        );
      } else if (reqDoc.type === "attendance_correction" && reqDoc.data) {
        const { date, requestedCheckIn, requestedCheckOut } = reqDoc.data;
        if (date) {
          const checkInDate = requestedCheckIn ? new Date(requestedCheckIn) : undefined;
          const checkOutDate = requestedCheckOut ? new Date(requestedCheckOut) : undefined;
          let workedMinutes = 0;
          if (checkInDate && checkOutDate) {
            workedMinutes = Math.max(0, Math.floor((checkOutDate.getTime() - checkInDate.getTime()) / (60 * 1000)));
          }

          await AttendanceModel.findOneAndUpdate(
            { storeId, employeeId: reqDoc.employeeId, date },
            {
              $set: {
                checkIn: checkInDate,
                checkOut: checkOutDate,
                workedMinutes,
                status: "present",
                verifiedBy: "hr_admin_approved",
              },
            },
            { upsert: true, new: true }
          );
        }
      }
    }

    await reqDoc.save();

    // Create notification for employee
    try {
      const notifType = status === "approved"
        ? (reqDoc.type === "bank_account_change" ? "hrm_bank_approved" : "hrm_attendance_approved")
        : (reqDoc.type === "bank_account_change" ? "hrm_bank_rejected" : "hrm_attendance_rejected");

      await NotificationModel.create({
        userId: reqDoc.userId,
        storeId,
        title: `${reqDoc.title}: ${status.toUpperCase()}`,
        message: reviewNote ? `Your request was ${status}: ${reviewNote}` : `Your request was ${status} by HR.`,
        type: notifType,
        isRead: false,
        metadata: { requestId: reqDoc._id, type: reqDoc.type, status },
      });
    } catch {
      // non-fatal
    }

    return response.json({
      ok: true,
      message: `Request ${status} successfully`,
      data: reqDoc,
    });
  } catch (error: any) {
    return response.status(400).json({ ok: false, message: error?.message || "Failed to review request" });
  }
}

// ── Admin Employee Documents ──
export async function listEmployeeDocumentsController(request: Request, response: Response) {
  try {
    const storeId = storeIdOf(request);
    const employeeId = String(request.params.employeeId);
    const { EmployeeDocumentModel } = await import("./employee-document.model.js");

    const documents = await EmployeeDocumentModel.find({ storeId, employeeId })
      .sort({ createdAt: -1 })
      .lean();

    response.json({ ok: true, data: documents });
  } catch (error: any) {
    response.status(500).json({ ok: false, message: error?.message || "Failed to list employee documents" });
  }
}

export async function uploadEmployeeDocumentAdminController(request: AuthRequest, response: Response) {
  try {
    const storeId = storeIdOf(request);
    const employeeId = String(request.params.employeeId);
    const { EmployeeDocumentModel } = await import("./employee-document.model.js");
    const { EmployeeModel } = await import("./employee.model.js");

    const employee = await EmployeeModel.findOne({ _id: employeeId, storeId });
    if (!employee) {
      return response.status(404).json({ ok: false, message: "Employee not found" });
    }

    const { title, documentType, fileUrl, fileName, fileSize, mimeType, description } = request.body;
    if (!title || !fileUrl) {
      return response.status(400).json({ ok: false, message: "Title and fileUrl are required" });
    }

    const doc = await EmployeeDocumentModel.create({
      storeId,
      employeeId,
      userId: employee.userId || null,
      title,
      documentType: documentType || "other",
      fileUrl,
      fileName: fileName || title,
      fileSize: Number(fileSize) || 0,
      mimeType: mimeType || "application/pdf",
      uploadedBy: "hr_admin",
      uploadedById: request.user?.userId || null,
      description: String(description || "").trim(),
    });

    response.status(201).json({ ok: true, message: "Document saved", data: doc });
  } catch (error: any) {
    response.status(400).json({ ok: false, message: error?.message || "Failed to upload document" });
  }
}

