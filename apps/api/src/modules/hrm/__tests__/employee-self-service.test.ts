import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import dotenvFlow from "dotenv-flow";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.resolve(__dirname, "../../../../");
const repoRoot = path.resolve(appDir, "../../");
dotenvFlow.config({ path: appDir, node_env: process.env.NODE_ENV ?? "development", silent: true });
dotenvFlow.config({ path: repoRoot, node_env: process.env.NODE_ENV ?? "development", silent: true });

import mongoose from "mongoose";
import { connectDatabase } from "../../../common/database/connection.js";
import { StoreModel } from "../../../models/store.model.js";
import { EmployeeModel } from "../employee.model.js";
import { AttendanceModel } from "../attendance.model.js";
import { LeaveRequestModel } from "../leave.model.js";
import { EmployeeRequestModel } from "../employee-request.model.js";
import { EmployeeDocumentModel } from "../employee-document.model.js";
import { OperationTaskModel } from "../../operations/operation-task.model.js";
import { NotificationModel } from "../../notifications/notification.model.js";
import {
  getMyEmployeeProfile,
  updateMyEmployeeProfile,
  getMyTodayAttendance,
  clockInMyAttendance,
  clockOutMyAttendance,
  requestAttendanceCorrection,
  applyMyLeave,
  getMyLeaves,
  cancelMyLeave,
  requestBankAccountChange,
  getMyBankAccount,
  getMyRequests,
  cancelMyRequest,
  getMyTasks,
  updateMyTaskStatus,
  getMyDocuments,
} from "../hrm-self-service.controller.js";
import { reviewHrmRequestController } from "../hrm.controller.js";

