import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware.js";
import { requireFeatureAccess } from "../../common/middleware/feature.middleware.js";
import {
  listEmployeesController,
  createEmployeeController,
  updateEmployeeController,
  getEmployeeController,
  listDepartmentsController,
  createDepartmentController,
  listDesignationsController,
  createDesignationController,
  listShiftsController,
  createShiftController,
  clockInController,
  clockOutController,
  listDailyAttendanceController,
  applyLeaveController,
  approveLeaveController,
  listLeavesController,
  generatePayrollController,
  listPayrollsController,
  approvePayrollController,
  markPaidPayrollController,
} from "./hrm.controller.js";

export const hrmRouter: Router = Router({ mergeParams: true });

const storeId = (req: { params: { storeId?: string } }) => String(req.params.storeId);
const hrmGuard = requireFeatureAccess("employees", { getStoreId: storeId });
const payrollGuard = requireFeatureAccess("payroll", { getStoreId: storeId });

hrmRouter.use(requireAuth);

// Employees
hrmRouter.get("/employees", hrmGuard, listEmployeesController);
hrmRouter.post("/employees", hrmGuard, createEmployeeController);
hrmRouter.get("/employees/:employeeId", hrmGuard, getEmployeeController);
hrmRouter.put("/employees/:employeeId", hrmGuard, updateEmployeeController);

// Organization
hrmRouter.get("/departments", hrmGuard, listDepartmentsController);
hrmRouter.post("/departments", hrmGuard, createDepartmentController);
hrmRouter.get("/designations", hrmGuard, listDesignationsController);
hrmRouter.post("/designations", hrmGuard, createDesignationController);

// Shifts & Attendance
hrmRouter.get("/shifts", hrmGuard, listShiftsController);
hrmRouter.post("/shifts", hrmGuard, createShiftController);
hrmRouter.post("/attendance/clock-in", hrmGuard, clockInController);
hrmRouter.post("/attendance/clock-out", hrmGuard, clockOutController);
hrmRouter.get("/attendance", hrmGuard, listDailyAttendanceController);

// Leaves
hrmRouter.get("/leaves", hrmGuard, listLeavesController);
hrmRouter.post("/leaves", hrmGuard, applyLeaveController);
hrmRouter.post("/leaves/:leaveId/approve", hrmGuard, approveLeaveController);

// Payroll
hrmRouter.get("/payroll", payrollGuard, listPayrollsController);
hrmRouter.post("/payroll/generate", payrollGuard, generatePayrollController);
hrmRouter.post("/payroll/:payrollId/approve", payrollGuard, approvePayrollController);
hrmRouter.post("/payroll/:payrollId/pay", payrollGuard, markPaidPayrollController);
