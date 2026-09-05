"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useGetStoreBySlugQuery } from "@/redux/api/store-api";
import { useGetMyTasksQuery, useUpdateMyTaskStatusMutation } from "@/redux/api/hrm-api";
import { useLanguage } from "@/providers/language-provider";
import {
  CheckSquare,
  ArrowLeft,
  Calendar,
  Clock,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ListTodo,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function MyTasksPage() {
  const params = useParams();
  const storeSlug = String(params.storeSlug);
  const { data: storeData } = useGetStoreBySlugQuery(storeSlug, { skip: !storeSlug });
  const store = storeData?.data?.store;
  const storeId = store?._id ?? "";

  const { data: tasksData, isLoading, refetch } = useGetMyTasksQuery(storeId, { skip: !storeId });
  const [updateStatus] = useUpdateMyTaskStatusMutation();

  const tasks = tasksData?.data?.tasks ?? [];

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await updateStatus({ storeId, taskId, status: newStatus }).unwrap();
      toast.success("Task status updated");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update status");
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
            <CheckSquare className="h-6 w-6 text-[#003399]" />
            <span>My Tasks</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Operational and departmental tasks assigned directly to you.
          </p>
        </div>
      </div>

      {/* Task List */}
      <Card className="border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-zinc-900 dark:text-white">
            Assigned Work Items
          </CardTitle>
          <CardDescription className="text-xs text-zinc-500 mt-0.5">
            Update your task status as you make progress.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="p-16 text-center text-zinc-500 text-xs">
              <ListTodo className="h-10 w-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
              <p className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm">No tasks currently assigned</p>
              <p className="text-zinc-400 mt-1">When store managers or operations assign tasks to you, they will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 border-y border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="py-3 px-4 font-bold">Task #</th>
                    <th className="py-3 px-4 font-bold">Title & Description</th>
                    <th className="py-3 px-4 font-bold">Module</th>
                    <th className="py-3 px-4 font-bold">Priority</th>
                    <th className="py-3 px-4 font-bold">Due Date</th>
                    <th className="py-3 px-4 font-bold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {tasks.map((t: any) => (
                    <tr key={t._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                      <td className="py-3 px-4 font-mono font-semibold text-zinc-500">
                        {t.taskNumber || "TASK"}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-zinc-900 dark:text-white block">
                          {t.title}
                        </span>
                        {t.description && (
                          <span className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">
                            {t.description}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 capitalize font-medium text-zinc-600 dark:text-zinc-400">
                        {t.module || "General"}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            t.priority === "urgent"
                              ? "danger"
                              : t.priority === "high"
                              ? "warning"
                              : "default"
                          }
                        >
                          {t.priority}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-mono text-zinc-500">
                        {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "No deadline"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Select
                          value={t.status}
                          onValueChange={(val) => handleStatusChange(t._id, val)}
                        >
                          <SelectTrigger className="h-7 w-[120px] text-[11px] font-semibold ml-auto">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todo">To Do</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="under_review">Under Review</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
