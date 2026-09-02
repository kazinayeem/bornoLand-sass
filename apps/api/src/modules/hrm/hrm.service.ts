import mongoose from "mongoose";
import { connectDatabase } from "../../common/database/connection.js";
import { EmployeeModel } from "./employee.model.js";
import { DepartmentModel, DesignationModel } from "./organization.model.js";
import { ShiftModel } from "./shift.model.js";
import { AttendanceModel } from "./attendance.model.js";
import { LeaveRequestModel } from "./leave.model.js";
import { PayrollModel } from "./payroll.model.js";

function oid(id: string | mongoose.Types.ObjectId | null | undefined): mongoose.Types.ObjectId | null {
  if (!id) return null;
  if (typeof id !== "string") return id as mongoose.Types.ObjectId;
  if (mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id) {
    return new mongoose.Types.ObjectId(id);
  }
  return null;
}

function storeOid(storeId: string | mongoose.Types.ObjectId): mongoose.Types.ObjectId {
  if (typeof storeId !== "string") return storeId as mongoose.Types.ObjectId;
  if (mongoose.Types.ObjectId.isValid(storeId) && String(new mongoose.Types.ObjectId(storeId)) === storeId) {
    return new mongoose.Types.ObjectId(storeId);
  }
  return new mongoose.Types.ObjectId("000000000000000000000000");
}

function genPayslipNumber(month: number, year: number) {
  const m = String(month).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `PS-${year}${m}-${rand}`;
}

// ── 1. Employees ─────────────────────────────────────────────────────────────

