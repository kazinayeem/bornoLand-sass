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
  Calendar,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StorePageHeader } from "@/components/store-dashboard/store-page-header";
import { StorePageCard } from "@/components/store-dashboard/store-page";
import { MetricCard } from "@/components/ui/metric-card";
import { Badge } from "@/components/ui/badge";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
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
import { cn } from "@/lib/utils";

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

  const { data: attData, isLoading, refetch, isError } = useGetDailyAttendanceQuery(
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
        <h2 className="mt-4 text-lg font-bold">{isBn ? "অনুমতি নেই" : "Access Denied"}</h2>
        <p className="text-xs text-zinc-500 mt-1">
          {isBn ? "হাজিরা লগ দেখার অনুমতি নেই।" : "You do not have permission to view attendance logs."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StorePageHeader
        title="Daily Attendance & Shifts (HRM)"
        description="Monitor staff check-in/out timestamps, working hours, delays, and overtime calculation for automated payroll."
        breadcrumbs={[
          { label: "Dashboard", href: store ? `/store/${store.slug}/dashboard` : "#" },
          { label: "HRM" },
          { label: "Attendance" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-36 h-9 text-xs"
            />
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5 text-xs font-semibold cursor-pointer">
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Refresh</span>
            </Button>
            <Button
              onClick={() => {
                setActionType("in");
                setClockModal(true);
              }}
              size="sm"
              className="gap-1.5 bg-[#003399] hover:bg-[#002B80] text-white text-xs font-bold shadow-2xs cursor-pointer"
            >
              <LogIn className="h-4 w-4" />
              <span>Clock In / Out</span>
            </Button>
          </div>
        }
      />

      {/* ── KPI Cards ─────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          title="Present Today"
          value={`${presentCount} / ${totalEmployees}`}
          subtitle={totalEmployees > 0 ? `${((presentCount / totalEmployees) * 100).toFixed(0)}% attendance rate` : "0% attendance"}
          icon={UserCheck}
          iconClassName="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30"
        />

        <MetricCard
          title="Absent / Pending"
          value={Math.max(0, totalEmployees - presentCount)}
          subtitle="Employees not yet clocked in"
          icon={AlertCircle}
          iconClassName="text-amber-600 bg-amber-50 dark:bg-amber-950/30"
        />

        <MetricCard
          title="Accumulated Overtime"
          value={`${(records.reduce((sum, r) => sum + (r.overtimeMinutes || 0), 0) / 60).toFixed(1)} hrs`}
          subtitle="Overtime logged for selected date"
          icon={Clock}
          iconClassName="text-blue-600 bg-blue-50 dark:bg-blue-950/30"
        />
      </div>

      {/* ── Attendance Log Table ──────────────────────────────── */}
      <StorePageCard>
        <div className="pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="text-base font-bold text-zinc-950 dark:text-white flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#003399] dark:text-[#FFDA1A]" />
            <span>Attendance Log — {new Date(date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" })}</span>
          </h3>
        </div>

        <div className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-[#003399]" />
            </div>
          ) : isError ? (
            <ErrorState
              title="Unable to load attendance records"
              message="Check your connection"
              onRetry={refetch}
            />
          ) : records.length === 0 ? (
            <EmptyState
              icon={CalendarCheck}
              title="No attendance logged for this date"
              description="Employees who clock in or out will appear in this register."
              action={
                <Button
                  onClick={() => {
                    setActionType("in");
                    setClockModal(true);
                  }}
                  size="sm"
                  className="bg-[#003399] text-white hover:bg-[#002B80] text-xs font-bold cursor-pointer"
                >
                  <LogIn className="h-3.5 w-3.5 mr-1" />
                  Clock In Staff
                </Button>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Clock In</th>
                    <th className="py-3 px-4">Clock Out</th>
                    <th className="py-3 px-4">Working Hours</th>
                    <th className="py-3 px-4">Overtime</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800">
                  {records.map((rec) => (
                    <tr
                      key={rec._id}
                      className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-bold text-zinc-900 dark:text-zinc-100">
                            {rec.employeeId?.firstName} {rec.employeeId?.lastName}
                          </p>
                          <p className="text-[11px] text-zinc-400 font-mono">
                            {rec.employeeId?.employeeCode || "EMP"}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-zinc-700 dark:text-zinc-300">
                        {rec.checkIn ? new Date(rec.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-zinc-700 dark:text-zinc-300">
                        {rec.checkOut ? new Date(rec.checkOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
                          {rec.workedMinutes ? `${(rec.workedMinutes / 60).toFixed(1)} hrs` : "In Progress"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {rec.overtimeMinutes > 0 ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                            +{(rec.overtimeMinutes / 60).toFixed(1)} hrs
                          </span>
                        ) : (
                          <span className="text-zinc-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge
                          variant={
                            rec.status === "present"
                              ? "success"
                              : rec.status === "late"
                              ? "warning"
                              : "default"
                          }
                        >
                          {rec.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {!rec.checkOut && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              try {
                                await clockOut({ storeId, employeeId: rec.employeeId._id }).unwrap();
                                toast.success("Clock-out recorded");
                                refetch();
                              } catch (err: any) {
                                toast.error(err?.data?.message || "Failed to clock out");
                              }
                            }}
                            className="h-7 text-xs gap-1 text-rose-600 border-rose-200 hover:bg-rose-50 cursor-pointer"
                          >
                            <LogOut className="h-3 w-3" />
                            <span>Clock Out</span>
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </StorePageCard>

      {/* ── Clock In/Out Modal ────────────────────────────────── */}
      <Dialog open={clockModal} onOpenChange={setClockModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isBn ? "কর্মীর হাজিরা দিন" : "Record Attendance"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleClockAction} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>{isBn ? "অ্যাকশন টাইপ" : "Action Type"}</Label>
              <Select value={actionType} onValueChange={(v: "in" | "out") => setActionType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in">Clock In (চেক-ইন)</SelectItem>
                  <SelectItem value="out">Clock Out (চেক-আউট)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>{isBn ? "কর্মী নির্বাচন করুন" : "Select Employee *"}</Label>
              <Select value={selectedEmpId} onValueChange={setSelectedEmpId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp._id} value={emp._id}>
                      {emp.firstName} {emp.lastName} ({emp.employeeCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setClockModal(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isClockingIn || isClockingOut}
                className="bg-[#003399] hover:bg-[#002B80] text-white font-bold"
              >
                {isClockingIn || isClockingOut ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                ) : null}
                <span>Submit {actionType === "in" ? "Clock In" : "Clock Out"}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
