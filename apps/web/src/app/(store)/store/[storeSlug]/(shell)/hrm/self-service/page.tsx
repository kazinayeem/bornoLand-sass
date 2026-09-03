"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useGetStoreBySlugQuery } from "@/redux/api/store-api";
import {
  useGetMySelfServiceProfileQuery,
  useGetMyTodayAttendanceQuery,
  useClockInMyAttendanceMutation,
  useClockOutMyAttendanceMutation,
  useGetMyAttendanceHistoryQuery,
  useGetMyLeavesQuery,
  useApplyMyLeaveMutation,
  useCancelMyLeaveMutation,
  useGetMyPayslipsQuery,
  type Payroll,
} from "@/redux/api/hrm-api";
import { useLanguage } from "@/providers/language-provider";
import {
  UserCheck,
  Clock,
  CalendarDays,
  Wallet,
  LogIn,
  LogOut,
  Building,
  Mail,
  Phone,
  CheckCircle,
  FileText,
  AlertCircle,
  Calendar,
  XCircle,
  Send,
  Printer,
  ShieldCheck,
  CreditCard,
  Building2,
  CalendarCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DocumentPreviewDialog } from "@/components/documents/document-preview-dialog";
import { PayslipDocument } from "@/components/documents/templates/payslip-document";
import type { PayslipData } from "@/components/documents/document-types";
import { toast } from "sonner";