export async function listEmployees(
  storeId: string,
  query: { page?: number; limit?: number; search?: string; departmentId?: string; status?: string }
) {
  await connectDatabase();
  const sid = storeOid(storeId);
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const skip = (page - 1) * limit;

  const filter: Record<string, any> = { storeId: sid };
  if (query.departmentId && oid(query.departmentId)) filter.departmentId = oid(query.departmentId);
  if (query.status && query.status !== "all") filter.status = query.status;
  if (query.search) {
    const s = query.search.trim();
    filter.$or = [
      { firstName: { $regex: s, $options: "i" } },
      { lastName: { $regex: s, $options: "i" } },
      { employeeCode: { $regex: s, $options: "i" } },
      { email: { $regex: s, $options: "i" } },
      { phone: { $regex: s, $options: "i" } },
    ];
  }

  const [employees, total] = await Promise.all([
    EmployeeModel.find(filter)
      .populate("departmentId", "name code")
      .populate("designationId", "name code")
      .populate("shiftId", "name startTime endTime")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    EmployeeModel.countDocuments(filter),
  ]);

  return {
    employees,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function createEmployee(storeId: string, payload: any) {
  await connectDatabase();
  const sid = storeOid(storeId);

  const count = await EmployeeModel.countDocuments({ storeId: sid });
  const employeeCode = payload.employeeCode?.trim() || `EMP-${String(count + 1).padStart(4, "0")}`;

  const basic = Number(payload.salaryStructure?.basic || 0);
  const houseRent = Number(payload.salaryStructure?.houseRent || 0);
  const medical = Number(payload.salaryStructure?.medical || 0);
  const conveyance = Number(payload.salaryStructure?.conveyance || 0);
  const allowances = Number(payload.salaryStructure?.allowances || 0);
  const grossSalary = basic + houseRent + medical + conveyance + allowances;

  const employee = await EmployeeModel.create({
    ...payload,
    storeId: sid,
    employeeCode,
    departmentId: payload.departmentId ? oid(payload.departmentId) : null,
    designationId: payload.designationId ? oid(payload.designationId) : null,
    shiftId: payload.shiftId ? oid(payload.shiftId) : null,
    managerId: payload.managerId ? oid(payload.managerId) : null,
    salaryStructure: {
      ...payload.salaryStructure,
      basic,
      houseRent,
      medical,
      conveyance,
      allowances,
      grossSalary,
    },
  });

  return employee;
}

export async function updateEmployee(storeId: string, employeeId: string, payload: any) {
  await connectDatabase();
  const sid = storeOid(storeId);
  const eId = oid(employeeId);
  if (!eId) throw new Error("Invalid employee ID");

  const employee = await EmployeeModel.findOne({ _id: eId, storeId: sid });
  if (!employee) throw new Error("Employee not found");

  if (payload.salaryStructure) {
    const basic = Number(payload.salaryStructure.basic ?? employee.salaryStructure?.basic ?? 0);
    const houseRent = Number(payload.salaryStructure.houseRent ?? employee.salaryStructure?.houseRent ?? 0);
    const medical = Number(payload.salaryStructure.medical ?? employee.salaryStructure?.medical ?? 0);
    const conveyance = Number(payload.salaryStructure.conveyance ?? employee.salaryStructure?.conveyance ?? 0);
    const allowances = Number(payload.salaryStructure.allowances ?? employee.salaryStructure?.allowances ?? 0);
    payload.salaryStructure.grossSalary = basic + houseRent + medical + conveyance + allowances;
  }

  Object.assign(employee, payload);
  await employee.save();
  return employee;
}

export async function getEmployeeById(storeId: string, employeeId: string) {
  await connectDatabase();
  const sid = storeOid(storeId);
  const eId = oid(employeeId);
  if (!eId) throw new Error("Invalid employee ID");

  return EmployeeModel.findOne({ _id: eId, storeId: sid })
    .populate("departmentId")
    .populate("designationId")
    .populate("shiftId")
    .populate("managerId", "firstName lastName employeeCode")
    .lean();
}

// ── 2. Organization: Departments & Designations ─────────────────────────────

export async function listDepartments(storeId: string) {
  await connectDatabase();
  return DepartmentModel.find({ storeId: storeOid(storeId) }).sort({ name: 1 }).lean();
}

export async function createDepartment(storeId: string, payload: { name: string; code?: string; description?: string }) {
  await connectDatabase();
  return DepartmentModel.create({ ...payload, storeId: storeOid(storeId) });
}

export async function listDesignations(storeId: string) {
  await connectDatabase();
  return DesignationModel.find({ storeId: storeOid(storeId) })
    .populate("departmentId", "name")
    .sort({ name: 1 })
    .lean();
}

export async function createDesignation(
  storeId: string,
  payload: { name: string; code?: string; departmentId?: string; description?: string }
) {
  await connectDatabase();
  return DesignationModel.create({
    ...payload,
    storeId: storeOid(storeId),
    departmentId: payload.departmentId ? oid(payload.departmentId) : null,
  });
}

// ── 3. Shifts ───────────────────────────────────────────────────────────────

export async function listShifts(storeId: string) {
  await connectDatabase();
  return ShiftModel.find({ storeId: storeOid(storeId) }).sort({ name: 1 }).lean();
}

export async function createShift(storeId: string, payload: any) {
  await connectDatabase();
  return ShiftModel.create({ ...payload, storeId: storeOid(storeId) });
}

// ── 4. Attendance ───────────────────────────────────────────────────────────

export async function clockInEmployee(
  storeId: string,
  employeeId: string,
  payload: { date?: string; ipAddress?: string; device?: string }
) {
  await connectDatabase();
  const sid = storeOid(storeId);
  const eId = oid(employeeId);
  if (!eId) throw new Error("Invalid employee ID");

  const todayStr = payload.date || new Date().toISOString().slice(0, 10);
  const now = new Date();

  let att = await AttendanceModel.findOne({ storeId: sid, employeeId: eId, date: todayStr });
  if (!att) {
    att = new AttendanceModel({
      storeId: sid,
      employeeId: eId,
      date: todayStr,
      checkIn: now,
      status: "present",
      ipAddress: payload.ipAddress || "",
      device: payload.device || "",
    });
  } else if (!att.checkIn) {
    att.checkIn = now;
  }

  await att.save();
  return att;
}

export async function clockOutEmployee(
  storeId: string,
  employeeId: string,
  payload: { date?: string }
) {
  await connectDatabase();
  const sid = storeOid(storeId);
  const eId = oid(employeeId);
  if (!eId) throw new Error("Invalid employee ID");

  const todayStr = payload.date || new Date().toISOString().slice(0, 10);
  const now = new Date();

  const att = await AttendanceModel.findOne({ storeId: sid, employeeId: eId, date: todayStr });
  if (!att) throw new Error("No check-in record found for today");

  att.checkOut = now;
  if (att.checkIn) {
    const diffMs = now.getTime() - new Date(att.checkIn).getTime();
    att.workedMinutes = Math.max(0, Math.floor(diffMs / (60 * 1000)));
    // calculate overtime if worked more than 8 hours (480 mins)
    if (att.workedMinutes > 480) {
      att.overtimeMinutes = att.workedMinutes - 480;
    }
  }

  await att.save();
  return att;
}

export async function listDailyAttendance(storeId: string, date: string) {
  await connectDatabase();
  const sid = storeOid(storeId);
  const targetDate = date || new Date().toISOString().slice(0, 10);

  const [records, employees] = await Promise.all([
    AttendanceModel.find({ storeId: sid, date: targetDate })
      .populate("employeeId", "firstName lastName employeeCode departmentId designationId photoUrl")
      .lean(),
    EmployeeModel.find({ storeId: sid, status: "active" })
      .select("firstName lastName employeeCode departmentId designationId photoUrl")
      .lean(),
  ]);

  return {
    date: targetDate,
    totalEmployees: employees.length,
    presentCount: records.filter((r) => r.status === "present" || r.status === "late").length,
    records,
  };
}

// ── 5. Leaves ───────────────────────────────────────────────────────────────

export async function applyLeaveRequest(storeId: string, payload: any) {
  await connectDatabase();
  return LeaveRequestModel.create({
    ...payload,
    storeId: storeOid(storeId),
    employeeId: oid(payload.employeeId),
    status: "pending",
  });
}

export async function approveOrRejectLeave(
  storeId: string,
  leaveId: string,
  payload: { status: "approved" | "rejected"; approvedBy: string; managerRemarks?: string }
) {
  await connectDatabase();
  const leave = await LeaveRequestModel.findOne({ _id: oid(leaveId), storeId: storeOid(storeId) });
  if (!leave) throw new Error("Leave request not found");

  leave.status = payload.status;
  leave.approvedBy = payload.approvedBy;
  leave.approvedAt = new Date();
  if (payload.managerRemarks) leave.managerRemarks = payload.managerRemarks;

  await leave.save();
  return leave;
}

export async function listLeaveRequests(storeId: string, query: { status?: string; page?: number; limit?: number }) {
  await connectDatabase();
  const sid = storeOid(storeId);
  const filter: Record<string, any> = { storeId: sid };
  if (query.status && query.status !== "all") filter.status = query.status;

  const records = await LeaveRequestModel.find(filter)
    .populate("employeeId", "firstName lastName employeeCode departmentId")
    .sort({ createdAt: -1 })
    .lean();

  return { records, total: records.length };
}

// ── 6. Auditable Payroll Engine ─────────────────────────────────────────────

export async function generateMonthlyPayroll(
  storeId: string,
  payload: { month: number; year: number; employeeIds?: string[] }
) {
  await connectDatabase();
  const sid = storeOid(storeId);
  const month = Number(payload.month);
  const year = Number(payload.year);

  const empFilter: Record<string, any> = { storeId: sid, status: "active" };
  if (payload.employeeIds?.length) {
    empFilter._id = { $in: payload.employeeIds.map((id) => oid(id)) };
  }

  const employees = await EmployeeModel.find(empFilter).lean();
  const results = [];

  for (const emp of employees) {
    // 1. Base salary and allowances
    const basic = emp.salaryStructure?.basic || 0;
    const houseRent = emp.salaryStructure?.houseRent || 0;
    const medical = emp.salaryStructure?.medical || 0;
    const conveyance = emp.salaryStructure?.conveyance || 0;
    const allowances = emp.salaryStructure?.allowances || 0;
    const grossSalary = basic + houseRent + medical + conveyance + allowances;

    // 2. Overtime calculation from attendance for that month
    const startStr = `${year}-${String(month).padStart(2, "0")}-01`;
    const endStr = `${year}-${String(month).padStart(2, "0")}-31`;

    const attendances = await AttendanceModel.find({
      storeId: sid,
      employeeId: emp._id,
      date: { $gte: startStr, $lte: endStr },
    }).lean();

    const totalOtMins = attendances.reduce((acc, a) => acc + (a.overtimeMinutes || 0), 0);
    const overtimeHours = Number((totalOtMins / 60).toFixed(1));
    const hourlyRate = emp.salaryStructure?.overtimeHourlyRate || (grossSalary > 0 ? grossSalary / (30 * 8) : 0);
    const overtimePay = Number((overtimeHours * hourlyRate).toFixed(2));

    // 3. Deductions
    const taxDeduction = emp.salaryStructure?.taxDeduction || 0;
    const pfDeduction = emp.salaryStructure?.providentFund || 0;
    const totalDeductions = taxDeduction + pfDeduction;

    // 4. Net Salary
    const netSalary = Math.max(0, grossSalary + overtimePay - totalDeductions);

    // 5. Create or Update Payroll record
    const payslipNumber = genPayslipNumber(month, year);

    const record = await PayrollModel.findOneAndUpdate(
      { storeId: sid, employeeId: emp._id, month, year },
      {
        $set: {
          storeId: sid,
          employeeId: emp._id,
          month,
          year,
          payslipNumber,
          basicSalary: basic,
          houseRent,
          medical,
          conveyance,
          otherAllowances: allowances,
          overtimeHours,
          overtimeRate: Number(hourlyRate.toFixed(2)),
          overtimePay,
          bonus: 0,
          commission: 0,
          grossSalary,
          taxDeduction,
          providentFundDeduction: pfDeduction,
          totalDeductions,
          netSalary,
          status: "generated",
        },
      },
      { upsert: true, new: true }
    );

    results.push(record);
  }

  return {
    month,
    year,
    generatedCount: results.length,
    totalGrossDisbursement: results.reduce((sum, r) => sum + r.grossSalary, 0),
    totalNetDisbursement: results.reduce((sum, r) => sum + r.netSalary, 0),
    payrolls: results,
  };
}

export async function listPayrolls(
  storeId: string,
  query: { month?: number; year?: number; status?: string }
) {
  await connectDatabase();
  const sid = storeOid(storeId);
  const filter: Record<string, any> = { storeId: sid };
  if (query.month) filter.month = Number(query.month);
  if (query.year) filter.year = Number(query.year);
  if (query.status && query.status !== "all") filter.status = query.status;

  const payrolls = await PayrollModel.find(filter)
    .populate("employeeId", "firstName lastName employeeCode departmentId designationId bankInfo")
    .sort({ createdAt: -1 })
    .lean();

  const totalNet = payrolls.reduce((sum, p) => sum + p.netSalary, 0);

  return {
    payrolls,
    total: payrolls.length,
    summary: {
      totalNetDisbursement: totalNet,
    },
  };
}

export async function approvePayroll(storeId: string, payrollId: string, approvedBy: string) {
  await connectDatabase();
  const p = await PayrollModel.findOne({ _id: oid(payrollId), storeId: storeOid(storeId) });
  if (!p) throw new Error("Payroll record not found");

  p.status = "approved";
  p.approvedBy = approvedBy;
  p.approvedAt = new Date();
  await p.save();
  return p;
}

export async function markPayrollPaid(
  storeId: string,
  payrollId: string,
  payload: { paymentMethod: string; paidAt?: Date }
) {
  await connectDatabase();
  const p = await PayrollModel.findOne({ _id: oid(payrollId), storeId: storeOid(storeId) });
  if (!p) throw new Error("Payroll record not found");

  p.status = "paid";
  p.paymentMethod = payload.paymentMethod || "bank_transfer";
  p.paidAt = payload.paidAt || new Date();
  await p.save();
  return p;
}
