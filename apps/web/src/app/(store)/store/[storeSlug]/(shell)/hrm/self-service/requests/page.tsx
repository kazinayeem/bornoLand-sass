"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useGetStoreBySlugQuery } from "@/redux/api/store-api";
import {
  useGetMyRequestsQuery,
  useCancelMyRequestMutation,
} from "@/redux/api/hrm-api";
import { useLanguage } from "@/providers/language-provider";
import {
  Send,
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Loader2,
  Calendar,
  CreditCard,
  UserCheck,
  FileText,
  HelpCircle,
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
import { getApiUrl } from "@/lib/urls";

export default function MyRequestsPage() {
  const params = useParams();
  const storeSlug = String(params.storeSlug);
  const { data: storeData } = useGetStoreBySlugQuery(storeSlug, { skip: !storeSlug });
  const store = storeData?.data?.store;
  const storeId = store?._id ?? "";

  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [newRequestModalOpen, setNewRequestModalOpen] = useState(false);
  const [reqTitle, setReqTitle] = useState("");
  const [reqCategory, setReqCategory] = useState("general_hr");
  const [reqDescription, setReqDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: requestsData, isLoading, refetch } = useGetMyRequestsQuery(storeId, {
    skip: !storeId,
  });
  const [cancelRequest, { isLoading: isCancelling }] = useCancelMyRequestMutation();

  const allRequests = requestsData?.data?.requests ?? [];

  const filteredRequests = allRequests.filter((req: any) => {
    if (filterType !== "all" && req.type !== filterType) return false;
    if (filterStatus !== "all" && req.status !== filterStatus) return false;
    return true;
  });

  const handleCancel = async (requestId: string) => {
    if (!confirm("Are you sure you want to cancel this pending request?")) return;
    try {
      await cancelRequest({ storeId, requestId }).unwrap();
      toast.success("Request cancelled successfully");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to cancel request");
    }
  };

  const handleCreateGeneralRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqTitle.trim() || !reqDescription.trim()) {
      toast.error("Please provide both a title and description");
      return;
    }

    try {
      setIsSubmitting(true);
      // Submit general HR request
      const res = await fetch(`${getApiUrl()}/v1/stores/${storeId}/hrm/self-service/attendance/correction`, {
        // Attendance correction or generic request endpoint
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: new Date().toISOString().slice(0, 10),
          reason: `[${reqCategory.toUpperCase()}] ${reqTitle}: ${reqDescription}`,
        }),
      });
      if (!res.ok) throw new Error("Failed to submit request");

      toast.success("HR request submitted successfully!");
      setNewRequestModalOpen(false);
      setReqTitle("");
      setReqDescription("");
      refetch();
    } catch (err: any) {
      toast.error(err?.message || "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "leave_request":
        return <Calendar className="h-4 w-4 text-blue-600" />;
      case "bank_account_change":
        return <CreditCard className="h-4 w-4 text-violet-600" />;
      case "attendance_correction":
        return <Clock className="h-4 w-4 text-amber-600" />;
      case "profile_update":
        return <UserCheck className="h-4 w-4 text-emerald-600" />;
      default:
        return <Send className="h-4 w-4 text-[#003399]" />;
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
            <Send className="h-6 w-6 text-[#003399]" />
            <span>Requests Center</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Centralized hub tracking all your leave, bank update, attendance correction, and HR requests.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setNewRequestModalOpen(true)}
            size="sm"
            className="bg-[#003399] hover:bg-[#002B80] text-white gap-2 font-bold shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>New HR Request</span>
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl text-xs">
          <button
            type="button"
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              filterType === "all" ? "bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-white" : "text-zinc-500"
            }`}
          >
            All Types
          </button>
          <button
            type="button"
            onClick={() => setFilterType("leave_request")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              filterType === "leave_request" ? "bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-white" : "text-zinc-500"
            }`}
          >
            Leaves
          </button>
          <button
            type="button"
            onClick={() => setFilterType("bank_account_change")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              filterType === "bank_account_change" ? "bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-white" : "text-zinc-500"
            }`}
          >
            Bank Updates
          </button>
          <button
            type="button"
            onClick={() => setFilterType("attendance_correction")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              filterType === "attendance_correction" ? "bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-white" : "text-zinc-500"
            }`}
          >
            Corrections
          </button>
        </div>

        <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl text-xs ml-auto">
          <button
            type="button"
            onClick={() => setFilterStatus("all")}
            className={`px-2.5 py-1 rounded-md font-medium ${filterStatus === "all" ? "bg-white dark:bg-zinc-900 font-bold" : "text-zinc-500"}`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus("pending")}
            className={`px-2.5 py-1 rounded-md font-medium ${filterStatus === "pending" ? "bg-white dark:bg-zinc-900 font-bold text-amber-600" : "text-zinc-500"}`}
          >
            Pending
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus("approved")}
            className={`px-2.5 py-1 rounded-md font-medium ${filterStatus === "approved" ? "bg-white dark:bg-zinc-900 font-bold text-emerald-600" : "text-zinc-500"}`}
          >
            Approved
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus("rejected")}
            className={`px-2.5 py-1 rounded-md font-medium ${filterStatus === "rejected" ? "bg-white dark:bg-zinc-900 font-bold text-rose-600" : "text-zinc-500"}`}
          >
            Rejected
          </button>
        </div>
      </div>

      {/* Requests Table */}
      <Card className="border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-zinc-900 dark:text-white">
            Requests Log
          </CardTitle>
          <CardDescription className="text-xs text-zinc-500 mt-0.5">
            Review status updates and admin feedback on your submitted requests.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="p-16 text-center text-zinc-500 text-xs">
              <Send className="h-10 w-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
              <p className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm">No requests found</p>
              <p className="text-zinc-400 mt-1">Submitted requests will appear in this unified log.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 border-y border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="py-3 px-4 font-bold">Request Details</th>
                    <th className="py-3 px-4 font-bold">Type</th>
                    <th className="py-3 px-4 font-bold">Submitted Date</th>
                    <th className="py-3 px-4 font-bold text-center">Status</th>
                    <th className="py-3 px-4 font-bold">HR Reviewer Notes</th>
                    <th className="py-3 px-4 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {filteredRequests.map((req: any) => (
                    <tr key={req._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                      <td className="py-3 px-4">
                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5 shrink-0">{getTypeIcon(req.type)}</div>
                          <div>
                            <span className="font-bold text-zinc-900 dark:text-white block">
                              {req.title}
                            </span>
                            {req.description && (
                              <span className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">
                                {req.description}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 capitalize font-medium text-zinc-600 dark:text-zinc-400">
                        {req.type?.replace(/_/g, " ")}
                      </td>
                      <td className="py-3 px-4 font-mono text-zinc-500">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge
                          variant={
                            req.status === "approved"
                              ? "success"
                              : req.status === "pending"
                              ? "warning"
                              : req.status === "cancelled"
                              ? "default"
                              : "danger"
                          }
                        >
                          {req.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400 italic max-w-[200px] truncate">
                        {req.reviewNote || (req.reviewedBy ? `Reviewed on ${new Date(req.reviewedAt).toLocaleDateString()}` : "Awaiting review")}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {req.status === "pending" && req.type !== "leave_request" ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={isCancelling}
                            onClick={() => handleCancel(req._id)}
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

      {/* New HR Request Modal */}
      <Dialog open={newRequestModalOpen} onOpenChange={setNewRequestModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Submit HR Request</DialogTitle>
            <DialogDescription>
              Submit an administrative request, payroll query, or inquiry to the HR department.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateGeneralRequest} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Request Category *</Label>
              <Select value={reqCategory} onValueChange={setReqCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general_hr">General HR Inquiry</SelectItem>
                  <SelectItem value="payroll_query">Salary / Payroll Query</SelectItem>
                  <SelectItem value="document_request">Official Document Request (e.g. NOC, Experience Letter)</SelectItem>
                  <SelectItem value="shift_change">Shift Timing Change Request</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Subject / Title *</Label>
              <Input
                value={reqTitle}
                onChange={(e) => setReqTitle(e.target.value)}
                placeholder="e.g. Request for Experience Certificate"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label>Description / Details *</Label>
              <Textarea
                value={reqDescription}
                onChange={(e) => setReqDescription(e.target.value)}
                placeholder="Explain the background and details of your request..."
                rows={3}
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setNewRequestModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#003399] hover:bg-[#002B80] text-white font-bold"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                <span>Submit to HR</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
