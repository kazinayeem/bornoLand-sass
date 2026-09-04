import { baseApi } from "@/redux/api/base-api";

export type Employee = {
  _id: string;
  storeId: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  photoUrl?: string;
  departmentId?: { _id: string; name: string; code?: string };
  designationId?: { _id: string; name: string; code?: string };
  shiftId?: { _id: string; name: string; startTime: string; endTime: string };
  userId?: string | null;
  employmentType: string;
  status: "active" | "on_leave" | "inactive" | "resigned" | "terminated" | "suspended";
  joiningDate: string;
  salaryStructure?: {
    basic: number;
    houseRent: number;
    medical: number;
    conveyance: number;
    allowances: number;
    grossSalary: number;
    overtimeHourlyRate?: number;
    taxDeduction?: number;
    providentFund?: number;
  };
  bankInfo?: {
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
    branchName?: string;
    routingNumber?: string;
    mobileWalletNumber?: string;
    walletProvider?: string;
  };
  createdAt: string;
};

export type Department = {
  _id: string;
  name: string;
  code?: string;
  description?: string;
  status: string;
};

export type Designation = {
  _id: string;
  name: string;
  code?: string;
  departmentId?: { _id: string; name: string };
  description?: string;
  status: string;
};

export type Shift = {
  _id: string;
  name: string;
  code?: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  gracePeriodMinutes: number;
  workDays: string[];
};

export type AttendanceRecord = {
  _id: string;
  employeeId: Employee;
  date: string;
  checkIn?: string | null;
  checkOut?: string | null;
  lateMinutes: number;
  earlyLeaveMinutes: number;
  overtimeMinutes: number;
  workedMinutes: number;
  status: string;
};

export type LeaveRequest = {
  _id: string;
  employeeId: Employee;
  leaveType: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  approvedBy?: string;
  approvedAt?: string;
  managerRemarks?: string;
  createdAt: string;
};

export type Payroll = {
  _id: string;
  employeeId: Employee;
  month: number;
  year: number;
  payslipNumber: string;
  basicSalary: number;
  houseRent: number;
  medical: number;
  conveyance: number;
  otherAllowances: number;
  overtimeHours: number;
  overtimePay: number;
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  status: "draft" | "generated" | "approved" | "paid";
  paymentMethod: string;
  paidAt?: string;
  approvedBy?: string;
  createdAt: string;
};

export type EmployeeLoginAccount = {
  created: boolean;
  linked: boolean;
  email: string;
  role: string;
  storeId: string;
  mustChangePassword: boolean;
  userId: string;
};

export type ApiEnvelope<T> = {
  ok: boolean;
  data: T;
  message?: string;
};

