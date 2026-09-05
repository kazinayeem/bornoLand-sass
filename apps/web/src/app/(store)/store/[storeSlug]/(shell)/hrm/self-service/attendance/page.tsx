"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useGetStoreBySlugQuery } from "@/redux/api/store-api";
import {
  useGetMyTodayAttendanceQuery,
  useClockInMyAttendanceMutation,
  useClockOutMyAttendanceMutation,
  useGetMyAttendanceHistoryQuery,
  useRequestAttendanceCorrectionMutation,
} from "@/redux/api/hrm-api";
import { useLanguage } from "@/providers/language-provider";
import {
  Clock,
  LogIn,
  LogOut,
  CheckCircle,
  AlertCircle,
  Calendar,
  ArrowLeft,
  CalendarCheck,
  Send,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function AttendancePage() {
  const params = useParams();
  const storeSlug = String(params.storeSlug);
  const { data: storeData } = useGetStoreBySlugQuery(storeSlug, { skip: !storeSlug });
  const store = storeData?.data?.store;
  const storeId = store?._id ?? "";

  const { language } = useLanguage();
  const isBn = (language as string) === "bn";

  const [correctionModalOpen, setCorrectionModalOpen] = useState(false);
  const [corrDate, setCorrDate] = useState("");
  const [corrCheckIn, setCorrCheckIn] = useState("");
  const [corrCheckOut, setCorrCheckOut] = useState("");
  const [corrReason, setCorrReason] = useState("");

  const { data: todayAttData, refetch: refetchTodayAtt } = useGetMyTodayAttendanceQuery(storeId, {
    skip: !storeId,
  });
  const { data: attHistoryData, refetch: refetchHistory } = useGetMyAttendanceHistoryQuery(
    { storeId, limit: 31 },
    { skip: !storeId }
  );

  const [clockIn, { isLoading: isClockingIn }] = useClockInMyAttendanceMutation();
  const [clockOut, { isLoading: isClockingOut }] = useClockOutMyAttendanceMutation();
  const [requestCorrection, { isLoading: isSubmittingCorr }] = useRequestAttendanceCorrectionMutation();

  const todayAtt = todayAttData?.data?.attendance;
  const todayStatus = todayAttData?.data?.status ?? "not_clocked_in";
  const attHistory = attHistoryData?.data?.attendance ?? [];

  const handleClockIn = async () => {
    try {
      await clockIn(storeId).unwrap();
      toast.success(isBn ? "চেক-ইন সম্পন্ন হয়েছে!" : "Clocked in successfully!");
      refetchTodayAtt();
      refetchHistory();
    } catch (err: any) {
      toast.error(err?.data?.message || "Clock-in failed");
    }
  };

  const handleClockOut = async () => {
    try {
      await clockOut(storeId).unwrap();
      toast.success(isBn ? "চেক-আউট সম্পন্ন হয়েছে!" : "Clocked out successfully!");
      refetchTodayAtt();
      refetchHistory();
    } catch (err: any) {
      toast.error(err?.data?.message || "Clock-out failed");
    }
  };

  const handleSubmitCorrection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!corrDate || !corrReason.trim()) {
      toast.error("Please select a date and provide a reason");
      return;
    }

    try {
      await requestCorrection({
        storeId,
        date: corrDate,
        requestedCheckIn: corrCheckIn ? `${corrDate}T${corrCheckIn}:00` : undefined,
        requestedCheckOut: corrCheckOut ? `${corrDate}T${corrCheckOut}:00` : undefined,
        reason: corrReason.trim(),
      }).unwrap();

      toast.success("Attendance correction request submitted for HR approval!");
      setCorrectionModalOpen(false);
      setCorrDate("");
      setCorrCheckIn("");
      setCorrCheckOut("");
      setCorrReason("");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to submit correction request");
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Back Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-4 dark:border-zinc-800">
        <div>
          <Link
            href={`/store/${storeSlug}/hrm/self-service`}
            className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 mb-1.5"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>My Workspace</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5">
            <Clock className="h-6 w-6 text-[#003399]" />
            <span>Attendance & Time</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Track daily work hours, live check-in / check-out, and submit correction requests for HR review.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCorrectionModalOpen(true)}
            className="gap-2 font-semibold text-xs border-zinc-200 dark:border-zinc-800"
          >
            <Send className="h-3.5 w-3.5 text-zinc-600" />
            <span>Request Correction</span>
          </Button>

          {todayStatus === "not_clocked_in" && (
            <Button
              onClick={handleClockIn}
              disabled={isClockingIn}
              size="sm"
              className="bg-[#003399] hover:bg-[#002B80] text-white gap-2 font-bold shadow-sm"
            >
              <LogIn className="h-4 w-4" />
              <span>Clock In</span>
            </Button>
          )}

          {todayStatus === "working" && (
            <Button
              onClick={handleClockOut}
              disabled={isClockingOut}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-bold shadow-sm"
            >
              <LogOut className="h-4 w-4" />
              <span>Clock Out</span>
            </Button>
          )}

          {todayStatus === "completed" && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400">
              <CheckCircle className="h-4 w-4" />
              <span>Shift Complete</span>
            </div>
          )}
        </div>
      </div>

      {/* Today's Live Status Banner */}
      <Card className="border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-500">
            Today's Log ({new Date().toISOString().slice(0, 10)})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
              <span className="text-xs text-zinc-500 block font-medium">Check In</span>
              <span className="text-xl font-bold font-mono text-zinc-900 dark:text-white mt-1 block">
                {todayAtt?.checkIn
                  ? new Date(todayAtt.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  : "—"}
              </span>
              {todayAtt?.lateMinutes ? (
                <span className="text-[11px] text-amber-600 font-bold block mt-1">
                  ⚠️ {todayAtt.lateMinutes} mins late
                </span>
              ) : (
                <span className="text-[11px] text-zinc-400 block mt-1">On schedule</span>
              )}
            </div>

            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
              <span className="text-xs text-zinc-500 block font-medium">Check Out</span>
              <span className="text-xl font-bold font-mono text-zinc-900 dark:text-white mt-1 block">
                {todayAtt?.checkOut
                  ? new Date(todayAtt.checkOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  : "—"}
              </span>
              <span className="text-[11px] text-zinc-400 block mt-1">
                {todayAtt?.checkOut ? "Shift ended" : "In progress"}
              </span>
            </div>

            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
              <span className="text-xs text-zinc-500 block font-medium">Worked Duration</span>
              <span className="text-xl font-bold font-mono text-zinc-900 dark:text-white mt-1 block">
                {todayAtt?.workedMinutes
                  ? `${Math.floor(todayAtt.workedMinutes / 60)}h ${todayAtt.workedMinutes % 60}m`
                  : todayAtt?.checkIn
                  ? "Active"
                  : "0m"}
              </span>
              <span className="text-[11px] text-zinc-400 block mt-1">Calculated</span>
            </div>

            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
              <span className="text-xs text-zinc-500 block font-medium">Status</span>
              <div className="mt-1">
                <Badge
                  variant={
                    todayAtt?.status === "present"
                      ? "success"
                      : todayAtt?.status === "late"
                      ? "warning"
                      : "default"
                  }
                >
                  {todayAtt?.status || "Not Checked In"}
                </Badge>
              </div>
              <span className="text-[11px] text-zinc-400 block mt-1">Official state</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Attendance History */}
      <Card className="border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-zinc-900 dark:text-white">
              Attendance History
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500 mt-0.5">
              Recent recorded clock-ins and clock-outs. Official records can only be adjusted via approved correction requests.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCorrectionModalOpen(true)}
            className="text-xs font-semibold"
          >
            Correction Request
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {attHistory.length === 0 ? (
            <div className="p-12 text-center text-zinc-400 text-xs">
              No attendance records recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 border-y border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="py-3 px-4 font-bold">Date</th>
                    <th className="py-3 px-4 font-bold">Check In</th>
                    <th className="py-3 px-4 font-bold">Check Out</th>
                    <th className="py-3 px-4 font-bold">Worked Time</th>
                    <th className="py-3 px-4 font-bold">Late</th>
                    <th className="py-3 px-4 font-bold">Overtime</th>
                    <th className="py-3 px-4 font-bold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {attHistory.map((rec: any) => (
                    <tr key={rec._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                      <td className="py-3 px-4 font-bold text-zinc-900 dark:text-white font-mono">
                        {rec.date}
                      </td>
                      <td className="py-3 px-4 font-mono">
                        {rec.checkIn
                          ? new Date(rec.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                          : "—"}
                      </td>
                      <td className="py-3 px-4 font-mono">
                        {rec.checkOut
                          ? new Date(rec.checkOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                          : "—"}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold">
                        {rec.workedMinutes
                          ? `${Math.floor(rec.workedMinutes / 60)}h ${rec.workedMinutes % 60}m`
                          : "—"}
                      </td>
                      <td className="py-3 px-4">
                        {rec.lateMinutes ? (
                          <span className="text-amber-600 font-bold">{rec.lateMinutes} mins</span>
                        ) : (
                          <span className="text-zinc-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {rec.overtimeMinutes ? (
                          <span className="text-emerald-600 font-bold">{rec.overtimeMinutes} mins</span>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attendance Correction Modal */}
      <Dialog open={correctionModalOpen} onOpenChange={setCorrectionModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request Attendance Correction</DialogTitle>
            <DialogDescription>
              Submit missing or incorrect clock-in / clock-out times. Your request will be reviewed by HR/Admin before updating the official attendance log.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitCorrection} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Date *</Label>
              <Input
                type="date"
                value={corrDate}
                onChange={(e) => setCorrDate(e.target.value)}
                required
                max={new Date().toISOString().slice(0, 10)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Requested In Time</Label>
                <Input
                  type="time"
                  value={corrCheckIn}
                  onChange={(e) => setCorrCheckIn(e.target.value)}
                  placeholder="09:00"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Requested Out Time</Label>
                <Input
                  type="time"
                  value={corrCheckOut}
                  onChange={(e) => setCorrCheckOut(e.target.value)}
                  placeholder="18:00"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Reason for Correction *</Label>
              <Textarea
                value={corrReason}
                onChange={(e) => setCorrReason(e.target.value)}
                placeholder="Forgot to clock in due to network issue / official offsite meeting..."
                rows={3}
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setCorrectionModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingCorr}
                className="bg-[#003399] hover:bg-[#002B80] text-white font-bold"
              >
                {isSubmittingCorr ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                <span>Submit to HR</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
