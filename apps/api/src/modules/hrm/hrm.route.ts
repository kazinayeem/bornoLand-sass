import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware.js";
import { requireFeatureAccess } from "../../common/middleware/feature.middleware.js";
import { requireStorePermission } from "../../common/middleware/store-permission.middleware.js";
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
  provisionEmployeeLoginController,
} from "./hrm.controller.js";
import { hrmSelfServiceRouter } from "./hrm-self-service.route.js";

export const hrmRouter: Router = Router({ mergeParams: true });

const storeId = (req: { params: { storeId?: string } }) => String(req.params.storeId);
const hrmGuard = requireFeatureAccess("employees", { getStoreId: storeId });
const payrollGuard = requireFeatureAccess("payroll", { getStoreId: storeId });
const hrmPermissionGuard = requireStorePermission("hrm:read");
const payrollPermissionGuard = requireStorePermission("hrm:payroll:manage");

hrmRouter.use(requireAuth);

// ── Dedicated Employee Self-Service Portal Routes ──
hrmRouter.use("/self-service", hrmSelfServiceRouter);

// Employees (admin HRM - requires hrm:read permission)
hrmRouter.get("/employees", hrmGuard, hrmPermissionGuard, listEmployeesController);
hrmRouter.post("/employees", hrmGuard, requireStorePermission("hrm:create"), createEmployeeController);
hrmRouter.get("/employees/:employeeId", hrmGuard, hrmPermissionGuard, getEmployeeController);
hrmRouter.put("/employees/:employeeId", hrmGuard, requireStorePermission("hrm:update"), updateEmployeeController);
hrmRouter.post("/employees/:employeeId/provision-login", hrmGuard, requireStorePermission("hrm:create"), provisionEmployeeLoginController);

// Employee ID Card (Admin view)
hrmRouter.get("/employees/:employeeId/id-card", hrmGuard, hrmPermissionGuard, async (req, res) => {
  const { getEmployeeIdCardAdminController } = await import("./employee-id-card.controller.js");
  return getEmployeeIdCardAdminController(req, res);
});

// Admin Upload Employee Photo
hrmRouter.post("/employees/:employeeId/photo", hrmGuard, requireStorePermission("hrm:update"), async (req, res) => {
  const { uploadEmployeePhotoAdminController } = await import("./employee-id-card.controller.js");
  const { photoUploadMiddleware } = await import("./hrm-self-service.controller.js");
  photoUploadMiddleware(req, res, (err) => {
    if (err) return res.status(400).json({ ok: false, message: err.message });
    return uploadEmployeePhotoAdminController(req, res);
  });
});

// Organization (admin HRM - requires hrm:read permission)
hrmRouter.get("/departments", hrmGuard, hrmPermissionGuard, listDepartmentsController);
hrmRouter.post("/departments", hrmGuard, hrmPermissionGuard, createDepartmentController);
hrmRouter.get("/designations", hrmGuard, hrmPermissionGuard, listDesignationsController);
hrmRouter.post("/designations", hrmGuard, hrmPermissionGuard, createDesignationController);

// Shifts & Attendance (admin HRM - requires hrm:read permission)
hrmRouter.get("/shifts", hrmGuard, hrmPermissionGuard, listShiftsController);
hrmRouter.post("/shifts", hrmGuard, hrmPermissionGuard, createShiftController);
hrmRouter.post("/attendance/clock-in", hrmGuard, hrmPermissionGuard, clockInController);
hrmRouter.post("/attendance/clock-out", hrmGuard, hrmPermissionGuard, clockOutController);
hrmRouter.get("/attendance", hrmGuard, hrmPermissionGuard, listDailyAttendanceController);

// Leaves (admin HRM - requires hrm:read permission)
hrmRouter.get("/leaves", hrmGuard, hrmPermissionGuard, listLeavesController);
hrmRouter.post("/leaves", hrmGuard, hrmPermissionGuard, applyLeaveController);
hrmRouter.post("/leaves/:leaveId/approve", hrmGuard, hrmPermissionGuard, approveLeaveController);

// Payroll (admin HRM - requires hrm:payroll:manage permission)
hrmRouter.get("/payroll", payrollGuard, payrollPermissionGuard, listPayrollsController);
hrmRouter.post("/payroll/generate", payrollGuard, payrollPermissionGuard, generatePayrollController);
hrmRouter.post("/payroll/:payrollId/approve", payrollGuard, payrollPermissionGuard, approvePayrollController);
hrmRouter.post("/payroll/:payrollId/pay", payrollGuard, payrollPermissionGuard, markPaidPayrollController);

// HR Requests (Bank updates, Attendance corrections, etc. - requires hrm:read / hrm:manage)
hrmRouter.get("/requests", hrmGuard, hrmPermissionGuard, async (req, res) => {
  const { listHrmRequestsController } = await import("./hrm.controller.js");
  return listHrmRequestsController(req, res);
});
hrmRouter.post("/requests/:requestId/review", hrmGuard, requireStorePermission("hrm:update"), async (req, res) => {
  const { reviewHrmRequestController } = await import("./hrm.controller.js");
  return reviewHrmRequestController(req, res);
});

// Employee Documents (Admin view and upload)
hrmRouter.get("/employees/:employeeId/documents", hrmGuard, hrmPermissionGuard, async (req, res) => {
  const { listEmployeeDocumentsController } = await import("./hrm.controller.js");
  return listEmployeeDocumentsController(req, res);
});
hrmRouter.post("/employees/:employeeId/documents", hrmGuard, requireStorePermission("hrm:update"), async (req, res) => {
  const { uploadEmployeeDocumentAdminController } = await import("./hrm.controller.js");
  return uploadEmployeeDocumentAdminController(req, res);
});

