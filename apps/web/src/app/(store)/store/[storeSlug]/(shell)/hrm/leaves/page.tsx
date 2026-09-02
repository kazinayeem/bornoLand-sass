"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useGetStoreBySlugQuery } from "@/redux/api/store-api";
import {
  useGetLeavesQuery,
  useApplyLeaveMutation,
  useApproveLeaveMutation,
  useGetEmployeesQuery,
} from "@/redux/api/hrm-api";
import { useLanguage } from "@/providers/language-provider";
import { useHasPermission } from "@/features/session/hooks";
import {
  CalendarDays,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
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

  const { language } = useLanguage();
  const isBn = language === "bn";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState("");
  const [leaveType, setLeaveType] = useState("casual");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [daysCount, setDaysCount] = useState("1");
  const [reason, setReason] = useState("");

  const hasAccess = useHasPermission("hrm:read");

  const { data: leavesData, isLoading, refetch } = useGetLeavesQuery(
    { storeId },
    { skip: !storeId }
  );

  const { data: empData } = useGetEmployeesQuery({ storeId, limit: 100 }, { skip: !storeId });

  const [applyLeave, { isLoading: isApplying }] = useApplyLeaveMutation();
  const [approveLeave, { isLoading: isProcessing }] = useApproveLeaveMutation();

  const leaves = leavesData?.data?.records ?? [];
  const employees = empData?.data?.employees ?? [];

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId || !startDate || !endDate || !reason.trim()) {
      toast.error(isBn ? "প্রয়োজনীয় সমস্ত তথ্য দিন" : "Please fill in all required fields");
      return;
    }

    try {
      await applyLeave({
        storeId,
        body: {
          employeeId: selectedEmpId,
          leaveType,
          startDate,
          endDate,
          daysCount: Number(daysCount) || 1,
          reason,
        },
      }).unwrap();

      toast.success(isBn ? "ছুটির আবেদন জমা হয়েছে" : "Leave request submitted");
      setIsModalOpen(false);
      setReason("");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to submit leave request");
    }
  };

  const handleDecision = async (leaveId: string, status: "approved" | "rejected") => {
    try {
      await approveLeave({ storeId, leaveId, status }).unwrap();
      toast.success(status === "approved" ? (isBn ? "ছুটি মঞ্জুর করা হয়েছে" : "Leave approved") : (isBn ? "ছুটি বাতিল করা হয়েছে" : "Leave rejected"));
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to process leave");
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
            <CalendarDays className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
            <span>{isBn ? "ছুটি ব্যবস্থাপনা (Leave Management)" : "Leave Management"}</span>
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {isBn
              ? "কর্মীদের নৈমিত্তিক, অসুস্থতা ও বাৎসরিক ছুটির আবেদন এবং ম্যানেজারের অনুমোদন প্রক্রিয়া।"
              : "Handle employee leave requests, approval workflows, balance deductions, and attendance reconciliation."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            <span>{isBn ? "রিফ্রেশ" : "Refresh"}</span>
          </Button>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>{isBn ? "ছুটির আবেদন করুন" : "Apply for Leave"}</span>
          </Button>
        </div>
      </div>

      <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-xs uppercase text-zinc-500 font-semibold border-b border-zinc-200/80 dark:border-zinc-800">
                <tr>
                  <th className="px-4 py-3">{isBn ? "কর্মী" : "Employee"}</th>
                  <th className="px-4 py-3">{isBn ? "ছুটির ধরন" : "Leave Type"}</th>
                  <th className="px-4 py-3">{isBn ? "শুরু তারিখ" : "Start Date"}</th>
                  <th className="px-4 py-3">{isBn ? "শেষ তারিখ" : "End Date"}</th>
                  <th className="px-4 py-3 text-right">{isBn ? "দিন সংখ্যা" : "Days"}</th>
                  <th className="px-4 py-3">{isBn ? "কারণ" : "Reason"}</th>
                  <th className="px-4 py-3">{isBn ? "স্ট্যাটাস" : "Status"}</th>
                  <th className="px-4 py-3 text-right">{isBn ? "অ্যাকশন" : "Action"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-zinc-400">
                      {isBn ? "লোড হচ্ছে..." : "Loading leave requests..."}
                    </td>
                  </tr>
                ) : leaves.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-zinc-400">
                      <CalendarDays className="h-8 w-8 mx-auto mb-2 text-zinc-300" />
                      <p className="text-sm">{isBn ? "কোনো ছুটির আবেদন পাওয়া যায়নি" : "No leave requests found"}</p>
                    </td>
                  </tr>
                ) : (
                  leaves.map((l) => (
                    <tr key={l._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                      <td className="px-4 py-3 font-medium text-zinc-900 dark:text-white">
                        {l.employeeId?.firstName} {l.employeeId?.lastName}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium capitalize bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400">
                          {l.leaveType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-600 dark:text-zinc-400 font-mono">
                        {l.startDate}
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-600 dark:text-zinc-400 font-mono">
                        {l.endDate}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-zinc-800 dark:text-zinc-200">
                        {l.daysCount} d
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-600 dark:text-zinc-400 max-w-xs truncate">
                        {l.reason}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium capitalize ${
                            l.status === "approved"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                              : l.status === "rejected"
                              ? "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400"
                              : "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
                          }`}
                        >
                          {l.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {l.status === "pending" && (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDecision(l._id, "approved")}
                              disabled={isProcessing}
                              className="h-7 text-xs text-emerald-600 border-emerald-300 hover:bg-emerald-50 px-2"
                            >
                              <CheckCircle className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">{isBn ? "মঞ্জুর" : "Approve"}</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDecision(l._id, "rejected")}
                              disabled={isProcessing}
                              className="h-7 text-xs text-rose-600 border-rose-300 hover:bg-rose-50 px-2"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">{isBn ? "বাতিল" : "Reject"}</span>
                            </Button>
                          </div>
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

      {/* Apply Leave Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <form onSubmit={handleApply}>
            <DialogHeader>
              <DialogTitle>{isBn ? "ছুটির আবেদন তৈরি করুন" : "Apply for Employee Leave"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label>{isBn ? "কর্মী নির্বাচন *" : "Employee *"}</Label>
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

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>{isBn ? "ছুটির ধরন" : "Leave Type"}</Label>
                  <Select value={leaveType} onValueChange={setLeaveType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="casual">{isBn ? "নৈমিত্তিক (Casual)" : "Casual"}</SelectItem>
                      <SelectItem value="sick">{isBn ? "অসুস্থতা (Sick)" : "Sick"}</SelectItem>
                      <SelectItem value="annual">{isBn ? "বাৎসরিক (Annual)" : "Annual"}</SelectItem>
                      <SelectItem value="unpaid">{isBn ? "অবৈতনিক (Unpaid)" : "Unpaid"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>{isBn ? "মোট দিন সংখ্যা *" : "Days Count *"}</Label>
                  <Input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={daysCount}
                    onChange={(e) => setDaysCount(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>{isBn ? "শুরু তারিখ *" : "Start Date *"}</Label>
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label>{isBn ? "শেষ তারিখ *" : "End Date *"}</Label>
                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>{isBn ? "ছুটির কারণ *" : "Reason *"}</Label>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={isBn ? "ছুটির যৌক্তিক কারণ লিখুন..." : "Reason for leave..."}
                  rows={2}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>{isBn ? "বাতিল" : "Cancel"}</Button>
              <Button type="submit" disabled={isApplying} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {isBn ? "আবেদন জমা দিন" : "Submit Leave Request"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
