"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useGetStoreBySlugQuery } from "@/redux/api/store-api";
import {
  useGetMySelfServiceProfileQuery,
  useGetMyTodayAttendanceQuery,
  useClockInMyAttendanceMutation,
  useClockOutMyAttendanceMutation,
  useGetMyAttendanceHistoryQuery,
  useGetMyLeavesQuery,
  useGetMyRequestsQuery,
  useGetMyNotificationsQuery,
} from "@/redux/api/hrm-api";
import { useLanguage } from "@/providers/language-provider";
import {
  UserCheck,
  Clock,
  CalendarDays,
  Wallet,
  LogIn,
  LogOut,
  CheckCircle,
  FileText,
  AlertCircle,
  CreditCard,
  Building2,
  CalendarCheck,
  Send,
  Bell,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  ListTodo,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function MyWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const storeSlug = String(params.storeSlug);
  const { data: storeData } = useGetStoreBySlugQuery(storeSlug, { skip: !storeSlug });
  const store = storeData?.data?.store;
  const storeId = store?._id ?? "";

  const { language } = useLanguage();
  const isBn = (language as string) === "bn";

  // Real Backend Data Queries
  const {
    data: profileData,
    isLoading: loadingProfile,
    error: profileError,
  } = useGetMySelfServiceProfileQuery(storeId, { skip: !storeId });

  const { data: todayAttData, refetch: refetchTodayAtt } = useGetMyTodayAttendanceQuery(storeId, {
    skip: !storeId,
  });
  const { data: attHistoryData } = useGetMyAttendanceHistoryQuery({ storeId, limit: 5 }, { skip: !storeId });
  const { data: leavesData } = useGetMyLeavesQuery(storeId, { skip: !storeId });
  const { data: requestsData } = useGetMyRequestsQuery(storeId, { skip: !storeId });
  const { data: notificationsData } = useGetMyNotificationsQuery({ storeId }, { skip: !storeId });

  // Clock Mutations
  const [clockIn, { isLoading: isClockingIn }] = useClockInMyAttendanceMutation();
  const [clockOut, { isLoading: isClockingOut }] = useClockOutMyAttendanceMutation();

  const employee = profileData?.data?.employee;
  const todayAtt = todayAttData?.data?.attendance;
  const todayStatus = todayAttData?.data?.status ?? "not_clocked_in";
  const recentAttendance = attHistoryData?.data?.attendance?.slice(0, 4) ?? [];
  const leaves = leavesData?.data?.leaves?.slice(0, 3) ?? [];
  const balances = leavesData?.data?.balances;
  const recentRequests = requestsData?.data?.requests?.slice(0, 3) ?? [];
  const recentNotifications = notificationsData?.data?.notifications?.slice(0, 3) ?? [];

  const handleClockIn = async () => {
    try {
      await clockIn(storeId).unwrap();
      toast.success(isBn ? "চেক-ইন সফল হয়েছে!" : "Clocked in successfully!");
      refetchTodayAtt();
    } catch (err: any) {
      toast.error(err?.data?.message || "Clock-in failed");
    }
  };

  const handleClockOut = async () => {
    try {
      await clockOut(storeId).unwrap();
      toast.success(isBn ? "চেক-আউট সম্পন্ন হয়েছে!" : "Clocked out successfully!");
      refetchTodayAtt();
    } catch (err: any) {
      toast.error(err?.data?.message || "Clock-out failed");
    }
  };

  if (loadingProfile) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#003399] border-t-transparent mb-4" />
        <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
          {isBn ? "ওয়ার্কস্পেস লোড হচ্ছে..." : "Loading employee workspace..."}
        </p>
      </div>
    );
  }

  if (profileError || !employee) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-8 text-center dark:border-rose-900/50 dark:bg-rose-950/20 max-w-xl mx-auto my-12">
        <AlertCircle className="mx-auto h-12 w-12 text-rose-500 mb-3" />
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
          {isBn ? "কোনো কর্মী প্রোফাইল পাওয়া যায়নি" : "No Active Employee Profile"}
        </h2>
        <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
          {isBn
            ? "আপনার লগইন অ্যাকাউন্টের সাথে এই স্টোরে কোনো সক্রিয় কর্মী রেকর্ড পাওয়া যায়নি। অনুগ্রহ করে স্টোর এডমিনের সাথে যোগাযোগ করুন।"
            : "Your account does not have an active employee profile in this store. Please contact your store administrator."}
        </p>
      </div>
    );
  }

  const basePath = `/store/${storeSlug}/hrm/self-service`;

  return (
    <div className="space-y-6 pb-12">
      {/* ── 1. Top Greeting Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-4 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              {isBn ? "স্বাগতম" : "Welcome back"}, {employee.firstName}!
            </h1>
            <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800">
              {employee.status.toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} • {store?.name || "BornoLand Store"}
          </p>
        </div>

        {/* Live Attendance Action Bar */}
        <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-900 p-2 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <div className="px-2 text-right">
            <span className="block text-[10px] uppercase font-bold text-zinc-400">
              {isBn ? "আজকের অবস্থা" : "Shift Status"}
            </span>
            <span
              className={`text-xs font-bold capitalize ${
                todayStatus === "working"
                  ? "text-blue-600 dark:text-blue-400"
                  : todayStatus === "completed"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-zinc-500"
              }`}
            >
              {todayStatus === "not_clocked_in"
                ? isBn ? "চেক-ইন বাকি" : "Not Clocked In"
                : todayStatus === "working"
                ? isBn ? "কর্মরত (Working)" : "Working"
                : isBn ? "শিফট সম্পন্ন" : "Completed"}
            </span>
          </div>

          {todayStatus === "not_clocked_in" && (
            <Button
              onClick={handleClockIn}
              disabled={isClockingIn}
              className="bg-[#003399] hover:bg-[#002B80] text-white gap-2 font-bold shadow-sm"
              size="sm"
            >
              <LogIn className="h-4 w-4" />
              <span>{isBn ? "চেক ইন" : "Clock In"}</span>
            </Button>
          )}

          {todayStatus === "working" && (
            <Button
              onClick={handleClockOut}
              disabled={isClockingOut}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-bold shadow-sm"
              size="sm"
            >
              <LogOut className="h-4 w-4" />
              <span>{isBn ? "চেক আউট" : "Clock Out"}</span>
            </Button>
          )}

          {todayStatus === "completed" && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400">
              <CheckCircle className="h-4 w-4" />
              <span>{isBn ? "আজকের শিফট সমাপ্ত" : "Shift Complete"}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── 2. Profile Summary & Today's Metric Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Profile Identity Card */}
        <Card className="border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm md:col-span-1">
          <CardContent className="p-5 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-start gap-3.5">
                {employee.photoUrl ? (
                  <img
                    src={employee.photoUrl}
                    alt={employee.firstName}
                    className="h-14 w-14 rounded-2xl object-cover border border-zinc-200 dark:border-zinc-800 shadow-sm"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-2xl bg-[#003399] text-white flex items-center justify-center font-bold text-xl shadow-sm">
                    {employee.firstName[0]}
                    {employee.lastName?.[0] || ""}
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-zinc-900 dark:text-white text-base leading-snug">
                    {employee.firstName} {employee.lastName}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {employee.designationId?.name || "Employee"} • {employee.departmentId?.name || "Operations"}
                  </p>
                  <span className="inline-block mt-2 font-mono text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-700 dark:text-zinc-300">
                    ID: {employee.employeeCode}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Store</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">{store?.name || "Store"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Shift</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {employee.shiftId?.name || "Standard"} ({employee.shiftId?.startTime || "09:00"} - {employee.shiftId?.endTime || "18:00"})
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <Link
                href={`${basePath}/profile`}
                className="text-xs font-bold text-[#003399] hover:underline flex items-center justify-between dark:text-blue-400"
              >
                <span>{isBn ? "প্রোফাইল বিবরণ দেখুন" : "View Full Profile"}</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Today's Summary Card */}
        <Card className="border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#003399]" />
              <span>{isBn ? "আজকের কাজের বিবরণ" : "Today's Time & Attendance"}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <span className="text-[11px] text-zinc-500 block font-medium">Clock In</span>
                <span className="text-lg font-bold font-mono text-zinc-900 dark:text-white">
                  {todayAtt?.checkIn
                    ? new Date(todayAtt.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : "—"}
                </span>
                {todayAtt?.lateMinutes ? (
                  <span className="text-[10px] text-amber-600 block mt-0.5 font-bold">
                    ⚠️ {todayAtt.lateMinutes}m Late
                  </span>
                ) : (
                  <span className="text-[10px] text-zinc-400 block mt-0.5">On time</span>
                )}
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <span className="text-[11px] text-zinc-500 block font-medium">Clock Out</span>
                <span className="text-lg font-bold font-mono text-zinc-900 dark:text-white">
                  {todayAtt?.checkOut
                    ? new Date(todayAtt.checkOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : "—"}
                </span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">
                  {todayAtt?.checkOut ? "Recorded" : "In Progress"}
                </span>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <span className="text-[11px] text-zinc-500 block font-medium">Worked Hours</span>
                <span className="text-lg font-bold font-mono text-zinc-900 dark:text-white">
                  {todayAtt?.workedMinutes
                    ? `${(todayAtt.workedMinutes / 60).toFixed(1)}h`
                    : todayAtt?.checkIn
                    ? "Active"
                    : "0h"}
                </span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">Standard: 8h</span>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <span className="text-[11px] text-zinc-500 block font-medium">Overtime</span>
                <span className="text-lg font-bold font-mono text-zinc-900 dark:text-white">
                  {todayAtt?.overtimeMinutes ? `${(todayAtt.overtimeMinutes / 60).toFixed(1)}h` : "0h"}
                </span>
                <span className="text-[10px] text-emerald-600 block mt-0.5 font-bold">Logged</span>
              </div>
            </div>

            <div className="flex justify-end">
              <Link
                href={`${basePath}/attendance`}
                className="text-xs font-bold text-[#003399] hover:underline flex items-center gap-1 dark:text-blue-400"
              >
                <span>{isBn ? "সম্পূর্ণ হাজিরা ইতিহাস ও আবেদন" : "Attendance Log & Correction Requests"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── 3. Quick Action Hub ── */}
      <div>
        <h2 className="text-sm font-bold text-zinc-900 dark:text-white mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            href={`${basePath}/leaves`}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-zinc-200 bg-white hover:border-[#003399] hover:bg-blue-50/40 transition-all dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-center group"
          >
            <CalendarDays className="h-6 w-6 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Request Leave</span>
            <span className="text-[10px] text-zinc-500 mt-0.5">Apply for time off</span>
          </Link>

          <Link
            href={`${basePath}/payroll`}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-zinc-200 bg-white hover:border-[#003399] hover:bg-blue-50/40 transition-all dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-center group"
          >
            <Wallet className="h-6 w-6 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">View Payslip</span>
            <span className="text-[10px] text-zinc-500 mt-0.5">Download salary slip</span>
          </Link>

          <Link
            href={`${basePath}/bank-account`}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-zinc-200 bg-white hover:border-[#003399] hover:bg-blue-50/40 transition-all dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-center group"
          >
            <CreditCard className="h-6 w-6 text-violet-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Bank Account</span>
            <span className="text-[10px] text-zinc-500 mt-0.5">Disbursement details</span>
          </Link>

          <Link
            href={`${basePath}/profile`}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-zinc-200 bg-white hover:border-[#003399] hover:bg-blue-50/40 transition-all dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-center group"
          >
            <UserCheck className="h-6 w-6 text-amber-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Edit Profile</span>
            <span className="text-[10px] text-zinc-500 mt-0.5">Phone & address</span>
          </Link>

          <Link
            href={`${basePath}/documents`}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-zinc-200 bg-white hover:border-[#003399] hover:bg-blue-50/40 transition-all dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-center group"
          >
            <FileText className="h-6 w-6 text-teal-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Documents</span>
            <span className="text-[10px] text-zinc-500 mt-0.5">Official files & contracts</span>
          </Link>

          <Link
            href={`${basePath}/requests`}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-zinc-200 bg-white hover:border-[#003399] hover:bg-blue-50/40 transition-all dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-center group"
          >
            <Send className="h-6 w-6 text-rose-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">My Requests</span>
            <span className="text-[10px] text-zinc-500 mt-0.5">Track status & reviews</span>
          </Link>
        </div>
      </div>

      {/* ── 4. Recent Activity & Summaries Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Attendance Logs */}
        <Card className="border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs uppercase font-bold text-zinc-500 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-blue-600" />
              <span>Recent Attendance</span>
            </CardTitle>
            <Link href={`${basePath}/attendance`} className="text-[11px] text-[#003399] font-bold hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {recentAttendance.length === 0 ? (
              <p className="text-xs text-zinc-400 py-4 text-center">No recent attendance records</p>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
                {recentAttendance.map((rec: any) => (
                  <div key={rec._id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200 block">{rec.date}</span>
                      <span className="text-[11px] text-zinc-400">
                        {rec.checkIn ? new Date(rec.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                        {" → "}
                        {rec.checkOut ? new Date(rec.checkOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "In progress"}
                      </span>
                    </div>
                    <Badge variant={rec.status === "present" ? "success" : rec.status === "late" ? "warning" : "default"}>
                      {rec.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Leave Requests & Balances */}
        <Card className="border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs uppercase font-bold text-zinc-500 flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 text-emerald-600" />
              <span>Leave Summary</span>
            </CardTitle>
            <Link href={`${basePath}/leaves`} className="text-[11px] text-[#003399] font-bold hover:underline">
              Manage
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {balances && (
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-zinc-50 dark:bg-zinc-800/60 p-2 rounded-lg border border-zinc-100 dark:border-zinc-800">
                  <span className="text-[10px] text-zinc-400 block font-medium">Casual</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">{balances.casual.remaining} days</span>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-800/60 p-2 rounded-lg border border-zinc-100 dark:border-zinc-800">
                  <span className="text-[10px] text-zinc-400 block font-medium">Sick</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">{balances.sick.remaining} days</span>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-800/60 p-2 rounded-lg border border-zinc-100 dark:border-zinc-800">
                  <span className="text-[10px] text-zinc-400 block font-medium">Annual</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">{balances.annual.remaining} days</span>
                </div>
              </div>
            )}

            {leaves.length === 0 ? (
              <p className="text-xs text-zinc-400 py-3 text-center">No recent leave requests</p>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
                {leaves.map((l: any) => (
                  <div key={l._id} className="py-2 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200 capitalize block">
                        {l.leaveType} ({l.daysCount}d)
                      </span>
                      <span className="text-[11px] text-zinc-400">
                        {l.startDate} ~ {l.endDate}
                      </span>
                    </div>
                    <Badge variant={l.status === "approved" ? "success" : l.status === "pending" ? "warning" : "default"}>
                      {l.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Requests & Updates */}
        <Card className="border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs uppercase font-bold text-zinc-500 flex items-center gap-1.5">
              <Send className="h-3.5 w-3.5 text-rose-600" />
              <span>Recent Requests</span>
            </CardTitle>
            <Link href={`${basePath}/requests`} className="text-[11px] text-[#003399] font-bold hover:underline">
              All requests
            </Link>
          </CardHeader>
          <CardContent>
            {recentRequests.length === 0 ? (
              <p className="text-xs text-zinc-400 py-4 text-center">No requests submitted yet</p>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
                {recentRequests.map((req: any) => (
                  <div key={req._id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200 block truncate max-w-[180px]">
                        {req.title}
                      </span>
                      <span className="text-[10px] text-zinc-400">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <Badge variant={req.status === "approved" ? "success" : req.status === "pending" ? "warning" : "default"}>
                      {req.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