export const hrmApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ── Employees ──
    getEmployees: builder.query<
      ApiEnvelope<{ employees: Employee[]; total: number; page: number; totalPages: number }>,
      { storeId: string; page?: number; limit?: number; search?: string; departmentId?: string; status?: string }
    >({
      query: ({ storeId, ...params }) => ({
        url: `/stores/${storeId}/hrm/employees`,
        params,
      }),
      providesTags: (_r, _e, { storeId }) => [{ type: "HRM", id: `${storeId}-employees` }],
    }),

    createEmployee: builder.mutation<
      ApiEnvelope<{ employee: Employee; loginAccount: EmployeeLoginAccount }>,
      { storeId: string; body: Record<string, unknown> }
    >({
      query: ({ storeId, body }) => ({
        url: `/stores/${storeId}/hrm/employees`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { storeId }) => [{ type: "HRM", id: `${storeId}-employees` }],
    }),

    updateEmployee: builder.mutation<ApiEnvelope<Employee>, { storeId: string; employeeId: string; body: any }>({
      query: ({ storeId, employeeId, body }) => ({
        url: `/stores/${storeId}/hrm/employees/${employeeId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, { storeId }) => [{ type: "HRM", id: `${storeId}-employees` }],
    }),

    provisionEmployeeLogin: builder.mutation<
      ApiEnvelope<{ loginAccount: EmployeeLoginAccount }>,
      { storeId: string; employeeId: string; memberRole?: string }
    >({
      query: ({ storeId, employeeId, memberRole }) => ({
        url: `/stores/${storeId}/hrm/employees/${employeeId}/provision-login`,
        method: "POST",
        body: memberRole ? { memberRole } : {},
      }),
      invalidatesTags: (_r, _e, { storeId }) => [{ type: "HRM", id: `${storeId}-employees` }],
    }),
    getDepartments: builder.query<ApiEnvelope<{ departments: Department[] }>, string>({
      query: (storeId) => ({ url: `/stores/${storeId}/hrm/departments` }),
      providesTags: (_r, _e, storeId) => [{ type: "HRM", id: `${storeId}-depts` }],
    }),

    createDepartment: builder.mutation<ApiEnvelope<Department>, { storeId: string; body: { name: string; code?: string; description?: string } }>({
      query: ({ storeId, body }) => ({
        url: `/stores/${storeId}/hrm/departments`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { storeId }) => [{ type: "HRM", id: `${storeId}-depts` }],
    }),

    getDesignations: builder.query<ApiEnvelope<{ designations: Designation[] }>, string>({
      query: (storeId) => ({ url: `/stores/${storeId}/hrm/designations` }),
      providesTags: (_r, _e, storeId) => [{ type: "HRM", id: `${storeId}-desigs` }],
    }),

    createDesignation: builder.mutation<ApiEnvelope<Designation>, { storeId: string; body: { name: string; code?: string; departmentId?: string; description?: string } }>({
      query: ({ storeId, body }) => ({
        url: `/stores/${storeId}/hrm/designations`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { storeId }) => [{ type: "HRM", id: `${storeId}-desigs` }],
    }),

    getShifts: builder.query<ApiEnvelope<{ shifts: Shift[] }>, string>({
      query: (storeId) => ({ url: `/stores/${storeId}/hrm/shifts` }),
      providesTags: (_r, _e, storeId) => [{ type: "HRM", id: `${storeId}-shifts` }],
    }),

    createShift: builder.mutation<ApiEnvelope<Shift>, { storeId: string; body: any }>({
      query: ({ storeId, body }) => ({
        url: `/stores/${storeId}/hrm/shifts`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { storeId }) => [{ type: "HRM", id: `${storeId}-shifts` }],
    }),

    // ── Attendance ──
    getDailyAttendance: builder.query<
      ApiEnvelope<{ date: string; totalEmployees: number; presentCount: number; records: AttendanceRecord[] }>,
      { storeId: string; date?: string }
    >({
      query: ({ storeId, ...params }) => ({
        url: `/stores/${storeId}/hrm/attendance`,
        params,
      }),
      providesTags: (_r, _e, { storeId }) => [{ type: "HRM", id: `${storeId}-attendance` }],
    }),

    clockIn: builder.mutation<ApiEnvelope<AttendanceRecord>, { storeId: string; employeeId: string }>({
      query: ({ storeId, employeeId }) => ({
        url: `/stores/${storeId}/hrm/attendance/clock-in`,
        method: "POST",
        body: { employeeId },
      }),
      invalidatesTags: (_r, _e, { storeId }) => [{ type: "HRM", id: `${storeId}-attendance` }],
    }),

    clockOut: builder.mutation<ApiEnvelope<AttendanceRecord>, { storeId: string; employeeId: string }>({
      query: ({ storeId, employeeId }) => ({
        url: `/stores/${storeId}/hrm/attendance/clock-out`,
        method: "POST",
        body: { employeeId },
      }),
      invalidatesTags: (_r, _e, { storeId }) => [{ type: "HRM", id: `${storeId}-attendance` }],
    }),

    // ── Leaves ──
    getLeaves: builder.query<ApiEnvelope<{ records: LeaveRequest[]; total: number }>, { storeId: string; status?: string }>({
      query: ({ storeId, ...params }) => ({
        url: `/stores/${storeId}/hrm/leaves`,
        params,
      }),
      providesTags: (_r, _e, { storeId }) => [{ type: "HRM", id: `${storeId}-leaves` }],
    }),

    applyLeave: builder.mutation<ApiEnvelope<LeaveRequest>, { storeId: string; body: any }>({
      query: ({ storeId, body }) => ({
        url: `/stores/${storeId}/hrm/leaves`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { storeId }) => [{ type: "HRM", id: `${storeId}-leaves` }],
    }),

    approveLeave: builder.mutation<ApiEnvelope<LeaveRequest>, { storeId: string; leaveId: string; status: "approved" | "rejected"; managerRemarks?: string }>({
      query: ({ storeId, leaveId, ...body }) => ({
        url: `/stores/${storeId}/hrm/leaves/${leaveId}/approve`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { storeId }) => [{ type: "HRM", id: `${storeId}-leaves` }],
    }),

    // ── Payroll ──
    getPayrolls: builder.query<
      ApiEnvelope<{ payrolls: Payroll[]; total: number; summary: { totalNetDisbursement: number } }>,
      { storeId: string; month?: number; year?: number; status?: string }
    >({
      query: ({ storeId, ...params }) => ({
        url: `/stores/${storeId}/hrm/payroll`,
        params,
      }),
      providesTags: (_r, _e, { storeId }) => [{ type: "HRM", id: `${storeId}-payroll` }],
    }),

    generatePayroll: builder.mutation<
      ApiEnvelope<{ month: number; year: number; generatedCount: number; totalNetDisbursement: number }>,
      { storeId: string; month: number; year: number }
    >({
      query: ({ storeId, ...body }) => ({
        url: `/stores/${storeId}/hrm/payroll/generate`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { storeId }) => [{ type: "HRM", id: `${storeId}-payroll` }],
    }),

    approvePayroll: builder.mutation<ApiEnvelope<Payroll>, { storeId: string; payrollId: string }>({
      query: ({ storeId, payrollId }) => ({
        url: `/stores/${storeId}/hrm/payroll/${payrollId}/approve`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, { storeId }) => [{ type: "HRM", id: `${storeId}-payroll` }],
    }),

    markPayrollPaid: builder.mutation<ApiEnvelope<Payroll>, { storeId: string; payrollId: string; paymentMethod: string }>({
      query: ({ storeId, payrollId, ...body }) => ({
        url: `/stores/${storeId}/hrm/payroll/${payrollId}/pay`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { storeId }) => [{ type: "HRM", id: `${storeId}-payroll` }],
    }),

    // ── Dedicated Employee Self-Service Endpoints ──
    getMySelfServiceProfile: builder.query<
      ApiEnvelope<{ employee: Employee; todayAttendance?: AttendanceRecord }>,
      string
    >({
      query: (storeId) => `/stores/${storeId}/hrm/self-service/profile`,
      providesTags: (_r, _e, storeId) => [{ type: "HRM", id: `${storeId}-self-profile` }],
    }),

    getMyTodayAttendance: builder.query<
      ApiEnvelope<{ date: string; attendance?: AttendanceRecord; status: string; serverTime: string }>,
      string
    >({
      query: (storeId) => `/stores/${storeId}/hrm/self-service/attendance/today`,
      providesTags: (_r, _e, storeId) => [{ type: "HRM", id: `${storeId}-self-attendance` }],
    }),

    clockInMyAttendance: builder.mutation<ApiEnvelope<AttendanceRecord>, string>({
      query: (storeId) => ({
        url: `/stores/${storeId}/hrm/self-service/attendance/clock-in`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, storeId) => [
        { type: "HRM", id: `${storeId}-self-attendance` },
        { type: "HRM", id: `${storeId}-attendance` },
      ],
    }),

    clockOutMyAttendance: builder.mutation<ApiEnvelope<AttendanceRecord>, string>({
      query: (storeId) => ({
        url: `/stores/${storeId}/hrm/self-service/attendance/clock-out`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, storeId) => [
        { type: "HRM", id: `${storeId}-self-attendance` },
        { type: "HRM", id: `${storeId}-attendance` },
      ],
    }),

    getMyAttendanceHistory: builder.query<
      ApiEnvelope<{ attendance: AttendanceRecord[]; total: number }>,
      { storeId: string; month?: number; year?: number; limit?: number }
    >({
      query: ({ storeId, ...params }) => ({
        url: `/stores/${storeId}/hrm/self-service/attendance/history`,
        params,
      }),
      providesTags: (_r, _e, { storeId }) => [{ type: "HRM", id: `${storeId}-self-attendance` }],
    }),

    getMyLeaves: builder.query<
      ApiEnvelope<{
        leaves: LeaveRequest[];
        balances: {
          casual: { quota: number; used: number; remaining: number };
          sick: { quota: number; used: number; remaining: number };
          annual: { quota: number; used: number; remaining: number };
        };
      }>,
      string
    >({
      query: (storeId) => `/stores/${storeId}/hrm/self-service/leaves`,
      providesTags: (_r, _e, storeId) => [{ type: "HRM", id: `${storeId}-self-leaves` }],
    }),

    applyMyLeave: builder.mutation<
      ApiEnvelope<LeaveRequest>,
      { storeId: string; leaveType: string; startDate: string; endDate: string; daysCount: number; reason: string }
    >({
      query: ({ storeId, ...body }) => ({
        url: `/stores/${storeId}/hrm/self-service/leaves`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { storeId }) => [
        { type: "HRM", id: `${storeId}-self-leaves` },
        { type: "HRM", id: `${storeId}-leaves` },
      ],
    }),

    cancelMyLeave: builder.mutation<ApiEnvelope<LeaveRequest>, { storeId: string; leaveId: string }>({
      query: ({ storeId, leaveId }) => ({
        url: `/stores/${storeId}/hrm/self-service/leaves/${leaveId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, { storeId }) => [
        { type: "HRM", id: `${storeId}-self-leaves` },
        { type: "HRM", id: `${storeId}-leaves` },
      ],
    }),

    getMyPayslips: builder.query<
      ApiEnvelope<{
        payslips: Payroll[];
        salaryStructure?: Employee["salaryStructure"];
        bankInfo?: Employee["bankInfo"];
      }>,
      string
    >({
      query: (storeId) => `/stores/${storeId}/hrm/self-service/payslips`,
      providesTags: (_r, _e, storeId) => [{ type: "HRM", id: `${storeId}-self-payslips` }],
    }),
  }),
});

export const {
  useGetEmployeesQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useProvisionEmployeeLoginMutation,
  useGetDepartmentsQuery,
  useCreateDepartmentMutation,
  useGetDesignationsQuery,
  useCreateDesignationMutation,
  useGetShiftsQuery,
  useCreateShiftMutation,
  useGetDailyAttendanceQuery,
  useClockInMutation,
  useClockOutMutation,
  useGetLeavesQuery,
  useApplyLeaveMutation,
  useApproveLeaveMutation,
  useGetPayrollsQuery,
  useGeneratePayrollMutation,
  useApprovePayrollMutation,
  useMarkPayrollPaidMutation,
  // Self-Service hooks
  useGetMySelfServiceProfileQuery,
  useGetMyTodayAttendanceQuery,
  useClockInMyAttendanceMutation,
  useClockOutMyAttendanceMutation,
  useGetMyAttendanceHistoryQuery,
  useGetMyLeavesQuery,
  useApplyMyLeaveMutation,
  useCancelMyLeaveMutation,
  useGetMyPayslipsQuery,
} = hrmApi;
