"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useGetStoreBySlugQuery } from "@/redux/api/store-api";
import {
  useGetMyLeavesQuery,
  useApplyMyLeaveMutation,
  useCancelMyLeaveMutation,
} from "@/redux/api/hrm-api";
import { useLanguage } from "@/providers/language-provider";
import {
  CalendarDays,
  Plus,
  ArrowLeft,
  XCircle,
  Loader2,
  AlertCircle,
  CheckCircle2,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function LeavesPage() {
  const params = useParams();
  const storeSlug = String(params.storeSlug);
  const { data: storeData } = useGetStoreBySlugQuery(storeSlug, { skip: !storeSlug });
  const store = storeData?.data?.store;
  const storeId = store?._id ?? "";

  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [leaveType, setLeaveType] = useState("casual");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [daysCount, setDaysCount] = useState(1);
  const [leaveReason, setLeaveReason] = useState("");

  const { data: leavesData, isLoading, refetch: refetchLeaves } = useGetMyLeavesQuery(storeId, {
    skip: !storeId,
  });
  const [applyLeave, { isLoading: isApplying }] = useApplyMyLeaveMutation();
  const [cancelLeave, { isLoading: isCancelling }] = useCancelMyLeaveMutation();

  const leaves = leavesData?.data?.leaves ?? [];
  const balances = leavesData?.data?.balances;

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !leaveReason.trim()) {
      toast.error("Please fill in start date, end date, and reason");
      return;
    }

    try {
      await applyLeave({
        storeId,
        leaveType,
        startDate,
        endDate,
        daysCount: Number(daysCount) || 1,
        reason: leaveReason.trim(),
      }).unwrap();

      toast.success("Leave application submitted successfully!");
      setLeaveModalOpen(false);
      setStartDate("");
      setEndDate("");
      setDaysCount(1);
      setLeaveReason("");
      refetchLeaves();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to submit leave application");
    }
  };

  const handleCancel = async (leaveId: string) => {
    if (!confirm("Are you sure you want to cancel this pending leave request?")) return;
    try {
      await cancelLeave({ storeId, leaveId }).unwrap();
      toast.success("Leave request cancelled successfully");
      refetchLeaves();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to cancel leave");
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
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
            <CalendarDays className="h-6 w-6 text-[#003399]" />
            <span>Leave Requests</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            View your annual leave quotas, track pending applications, and request time off.
          </p>
        </div>

        <Button
          onClick={() => setLeaveModalOpen(true)}
          size="sm"
          className="bg-[#003399] hover:bg-[#002B80] text-white gap-2 font-bold shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Apply for Leave</span>
        </Button>
      </div>

      {/* Leave Balance Cards */}
      {balances && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-xs text-zinc-500 font-semibold mb-2">
                <span>Casual Leave</span>
                <span className="font-mono">{balances.casual.used} / {balances.casual.quota} used</span>
              </div>
              <div className="text-2xl font-bold text-zinc-900 dark:text-white">
                {balances.casual.remaining} <span className="text-xs font-normal text-zinc-400">days left</span>
              </div>
              <div className="mt-3 h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${Math.min(100, (balances.casual.used / balances.casual.quota) * 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-xs text-zinc-500 font-semibold mb-2">
                <span>Sick Leave</span>
                <span className="font-mono">{balances.sick.used} / {balances.sick.quota} used</span>
              </div>
              <div className="text-2xl font-bold text-zinc-900 dark:text-white">
                {balances.sick.remaining} <span className="text-xs font-normal text-zinc-400">days left</span>
              </div>
              <div className="mt-3 h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full"
                  style={{ width: `${Math.min(100, (balances.sick.used / balances.sick.quota) * 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-xs text-zinc-500 font-semibold mb-2">
                <span>Annual Leave</span>
                <span className="font-mono">{balances.annual.used} / {balances.annual.quota} used</span>
              </div>
              <div className="text-2xl font-bold text-zinc-900 dark:text-white">
                {balances.annual.remaining} <span className="text-xs font-normal text-zinc-400">days left</span>
              </div>
              <div className="mt-3 h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-violet-600 rounded-full"
                  style={{ width: `${Math.min(100, (balances.annual.used / balances.annual.quota) * 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Leave Requests Table */}
      <Card className="border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-zinc-900 dark:text-white">
            Leave History & Status
          </CardTitle>
          <CardDescription className="text-xs text-zinc-500 mt-0.5">
            Past leave applications and their current HR approval status.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {leaves.length === 0 ? (
            <div className="p-12 text-center text-zinc-400 text-xs">
              No leave requests found. Click &quot;Apply for Leave&quot; above to submit an application.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 border-y border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="py-3 px-4 font-bold">Leave Type</th>
                    <th className="py-3 px-4 font-bold">Dates</th>
                    <th className="py-3 px-4 font-bold">Days</th>
                    <th className="py-3 px-4 font-bold">Reason</th>
                    <th className="py-3 px-4 font-bold text-center">Status</th>
                    <th className="py-3 px-4 font-bold">Manager Remarks</th>
                    <th className="py-3 px-4 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {leaves.map((l: any) => (
                    <tr key={l._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                      <td className="py-3 px-4 font-bold capitalize text-zinc-900 dark:text-white">
                        {l.leaveType}
                      </td>
                      <td className="py-3 px-4 font-mono">
                        {l.startDate} ~ {l.endDate}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold">
                        {l.daysCount} days
                      </td>
                      <td className="py-3 px-4 max-w-[200px] truncate text-zinc-600 dark:text-zinc-400">
                        {l.reason}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge
                          variant={
                            l.status === "approved"
                              ? "success"
                              : l.status === "pending"
                              ? "warning"
                              : l.status === "cancelled"
                              ? "default"
                              : "danger"
                          }
                        >
                          {l.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-zinc-500 italic max-w-[150px] truncate">
                        {l.managerRemarks || "—"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {l.status === "pending" ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={isCancelling}
                            onClick={() => handleCancel(l._id)}
                            className="h-7 text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-[11px] font-semibold"
                          >
                            Cancel
                          </Button>
                        ) : (
                          <span className="text-zinc-400 text-[11px]">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Apply Leave Dialog */}
      <Dialog open={leaveModalOpen} onOpenChange={setLeaveModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Apply for Leave</DialogTitle>
            <DialogDescription>
              Submit your leave application for manager and HR approval.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleApply} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Leave Type *</Label>
              <Select value={leaveType} onValueChange={setLeaveType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="casual">Casual Leave ({balances?.casual.remaining ?? 10} days remaining)</SelectItem>
                  <SelectItem value="sick">Sick Leave ({balances?.sick.remaining ?? 14} days remaining)</SelectItem>
                  <SelectItem value="annual">Annual Leave ({balances?.annual.remaining ?? 15} days remaining)</SelectItem>
                  <SelectItem value="unpaid">Unpaid / Other Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Start Date *</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>End Date *</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Days Count *</Label>
              <Input
                type="number"
                step="0.5"
                min="0.5"
                value={daysCount}
                onChange={(e) => setDaysCount(Number(e.target.value) || 1)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label>Reason *</Label>
              <Textarea
                value={leaveReason}
                onChange={(e) => setLeaveReason(e.target.value)}
                placeholder="Medical checkup / family visit / emergency..."
                rows={3}
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setLeaveModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isApplying}
                className="bg-[#003399] hover:bg-[#002B80] text-white font-bold"
              >
                {isApplying ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                <span>Submit Application</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
