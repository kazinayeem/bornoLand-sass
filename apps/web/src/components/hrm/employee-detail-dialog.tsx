"use client";

import { useState } from "react";
import {
  type Employee,
  type Department,
  type Designation,
  type Shift,
  useUpdateEmployeeMutation,
  useGetLeavesQuery,
  useApproveLeaveMutation,
  useGetPayrollsQuery,
  useGetHrmRequestsQuery,
  useReviewHrmRequestMutation,
  useGetEmployeeDocumentsAdminQuery,
  useUploadEmployeeDocumentAdminMutation,
  useGetDailyAttendanceQuery,
  useGetEmployeeIdCardQuery,
} from "@/redux/api/hrm-api";
import { EmployeeIdCardModal } from "./employee-id-card-modal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Clock,
  CalendarDays,
  Wallet,
  CreditCard,
  FileText,
  Send,
  Building,
  Briefcase,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  Plus,
  Loader2,
  Lock,
  History,
  ShieldCheck,
  IdCard,
} from "lucide-react";
import { toast } from "sonner";

interface EmployeeDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
  storeId: string;
  storeSlug: string;
  departments?: Department[];
  designations?: Designation[];
  shifts?: Shift[];
  onEmployeeUpdated?: () => void;
}

export function EmployeeDetailDialog({
  open,
  onOpenChange,
  employee,
  storeId,
  storeSlug,
  departments = [],
  designations = [],
  shifts = [],
  onEmployeeUpdated,
}: EmployeeDetailDialogProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isIdCardOpen, setIsIdCardOpen] = useState(false);

  // Profile Edit states
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editDeptId, setEditDeptId] = useState("");
  const [editDesigId, setEditDesigId] = useState("");
  const [editShiftId, setEditShiftId] = useState("");
  const [editBasic, setEditBasic] = useState<number>(0);
  const [editStatus, setEditStatus] = useState("active");

  // New Document upload states
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocType, setNewDocType] = useState("appointment_letter");
  const [newDocUrl, setNewDocUrl] = useState("");

  // Review note state
  const [reviewNote, setReviewNote] = useState("");

  // Sync edit state on employee change
  const [lastEmpId, setLastEmpId] = useState<string | null>(null);
  if (employee && employee._id !== lastEmpId) {
    setLastEmpId(employee._id);
    setEditFirstName(employee.firstName);
    setEditLastName(employee.lastName || "");
    setEditPhone(employee.phone || "");
    setEditDeptId(employee.departmentId?._id || "");
    setEditDesigId(employee.designationId?._id || "");
    setEditShiftId(employee.shiftId?._id || "");
    setEditBasic(employee.salaryStructure?.basic || 0);
    setEditStatus(employee.status || "active");
  }

  // Queries for employee-specific data
  const empId = employee?._id || "";
  const { data: leavesData, refetch: refetchLeaves } = useGetLeavesQuery(
    { storeId },
    { skip: !open || !storeId }
  );
  const { data: payrollData } = useGetPayrollsQuery(
    { storeId },
    { skip: !open || !storeId || !empId }
  );
  const { data: requestsData, refetch: refetchRequests } = useGetHrmRequestsQuery(
    { storeId, employeeId: empId },
    { skip: !open || !storeId || !empId }
  );
  const { data: docsData, refetch: refetchDocs } = useGetEmployeeDocumentsAdminQuery(
    { storeId, employeeId: empId },
    { skip: !open || !storeId || !empId }
  );
  const { data: attData } = useGetDailyAttendanceQuery(
    { storeId },
    { skip: !open || !storeId }
  );

  const { data: idCardData, isLoading: isLoadingIdCard } = useGetEmployeeIdCardQuery(
    { storeSlug, employeeId: empId },
    { skip: !isIdCardOpen || !storeSlug || !empId }
  );

  // Mutations
  const [updateEmployee, { isLoading: isUpdatingEmp }] = useUpdateEmployeeMutation();
  const [approveLeave, { isLoading: isApprovingLeave }] = useApproveLeaveMutation();
  const [reviewRequest, { isLoading: isReviewingReq }] = useReviewHrmRequestMutation();
  const [uploadDoc, { isLoading: isUploadingDoc }] = useUploadEmployeeDocumentAdminMutation();

  if (!employee) return null;

  // Filter leaves and attendance for this employee
  const employeeLeaves = (leavesData?.data?.records || []).filter(
    (l: any) => l.employeeId?._id === empId || l.employeeId === empId
  );
  const employeeAttendance = (attData?.data?.records || []).filter(
    (a: any) => a.employeeId?._id === empId || a.employeeId === empId
  );
  const employeeRequests = requestsData?.data?.requests || [];
  const employeeDocs = docsData?.data || [];
  const employeePayrolls = (payrollData?.data?.payrolls || []).filter(
    (p: any) => p.employeeId?._id === empId || p.employeeId === empId
  );

  const pendingBankRequest = employeeRequests.find(
    (r: any) => r.type === "bank_account_change" && r.status === "pending"
  );

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateEmployee({
        storeId,
        employeeId: empId,
        body: {
          firstName: editFirstName,
          lastName: editLastName,
          phone: editPhone,
          departmentId: editDeptId || undefined,
          designationId: editDesigId || undefined,
          shiftId: editShiftId || undefined,
          status: editStatus,
          salaryStructure: {
            basic: editBasic,
            houseRent: Math.round(editBasic * 0.4),
            medical: Math.round(editBasic * 0.1),
            conveyance: Math.round(editBasic * 0.05),
            allowances: 0,
            grossSalary: editBasic + Math.round(editBasic * 0.55),
          },
        },
      }).unwrap();

      toast.success("Employee profile updated successfully!");
      onEmployeeUpdated?.();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update employee");
    }
  };

  const handleReviewRequest = async (requestId: string, status: "approved" | "rejected") => {
    try {
      await reviewRequest({
        storeId,
        requestId,
        status,
        reviewNote: reviewNote.trim() || (status === "approved" ? "Approved by HR" : "Rejected by HR"),
      }).unwrap();

      toast.success(`Request ${status} successfully!`);
      setReviewNote("");
      refetchRequests();
      onEmployeeUpdated?.();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to review request");
    }
  };

  const handleApproveLeaveAction = async (leaveId: string, status: "approved" | "rejected") => {
    try {
      await approveLeave({
        storeId,
        leaveId,
        status,
        managerRemarks: status === "approved" ? "Approved" : "Declined by HR",
      }).unwrap();

      toast.success(`Leave request ${status}`);
      refetchLeaves();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update leave status");
    }
  };

  const handleUploadDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle.trim() || !newDocUrl.trim()) {
      toast.error("Please enter a title and valid file URL");
      return;
    }

    try {
      await uploadDoc({
        storeId,
        employeeId: empId,
        title: newDocTitle.trim(),
        documentType: newDocType,
        fileUrl: newDocUrl.trim(),
      }).unwrap();

      toast.success("Document attached to employee record!");
      setNewDocTitle("");
      setNewDocUrl("");
      refetchDocs();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to attach document");
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        {/* Top Header Identity Banner */}
        <div className="p-6 bg-zinc-50 border-b border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              {employee.photoUrl ? (
                <img
                  src={employee.photoUrl}
                  alt={employee.firstName}
                  className="h-14 w-14 rounded-2xl object-cover border border-zinc-200 dark:border-zinc-700 shadow-sm"
                />
              ) : (
                <div className="h-14 w-14 rounded-2xl bg-[#003399] text-white flex items-center justify-center font-bold text-xl shadow-sm">
                  {employee.firstName[0]}
                  {employee.lastName?.[0] || ""}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                    {employee.firstName} {employee.lastName}
                  </h2>
                  <Badge variant={employee.status === "active" ? "success" : "default"}>
                    {employee.status}
                  </Badge>
                  {employee.userId ? (
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold border border-emerald-200">
                      Login Active
                    </span>
                  ) : (
                    <span className="text-[10px] bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded font-bold">
                      No Login
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {employee.designationId?.name || "Member"} • {employee.departmentId?.name || "General"} • ID: <span className="font-mono font-semibold">{employee.employeeCode}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setIsIdCardOpen(true)}
                className="gap-1.5 border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 hover:text-blue-800"
              >
                <IdCard className="h-4 w-4" />
                <span>ID Card</span>
              </Button>

              <div className="text-right text-xs">
                <span className="text-zinc-400 block font-medium">Monthly Gross</span>
                <span className="text-lg font-bold font-mono text-[#003399] dark:text-blue-400">
                  ৳{(employee.salaryStructure?.grossSalary || employee.salaryStructure?.basic || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Multi-Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <div className="border-b border-zinc-200 px-6 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-x-auto">
            <TabsList className="h-11 bg-transparent p-0 gap-4">
              <TabsTrigger value="overview" className="data-[state=active]:border-b-2 data-[state=active]:border-[#003399] rounded-none px-1 text-xs">
                Overview
              </TabsTrigger>
              <TabsTrigger value="attendance" className="data-[state=active]:border-b-2 data-[state=active]:border-[#003399] rounded-none px-1 text-xs">
                Attendance ({employeeAttendance.length})
              </TabsTrigger>
              <TabsTrigger value="leave" className="data-[state=active]:border-b-2 data-[state=active]:border-[#003399] rounded-none px-1 text-xs">
                Leaves ({employeeLeaves.length})
              </TabsTrigger>
              <TabsTrigger value="payroll" className="data-[state=active]:border-b-2 data-[state=active]:border-[#003399] rounded-none px-1 text-xs">
                Payroll
              </TabsTrigger>
              <TabsTrigger value="bank" className="data-[state=active]:border-b-2 data-[state=active]:border-[#003399] rounded-none px-1 text-xs relative">
                Bank Account
                {pendingBankRequest && (
                  <span className="h-2 w-2 rounded-full bg-amber-500 absolute -top-0.5 -right-1" />
                )}
              </TabsTrigger>
              <TabsTrigger value="documents" className="data-[state=active]:border-b-2 data-[state=active]:border-[#003399] rounded-none px-1 text-xs">
                Documents ({employeeDocs.length})
              </TabsTrigger>
              <TabsTrigger value="requests" className="data-[state=active]:border-b-2 data-[state=active]:border-[#003399] rounded-none px-1 text-xs">
                Requests ({employeeRequests.length})
              </TabsTrigger>
              <TabsTrigger value="profile" className="data-[state=active]:border-b-2 data-[state=active]:border-[#003399] rounded-none px-1 text-xs">
                Edit Profile
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* ── 1. OVERVIEW TAB ── */}
            <TabsContent value="overview" className="m-0 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-400 block font-medium">Email</span>
                  <span className="font-semibold text-zinc-900 dark:text-white mt-1 block truncate">
                    {employee.email}
                  </span>
                </div>
                <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-400 block font-medium">Phone</span>
                  <span className="font-semibold text-zinc-900 dark:text-white mt-1 block">
                    {employee.phone || "—"}
                  </span>
                </div>
                <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-400 block font-medium">Joining Date</span>
                  <span className="font-semibold text-zinc-900 dark:text-white mt-1 block font-mono">
                    {employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : "—"}
                  </span>
                </div>
                <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-400 block font-medium">Department</span>
                  <span className="font-semibold text-zinc-900 dark:text-white mt-1 block">
                    {employee.departmentId?.name || "General"}
                  </span>
                </div>
                <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-400 block font-medium">Designation</span>
                  <span className="font-semibold text-zinc-900 dark:text-white mt-1 block">
                    {employee.designationId?.name || "Member"}
                  </span>
                </div>
                <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-400 block font-medium">Assigned Shift</span>
                  <span className="font-semibold text-zinc-900 dark:text-white mt-1 block">
                    {employee.shiftId?.name || "Default Shift"}
                  </span>
                </div>
              </div>

              {employee.emergencyContact?.name && (
                <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs">
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 block mb-2">Emergency Contact</span>
                  <div className="flex gap-6 text-zinc-600 dark:text-zinc-400">
                    <div>Name: <span className="font-semibold text-zinc-900 dark:text-zinc-100">{employee.emergencyContact.name}</span></div>
                    <div>Relation: <span className="font-semibold text-zinc-900 dark:text-zinc-100">{employee.emergencyContact.relation || "—"}</span></div>
                    <div>Phone: <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">{employee.emergencyContact.phone || "—"}</span></div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* ── 2. ATTENDANCE TAB ── */}
            <TabsContent value="attendance" className="m-0 space-y-4">
              {employeeAttendance.length === 0 ? (
                <p className="text-xs text-zinc-400 py-8 text-center">No attendance records logged for this employee.</p>
              ) : (
                <div className="overflow-x-auto border border-zinc-200 rounded-xl">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-zinc-50 text-zinc-500 border-b border-zinc-200">
                      <tr>
                        <th className="py-2.5 px-3 font-bold">Date</th>
                        <th className="py-2.5 px-3 font-bold">In Time</th>
                        <th className="py-2.5 px-3 font-bold">Out Time</th>
                        <th className="py-2.5 px-3 font-bold">Worked</th>
                        <th className="py-2.5 px-3 font-bold">Late</th>
                        <th className="py-2.5 px-3 font-bold text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {employeeAttendance.map((a: any) => (
                        <tr key={a._id}>
                          <td className="py-2 px-3 font-mono font-semibold">{a.date}</td>
                          <td className="py-2 px-3 font-mono">{a.checkIn ? new Date(a.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                          <td className="py-2 px-3 font-mono">{a.checkOut ? new Date(a.checkOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                          <td className="py-2 px-3 font-mono">{a.workedMinutes ? `${(a.workedMinutes / 60).toFixed(1)}h` : "—"}</td>
                          <td className="py-2 px-3">{a.lateMinutes ? <span className="text-amber-600 font-bold">{a.lateMinutes}m</span> : "—"}</td>
                          <td className="py-2 px-3 text-center">
                            <Badge variant={a.status === "present" ? "success" : a.status === "late" ? "warning" : "default"}>
                              {a.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>

            {/* ── 3. LEAVE TAB ── */}
            <TabsContent value="leave" className="m-0 space-y-4">
              {employeeLeaves.length === 0 ? (
                <p className="text-xs text-zinc-400 py-8 text-center">No leave requests for this employee.</p>
              ) : (
                <div className="space-y-3">
                  {employeeLeaves.map((l: any) => (
                    <div key={l._id} className="p-3.5 border border-zinc-200 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold capitalize text-zinc-900">{l.leaveType} Leave ({l.daysCount} days)</span>
                          <Badge variant={l.status === "approved" ? "success" : l.status === "pending" ? "warning" : "danger"}>
                            {l.status}
                          </Badge>
                        </div>
                        <p className="text-zinc-500 font-mono mt-0.5">{l.startDate} ~ {l.endDate}</p>
                        <p className="text-zinc-600 mt-1">Reason: {l.reason}</p>
                      </div>

                      {l.status === "pending" && (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApproveLeaveAction(l._id, "approved")}
                            disabled={isApprovingLeave}
                            className="h-7 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApproveLeaveAction(l._id, "rejected")}
                            disabled={isApprovingLeave}
                            className="h-7 text-[11px] text-rose-600 border-rose-200 hover:bg-rose-50 font-bold"
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ── 4. PAYROLL TAB ── */}
            <TabsContent value="payroll" className="m-0 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-zinc-50 rounded-xl border">
                  <span className="text-zinc-400 block">Basic Pay</span>
                  <span className="font-bold text-sm font-mono mt-1 block">৳{(employee.salaryStructure?.basic || 0).toLocaleString()}</span>
                </div>
                <div className="p-3 bg-zinc-50 rounded-xl border">
                  <span className="text-zinc-400 block">House Rent</span>
                  <span className="font-bold text-sm font-mono mt-1 block">৳{(employee.salaryStructure?.houseRent || 0).toLocaleString()}</span>
                </div>
                <div className="p-3 bg-zinc-50 rounded-xl border">
                  <span className="text-zinc-400 block">Medical</span>
                  <span className="font-bold text-sm font-mono mt-1 block">৳{(employee.salaryStructure?.medical || 0).toLocaleString()}</span>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <span className="text-blue-700 block font-bold">Gross Salary</span>
                  <span className="font-bold text-base font-mono text-[#003399] mt-1 block">৳{(employee.salaryStructure?.grossSalary || 0).toLocaleString()}</span>
                </div>
              </div>

              <h4 className="text-xs font-bold text-zinc-800 mt-4">Payslips Generated ({employeePayrolls.length})</h4>
              {employeePayrolls.length === 0 ? (
                <p className="text-xs text-zinc-400 py-4">No payslips generated yet.</p>
              ) : (
                <div className="divide-y divide-zinc-100 border rounded-xl overflow-hidden text-xs">
                  {employeePayrolls.map((p: any) => (
                    <div key={p._id} className="p-3 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-zinc-900">{p.year}-{String(p.month).padStart(2, "0")}</span>
                        <span className="text-zinc-400 ml-3 font-mono">Net: ৳{(p.netSalary || 0).toLocaleString()}</span>
                      </div>
                      <Badge variant={p.status === "paid" ? "success" : "warning"}>{p.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ── 5. BANK ACCOUNT TAB ── */}
            <TabsContent value="bank" className="m-0 space-y-4">
              {pendingBankRequest && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-3">
                  <div className="flex items-center gap-2 text-amber-800 font-bold">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <span>Pending Bank Account Change Request from Employee</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 font-mono bg-white p-3 rounded-lg border border-amber-200 text-[11px]">
                    <div>Bank: <span className="font-bold">{pendingBankRequest.data?.bankName}</span></div>
                    <div>Holder: <span className="font-bold">{pendingBankRequest.data?.accountName}</span></div>
                    <div>Account: <span className="font-bold">{pendingBankRequest.data?.accountNumber}</span></div>
                    <div>Branch: <span className="font-bold">{pendingBankRequest.data?.branchName || "—"}</span></div>
                  </div>
                  <p className="text-zinc-600">Reason: {pendingBankRequest.data?.reason || pendingBankRequest.description}</p>
                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      size="sm"
                      onClick={() => handleReviewRequest(pendingBankRequest._id, "approved")}
                      disabled={isReviewingReq}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-7 text-[11px]"
                    >
                      Approve & Update Official Bank Record
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReviewRequest(pendingBankRequest._id, "rejected")}
                      disabled={isReviewingReq}
                      className="text-rose-600 border-rose-200 hover:bg-rose-50 font-bold h-7 text-[11px]"
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              )}

              <Card className="border">
                <CardContent className="p-4 space-y-2 text-xs">
                  <h4 className="font-bold text-zinc-900 mb-2">Current Active Bank Information</h4>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-zinc-500">Bank Name</span>
                    <span className="font-bold text-zinc-900">{employee.bankInfo?.bankName || "Not configured"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-zinc-500">Account Holder</span>
                    <span className="font-bold text-zinc-900">{employee.bankInfo?.accountName || "—"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-zinc-500">Account Number</span>
                    <span className="font-mono font-bold text-zinc-900">{employee.bankInfo?.accountNumber || "—"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-zinc-500">Branch</span>
                    <span className="font-semibold text-zinc-800">{employee.bankInfo?.branchName || "—"}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-zinc-500">Mobile Wallet</span>
                    <span className="font-mono text-zinc-800">{employee.bankInfo?.mobileWalletNumber || "—"} ({employee.bankInfo?.walletProvider || "bKash"})</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── 6. DOCUMENTS TAB ── */}
            <TabsContent value="documents" className="m-0 space-y-4">
              <form onSubmit={handleUploadDoc} className="p-4 bg-zinc-50 rounded-xl border space-y-3 text-xs">
                <span className="font-bold text-zinc-900 block">Attach Official Document</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[11px]">Title</Label>
                    <Input
                      value={newDocTitle}
                      onChange={(e) => setNewDocTitle(e.target.value)}
                      placeholder="e.g. Appointment Letter"
                      className="h-8 text-xs"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px]">Type</Label>
                    <Select value={newDocType} onValueChange={setNewDocType}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="appointment_letter">Appointment Letter</SelectItem>
                        <SelectItem value="contract">Employment Contract</SelectItem>
                        <SelectItem value="certificate">Certificate</SelectItem>
                        <SelectItem value="tax_document">Tax Document</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px]">File Public URL</Label>
                    <Input
                      value={newDocUrl}
                      onChange={(e) => setNewDocUrl(e.target.value)}
                      placeholder="https://.../document.pdf"
                      className="h-8 text-xs"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-1">
                  <Button type="submit" size="sm" disabled={isUploadingDoc} className="h-7 text-xs bg-[#003399] font-bold text-white">
                    {isUploadingDoc ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
                    Save Document
                  </Button>
                </div>
              </form>

              {employeeDocs.length === 0 ? (
                <p className="text-xs text-zinc-400 py-6 text-center">No documents uploaded for this employee.</p>
              ) : (
                <div className="divide-y divide-zinc-100 border rounded-xl overflow-hidden text-xs">
                  {employeeDocs.map((d: any) => (
                    <div key={d._id} className="p-3 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-zinc-900 block">{d.title}</span>
                        <span className="text-[11px] text-zinc-400 capitalize">{d.documentType?.replace("_", " ")} • Uploaded by {d.uploadedBy}</span>
                      </div>
                      <a
                        href={d.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#003399] font-semibold text-xs hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Open</span>
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ── 7. REQUESTS TAB ── */}
            <TabsContent value="requests" className="m-0 space-y-4">
              {employeeRequests.length === 0 ? (
                <p className="text-xs text-zinc-400 py-8 text-center">No employee requests submitted.</p>
              ) : (
                <div className="space-y-3 text-xs">
                  {employeeRequests.map((r: any) => (
                    <div key={r._id} className="p-3.5 border rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-zinc-900">{r.title}</span>
                          <Badge variant={r.status === "approved" ? "success" : r.status === "pending" ? "warning" : "danger"}>
                            {r.status}
                          </Badge>
                        </div>
                        <span className="text-zinc-400 font-mono text-[11px]">{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-zinc-600">{r.description}</p>
                      {r.reviewNote && <p className="text-zinc-500 italic bg-zinc-50 p-2 rounded">HR Note: {r.reviewNote}</p>}

                      {r.status === "pending" && (
                        <div className="flex items-center gap-2 pt-2 border-t">
                          <Button
                            size="sm"
                            onClick={() => handleReviewRequest(r._id, "approved")}
                            disabled={isReviewingReq}
                            className="h-7 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReviewRequest(r._id, "rejected")}
                            disabled={isReviewingReq}
                            className="h-7 text-[11px] text-rose-600 border-rose-200 hover:bg-rose-50 font-bold"
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ── 8. EDIT PROFILE TAB ── */}
            <TabsContent value="profile" className="m-0 space-y-4">
              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">First Name *</Label>
                    <Input value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} required />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Last Name</Label>
                    <Input value={editLastName} onChange={(e) => setEditLastName(e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Phone Number</Label>
                    <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Basic Salary (BDT)</Label>
                    <Input
                      type="number"
                      value={editBasic}
                      onChange={(e) => setEditBasic(Number(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Department</Label>
                    <Select value={editDeptId} onValueChange={setEditDeptId}>
                      <SelectTrigger className="text-xs"><SelectValue placeholder="Department" /></SelectTrigger>
                      <SelectContent>
                        {departments.map((d) => (
                          <SelectItem key={d._id} value={d._id}>{d.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Designation</Label>
                    <Select value={editDesigId} onValueChange={setEditDesigId}>
                      <SelectTrigger className="text-xs"><SelectValue placeholder="Designation" /></SelectTrigger>
                      <SelectContent>
                        {designations.map((d) => (
                          <SelectItem key={d._id} value={d._id}>{d.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Shift</Label>
                    <Select value={editShiftId} onValueChange={setEditShiftId}>
                      <SelectTrigger className="text-xs"><SelectValue placeholder="Shift" /></SelectTrigger>
                      <SelectContent>
                        {shifts.map((s) => (
                          <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Employment Status</Label>
                  <Select value={editStatus} onValueChange={setEditStatus}>
                    <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="on_leave">On Leave</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="terminated">Terminated</SelectItem>
                      <SelectItem value="resigned">Resigned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={isUpdatingEmp}
                    className="bg-[#003399] hover:bg-[#002B80] text-white font-bold text-xs"
                  >
                    {isUpdatingEmp ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
                    Save Employee Changes
                  </Button>
                </div>
              </form>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>

    <EmployeeIdCardModal
      open={isIdCardOpen}
      onClose={() => setIsIdCardOpen(false)}
      cardData={idCardData?.data}
      isLoading={isLoadingIdCard}
      storeSlug={storeSlug}
      employeeId={empId}
      canUploadPhoto={true}
    />
  </>
  );
}
