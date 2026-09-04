"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useGetStoreBySlugQuery } from "@/redux/api/store-api";
import {
  useGetDailyAttendanceQuery,
  useClockInMutation,
  useClockOutMutation,
  useGetEmployeesQuery,
} from "@/redux/api/hrm-api";
import { useLanguage } from "@/providers/language-provider";
import { useHasPermission } from "@/features/session/hooks";
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  UserCheck,
  AlertCircle,
  RefreshCw,
  LogIn,
  LogOut,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function AttendancePage() {
  const params = useParams();
  const storeSlug = String(params.storeSlug);
  const { data: storeData } = useGetStoreBySlugQuery(storeSlug, { skip: !storeSlug });
  const store = storeData?.data?.store;
  const storeId = store?._id ?? "";

  const { language } = useLanguage();
  const isBn = false;

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [clockModal, setClockModal] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState("");
  const [actionType, setActionType] = useState<"in" | "out">("in");

  const hasAccess = useHasPermission("hrm:read");

  const { data: attData, isLoading, refetch } = useGetDailyAttendanceQuery(
    { storeId, date },
    { skip: !storeId }
  );

  const { data: empData } = useGetEmployeesQuery({ storeId, limit: 100 }, { skip: !storeId });

  const [clockIn, { isLoading: isClockingIn }] = useClockInMutation();
  const [clockOut, { isLoading: isClockingOut }] = useClockOutMutation();

  const records = attData?.data?.records ?? [];
  const totalEmployees = attData?.data?.totalEmployees ?? 0;
  const presentCount = attData?.data?.presentCount ?? 0;
  const employees = empData?.data?.employees ?? [];

  const handleClockAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId) return;

    try {
      if (actionType === "in") {
        await clockIn({ storeId, employeeId: selectedEmpId }).unwrap();
        toast.success(isBn ? "চেক-ইন সফল হয়েছে" : "Clock-in successful");
      } else {
        await clockOut({ storeId, employeeId: selectedEmpId }).unwrap();
        toast.success(isBn ? "চেক-আউট সফল হয়েছে" : "Clock-out successful");
      }
      setClockModal(false);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to record attendance");
    }
  };

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <ShieldAlert className="h-10 w-10 text-rose-500" />
        <h2 className="mt-4 text-lg font-semibold">{isBn ? "অনুমতি নেই" : "Access Denied"}</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white flex items-center gap-2.5">
            <CalendarCheck className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
            <span>{isBn ? "হাজিরা ও শিফট ট্র্যাকার (Attendance)" : "Daily Attendance & Shifts"}</span>
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {isBn
              ? "কর্মীদের চেক-ইন, চেক-আউট, বিলম্ব ও ওভারটাইম হিসাব স্বয়ংক্রিয়ভাবে পরিচালনা করুন।"
              : "Track daily check-ins, check-outs, late minutes, and overtime calculation for payroll."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-36 h-9 text-xs"
          />
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            <span>{isBn ? "রিফ্রেশ" : "Refresh"}</span>
          </Button>
          <Button
            onClick={() => {
              setActionType("in");
              setClockModal(true);
            }}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
          >
            <LogIn className="h-4 w-4" />
            <span>{isBn ? "হাজিরা দিন (Clock In)" : "Clock In / Out"}</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500 flex items-center justify-between">
              <span>{isBn ? "উপস্থিতি হার" : "Present Today"}</span>
              <UserCheck className="h-4 w-4 text-emerald-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {presentCount} / {totalEmployees}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              {totalEmployees > 0 ? `${((presentCount / totalEmployees) * 100).toFixed(0)}% attendance rate` : "0%"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500 flex items-center justify-between">
              <span>{isBn ? "অনুপস্থিত কর্মী" : "Absent / Pending"}</span>
              <AlertCircle className="h-4 w-4 text-amber-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-white">
              {Math.max(0, totalEmployees - presentCount)}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              {isBn ? "আজ এখনো চেক-ইন করেননি" : "Employees not yet checked in"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500 flex items-center justify-between">
              <span>{isBn ? "মোট ওভারটাইম" : "Total Overtime"}</span>
              <Clock className="h-4 w-4 text-indigo-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {(records.reduce((sum, r) => sum + (r.overtimeMinutes || 0), 0) / 60).toFixed(1)} hrs
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              {isBn ? "আজকের অনুমোদিত অতিরিক্ত কাজের সময়" : "Accumulated overtime hours today"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Table */}
      <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-xs uppercase text-zinc-500 font-semibold border-b border-zinc-200/80 dark:border-zinc-800">
                <tr>
                  <th className="px-4 py-3">{isBn ? "কর্মী" : "Employee"}</th>
                  <th className="px-4 py-3">{isBn ? "আইডি" : "Code"}</th>
                  <th className="px-4 py-3">{isBn ? "চেক-ইন সময়" : "Check In"}</th>
                  <th className="px-4 py-3">{isBn ? "চেক-আউট সময়" : "Check Out"}</th>
                  <th className="px-4 py-3 text-right">{isBn ? "মোট সময়" : "Worked Time"}</th>
                  <th className="px-4 py-3 text-right">{isBn ? "ওভারটাইম" : "Overtime"}</th>
                  <th className="px-4 py-3">{isBn ? "স্ট্যাটাস" : "Status"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-zinc-400">
                      {isBn ? "লোড হচ্ছে..." : "Loading attendance..."}
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-zinc-400">
                      <CalendarCheck className="h-8 w-8 mx-auto mb-2 text-zinc-300" />
                      <p className="text-sm">{isBn ? "এই তারিখে কোনো হাজিরার রেকর্ড নেই" : "No attendance records for this date"}</p>
                    </td>
                  </tr>
                ) : (
                  records.map((r) => (
                    <tr key={r._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                      <td className="px-4 py-3 font-medium text-zinc-900 dark:text-white">
                        {r.employeeId?.firstName} {r.employeeId?.lastName}
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-zinc-500">
                        {r.employeeId?.employeeCode}
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                        {r.checkIn ? new Date(r.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-700 dark:text-zinc-300">
                        {r.checkOut ? new Date(r.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-zinc-600 dark:text-zinc-400">
                        {r.workedMinutes > 0 ? `${(r.workedMinutes / 60).toFixed(1)} hrs` : "—"}
                      </td>
                      <td className="px-4 py-3 text-right text-xs font-semibold text-indigo-600">
                        {r.overtimeMinutes > 0 ? `+${(r.overtimeMinutes / 60).toFixed(1)} hrs` : "0 hrs"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 capitalize">
                          {r.status}
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

      {/* Manual Clock In/Out Modal */}
      <Dialog open={clockModal} onOpenChange={setClockModal}>
        <DialogContent className="sm:max-w-[420px]">
          <form onSubmit={handleClockAction}>
            <DialogHeader>
              <DialogTitle>{isBn ? "হাজিরা চেক-ইন / চেক-আউট" : "Record Employee Attendance"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label>{isBn ? "কর্মী বাছাই করুন *" : "Select Employee *"}</Label>
                <Select value={selectedEmpId} onValueChange={setSelectedEmpId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose employee..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-52">
                    {employees.map((e: any) => (
                      <SelectItem key={e._id} value={e._id}>
                        {e.firstName} {e.lastName} ({e.employeeCode})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>{isBn ? "অ্যাকশন টাইপ *" : "Action Type *"}</Label>
                <Select value={actionType} onValueChange={(v: "in" | "out") => setActionType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in">{isBn ? "চেক-ইন (Clock In)" : "Clock In"}</SelectItem>
                    <SelectItem value="out">{isBn ? "চেক-আউট (Clock Out)" : "Clock Out"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setClockModal(false)}>{isBn ? "বাতিল" : "Cancel"}</Button>
              <Button type="submit" disabled={isClockingIn || isClockingOut} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {isBn ? "নিশ্চিত করুন" : "Confirm Attendance"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
