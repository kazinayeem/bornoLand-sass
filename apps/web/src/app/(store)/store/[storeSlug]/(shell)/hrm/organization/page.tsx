"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useGetStoreBySlugQuery } from "@/redux/api/store-api";
import {
  useGetDepartmentsQuery,
  useCreateDepartmentMutation,
  useGetDesignationsQuery,
  useCreateDesignationMutation,
} from "@/redux/api/hrm-api";
import { useLanguage } from "@/providers/language-provider";
import { useHasPermission } from "@/features/session/hooks";
import {
  Briefcase,
  Plus,
  Building,
  ShieldAlert,
  RefreshCw,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function OrganizationPage() {
  const params = useParams();
  const storeSlug = String(params.storeSlug);
  const { data: storeData } = useGetStoreBySlugQuery(storeSlug, { skip: !storeSlug });
  const store = storeData?.data?.store;
  const storeId = store?._id ?? "";

  const { language } = useLanguage();
  const isBn = language === "bn";

  const [deptModal, setDeptModal] = useState(false);
  const [desigModal, setDesigModal] = useState(false);

  const [deptName, setDeptName] = useState("");
  const [deptCode, setDeptCode] = useState("");

  const [desigName, setDesigName] = useState("");
  const [desigDeptId, setDesigDeptId] = useState("");

  const hasAccess = useHasPermission("hrm:read");

  const { data: deptsData, isLoading: loadingDepts, refetch: refetchDepts } = useGetDepartmentsQuery(storeId, {
    skip: !storeId,
  });
  const { data: desigsData, isLoading: loadingDesigs, refetch: refetchDesigs } = useGetDesignationsQuery(storeId, {
    skip: !storeId,
  });

  const [createDept, { isLoading: isCreatingDept }] = useCreateDepartmentMutation();
  const [createDesig, { isLoading: isCreatingDesig }] = useCreateDesignationMutation();

  const departments = deptsData?.data?.departments ?? [];
  const designations = desigsData?.data?.designations ?? [];

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim()) return;
    try {
      await createDept({ storeId, body: { name: deptName.trim(), code: deptCode.trim() } }).unwrap();
      toast.success(isBn ? "বিভাগ তৈরি হয়েছে" : "Department created");
      setDeptModal(false);
      setDeptName("");
      setDeptCode("");
      refetchDepts();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create department");
    }
  };

  const handleCreateDesig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desigName.trim()) return;
    try {
      await createDesig({
        storeId,
        body: { name: desigName.trim(), departmentId: desigDeptId || undefined },
      }).unwrap();
      toast.success(isBn ? "পদবী তৈরি হয়েছে" : "Designation created");
      setDesigModal(false);
      setDesigName("");
      setDesigDeptId("");
      refetchDesigs();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create designation");
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
            <Briefcase className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
            <span>{isBn ? "বিভাগ ও পদবী সংগঠন (Organization)" : "Departments & Designations"}</span>
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {isBn
              ? "কোম্পানির প্রাতিষ্ঠানিক কাঠামো, কর্মীবাহিনীর বিভিন্ন বিভাগ ও পদবী তালিকা।"
              : "Define organization departments, job titles, reporting hierarchy, and team positions."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetchDepts();
              refetchDesigs();
            }}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>{isBn ? "রিফ্রেশ" : "Refresh"}</span>
          </Button>
          <Button onClick={() => setDeptModal(true)} variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            <span>{isBn ? "+ নতুন বিভাগ" : "+ Department"}</span>
          </Button>
          <Button onClick={() => setDesigModal(true)} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
            <Plus className="h-4 w-4" />
            <span>{isBn ? "+ নতুন পদবী" : "+ Designation"}</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Departments Column */}
        <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm">
          <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Building className="h-4 w-4 text-indigo-500" />
                <span>{isBn ? "বিভাগসমূহ (Departments)" : "Departments"}</span>
              </CardTitle>
              <CardDescription className="text-xs">
                {departments.length} {isBn ? "টি সক্রিয় বিভাগ" : "active departments"}
              </CardDescription>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setDeptModal(true)} className="text-xs">
              + {isBn ? "যোগ করুন" : "Add"}
            </Button>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-zinc-100 dark:divide-zinc-800">
            {departments.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-400">
                {isBn ? "কোনো বিভাগ যুক্ত করা হয়নি" : "No departments added yet"}
              </div>
            ) : (
              departments.map((d: any) => (
                <div key={d._id} className="p-3.5 flex items-center justify-between hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                  <div>
                    <div className="font-semibold text-sm text-zinc-900 dark:text-white">{d.name}</div>
                    {d.code && <div className="text-xs text-zinc-400 font-mono">Code: {d.code}</div>}
                  </div>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                    Active
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Designations Column */}
        <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm">
          <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-indigo-500" />
                <span>{isBn ? "পদবীসমূহ (Designations)" : "Designations"}</span>
              </CardTitle>
              <CardDescription className="text-xs">
                {designations.length} {isBn ? "টি পদবী তালিকাভুক্ত" : "job titles configured"}
              </CardDescription>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setDesigModal(true)} className="text-xs">
              + {isBn ? "যোগ করুন" : "Add"}
            </Button>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-zinc-100 dark:divide-zinc-800">
            {designations.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-400">
                {isBn ? "কোনো পদবী যুক্ত করা হয়নি" : "No designations added yet"}
              </div>
            ) : (
              designations.map((d: any) => (
                <div key={d._id} className="p-3.5 flex items-center justify-between hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                  <div>
                    <div className="font-semibold text-sm text-zinc-900 dark:text-white">{d.name}</div>
                    {d.departmentId?.name && (
                      <div className="text-xs text-zinc-400">{d.departmentId.name}</div>
                    )}
                  </div>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
                    Position
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dept Modal */}
      <Dialog open={deptModal} onOpenChange={setDeptModal}>
        <DialogContent className="sm:max-w-[400px]">
          <form onSubmit={handleCreateDept}>
            <DialogHeader>
              <DialogTitle>{isBn ? "নতুন বিভাগ যুক্ত করুন" : "Add Department"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-3">
              <div className="space-y-1">
                <Label>{isBn ? "বিভাগের নাম *" : "Department Name *"}</Label>
                <Input value={deptName} onChange={(e) => setDeptName(e.target.value)} placeholder="e.g. Sales & POS" required />
              </div>
              <div className="space-y-1">
                <Label>{isBn ? "বিভাগ কোড" : "Department Code"}</Label>
                <Input value={deptCode} onChange={(e) => setDeptCode(e.target.value)} placeholder="e.g. DPT-SALES" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDeptModal(false)}>{isBn ? "বাতিল" : "Cancel"}</Button>
              <Button type="submit" disabled={isCreatingDept} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {isBn ? "সংরক্ষণ" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Desig Modal */}
      <Dialog open={desigModal} onOpenChange={setDesigModal}>
        <DialogContent className="sm:max-w-[420px]">
          <form onSubmit={handleCreateDesig}>
            <DialogHeader>
              <DialogTitle>{isBn ? "নতুন পদবী যুক্ত করুন" : "Add Designation"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-3">
              <div className="space-y-1">
                <Label>{isBn ? "পদবীর নাম *" : "Designation Title *"}</Label>
                <Input value={desigName} onChange={(e) => setDesigName(e.target.value)} placeholder="e.g. Senior Cashier" required />
              </div>
              <div className="space-y-1">
                <Label>{isBn ? "সম্পর্কিত বিভাগ" : "Department"}</Label>
                <Select value={desigDeptId} onValueChange={setDesigDeptId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((d: any) => (
                      <SelectItem key={d._id} value={d._id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDesigModal(false)}>{isBn ? "বাতিল" : "Cancel"}</Button>
              <Button type="submit" disabled={isCreatingDesig} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {isBn ? "সংরক্ষণ" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
