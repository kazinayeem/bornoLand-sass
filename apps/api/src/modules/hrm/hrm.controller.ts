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
  return String(request.params.storeId ?? "");
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