export default function EmployeeSelfServicePage() {
  const params = useParams();
  const storeSlug = String(params.storeSlug);
  const { data: storeData } = useGetStoreBySlugQuery(storeSlug, { skip: !storeSlug });
  const store = storeData?.data?.store;
  const storeId = store?._id ?? "";

  const { language } = useLanguage();
  const isBn = language === "bn";

  const [activeTab, setActiveTab] = useState("attendance");
  const [selectedPayslip, setSelectedPayslip] = useState<Payroll | null>(null);

  // Leave Modal State
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [leaveType, setLeaveType] = useState("casual");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [daysCount, setDaysCount] = useState(1);
  const [leaveReason, setLeaveReason] = useState("");

  // RTK Queries
  const {
    data: profileData,
    isLoading: loadingProfile,
    error: profileError,
  } = useGetMySelfServiceProfileQuery(storeId, { skip: !storeId });
  const { data: todayAttData, refetch: refetchTodayAtt } = useGetMyTodayAttendanceQuery(storeId, { skip: !storeId });
  const { data: attHistoryData } = useGetMyAttendanceHistoryQuery({ storeId }, { skip: !storeId });
  const { data: leavesData, refetch: refetchLeaves } = useGetMyLeavesQuery(storeId, { skip: !storeId });
  const { data: payslipsData } = useGetMyPayslipsQuery(storeId, { skip: !storeId });

  // Mutations
  const [clockIn, { isLoading: isClockingIn }] = useClockInMyAttendanceMutation();
  const [clockOut, { isLoading: isClockingOut }] = useClockOutMyAttendanceMutation();
  const [applyLeave, { isLoading: isApplyingLeave }] = useApplyMyLeaveMutation();
  const [cancelLeave, { isLoading: isCancellingLeave }] = useCancelMyLeaveMutation();

  const employee = profileData?.data?.employee;
  const todayAtt = todayAttData?.data?.attendance;
  const todayStatus = todayAttData?.data?.status ?? "not_clocked_in";
  const attHistory = attHistoryData?.data?.attendance ?? [];
  const leaves = leavesData?.data?.leaves ?? [];
  const balances = leavesData?.data?.balances;
  const payslips = payslipsData?.data?.payslips ?? [];

  // Clock In
  const handleClockIn = async () => {
    try {
      await clockIn(storeId).unwrap();
      toast.success(isBn ? "আজকের চেক-ইন সফল হয়েছে!" : "Clock-in successful!");
      refetchTodayAtt();
    } catch (err: any) {
      toast.error(err?.data?.message || "Clock-in failed");
    }
  };

  // Clock Out
  const handleClockOut = async () => {
    try {
      await clockOut(storeId).unwrap();
      toast.success(isBn ? "আজকের চেক-আউট সম্পন্ন হয়েছে!" : "Clock-out recorded!");
      refetchTodayAtt();
    } catch (err: any) {
      toast.error(err?.data?.message || "Clock-out failed");
    }
  };

  // Apply Leave
  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !leaveReason) {
      toast.error(isBn ? "সকল তথ্য সঠিকভাবে পূরণ করুন" : "Please fill in all required fields");
      return;
    }
    try {
      await applyLeave({
        storeId,
        leaveType,
        startDate,
        endDate,
        daysCount,
        reason: leaveReason,
      }).unwrap();
      toast.success(isBn ? "ছুটির আবেদন সফলভাবে জমা দেওয়া হয়েছে!" : "Leave application submitted!");
      setLeaveModalOpen(false);
      setStartDate("");
      setEndDate("");
      setLeaveReason("");
      refetchLeaves();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to submit leave application");
    }
  };

  // Cancel Leave
  const handleCancelLeave = async (leaveId: string) => {
    try {
      await cancelLeave({ storeId, leaveId }).unwrap();
      toast.success(isBn ? "ছুটির আবেদন বাতিল করা হয়েছে" : "Leave request cancelled");
      refetchLeaves();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to cancel leave");
    }
  };

  if (loadingProfile) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Clock className="h-10 w-10 animate-spin text-indigo-600 mb-3" />
        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
          {isBn ? "কর্মী প্রোফাইল লোড হচ্ছে..." : "Loading employee self-service portal..."}
        </p>
      </div>
    );
  }

  if (profileError || !employee) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-8 text-center dark:border-rose-900/50 dark:bg-rose-950/20">
        <AlertCircle className="mx-auto h-12 w-12 text-rose-500 mb-3" />
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
          {isBn ? "কোনো কর্মী প্রোফাইল পাওয়া যায়নি" : "No Linked Employee Profile Found"}
        </h2>
        <p className="mt-1 text-xs text-zinc-500 max-w-md mx-auto">
          {isBn
            ? "আপনার লগইন অ্যাকাউন্টের সাথে এই স্টোরে কোনো কর্মী প্রোফাইল সংযুক্ত নেই। অনুগ্রহ করে স্টোর এডমিনের সাথে যোগাযোগ করুন।"
            : "Your account is not linked to an employee profile in this store. Please contact your store administrator to assign your employee ID."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white flex items-center gap-2.5">
          <UserCheck className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
          <span>{isBn ? "কর্মী সেলফ-সার্ভিস পোর্টাল" : "Employee Self-Service Portal"}</span>
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          {isBn
            ? "আপনার ব্যক্তিগত হাজিরা, ছুটির হিসাব, বেতন পে-স্লিপ এবং কর্মস্থল প্রোফাইল পরিচালনা করুন।"
            : "Manage your personal attendance, leave balance, salary payslips, and workplace profile."}
        </p>
      </div>

      {/* Employee Identity Hero Banner */}
      <Card className="border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
        <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-md shrink-0">
              {employee.firstName[0]}
              {employee.lastName?.[0] || ""}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                  {employee.firstName} {employee.lastName}
                </h2>
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400">
                  {employee.status.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {employee.designationId?.name || "Team Member"} • {employee.departmentId?.name || "General"}
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-xs font-mono text-zinc-500">
                <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded font-semibold text-zinc-900 dark:text-zinc-200">
                  ID: {employee.employeeCode}
                </span>
                {employee.phone && <span>📞 {employee.phone}</span>}
                {employee.email && <span>✉️ {employee.email}</span>}
              </div>
            </div>
          </div>

          {/* Quick Attendance Action Box */}
          <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800/60 p-3.5 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60 shrink-0">
            <div className="text-right">
              <div className="text-[11px] uppercase font-bold text-zinc-400">
                {isBn ? "আজকের স্ট্যাটাস" : "Today's Status"}
              </div>
              <div
                className={`text-xs font-bold capitalize ${
                  todayStatus === "working"
                    ? "text-indigo-600 dark:text-indigo-400"
                    : todayStatus === "completed"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-zinc-500"
                }`}
              >
                {todayStatus === "not_clocked_in"
                  ? isBn
                    ? "উপস্থিতি বাকি"
                    : "Not Clocked In"
                  : todayStatus === "working"
                  ? isBn
                    ? "কর্মরত (Working)"
                    : "Working"
                  : isBn
                  ? "সম্পন্ন (Completed)"
                  : "Completed"}
              </div>
            </div>

            {todayStatus === "not_clocked_in" && (
              <Button
                onClick={handleClockIn}
                disabled={isClockingIn}
                className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-sm font-semibold"
              >
                <LogIn className="h-4 w-4" />
                <span>{isBn ? "চেক ইন" : "Clock In"}</span>
              </Button>
            )}

            {todayStatus === "working" && (
              <Button
                onClick={handleClockOut}
                disabled={isClockingOut}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-sm font-semibold"
              >
                <LogOut className="h-4 w-4" />
                <span>{isBn ? "চেক আউট" : "Clock Out"}</span>
              </Button>
            )}

            {todayStatus === "completed" && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 px-3 py-1.5 bg-emerald-50 rounded-lg dark:bg-emerald-950/30">
                <CheckCircle className="h-4 w-4" />
                <span>{isBn ? "আজকের শিফট সমাপ্ত" : "Shift Complete"}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-xl mb-6">
          <TabsTrigger value="attendance" className="gap-2 text-xs">
            <Clock className="h-3.5 w-3.5" />
            <span>{isBn ? "হাজিরা" : "Attendance"}</span>
          </TabsTrigger>
          <TabsTrigger value="leaves" className="gap-2 text-xs">
            <CalendarCheck className="h-3.5 w-3.5" />
            <span>{isBn ? "ছুটি" : "Leaves"}</span>
          </TabsTrigger>
          <TabsTrigger value="payroll" className="gap-2 text-xs">
            <Wallet className="h-3.5 w-3.5" />
            <span>{isBn ? "পে-স্লিপ" : "Payslips"}</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="gap-2 text-xs">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>{isBn ? "প্রোফাইল" : "Profile"}</span>
          </TabsTrigger>
        </TabsList>

        {/* ── TAB 1: ATTENDANCE ── */}
        <TabsContent value="attendance" className="space-y-6">
          {/* Today's Detail Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs uppercase font-bold text-zinc-500">
                  {isBn ? "চেক ইন সময়" : "Clock-in Time"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-white">
                  {todayAtt?.checkIn
                    ? new Date(todayAtt.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : "—"}
                </div>
                {todayAtt?.lateMinutes ? (
                  <p className="text-xs text-amber-600 mt-1">
                    ⚠️ {todayAtt.lateMinutes} mins late
                  </p>
                ) : (
                  <p className="text-xs text-zinc-400 mt-1">{isBn ? "সময়মতো" : "On time"}</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs uppercase font-bold text-zinc-500">
                  {isBn ? "চেক আউট সময়" : "Clock-out Time"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-white">
                  {todayAtt?.checkOut
                    ? new Date(todayAtt.checkOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : "—"}
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  {todayAtt?.checkOut ? (isBn ? "রেকর্ড সম্পন্ন" : "Recorded") : (isBn ? "শিফট চলমান" : "In progress")}
                </p>
              </CardContent>
            </Card>

            <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs uppercase font-bold text-zinc-500">
                  {isBn ? "মোট কাজের সময়" : "Total Worked Today"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-emerald-600">
                  {todayAtt?.workedMinutes
                    ? `${Math.floor(todayAtt.workedMinutes / 60)}h ${todayAtt.workedMinutes % 60}m`
                    : "—"}
                </div>
                {todayAtt?.overtimeMinutes ? (
                  <p className="text-xs text-indigo-600 mt-1 font-semibold">
                    + {todayAtt.overtimeMinutes} mins Overtime
                  </p>
                ) : (
                  <p className="text-xs text-zinc-400 mt-1">{isBn ? "স্বাভাবিক শিফট" : "Regular Shift"}</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Attendance Log Table */}
          <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                {isBn ? "সাম্প্রতিক হাজিরার ইতিহাস" : "Recent Attendance History"}
              </CardTitle>
              <CardDescription>
                {isBn
                  ? "আপনার সাম্প্রতিক দৈনিক চেক-ইন ও চেক-আউটের নিরীক্ষিত রেকর্ড।"
                  : "Audited records of your daily check-in, check-out, and worked durations."}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 font-semibold border-y">
                    <tr>
                      <th className="px-4 py-3 text-left">{isBn ? "তারিখ" : "Date"}</th>
                      <th className="px-4 py-3 text-left">{isBn ? "চেক ইন" : "Check In"}</th>
                      <th className="px-4 py-3 text-left">{isBn ? "চেক আউট" : "Check Out"}</th>
                      <th className="px-4 py-3 text-left">{isBn ? "সময়কাল" : "Worked Time"}</th>
                      <th className="px-4 py-3 text-left">{isBn ? "স্ট্যাটাস" : "Status"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {attHistory.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-zinc-400">
                          {isBn ? "কোনো হাজিরার রেকর্ড নেই" : "No attendance records found"}
                        </td>
                      </tr>
                    ) : (
                      attHistory.map((row, idx) => (
                        <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                          <td className="px-4 py-3 font-mono font-medium">{row.date}</td>
                          <td className="px-4 py-3 font-mono">
                            {row.checkIn
                              ? new Date(row.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                              : "—"}
                          </td>
                          <td className="px-4 py-3 font-mono">
                            {row.checkOut
                              ? new Date(row.checkOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                              : "—"}
                          </td>
                          <td className="px-4 py-3 font-mono">
                            {row.workedMinutes
                              ? `${Math.floor(row.workedMinutes / 60)}h ${row.workedMinutes % 60}m`
                              : "—"}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${
                                row.status === "present"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : row.status === "late"
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : "bg-zinc-100 text-zinc-700"
                              }`}
                            >
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 2: LEAVES ── */}
        <TabsContent value="leaves" className="space-y-6">
          {/* Leave Quota Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs uppercase font-bold text-zinc-500">
                  {isBn ? "নৈমিত্তিক ছুটি (Casual Leave)" : "Casual Leave"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-white">
                  {balances?.casual?.remaining ?? 10} <span className="text-xs text-zinc-400 font-normal">days left</span>
                </div>
                <p className="text-xs text-zinc-500 mt-1">
                  Used {balances?.casual?.used ?? 0} of {balances?.casual?.quota ?? 10} days
                </p>
              </CardContent>
            </Card>

            <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs uppercase font-bold text-zinc-500">
                  {isBn ? "অসুস্থতাজনিত ছুটি (Sick Leave)" : "Sick Leave"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-white">
                  {balances?.sick?.remaining ?? 14} <span className="text-xs text-zinc-400 font-normal">days left</span>
                </div>
                <p className="text-xs text-zinc-500 mt-1">
                  Used {balances?.sick?.used ?? 0} of {balances?.sick?.quota ?? 14} days
                </p>
              </CardContent>
            </Card>

            <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs uppercase font-bold text-zinc-500">
                  {isBn ? "বার্ষিক অর্জিত ছুটি (Annual Leave)" : "Annual Leave"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-white">
                  {balances?.annual?.remaining ?? 15} <span className="text-xs text-zinc-400 font-normal">days left</span>
                </div>
                <p className="text-xs text-zinc-500 mt-1">
                  Used {balances?.annual?.used ?? 0} of {balances?.annual?.quota ?? 15} days
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Leave Requests Table + Apply Button */}
          <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-semibold">
                  {isBn ? "ছুটির আবেদনের তালিকা" : "Leave Applications & History"}
                </CardTitle>
                <CardDescription>
                  {isBn
                    ? "আপনার ছুটির আবেদনের অবস্থা দেখুন অথবা নতুন ছুটির জন্য আবেদন করুন।"
                    : "Track pending or approved leave requests and submit new applications."}
                </CardDescription>
              </div>
              <Button onClick={() => setLeaveModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                <Send className="h-4 w-4" />
                <span>{isBn ? "ছুটির আবেদন করুন" : "Apply for Leave"}</span>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 font-semibold border-y">
                    <tr>
                      <th className="px-4 py-3 text-left">{isBn ? "ছুটির ধরন" : "Type"}</th>
                      <th className="px-4 py-3 text-left">{isBn ? "শুরু" : "Start"}</th>
                      <th className="px-4 py-3 text-left">{isBn ? "সমাপ্তি" : "End"}</th>
                      <th className="px-4 py-3 text-left">{isBn ? "দিন" : "Days"}</th>
                      <th className="px-4 py-3 text-left">{isBn ? "কারণ" : "Reason"}</th>
                      <th className="px-4 py-3 text-left">{isBn ? "স্ট্যাটাস" : "Status"}</th>
                      <th className="px-4 py-3 text-right">{isBn ? "অ্যাকশন" : "Action"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {leaves.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-zinc-400">
                          {isBn ? "কোনো ছুটির আবেদন পাওয়া যায়নি" : "No leave requests found"}
                        </td>
                      </tr>
                    ) : (
                      leaves.map((l: any, idx) => (
                        <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                          <td className="px-4 py-3 font-semibold capitalize">{l.leaveType}</td>
                          <td className="px-4 py-3 font-mono">{l.startDate}</td>
                          <td className="px-4 py-3 font-mono">{l.endDate}</td>
                          <td className="px-4 py-3 font-mono font-medium">{l.daysCount} d</td>
                          <td className="px-4 py-3 text-zinc-600 max-w-xs truncate">{l.reason}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${
                                l.status === "approved"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : l.status === "pending"
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : l.status === "rejected"
                                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                                  : "bg-zinc-100 text-zinc-500"
                              }`}
                            >
                              {l.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {l.status === "pending" && (
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={isCancellingLeave}
                                onClick={() => handleCancelLeave(l._id)}
                                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 h-7 text-[11px]"
                              >
                                {isBn ? "বাতিল করুন" : "Cancel"}
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 3: PAYSLIPS & SALARY ── */}
        <TabsContent value="payroll" className="space-y-6">
          {/* Salary Breakdown Overview */}
          {employee.salaryStructure && (
            <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm bg-zinc-50/50 dark:bg-zinc-900/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-emerald-600" />
                  <span>{isBn ? "নির্ধারিত বেতন কাঠামো" : "Assigned Salary Structure"}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200/60 dark:border-zinc-800">
                    <span className="text-zinc-500 block">{isBn ? "মূল বেতন (Basic)" : "Basic Salary"}</span>
                    <span className="text-base font-bold font-mono text-zinc-900 dark:text-white">
                      ৳{employee.salaryStructure.basic?.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200/60 dark:border-zinc-800">
                    <span className="text-zinc-500 block">{isBn ? "বাড়ি ভাড়া ও চিকিৎসা" : "House & Medical"}</span>
                    <span className="text-base font-bold font-mono text-zinc-900 dark:text-white">
                      ৳{((employee.salaryStructure.houseRent || 0) + (employee.salaryStructure.medical || 0))?.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200/60 dark:border-zinc-800">
                    <span className="text-zinc-500 block">{isBn ? "যাতায়াত ও ভাতা" : "Conveyance & Other"}</span>
                    <span className="text-base font-bold font-mono text-zinc-900 dark:text-white">
                      ৳{((employee.salaryStructure.conveyance || 0) + (employee.salaryStructure.allowances || 0))?.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <span className="text-emerald-700 dark:text-emerald-300 block font-semibold">
                      {isBn ? "সর্বমোট বেতন (Gross)" : "Gross Salary"}
                    </span>
                    <span className="text-base font-bold font-mono text-emerald-700 dark:text-emerald-400">
                      ৳{employee.salaryStructure.grossSalary?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payslip History Table */}
          <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                {isBn ? "মাসিক পে-স্লিপ সমূহ" : "My Monthly Payslips"}
              </CardTitle>
              <CardDescription>
                {isBn
                  ? "আপনার অনুমোদিত ও পরিশোধিত মাসিক বেতনের পে-স্লিপ প্রিন্ট ও ডাউনলোড করুন।"
                  : "View and print official monthly salary payslips generated by your store payroll."}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 font-semibold border-y">
                    <tr>
                      <th className="px-4 py-3 text-left">{isBn ? "স্লিপ নং" : "Payslip #"}</th>
                      <th className="px-4 py-3 text-left">{isBn ? "মাস / বছর" : "Period"}</th>
                      <th className="px-4 py-3 text-right">{isBn ? "মূল বেতন" : "Gross Salary"}</th>
                      <th className="px-4 py-3 text-right">{isBn ? "কর্তন" : "Deductions"}</th>
                      <th className="px-4 py-3 text-right">{isBn ? "নিট প্রদেয়" : "Net Pay"}</th>
                      <th className="px-4 py-3 text-left">{isBn ? "স্ট্যাটাস" : "Status"}</th>
                      <th className="px-4 py-3 text-right">{isBn ? "অ্যাকশন" : "Action"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {payslips.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-zinc-400">
                          {isBn ? "কোনো পে-স্লিপ পাওয়া যায়নি" : "No payslips issued yet"}
                        </td>
                      </tr>
                    ) : (
                      payslips.map((ps) => (
                        <tr key={ps._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                          <td className="px-4 py-3 font-mono font-medium">{ps.payslipNumber}</td>
                          <td className="px-4 py-3 font-medium">
                            {new Date(ps.year, ps.month - 1).toLocaleString("default", { month: "long" })} {ps.year}
                          </td>
                          <td className="px-4 py-3 text-right font-mono">৳{ps.grossSalary?.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right font-mono text-rose-600">
                            {ps.totalDeductions > 0 ? `-৳${ps.totalDeductions.toLocaleString()}` : "৳0"}
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600">
                            ৳{ps.netSalary?.toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${
                                ps.status === "paid"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : ps.status === "approved"
                                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}
                            >
                              {ps.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedPayslip(ps)}
                              className="gap-1.5 h-7 text-[11px]"
                            >
                              <Printer className="h-3.5 w-3.5" />
                              <span>{isBn ? "পে-স্লিপ দেখুন" : "View Payslip"}</span>
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 4: MY PROFILE & WORKPLACE INFO ── */}
        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Employment Info */}
            <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Building className="h-4 w-4 text-indigo-600" />
                  <span>{isBn ? "কর্মসংস্থান তথ্য" : "Employment Details"}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-zinc-500">{isBn ? "কর্মী কোড (Code):" : "Employee Code:"}</span>
                  <span className="font-mono font-semibold">{employee.employeeCode}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-zinc-500">{isBn ? "পদবী (Designation):" : "Designation:"}</span>
                  <span className="font-semibold">{employee.designationId?.name || "—"}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-zinc-500">{isBn ? "বিভাগ (Department):" : "Department:"}</span>
                  <span className="font-semibold">{employee.departmentId?.name || "—"}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-zinc-500">{isBn ? "চাকরির ধরন (Type):" : "Employment Type:"}</span>
                  <span className="capitalize">{employee.employmentType?.replace("_", " ")}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-zinc-500">{isBn ? "যোগদানের তারিখ (Joined):" : "Joining Date:"}</span>
                  <span className="font-mono">{new Date(employee.joiningDate).toLocaleDateString()}</span>
                </div>
                {employee.shiftId && (
                  <div className="flex justify-between py-1.5">
                    <span className="text-zinc-500">{isBn ? "শিফট (Shift):" : "Shift Hours:"}</span>
                    <span className="font-mono font-medium">
                      {employee.shiftId.name} ({employee.shiftId.startTime} - {employee.shiftId.endTime})
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bank & Payment Information */}
            <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-emerald-600" />
                  <span>{isBn ? "ব্যাংক ও পেমেন্ট তথ্য" : "Bank & Payment Details"}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-zinc-500">{isBn ? "ব্যাংকের নাম:" : "Bank Name:"}</span>
                  <span className="font-medium">{employee.bankInfo?.bankName || "—"}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-zinc-500">{isBn ? "হিসাব নম্বর:" : "Account Number:"}</span>
                  <span className="font-mono font-medium">{employee.bankInfo?.accountNumber || "—"}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-zinc-500">{isBn ? "শাখার নাম:" : "Branch Name:"}</span>
                  <span className="font-medium">{employee.bankInfo?.branchName || "—"}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-zinc-500">{isBn ? "মোবাইল ওয়ালেট (bKash/Nagad):" : "Mobile Wallet:"}</span>
                  <span className="font-mono font-medium">
                    {employee.bankInfo?.mobileWalletNumber
                      ? `${employee.bankInfo.walletProvider}: ${employee.bankInfo.mobileWalletNumber}`
                      : "—"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Apply Leave Modal */}
      {leaveModalOpen && (
        <Dialog open={leaveModalOpen} onOpenChange={setLeaveModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{isBn ? "ছুটির আবেদন করুন" : "Apply for Leave"}</DialogTitle>
              <DialogDescription>
                {isBn
                  ? "ছুটির ধরন, তারিখ এবং উপযুক্ত কারণ উল্লেখ করে আবেদন জমা দিন।"
                  : "Submit a new leave request to be reviewed and approved by your HR manager."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleApplyLeave} className="space-y-4 text-xs pt-2">
              <div>
                <label className="font-semibold block mb-1">{isBn ? "ছুটির ধরন" : "Leave Type"}</label>
                <Select value={leaveType} onValueChange={setLeaveType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="casual">{isBn ? "নৈমিত্তিক ছুটি (Casual)" : "Casual Leave"}</SelectItem>
                    <SelectItem value="sick">{isBn ? "অসুস্থতাজনিত (Sick)" : "Sick Leave"}</SelectItem>
                    <SelectItem value="annual">{isBn ? "বার্ষিক ছুটি (Annual)" : "Annual Leave"}</SelectItem>
                    <SelectItem value="unpaid">{isBn ? "বেতনবিহীন (Unpaid)" : "Unpaid Leave"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">{isBn ? "শুরুর তারিখ" : "Start Date"}</label>
                  <Input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">{isBn ? "সমাপ্তির তারিখ" : "End Date"}</label>
                  <Input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">{isBn ? "মোট দিনের সংখ্যা" : "Days Count"}</label>
                <Input
                  type="number"
                  min="0.5"
                  step="0.5"
                  required
                  value={daysCount}
                  onChange={(e) => setDaysCount(Number(e.target.value))}
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">{isBn ? "ছুটির কারণ" : "Reason for Leave"}</label>
                <textarea
                  required
                  rows={3}
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  placeholder={isBn ? "কারণ বিস্তারিত লিখুন..." : "Provide a brief explanation for your leave..."}
                  className="w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setLeaveModalOpen(false)}>
                  {isBn ? "বাতিল" : "Cancel"}
                </Button>
                <Button type="submit" disabled={isApplyingLeave} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  {isApplyingLeave ? (isBn ? "জমা হচ্ছে..." : "Submitting...") : (isBn ? "আবেদন জমা দিন" : "Submit Request")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Unified Master Payslip Modal Preview & Print */}
      {selectedPayslip && (
        <DocumentPreviewDialog
          open={!!selectedPayslip}
          onClose={() => setSelectedPayslip(null)}
          title={`${isBn ? "বেতন পে-স্লিপ" : "Salary Payslip"} #${selectedPayslip.payslipNumber}`}
          filename={`BornoLand-Payslip-${selectedPayslip.payslipNumber}.pdf`}
          defaultPageSize="a4-portrait"
        >
          <PayslipDocument
            store={{
              name: store?.name || "BornoLand Store",
              shortName: store?.shortName,
              logoUrl: store?.logoUrl,
              brandColor: (store as any)?.brandColor,
              address: (store as any)?.address,
              phone: (store as any)?.phone,
              email: (store as any)?.email,
            }}
            payslip={{
              payslipNumber: selectedPayslip.payslipNumber,
              period: `${new Date(selectedPayslip.year, selectedPayslip.month - 1).toLocaleString("default", { month: "long" })} ${selectedPayslip.year}`,
              paymentDate: selectedPayslip.paidAt,
              status: selectedPayslip.status === "paid" ? "paid" : "approved",
              paymentMethod: selectedPayslip.paymentMethod,
              employee: {
                code: employee.employeeCode,
                name: `${employee.firstName} ${employee.lastName}`.trim(),
                designation: employee.designationId?.name || "Staff",
                department: employee.departmentId?.name || "General",
                bankAccount: employee.bankInfo?.accountNumber,
                phone: employee.phone,
              },
              earnings: {
                basicSalary: selectedPayslip.basicSalary || 0,
                houseRent: selectedPayslip.houseRent || 0,
                medical: selectedPayslip.medical || 0,
                conveyance: selectedPayslip.conveyance || 0,
                overtimeHours: selectedPayslip.overtimeHours || 0,
                overtimePay: selectedPayslip.overtimePay || 0,
                otherAllowances: selectedPayslip.otherAllowances || 0,
                bonus: (selectedPayslip as any).bonus || 0,
              },
              deductions: {
                taxDeduction: (selectedPayslip as any).taxDeduction || 0,
                providentFundDeduction: (selectedPayslip as any).providentFundDeduction || 0,
                unpaidLeaveDeduction: (selectedPayslip as any).unpaidLeaveDeduction || 0,
              },
              grossSalary: selectedPayslip.grossSalary || 0,
              totalDeductions: selectedPayslip.totalDeductions || 0,
              netSalary: selectedPayslip.netSalary || 0,
              notes: (selectedPayslip as any).notes,
            }}
            isBn={isBn}
          />
        </DocumentPreviewDialog>
      )}
    </div>
  );
}
