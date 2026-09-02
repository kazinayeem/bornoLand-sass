"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useGetStoreBySlugQuery } from "@/redux/api/store-api";
import {
  useGetEmployeesQuery,
  useClockInMutation,
  useClockOutMutation,
  useGetLeavesQuery,
  useApplyLeaveMutation,
  useGetPayrollsQuery,
} from "@/redux/api/hrm-api";
import { useLanguage } from "@/providers/language-provider";
import {
  UserCheck,
  Clock,
  CalendarDays,
  Wallet,
  LogIn,
  LogOut,
  Building,
  Mail,
  Phone,
  CheckCircle,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

export default function EmployeeSelfServicePage() {
  const params = useParams();
  const storeSlug = String(params.storeSlug);
  const { data: storeData } = useGetStoreBySlugQuery(storeSlug, { skip: !storeSlug });
  const store = storeData?.data?.store;
  const storeId = store?._id ?? "";

  const { language } = useLanguage();
  const isBn = language === "bn";

  const { data: empData } = useGetEmployeesQuery({ storeId, limit: 1 }, { skip: !storeId });
  const employee = empData?.data?.employees?.[0];

  const [clockIn, { isLoading: isClockingIn }] = useClockInMutation();
  const [clockOut, { isLoading: isClockingOut }] = useClockOutMutation();

  const handleClockIn = async () => {
    if (!employee?._id) return;
    try {
      await clockIn({ storeId, employeeId: employee._id }).unwrap();
      toast.success(isBn ? "আজকের চেক-ইন সফল হয়েছে!" : "Clock-in successful!");
    } catch (err: any) {
      toast.error(err?.data?.message || "Clock-in failed");
    }
  };

  const handleClockOut = async () => {
    if (!employee?._id) return;
    try {
      await clockOut({ storeId, employeeId: employee._id }).unwrap();
      toast.success(isBn ? "আজকের চেক-আউট সম্পন্ন হয়েছে!" : "Clock-out recorded!");
    } catch (err: any) {
      toast.error(err?.data?.message || "Clock-out failed");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white flex items-center gap-2.5">
          <UserCheck className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
          <span>{isBn ? "কর্মী সেলফ-সার্ভিস পোর্টাল (My Portal)" : "Employee Self-Service Portal"}</span>
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          {isBn
            ? "আপনার প্রোফাইল, দৈনিক হাজিরা, ছুটির আবেদন এবং মাসিক পে-স্লিপ দেখুন।"
            : "View your personal profile, clock-in/out for today, apply for leaves, and download salary payslips."}
        </p>
      </div>

      {/* Quick Clock In/Out Banner */}
      <Card className="border-indigo-200 dark:border-indigo-900 bg-gradient-to-r from-indigo-50/50 to-blue-50/30 dark:from-indigo-950/20 dark:to-blue-950/10 shadow-sm">
        <CardContent className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              {employee ? `${employee.firstName[0]}${employee.lastName?.[0] || ""}` : "ME"}
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                {isBn ? "স্বাগতম," : "Welcome,"} {employee ? `${employee.firstName} ${employee.lastName}` : "Staff Member"}
              </h2>
              <p className="text-xs text-zinc-500">
                {employee?.designationId?.name || "Team Member"} • {employee?.departmentId?.name || "General Department"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              onClick={handleClockIn}
              disabled={isClockingIn}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
              <LogIn className="h-4 w-4" />
              <span>{isBn ? "চেক-ইন করুন (Clock In)" : "Clock In"}</span>
            </Button>
            <Button
              onClick={handleClockOut}
              disabled={isClockingOut}
              variant="outline"
              className="gap-2 border-rose-300 text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400"
            >
              <LogOut className="h-4 w-4" />
              <span>{isBn ? "চেক-আউট (Clock Out)" : "Clock Out"}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Profile & Info Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-indigo-500" />
              <span>{isBn ? "আমার প্রোফাইল" : "My Profile Info"}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 text-xs text-zinc-600 dark:text-zinc-400">
            <div className="flex justify-between">
              <span className="text-zinc-400">{isBn ? "কর্মী আইডি:" : "Employee ID:"}</span>
              <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200">
                {employee?.employeeCode || "EMP-0001"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">{isBn ? "ইমেইল:" : "Email:"}</span>
              <span className="font-medium text-zinc-800 dark:text-zinc-200">{employee?.email || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">{isBn ? "ফোন:" : "Phone:"}</span>
              <span className="font-medium text-zinc-800 dark:text-zinc-200">{employee?.phone || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">{isBn ? "যোগদানের তারিখ:" : "Joining Date:"}</span>
              <span>{employee?.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : "—"}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-indigo-500" />
              <span>{isBn ? "কাজের সময়সূচি ও শিফট" : "My Work Shift"}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 text-xs text-zinc-600 dark:text-zinc-400">
            <div className="flex justify-between">
              <span className="text-zinc-400">{isBn ? "শিফট নাম:" : "Shift Name:"}</span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                {employee?.shiftId?.name || "General Office Shift"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">{isBn ? "শুরু ও শেষ সময়:" : "Timing:"}</span>
              <span className="font-mono font-medium text-indigo-600">
                {employee?.shiftId?.startTime || "09:00"} - {employee?.shiftId?.endTime || "18:00"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">{isBn ? "কর্মদিবস:" : "Work Days:"}</span>
              <span>Sunday – Thursday</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Wallet className="h-4 w-4 text-emerald-500" />
              <span>{isBn ? "বেতন বিবরণী" : "Salary Structure"}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 text-xs text-zinc-600 dark:text-zinc-400">
            <div className="flex justify-between">
              <span className="text-zinc-400">{isBn ? "মূল বেতন:" : "Basic Salary:"}</span>
              <span className="font-medium text-zinc-800 dark:text-zinc-200">
                ৳{employee?.salaryStructure?.basic?.toLocaleString() || "0"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">{isBn ? "মোট গ্রস বেতন:" : "Gross Salary:"}</span>
              <span className="font-bold text-emerald-600">
                ৳{employee?.salaryStructure?.grossSalary?.toLocaleString() || "0"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">{isBn ? "পেমেন্ট মাধ্যম:" : "Disbursement:"}</span>
              <span>{employee?.bankInfo?.walletProvider || "Bank Transfer"}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
