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
  emergencyContact?: {
    name?: string;
    relation?: string;
    phone?: string;
  };
  address?: string;
  createdAt: string;
};

export type EmployeeRequest = {
  _id: string;
  storeId: string;
  employeeId: string | Employee;
  userId: string;
  type: "bank_account_change" | "attendance_correction" | "profile_update" | "document_request" | "general_hr" | "leave_request";
  title: string;
  description: string;
  data?: any;
  status: "pending" | "approved" | "rejected" | "cancelled";
  reviewedBy?: string;
  reviewerName?: string;
  reviewedAt?: string;
  reviewNote?: string;
  createdAt: string;
  updatedAt?: string;
};

export type EmployeeDocumentItem = {
  _id: string;
  storeId: string;
  employeeId: string;
  title: string;
  documentType: string;
  fileUrl: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  uploadedBy: "employee" | "hr_admin";
  description?: string;
  createdAt: string;
};

export type EmployeeTaskItem = {
  _id: string;
  storeId: string;
  taskNumber: string;
  title: string;
  description?: string;
  module?: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "todo" | "in_progress" | "under_review" | "completed" | "cancelled";
  assignedTo?: string;
  assignedToId?: string;
  dueDate?: string;
  createdAt: string;
};

export type EmployeeNotificationItem = {
  _id: string;
  userId: string;
  storeId?: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  actionUrl?: string;
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

    updateMySelfServiceProfile: builder.mutation<
      ApiEnvelope<Employee>,
      {
        storeId: string;
        phone?: string;
        address?: string;
        photoUrl?: string;
        emergencyContact?: { name?: string; relation?: string; phone?: string };
      }
    >({
      query: ({ storeId, ...body }) => ({
        url: `/stores/${storeId}/hrm/self-service/profile`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, { storeId }) => [
        { type: "HRM", id: `${storeId}-self-profile` },
        { type: "HRM", id: storeId },
      ],
    }),

    requestAttendanceCorrection: builder.mutation<
      ApiEnvelope<EmployeeRequest>,
      { storeId: string; date: string; requestedCheckIn?: string; requestedCheckOut?: string; reason: string }
    >({
      query: ({ storeId, ...body }) => ({
        url: `/stores/${storeId}/hrm/self-service/attendance/correction`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { storeId }) => [
        { type: "HRM", id: `${storeId}-self-requests` },
      ],
    }),

    getMyBankAccount: builder.query<
      ApiEnvelope<{
        bankInfo: Employee["bankInfo"];
        pendingRequest?: EmployeeRequest;
        history: EmployeeRequest[];
      }>,
      string
    >({
      query: (storeId) => `/stores/${storeId}/hrm/self-service/bank-account`,
      providesTags: (_r, _e, storeId) => [{ type: "HRM", id: `${storeId}-self-bank` }],
    }),

    requestBankAccountChange: builder.mutation<
      ApiEnvelope<EmployeeRequest>,
      {
        storeId: string;
        bankName?: string;
        accountName?: string;
        accountNumber?: string;
        branchName?: string;
        routingNumber?: string;
        mobileWalletNumber?: string;
        walletProvider?: string;
        reason?: string;
      }
    >({
      query: ({ storeId, ...body }) => ({
        url: `/stores/${storeId}/hrm/self-service/bank-account/request`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { storeId }) => [
        { type: "HRM", id: `${storeId}-self-bank` },
        { type: "HRM", id: `${storeId}-self-requests` },
      ],
    }),

    getMyDocuments: builder.query<
      ApiEnvelope<{ documents: EmployeeDocumentItem[]; total: number }>,
      string
    >({
      query: (storeId) => `/stores/${storeId}/hrm/self-service/documents`,
      providesTags: (_r, _e, storeId) => [{ type: "HRM", id: `${storeId}-self-documents` }],
    }),

    getMyRequests: builder.query<
      ApiEnvelope<{ requests: EmployeeRequest[]; total: number }>,
      string
    >({
      query: (storeId) => `/stores/${storeId}/hrm/self-service/requests`,
      providesTags: (_r, _e, storeId) => [{ type: "HRM", id: `${storeId}-self-requests` }],
    }),

    cancelMyRequest: builder.mutation<ApiEnvelope<EmployeeRequest>, { storeId: string; requestId: string }>({
      query: ({ storeId, requestId }) => ({
        url: `/stores/${storeId}/hrm/self-service/requests/${requestId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, { storeId }) => [
        { type: "HRM", id: `${storeId}-self-requests` },
        { type: "HRM", id: `${storeId}-self-bank` },
      ],
    }),

    getMyNotifications: builder.query<
      ApiEnvelope<{ notifications: EmployeeNotificationItem[]; unreadCount: number; total: number }>,
      { storeId: string; unreadOnly?: boolean }
    >({
      query: ({ storeId, ...params }) => ({
        url: `/stores/${storeId}/hrm/self-service/notifications`,
        params,
      }),
      providesTags: (_r, _e, { storeId }) => [{ type: "HRM", id: `${storeId}-self-notifications` }],
    }),

    markMyNotificationRead: builder.mutation<ApiEnvelope<EmployeeNotificationItem>, { storeId: string; notificationId: string }>({
      query: ({ storeId, notificationId }) => ({
        url: `/stores/${storeId}/hrm/self-service/notifications/${notificationId}/read`,
        method: "PUT",
      }),
      invalidatesTags: (_r, _e, { storeId }) => [{ type: "HRM", id: `${storeId}-self-notifications` }],
    }),

    markAllMyNotificationsRead: builder.mutation<ApiEnvelope<void>, string>({
      query: (storeId) => ({
        url: `/stores/${storeId}/hrm/self-service/notifications/read-all`,
        method: "PUT",
      }),
      invalidatesTags: (_r, _e, storeId) => [{ type: "HRM", id: `${storeId}-self-notifications` }],
    }),

    getMyTasks: builder.query<
      ApiEnvelope<{ tasks: EmployeeTaskItem[]; total: number }>,
      string
    >({
      query: (storeId) => `/stores/${storeId}/hrm/self-service/tasks`,
      providesTags: (_r, _e, storeId) => [{ type: "HRM", id: `${storeId}-self-tasks` }],
    }),

    updateMyTaskStatus: builder.mutation<
      ApiEnvelope<EmployeeTaskItem>,
      { storeId: string; taskId: string; status: string }
    >({
      query: ({ storeId, taskId, status }) => ({
        url: `/stores/${storeId}/hrm/self-service/tasks/${taskId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (_r, _e, { storeId }) => [{ type: "HRM", id: `${storeId}-self-tasks` }],
    }),

    // Admin HR Requests
    getHrmRequests: builder.query<
      ApiEnvelope<{ requests: EmployeeRequest[]; total: number; page: number; limit: number }>,
      { storeId: string; status?: string; type?: string; employeeId?: string; page?: number; limit?: number }
    >({
      query: ({ storeId, ...params }) => ({
        url: `/stores/${storeId}/hrm/requests`,
        params,
      }),
      providesTags: (_r, _e, { storeId }) => [{ type: "HRM", id: `${storeId}-hrm-requests` }],
    }),

    reviewHrmRequest: builder.mutation<
      ApiEnvelope<EmployeeRequest>,
      { storeId: string; requestId: string; status: "approved" | "rejected"; reviewNote?: string }
    >({
      query: ({ storeId, requestId, ...body }) => ({
        url: `/stores/${storeId}/hrm/requests/${requestId}/review`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { storeId }) => [
        { type: "HRM", id: `${storeId}-hrm-requests` },
        { type: "HRM", id: storeId },
        { type: "HRM", id: `${storeId}-attendance` },
      ],
    }),

    // Admin Employee Documents
    getEmployeeDocumentsAdmin: builder.query<
      ApiEnvelope<EmployeeDocumentItem[]>,
      { storeId: string; employeeId: string }
    >({
      query: ({ storeId, employeeId }) => `/stores/${storeId}/hrm/employees/${employeeId}/documents`,
      providesTags: (_r, _e, { storeId, employeeId }) => [
        { type: "HRM", id: `${storeId}-doc-${employeeId}` },
      ],
    }),

    uploadEmployeeDocumentAdmin: builder.mutation<
      ApiEnvelope<EmployeeDocumentItem>,
      {
        storeId: string;
        employeeId: string;
        title: string;
        documentType?: string;
        fileUrl: string;
        fileName?: string;
        fileSize?: number;
        mimeType?: string;
        description?: string;
      }
    >({
      query: ({ storeId, employeeId, ...body }) => ({
        url: `/stores/${storeId}/hrm/employees/${employeeId}/documents`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { storeId, employeeId }) => [
        { type: "HRM", id: `${storeId}-doc-${employeeId}` },
        { type: "HRM", id: `${storeId}-self-documents` },
      ],
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
  useUpdateMySelfServiceProfileMutation,
  useGetMyTodayAttendanceQuery,
  useClockInMyAttendanceMutation,
  useClockOutMyAttendanceMutation,
  useGetMyAttendanceHistoryQuery,
  useRequestAttendanceCorrectionMutation,
  useGetMyLeavesQuery,
  useApplyMyLeaveMutation,
  useCancelMyLeaveMutation,
  useGetMyPayslipsQuery,
  useGetMyBankAccountQuery,
  useRequestBankAccountChangeMutation,
  useGetMyDocumentsQuery,
  useGetMyRequestsQuery,
  useCancelMyRequestMutation,
  useGetMyNotificationsQuery,
  useMarkMyNotificationReadMutation,
  useMarkAllMyNotificationsReadMutation,
  useGetMyTasksQuery,
  useUpdateMyTaskStatusMutation,
  // Admin Request Review & Documents hooks
  useGetHrmRequestsQuery,
  useReviewHrmRequestMutation,
  useGetEmployeeDocumentsAdminQuery,
  useUploadEmployeeDocumentAdminMutation,
} = hrmApi;

