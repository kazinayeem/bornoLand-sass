"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useGetStoreBySlugQuery } from "@/redux/api/store-api";
import {
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskStatusMutation,
  type OperationTask,
} from "@/redux/api/operations-api";
import { useLanguage } from "@/providers/language-provider";
import { useHasPermission } from "@/features/session/hooks";
import {
  CheckSquare,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Layers,
  Workflow,
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

export default function OperationsTasksPage() {
  const params = useParams();
  const storeSlug = String(params.storeSlug);
  const { data: storeData } = useGetStoreBySlugQuery(storeSlug, { skip: !storeSlug });
  const store = storeData?.data?.store;
  const storeId = store?._id ?? "";

  const { language } = useLanguage();
  const isBn = language === "bn";

  const [moduleFilter, setModuleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [module, setModule] = useState<OperationTask["module"]>("general");
  const [priority, setPriority] = useState("medium");
  const [isApproval, setIsApproval] = useState(false);

  const hasAccess = useHasPermission("operations:read");

  const { data: tasksData, isLoading, refetch } = useGetTasksQuery(
    {
      storeId,
      module: moduleFilter !== "all" ? moduleFilter : undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
    },
    { skip: !storeId }
  );

  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();
  const [updateStatus, { isLoading: isUpdating }] = useUpdateTaskStatusMutation();

  const tasks = tasksData?.data?.tasks ?? [];
  const total = tasksData?.data?.total ?? 0;
  const pendingApprovals = tasksData?.data?.pendingApprovals ?? 0;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await createTask({
        storeId,
        body: {
          title: title.trim(),
          description: description.trim() || undefined,
          module,
          priority,
          isApprovalWorkflow: isApproval,
        },
      }).unwrap();

      toast.success(isBn ? "টাস্ক তৈরি সম্পন্ন হয়েছে" : "Task created successfully");
      setIsModalOpen(false);
      setTitle("");
      setDescription("");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create task");
    }
  };

  const handleStatusChange = async (taskId: string, nextStatus: string) => {
    try {
      await updateStatus({ storeId, taskId, status: nextStatus }).unwrap();
      toast.success(isBn ? "টাস্কের স্ট্যাটাস আপডেট হয়েছে" : "Task status updated");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update status");
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
            <Workflow className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
            <span>{isBn ? "অপারেশনস টাস্ক ও অনুমোদন হাব (Workflows)" : "Operations Tasks & Approvals Hub"}</span>
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {isBn
              ? "ইনভেন্টরি, পে-রোল, ক্রয়াদেশ ও ডেলিভারির মাল্টি-স্টেপ অনুমোদন এবং কর্মীবাহিনীর কার্যপ্রবাহ।"
              : "Cross-modular operational tasks, multi-step manager approvals, and queue management."}
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
            <span>{isBn ? "নতুন টাস্ক / অনুমোদন" : "Create Task"}</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500 flex items-center justify-between">
              <span>{isBn ? "অপেক্ষমান অনুমোদন" : "Pending Approvals"}</span>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {pendingApprovals}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              {isBn ? "ম্যানেজারের পর্যালোচনার অপেক্ষায়" : "Awaiting manager review & authorization"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500 flex items-center justify-between">
              <span>{isBn ? "চলমান টাস্ক" : "In Progress Tasks"}</span>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {tasks.filter((t) => t.status === "in_progress" || t.status === "todo").length}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              {isBn ? "সক্রিয় অপারেশনাল কাজ" : "Active tasks in execution"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500 flex items-center justify-between">
              <span>{isBn ? "সম্পন্ন কাজ" : "Completed"}</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {tasks.filter((t) => t.status === "completed").length}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              {isBn ? "সফলভাবে অনুমোদিত ও সম্পন্ন টাস্ক" : "Finished and verified workflows"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tasks Table */}
      <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm">
        <CardHeader className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <Select value={moduleFilter} onValueChange={setModuleFilter}>
              <SelectTrigger className="w-[180px] h-9 text-xs">
                <SelectValue placeholder="Module" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isBn ? "সকল মডিউল" : "All Modules"}</SelectItem>
                <SelectItem value="inventory">{isBn ? "ইনভেন্টরি (Inventory)" : "Inventory"}</SelectItem>
                <SelectItem value="hrm">{isBn ? "এইচআরএম ও বেতন (HRM)" : "HRM & Payroll"}</SelectItem>
                <SelectItem value="finance">{isBn ? "হিসাব ও অর্থায়ন (Finance)" : "Finance"}</SelectItem>
                <SelectItem value="pos">{isBn ? "পিওএস (POS)" : "POS"}</SelectItem>
                <SelectItem value="general">{isBn ? "সাধারণ অপারেশন" : "General"}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="text-xs text-zinc-500">
            {isBn ? `মোট ${total} টি টাস্ক` : `${total} total tasks`}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-xs uppercase text-zinc-500 font-semibold border-b border-zinc-200/80 dark:border-zinc-800">
                <tr>
                  <th className="px-4 py-3">{isBn ? "টাস্ক #" : "Task #"}</th>
                  <th className="px-4 py-3">{isBn ? "শিরোনাম ও বিবরণ" : "Title & Details"}</th>
                  <th className="px-4 py-3">{isBn ? "মডিউল" : "Module"}</th>
                  <th className="px-4 py-3">{isBn ? "ধরন" : "Type"}</th>
                  <th className="px-4 py-3">{isBn ? "অগ্রাধিকার" : "Priority"}</th>
                  <th className="px-4 py-3">{isBn ? "স্ট্যাটাস" : "Status"}</th>
                  <th className="px-4 py-3 text-right">{isBn ? "অ্যাকশন" : "Action"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-zinc-400">
                      {isBn ? "লোড হচ্ছে..." : "Loading tasks..."}
                    </td>
                  </tr>
                ) : tasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-zinc-400">
                      <CheckSquare className="h-8 w-8 mx-auto mb-2 text-zinc-300" />
                      <p className="text-sm">{isBn ? "কোনো অপারেশন টাস্ক নেই" : "No operational tasks found"}</p>
                    </td>
                  </tr>
                ) : (
                  tasks.map((t) => (
                    <tr key={t._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                      <td className="px-4 py-3 font-mono font-bold text-xs text-zinc-700 dark:text-zinc-300">
                        {t.taskNumber}
                      </td>
                      <td className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-100">
                        <div>{t.title}</div>
                        {t.description && <div className="text-xs text-zinc-400 font-normal mt-0.5">{t.description}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 capitalize">
                          {t.module}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {t.isApprovalWorkflow ? (
                          <span className="font-semibold text-amber-600 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Approval
                          </span>
                        ) : (
                          <span className="text-zinc-500">Standard</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium capitalize ${
                            t.priority === "urgent" || t.priority === "high"
                              ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                              : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                          }`}
                        >
                          {t.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium capitalize ${
                            t.status === "completed"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                              : t.status === "in_progress"
                              ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                              : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                          }`}
                        >
                          {t.status?.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {t.status !== "completed" && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusChange(t._id, "completed")}
                            className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1 px-2.5"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>{t.isApprovalWorkflow ? (isBn ? "অনুমোদন করুন" : "Approve") : (isBn ? "সম্পন্ন" : "Complete")}</span>
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

      {/* Create Task Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Workflow className="h-5 w-5 text-indigo-600" />
                <span>{isBn ? "নতুন অপারেশন টাস্ক / অনুমোদন তৈরি" : "Create Task / Approval"}</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3.5 py-3">
              <div className="space-y-1">
                <Label>{isBn ? "টাস্কের শিরোনাম *" : "Task Title *"}</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Inspect damaged goods batch" required />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1 min-w-0">
                  <Label>{isBn ? "মডিউল" : "Module"}</Label>
                  <Select value={module} onValueChange={(v: any) => setModule(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="inventory">Inventory</SelectItem>
                      <SelectItem value="hrm">HRM</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="pos">POS</SelectItem>
                      <SelectItem value="orders">Orders</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1 min-w-0">
                  <Label>{isBn ? "অগ্রাধিকার" : "Priority"}</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label>{isBn ? "বিবরণ" : "Description"}</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Instructions or criteria..." rows={2} />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isApproval"
                  checked={isApproval}
                  onChange={(e) => setIsApproval(e.target.checked)}
                  className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                />
                <Label htmlFor="isApproval" className="text-xs cursor-pointer">
                  {isBn ? "এটি একটি ম্যানেজার অনুমোদন ওয়ার্কফ্লো (Requires Approval)" : "This is a manager authorization workflow"}
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>{isBn ? "বাতিল" : "Cancel"}</Button>
              <Button type="submit" disabled={isCreating} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {isCreating ? (isBn ? "তৈরি হচ্ছে..." : "Creating...") : isBn ? "টাস্ক সংরক্ষণ করুন" : "Save Task"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
