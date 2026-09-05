import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware.js";
import { requireStoreAccess } from "../../common/middleware/store-permission.middleware.js";
import {
  getMyEmployeeProfile,
  updateMyEmployeeProfile,
  uploadMyProfilePhoto,
  photoUploadMiddleware,
  getMyTodayAttendance,
  clockInMyAttendance,
  clockOutMyAttendance,
  getMyAttendanceHistory,
  requestAttendanceCorrection,
  getMyLeaves,
  applyMyLeave,
  cancelMyLeave,
  getMyPayslips,
  getMyBankAccount,
  requestBankAccountChange,
  getMyDocuments,
  uploadMyDocument,
  documentUploadMiddleware,
  getMyRequests,
  cancelMyRequest,
  getMyNotifications,
  markMyNotificationRead,
  markAllMyNotificationsRead,
  getMyTasks,
  updateMyTaskStatus,
} from "./hrm-self-service.controller.js";

export const hrmSelfServiceRouter: Router = Router({ mergeParams: true });

// All self-service endpoints require authenticated user and active store membership
hrmSelfServiceRouter.use(requireAuth, requireStoreAccess);

// 1. My Employee Profile
hrmSelfServiceRouter.get("/profile", getMyEmployeeProfile);
hrmSelfServiceRouter.patch("/profile", updateMyEmployeeProfile);
hrmSelfServiceRouter.post("/profile/photo", photoUploadMiddleware, uploadMyProfilePhoto);
hrmSelfServiceRouter.get("/id-card", async (req, res) => {
  const { getMyEmployeeIdCardController } = await import("./employee-id-card.controller.js");
  return getMyEmployeeIdCardController(req, res);
});

// 2. Attendance & Live Clocking
hrmSelfServiceRouter.get("/attendance/today", getMyTodayAttendance);
hrmSelfServiceRouter.post("/attendance/clock-in", clockInMyAttendance);
hrmSelfServiceRouter.post("/attendance/clock-out", clockOutMyAttendance);
hrmSelfServiceRouter.get("/attendance/history", getMyAttendanceHistory);
hrmSelfServiceRouter.post("/attendance/correction", requestAttendanceCorrection);

// 3. Leaves & Balances
hrmSelfServiceRouter.get("/leaves", getMyLeaves);
hrmSelfServiceRouter.post("/leaves", applyMyLeave);
hrmSelfServiceRouter.delete("/leaves/:leaveId", cancelMyLeave);

// 4. Payslips & Salary
hrmSelfServiceRouter.get("/payslips", getMyPayslips);

// 5. Bank Account & Change Requests
hrmSelfServiceRouter.get("/bank-account", getMyBankAccount);
hrmSelfServiceRouter.post("/bank-account/request", requestBankAccountChange);

// 6. Documents
hrmSelfServiceRouter.get("/documents", getMyDocuments);
hrmSelfServiceRouter.post("/documents", documentUploadMiddleware, uploadMyDocument);

// 7. Centralized Requests
hrmSelfServiceRouter.get("/requests", getMyRequests);
hrmSelfServiceRouter.delete("/requests/:requestId", cancelMyRequest);

// 8. Notifications
hrmSelfServiceRouter.get("/notifications", getMyNotifications);
hrmSelfServiceRouter.put("/notifications/read-all", markAllMyNotificationsRead);
hrmSelfServiceRouter.put("/notifications/:id/read", markMyNotificationRead);

// 9. Assigned Tasks
hrmSelfServiceRouter.get("/tasks", getMyTasks);
hrmSelfServiceRouter.patch("/tasks/:taskId/status", updateMyTaskStatus);
