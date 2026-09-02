"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useGetStoreBySlugQuery } from "@/redux/api/store-api";
import {
  useGetPayrollsQuery,
  useGeneratePayrollMutation,
  useApprovePayrollMutation,
  useMarkPayrollPaidMutation,
} from "@/redux/api/hrm-api";
import { useLanguage } from "@/providers/language-provider";
import { useHasPermission } from "@/features/session/hooks";
import {
  Wallet,
  Calculator,
  CheckCircle,
  FileText,
  RefreshCw,
  Printer,
  CreditCard,
  Building,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function PayrollPage() {
  const params = useParams();
  const storeSlug = String(params.storeSlug);
  const { data: storeData } = useGetStoreBySlugQuery(storeSlug, { skip: !storeSlug });
  const store = storeData?.data?.store;
  const storeId = store?._id ?? "";

  const { language } = useLanguage();
  const isBn = language === "bn";

  const currentDate = new Date();
  const [month, setMonth] = useState(String(currentDate.getMonth() + 1));
  const [year, setYear] = useState(String(currentDate.getFullYear()));
  const [selectedPayslip, setSelectedPayslip] = useState<any | null>(null);

  const hasAccess = useHasPermission("hrm:payroll:manage");

  const { data: payrollData, isLoading, refetch } = useGetPayrollsQuery(
    { storeId, month: Number(month), year: Number(year) },
    { skip: !storeId }
  );

  const [generatePayroll, { isLoading: isGenerating }] = useGeneratePayrollMutation();
  const [approvePayroll, { isLoading: isApproving }] = useApprovePayrollMutation();
  const [markPaid, { isLoading: isPaying }] = useMarkPayrollPaidMutation();

  const payrolls = payrollData?.data?.payrolls ?? [];
  const totalNet = payrollData?.data?.summary?.totalNetDisbursement ?? 0;

  const handleGenerate = async () => {
    try {
      const res = await generatePayroll({
        storeId,
        month: Number(month),
        year: Number(year),
      }).unwrap();
      toast.success(
        isBn
          ? `${res.data?.generatedCount} জন কর্মীর পে-রোল তৈরি সম্পন্ন হয়েছে`
          : `Payroll generated for ${res.data?.generatedCount} employees`
      );
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to generate payroll");
    }
  };

  const handleApprove = async (pId: string) => {
    try {
      await approvePayroll({ storeId, payrollId: pId }).unwrap();
      toast.success(isBn ? "পে-রোল অনুমোদিত হয়েছে" : "Payroll approved");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to approve payroll");
    }
  };

  const handlePay = async (pId: string) => {
    try {
      await markPaid({ storeId, payrollId: pId, paymentMethod: "bank_transfer" }).unwrap();
      toast.success(isBn ? "বেতন পরিশোধ সম্পন্ন হয়েছে" : "Salary marked as paid");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to mark as paid");
    }
  };

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <ShieldAlert className="h-10 w-10 text-rose-500" />
        <h2 className="mt-4 text-lg font-semibold">{isBn ? "অনুমতি নেই" : "Access Denied"}</h2>
        <p className="text-sm text-zinc-500 mt-1">
          {isBn ? "পে-রোল ও বেতন পরিচালনা করার অনুমতি আপনার নেই।" : "You do not have permission to manage payroll."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white flex items-center gap-2.5">
            <Wallet className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
            <span>{isBn ? "বেতন ও পে-রোল ইঞ্জিন (Payroll & Payslips)" : "Auditable Payroll & Payslips"}</span>
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {isBn
              ? "হাজিরা, ওভারটাইম এবং কর্তন হিসেব করে স্বয়ংক্রিয়ভাবে মাসিক বেতন ও পে-স্লিপ প্রস্তুত করুন।"
              : "Automate monthly net salary computations with attendance adjustments, overtime pay, tax, and printable payslips."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-32 h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => (
                <SelectItem key={i + 1} value={String(i + 1)}>
                  {new Date(2025, i).toLocaleString("default", { month: "long" })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-24 h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["2024", "2025", "2026", "2027"].map((y) => (
                <SelectItem key={y} value={y}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
          >
            <Calculator className="h-4 w-4" />
            <span>{isGenerating ? (isBn ? "হিসাব হচ্ছে..." : "Calculating...") : (isBn ? "পে-রোল তৈরি করুন" : "Generate Payroll")}</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500 flex items-center justify-between">
              <span>{isBn ? "মোট প্রদেয় বেতন" : "Total Net Disbursement"}</span>
              <Wallet className="h-4 w-4 text-emerald-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              ৳{totalNet.toLocaleString()}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              {isBn ? "নির্বাচিত মাসের সর্বমোট প্রদেয় অর্থ" : "Total net salary payable for selected month"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500 flex items-center justify-between">
              <span>{isBn ? "কর্মীর সংখ্যা" : "Processed Employees"}</span>
              <FileText className="h-4 w-4 text-indigo-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-white">
              {payrolls.length}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              {isBn ? "পে-রোল স্লিপ তৈরি হয়েছে" : "Generated payslips"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500 flex items-center justify-between">
              <span>{isBn ? "পরিশোধ স্ট্যাটাস" : "Payment Status"}</span>
              <CreditCard className="h-4 w-4 text-blue-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-white">
              {payrolls.filter((p) => p.status === "paid").length} / {payrolls.length}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              {isBn ? "জন কর্মীর বেতন পরিশোধ সম্পন্ন" : "employees paid so far"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payroll Table */}
      <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-xs uppercase text-zinc-500 font-semibold border-b border-zinc-200/80 dark:border-zinc-800">
                <tr>
                  <th className="px-4 py-3">{isBn ? "স্লিপ নম্বর" : "Payslip #"}</th>
                  <th className="px-4 py-3">{isBn ? "কর্মী" : "Employee"}</th>
                  <th className="px-4 py-3 text-right">{isBn ? "মূল বেতন" : "Basic"}</th>
                  <th className="px-4 py-3 text-right">{isBn ? "ভাতা" : "Allowances"}</th>
                  <th className="px-4 py-3 text-right">{isBn ? "ওভারটাইম" : "Overtime"}</th>
                  <th className="px-4 py-3 text-right">{isBn ? "কর্তন" : "Deductions"}</th>
                  <th className="px-4 py-3 text-right">{isBn ? "নিট বেতন" : "Net Salary"}</th>
                  <th className="px-4 py-3">{isBn ? "স্ট্যাটাস" : "Status"}</th>
                  <th className="px-4 py-3 text-right">{isBn ? "অ্যাকশন" : "Action"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-zinc-400">
                      {isBn ? "লোড হচ্ছে..." : "Loading payrolls..."}
                    </td>
                  </tr>
                ) : payrolls.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-zinc-400">
                      <Wallet className="h-8 w-8 mx-auto mb-2 text-zinc-300" />
                      <p className="text-sm">{isBn ? "এই মাসের জন্য পে-রোল তৈরি করা হয়নি" : "No payroll generated for this month"}</p>
                      <Button onClick={handleGenerate} size="sm" className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white">
                        {isBn ? "এখনই পে-রোল তৈরি করুন" : "Generate Payroll Now"}
                      </Button>
                    </td>
                  </tr>
                ) : (
                  payrolls.map((p) => (
                    <tr key={p._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                      <td className="px-4 py-3 font-mono text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        {p.payslipNumber}
                      </td>
                      <td className="px-4 py-3 font-medium text-zinc-900 dark:text-white">
                        <div>{p.employeeId?.firstName} {p.employeeId?.lastName}</div>
                        <div className="text-[11px] text-zinc-400 font-mono">{p.employeeId?.employeeCode}</div>
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-zinc-600 dark:text-zinc-400">
                        ৳{p.basicSalary?.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-zinc-600 dark:text-zinc-400">
                        ৳{(p.houseRent + p.medical + p.conveyance + p.otherAllowances)?.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-xs font-medium text-indigo-600">
                        +{p.overtimePay > 0 ? `৳${p.overtimePay.toLocaleString()}` : "৳0"}
                      </td>
                      <td className="px-4 py-3 text-right text-xs font-medium text-rose-600">
                        -{p.totalDeductions > 0 ? `৳${p.totalDeductions.toLocaleString()}` : "৳0"}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-zinc-900 dark:text-white">
                        ৳{p.netSalary?.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium capitalize ${
                            p.status === "paid"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                              : p.status === "approved"
                              ? "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400"
                              : "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedPayslip(p)}
                            className="h-7 text-xs px-2"
                          >
                            <FileText className="h-3.5 w-3.5 text-indigo-600 mr-1" />
                            <span>{isBn ? "স্লিপ" : "Payslip"}</span>
                          </Button>

                          {p.status === "generated" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApprove(p._id)}
                              disabled={isApproving}
                              className="h-7 text-xs text-blue-600 border-blue-200 hover:bg-blue-50 px-2"
                            >
                              <span>{isBn ? "অনুমোদন" : "Approve"}</span>
                            </Button>
                          )}

                          {p.status === "approved" && (
                            <Button
                              size="sm"
                              onClick={() => handlePay(p._id)}
                              disabled={isPaying}
                              className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-2.5"
                            >
                              <span>{isBn ? "পরিশোধ" : "Pay"}</span>
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Payslip View Modal */}
      {selectedPayslip && (
        <Dialog open={!!selectedPayslip} onOpenChange={() => setSelectedPayslip(null)}>
          <DialogContent className="sm:max-w-[550px] p-6">
            <div className="border-b pb-4 flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                  {store?.name || "BornoLand Enterprise"}
                </h2>
                <p className="text-xs text-zinc-500">
                  {isBn ? "মাসিক বেতন পে-স্লিপ" : "Monthly Salary Payslip"} — {new Date(selectedPayslip.year, selectedPayslip.month - 1).toLocaleString("default", { month: "long" })} {selectedPayslip.year}
                </p>
              </div>
              <div className="text-right font-mono text-xs text-zinc-500">
                <div>#{selectedPayslip.payslipNumber}</div>
                <div className="capitalize text-emerald-600 font-semibold">{selectedPayslip.status}</div>
              </div>
            </div>

            <div className="py-3 grid grid-cols-2 gap-2 text-xs border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <span className="text-zinc-400">{isBn ? "কর্মী:" : "Employee:"}</span>{" "}
                <span className="font-semibold">{selectedPayslip.employeeId?.firstName} {selectedPayslip.employeeId?.lastName}</span>
              </div>
              <div>
                <span className="text-zinc-400">{isBn ? "কর্মী কোড:" : "Code:"}</span>{" "}
                <span className="font-mono font-medium">{selectedPayslip.employeeId?.employeeCode}</span>
              </div>
            </div>

            <div className="py-3 space-y-2 text-xs">
              <div className="font-semibold text-zinc-700 dark:text-zinc-300">{isBn ? "উপার্জন (Earnings):" : "Earnings:"}</div>
              <div className="flex justify-between pl-2">
                <span>{isBn ? "মূল বেতন (Basic Salary):" : "Basic Salary:"}</span>
                <span className="font-medium">৳{selectedPayslip.basicSalary?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pl-2">
                <span>{isBn ? "বাড়ি ভাড়া ও চিকিৎসা ভাতা:" : "House Rent & Medical:"}</span>
                <span className="font-medium">৳{(selectedPayslip.houseRent + selectedPayslip.medical)?.toLocaleString()}</span>
              </div>
              {selectedPayslip.overtimePay > 0 && (
                <div className="flex justify-between pl-2 text-indigo-600">
                  <span>{isBn ? `ওভারটাইম (${selectedPayslip.overtimeHours} ঘন্টা):` : `Overtime (${selectedPayslip.overtimeHours} hrs):`}</span>
                  <span className="font-semibold">+৳{selectedPayslip.overtimePay?.toLocaleString()}</span>
                </div>
              )}

              <div className="font-semibold text-zinc-700 dark:text-zinc-300 pt-2 border-t">{isBn ? "কর্তন (Deductions):" : "Deductions:"}</div>
              {selectedPayslip.taxDeduction > 0 && (
                <div className="flex justify-between pl-2 text-rose-600">
                  <span>{isBn ? "আয়কর (Tax):" : "Tax Deduction:"}</span>
                  <span>-৳{selectedPayslip.taxDeduction?.toLocaleString()}</span>
                </div>
              )}
              {selectedPayslip.providentFundDeduction > 0 && (
                <div className="flex justify-between pl-2 text-rose-600">
                  <span>{isBn ? "ভবিষ্য তহবিল (PF):" : "Provident Fund:"}</span>
                  <span>-৳{selectedPayslip.providentFundDeduction?.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between pt-3 border-t text-sm font-bold text-zinc-900 dark:text-white">
                <span>{isBn ? "সর্বমোট নিট বেতন (Net Salary):" : "Net Salary Payable:"}</span>
                <span className="text-emerald-600 text-base">৳{selectedPayslip.netSalary?.toLocaleString()}</span>
              </div>
            </div>

            <DialogFooter className="flex justify-between sm:justify-between items-center pt-2">
              <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5">
                <Printer className="h-4 w-4" />
                <span>{isBn ? "প্রিন্ট করুন" : "Print"}</span>
              </Button>
              <Button size="sm" onClick={() => setSelectedPayslip(null)}>
                {isBn ? "বন্ধ করুন" : "Close"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