describe("HRM Employee Self-Service (ESS) & Workflow Integration Test Suite", () => {
  let storeId: mongoose.Types.ObjectId;
  let employeeUserId: mongoose.Types.ObjectId;
  let employeeId: mongoose.Types.ObjectId;
  let hrAdminUserId: mongoose.Types.ObjectId;
  let departmentId: mongoose.Types.ObjectId;

  const mockResponse = () => {
    const res: any = {};
    res.statusCode = 200;
    res.status = (code: number) => {
      res.statusCode = code;
      return res;
    };
    res.json = (data: any) => {
      res.data = data;
      return res;
    };
    return res;
  };

  before(async () => {
    await connectDatabase();

    storeId = new mongoose.Types.ObjectId();
    employeeUserId = new mongoose.Types.ObjectId();
    hrAdminUserId = new mongoose.Types.ObjectId();
    departmentId = new mongoose.Types.ObjectId();

    await StoreModel.create({
      tenantId: new mongoose.Types.ObjectId(),
      userId: hrAdminUserId,
      name: "ESS Test Store",
      slug: `ess-store-${Date.now()}`,
      currency: "BDT",
      plan: "business",
      billingStatus: "active",
      subscriptionStatus: "active",
      status: "active",
    });

    const emp = await EmployeeModel.create({
      storeId,
      userId: employeeUserId,
      firstName: "Rahim",
      lastName: "Uddin",
      employeeCode: "EMP-ESS-001",
      email: "rahim.uddin@teststore.local",
      phone: "+8801700000001",
      emergencyContact: {
        name: "Karim Uddin",
        relation: "Brother",
        phone: "+8801700000002",
      },
      presentAddress: "Mirpur 10, Dhaka",
      permanentAddress: "Sylhet Sadar",
      bloodGroup: "B+",
      departmentId,
      status: "active",
      salaryStructure: {
        basic: 30000,
        houseRent: 12000,
        medical: 3000,
        conveyance: 1500,
        allowances: 0,
        grossSalary: 46500,
      },
      bankInfo: {
        paymentMethod: "bank_transfer",
        accountHolderName: "Rahim Uddin",
        bankName: "Dutch Bangla Bank Ltd",
        branchName: "Mirpur Branch",
        accountNumber: "1234567890123",
        routingNumber: "098765432",
      },
    });
    employeeId = emp._id as mongoose.Types.ObjectId;
  });

  after(async () => {
    await EmployeeModel.deleteMany({ storeId });
    await AttendanceModel.deleteMany({ storeId });
    await LeaveRequestModel.deleteMany({ storeId });
    await EmployeeRequestModel.deleteMany({ storeId });
    await EmployeeDocumentModel.deleteMany({ storeId });
    await OperationTaskModel.deleteMany({ storeId });
    await NotificationModel.deleteMany({ storeId });
    await StoreModel.deleteMany({ _id: storeId });
    await mongoose.connection.close();
  });

  it("1. Employee profile resolution & view", async () => {
    const req: any = {
      storeContext: { storeId: String(storeId) },
      user: { userId: String(employeeUserId) },
    };
    const res = mockResponse();

    await getMyEmployeeProfile(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.data.ok, true);
    assert.equal(res.data.data.employee.employeeCode, "EMP-ESS-001");
    assert.equal(res.data.data.employee.email, "rahim.uddin@teststore.local");
  });

  it("2. Non-sensitive profile update (presentAddress, emergencyContact, phone)", async () => {
    const req: any = {
      storeContext: { storeId: String(storeId) },
      user: { userId: String(employeeUserId) },
      body: {
        phone: "+8801711112222",
        presentAddress: "Dhanmondi 32, Dhaka",
        emergencyContact: {
          name: "Jamal Uddin",
          relation: "Father",
          phone: "+8801733334444",
        },
      },
    };
    const res = mockResponse();

    await updateMyEmployeeProfile(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.data.ok, true);

    const updated = await EmployeeModel.findById(employeeId);
    assert.equal(updated?.phone, "+8801711112222");
    assert.equal(updated?.address, "Dhanmondi 32, Dhaka");
    assert.equal(updated?.emergencyContact?.name, "Jamal Uddin");
  });

  it("3. Attendance live clock-in and clock-out flow", async () => {
    const reqClockIn: any = {
      storeContext: { storeId: String(storeId) },
      user: { userId: String(employeeUserId) },
      ip: "127.0.0.1",
      get: () => "TestAgent/1.0",
    };
    const resClockIn = mockResponse();

    await clockInMyAttendance(reqClockIn, resClockIn);
    assert.equal(resClockIn.statusCode, 200);
    assert.equal(resClockIn.data.ok, true);
    assert.ok(resClockIn.data.data.checkIn);

    // Verify today attendance returns record
    const reqToday: any = {
      storeContext: { storeId: String(storeId) },
      user: { userId: String(employeeUserId) },
    };
    const resToday = mockResponse();
    await getMyTodayAttendance(reqToday, resToday);
    assert.equal(resToday.statusCode, 200);
    assert.equal(resToday.data.data.isClockedIn, true);

    // Clock out
    const reqClockOut: any = {
      storeContext: { storeId: String(storeId) },
      user: { userId: String(employeeUserId) },
    };
    const resClockOut = mockResponse();
    await clockOutMyAttendance(reqClockOut, resClockOut);
    assert.equal(resClockOut.statusCode, 200);
    assert.ok(resClockOut.data.data.checkOut);
  });

  it("4. Attendance correction request & HR approval workflow", async () => {
    // Employee requests correction for past date
    const reqCorr: any = {
      storeContext: { storeId: String(storeId) },
      user: { userId: String(employeeUserId) },
      body: {
        date: "2026-09-01",
        proposedCheckIn: "2026-09-01T09:00:00.000Z",
        proposedCheckOut: "2026-09-01T18:00:00.000Z",
        reason: "Biometric device offline due to power outage",
      },
    };
    const resCorr = mockResponse();

    await requestAttendanceCorrection(reqCorr, resCorr);
    assert.equal(resCorr.statusCode, 201);
    assert.equal(resCorr.data.ok, true);
    const requestId = resCorr.data.data._id;
    assert.ok(requestId);

    // HR reviews and approves the correction
    const reqReview: any = {
      storeContext: { storeId: String(storeId) },
      user: { userId: String(hrAdminUserId), firstName: "Admin", lastName: "HR" },
      params: { requestId: String(requestId) },
      body: {
        status: "approved",
        reviewNote: "Verified with CCTV log",
      },
    };
    const resReview = mockResponse();

    await reviewHrmRequestController(reqReview, resReview);
    assert.equal(resReview.statusCode, 200);
    assert.equal(resReview.data.ok, true);

    // Check attendance record was upserted/updated in database
    const att = await AttendanceModel.findOne({
      storeId,
      employeeId,
      date: "2026-09-01",
    });
    assert.ok(att);
    assert.equal(att?.status, "present");
    assert.equal(new Date(att?.checkIn!).toISOString(), "2026-09-01T09:00:00.000Z");
  });

  it("5. Leave application and self cancellation workflow", async () => {
    // Apply for casual leave
    const reqLeave: any = {
      storeContext: { storeId: String(storeId) },
      user: { userId: String(employeeUserId) },
      body: {
        leaveType: "casual",
        startDate: "2026-09-15",
        endDate: "2026-09-16",
        daysCount: 2,
        reason: "Family emergency",
      },
    };
    const resLeave = mockResponse();

    await applyMyLeave(reqLeave, resLeave);
    assert.equal(resLeave.statusCode, 201);
    assert.equal(resLeave.data.ok, true);
    const leaveId = resLeave.data.data._id;

    // View leaves list
    const reqList: any = {
      storeContext: { storeId: String(storeId) },
      user: { userId: String(employeeUserId) },
      query: {},
    };
    const resList = mockResponse();
    await getMyLeaves(reqList, resList);
    assert.equal(resList.statusCode, 200);
    assert.equal(resList.data.data.leaves.length, 1);
    assert.equal(resList.data.data.leaves[0].status, "pending");

    // Employee cancels pending leave
    const reqCancel: any = {
      storeContext: { storeId: String(storeId) },
      user: { userId: String(employeeUserId) },
      params: { leaveId: String(leaveId) },
    };
    const resCancel = mockResponse();
    await cancelMyLeave(reqCancel, resCancel);
    assert.equal(resCancel.statusCode, 200);
    assert.equal(resCancel.data.data.status, "cancelled");
  });

  it("6. Bank account update request & HR review mutating official record", async () => {
    const reqBankReq: any = {
      storeContext: { storeId: String(storeId) },
      user: { userId: String(employeeUserId) },
      body: {
        paymentMethod: "bank_transfer",
        accountHolderName: "Rahim Uddin",
        bankName: "BRAC Bank PLC",
        branchName: "Gulshan 1 Branch",
        accountNumber: "9876543210987",
        routingNumber: "123456789",
        reason: "Primary salary account changed to BRAC Bank",
      },
    };
    const resBankReq = mockResponse();

    await requestBankAccountChange(reqBankReq, resBankReq);
    assert.equal(resBankReq.statusCode, 201);
    const bankReqId = resBankReq.data.data._id;
    assert.ok(bankReqId);

    // Verify employee sees pending request
    const reqGetBank: any = {
      storeContext: { storeId: String(storeId) },
      user: { userId: String(employeeUserId) },
    };
    const resGetBank = mockResponse();
    await getMyBankAccount(reqGetBank, resGetBank);
    assert.equal(resGetBank.statusCode, 200);
    assert.ok(resGetBank.data.data.pendingRequest);
    assert.equal(resGetBank.data.data.pendingRequest.data.bankName, "BRAC Bank PLC");

    // HR reviews and approves bank account change
    const reqReviewBank: any = {
      storeContext: { storeId: String(storeId) },
      user: { userId: String(hrAdminUserId), firstName: "Admin", lastName: "HR" },
      params: { requestId: String(bankReqId) },
      body: {
        status: "approved",
        reviewNote: "Verified cheque copy and national ID",
      },
    };
    const resReviewBank = mockResponse();
    await reviewHrmRequestController(reqReviewBank, resReviewBank);
    assert.equal(resReviewBank.statusCode, 200);

    // Official employee record must now be updated to BRAC Bank
    const updatedEmp = await EmployeeModel.findById(employeeId);
    assert.equal(updatedEmp?.bankInfo?.bankName, "BRAC Bank PLC");
    assert.equal(updatedEmp?.bankInfo?.accountNumber, "9876543210987");

    // Employee notification should be sent
    const notifs = await NotificationModel.find({
      storeId,
      userId: employeeUserId,
      type: "hrm_bank_approved",
    });
    assert.equal(notifs.length, 1);
  });

  it("7. Tasks assigned to employee view & status mutation", async () => {
    // Create an operation task assigned to Rahim
    const task = await OperationTaskModel.create({
      storeId,
      taskNumber: `TASK-${Date.now()}`,
      title: "Store stock recount for Section B",
      description: "Perform physical count and report discrepancies",
      status: "todo",
      priority: "high",
      assignedToId: employeeUserId,
      dueDate: new Date("2026-09-10"),
    });

    const reqTasks: any = {
      storeContext: { storeId: String(storeId) },
      user: { userId: String(employeeUserId) },
      query: {},
    };
    const resTasks = mockResponse();
    await getMyTasks(reqTasks, resTasks);
    assert.equal(resTasks.statusCode, 200);
    assert.equal(resTasks.data.data.tasks.length, 1);
    assert.equal(resTasks.data.data.tasks[0].title, "Store stock recount for Section B");

    // Employee updates task status to in_progress
    const reqUpdateTask: any = {
      storeContext: { storeId: String(storeId) },
      user: { userId: String(employeeUserId) },
      params: { taskId: String(task._id) },
      body: { status: "in_progress" },
    };
    const resUpdateTask = mockResponse();
    await updateMyTaskStatus(reqUpdateTask, resUpdateTask);
    assert.equal(resUpdateTask.statusCode, 200);
    assert.equal(resUpdateTask.data.data.status, "in_progress");
  });

  it("8. Suspended / Terminated employee access blocked with 403", async () => {
    // Set employee status to suspended
    await EmployeeModel.findByIdAndUpdate(employeeId, { status: "suspended" });

    const reqSuspended: any = {
      storeContext: { storeId: String(storeId) },
      user: { userId: String(employeeUserId) },
    };
    const resSuspended = mockResponse();

    await getMyEmployeeProfile(reqSuspended, resSuspended);
    assert.equal(resSuspended.statusCode, 403);
    assert.match(resSuspended.data.message, /Access denied/);

    // Restore active status
    await EmployeeModel.findByIdAndUpdate(employeeId, { status: "active" });
  });

  it("9. Cross-store isolation & security", async () => {
    const otherStoreId = new mongoose.Types.ObjectId();
    const reqOtherStore: any = {
      storeContext: { storeId: String(otherStoreId) },
      user: { userId: String(employeeUserId) },
    };
    const resOtherStore = mockResponse();

    await getMyEmployeeProfile(reqOtherStore, resOtherStore);
    assert.equal(resOtherStore.statusCode, 404);
    assert.match(resOtherStore.data.message, /No active employee profile found/);
  });
});
