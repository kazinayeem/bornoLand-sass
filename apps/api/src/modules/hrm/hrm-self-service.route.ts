import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware.js";
import { requireStoreAccess } from "../../common/middleware/store-permission.middleware.js";
import {
  getMyEmployeeProfile,
  getMyTodayAttendance,
  clockInMyAttendance,
  clockOutMyAttendance,
  getMyAttendanceHistory,
  getMyLeaves,
  applyMyLeave,
  cancelMyLeave,
  getMyPayslips,
} from "./hrm-self-service.controller.js";

export const hrmSelfServiceRouter: Router = Router({ mergeParams: true });

// All self-service endpoints require authenticated user and active store membership
hrmSelfServiceRouter.use(requireAuth, requireStoreAccess);

// 1. My Employee Profile
hrmSelfServiceRouter.get("/profile", getMyEmployeeProfile);

// 2. Attendance & Live Clocking
hrmSelfServiceRouter.get("/attendance/today", getMyTodayAttendance);
hrmSelfServiceRouter.post("/attendance/clock-in", clockInMyAttendance);
hrmSelfServiceRouter.post("/attendance/clock-out", clockOutMyAttendance);
hrmSelfServiceRouter.get("/attendance/history", getMyAttendanceHistory);

// 3. Leaves & Balances
hrmSelfServiceRouter.get("/leaves", getMyLeaves);
hrmSelfServiceRouter.post("/leaves", applyMyLeave);
hrmSelfServiceRouter.delete("/leaves/:leaveId", cancelMyLeave);

// 4. Payslips & Salary
hrmSelfServiceRouter.get("/payslips", getMyPayslips);
