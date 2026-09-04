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
  Loader2,
  DollarSign,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StorePageHeader } from "@/components/store-dashboard/store-page-header";
import { StorePageCard } from "@/components/store-dashboard/store-page";
import { MetricCard } from "@/components/ui/metric-card";
import { Badge } from "@/components/ui/badge";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { DocumentPreviewDialog } from "@/components/documents/document-preview-dialog";
import { PayslipDocument } from "@/components/documents/templates/payslip-document";
import type { PayslipData } from "@/components/documents/document-types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function PayrollPage() {
  const params = useParams();
  const storeSlug = String(params.storeSlug);
  const { data: storeData } = useGetStoreBySlugQuery(storeSlug, { skip: !storeSlug });
  const store = storeData?.data?.store;
  const storeId = store?._id ?? "";

  const { language } = useLanguage();
  const isBn = false;

  const currentDate = new Date();
  const [month, setMonth] = useState(String(currentDate.getMonth() + 1));
  const [year, setYear] = useState(String(currentDate.getFullYear()));
  const [selectedPayslip, setSelectedPayslip] = useState<any | null>(null);

  const hasAccess = useHasPermission("hrm:payroll:manage");

  const { data: payrollData, isLoading, refetch, isError } = useGetPayrollsQuery(
    { storeId, month: Number(month), year: Number(year) },
    { skip: !storeId }
  );

  const [generatePayroll, { isLoading: isGenerating }] = useGeneratePayrollMutation();
  const [approvePayroll, { isLoading: isApproving }] = useApprovePayrollMutation();
  const [markPaid, { isLoading: isPaying }] = useMarkPayrollPaidMutation();

  const payrolls = payrollData?.data?.payrolls ?? [];
  const totalNet = payrollData?.data?.summary?.totalNetDisbursement ?? 0;
  const paidCount = payrolls.filter((p) => p.status === "paid").length;

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
        <h2 className="mt-4 text-lg font-bold">{isBn ? "অনুমতি নেই" : "Access Denied"}</h2>
        <p className="text-xs text-zinc-500 mt-1">
          {isBn ? "পে-রোল ও বেতন পরিচালনা করার অনুমতি আপনার নেই।" : "You do not have permission to manage payroll."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StorePageHeader
        title="Auditable Payroll & Payslips (HRM)"
        description="Automate monthly net salary computations with attendance adjustments, overtime pay, deductions, tax, and printable payslips."
        breadcrumbs={[
          { label: "Dashboard", href: store ? `/store/${store.slug}/dashboard` : "#" },
          { label: "HRM" },
          { label: "Payroll" },
        ]}
        actions={
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
              size="sm"
              className="gap-1.5 bg-[#003399] hover:bg-[#002B80] text-white text-xs font-bold shadow-2xs cursor-pointer"
            >
              <Calculator className="h-4 w-4" />
              <span>{isGenerating ? "Calculating..." : "Generate Payroll"}</span>
            </Button>
          </div>
        }
      />

      {/* ── KPI Cards ─────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          title="Total Net Disbursement"
          value={`৳${totalNet.toLocaleString()}`}
          subtitle="Payable for selected period"
          icon={Wallet}
          iconClassName="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30"
        />

        <MetricCard
          title="Processed Employees"
          value={payrolls.length}
          subtitle="Staff payroll records"
          icon={FileText}
          iconClassName="text-blue-600 bg-blue-50 dark:bg-blue-950/30"
        />

        <MetricCard
          title="Disbursement Status"
          value={`${paidCount} / ${payrolls.length} Paid`}
          subtitle={payrolls.length > 0 && paidCount === payrolls.length ? "All disbursements clear" : "Pending disbursements"}
          icon={CheckCircle2}
          iconClassName="text-purple-600 bg-purple-50 dark:bg-purple-950/30"
        />
      </div>

      {/* ── Payroll List Table ────────────────────────────────── */}
      <StorePageCard>
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="text-base font-bold text-zinc-950 dark:text-white flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-[#003399] dark:text-[#FFDA1A]" />
            <span>Payroll Sheet — {new Date(Number(year), Number(month) - 1).toLocaleString("default", { month: "long" })} {year}</span>
          </h3>

          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5 text-xs font-semibold cursor-pointer">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </Button>
        </div>

        <div className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-[#003399]" />
            </div>
          ) : isError ? (
            <ErrorState
              title="Unable to load payroll"
              message="Check your connection"
              onRetry={refetch}
            />
          ) : payrolls.length === 0 ? (
            <EmptyState
              icon={Wallet}
              title="No payroll generated for this period"
              description="Click 'Generate Payroll' above to calculate wages based on basic pay and attendance."
              action={
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  size="sm"
                  className="bg-[#003399] text-white hover:bg-[#002B80] text-xs font-bold cursor-pointer"
                >
                  <Calculator className="h-3.5 w-3.5 mr-1" />
                  Generate Payroll
                </Button>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4 text-right">Gross</th>
                    <th className="py-3 px-4 text-right">Deductions</th>
                    <th className="py-3 px-4 text-right">Overtime</th>
                    <th className="py-3 px-4 text-right">Net Payable</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800">
                  {payrolls.map((pay) => (
                    <tr
                      key={pay._id}
                      className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <p className="font-bold text-zinc-900 dark:text-zinc-100">
                          {pay.employeeId?.firstName} {pay.employeeId?.lastName}
                        </p>
                        <p className="text-[11px] text-zinc-400 font-mono">
                          {pay.employeeId?.employeeCode || "EMP"}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-zinc-700 dark:text-zinc-300">
                        ৳{pay.grossSalary?.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-rose-600 dark:text-rose-400">
                        -৳{pay.totalDeductions?.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-emerald-600 dark:text-emerald-400">
                        +৳{pay.overtimePay?.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-zinc-950 dark:text-white">
                        ৳{pay.netSalary?.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge
                          variant={
                            pay.status === "paid"
                              ? "success"
                              : pay.status === "approved"
                              ? "primary"
                              : "warning"
                          }
                        >
                          {pay.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {pay.status === "draft" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApprove(pay._id)}
                              disabled={isApproving}
                              className="h-7 text-xs font-semibold cursor-pointer"
                            >
                              Approve
                            </Button>
                          )}
                          {pay.status === "approved" && (
                            <Button
                              size="sm"
                              onClick={() => handlePay(pay._id)}
                              disabled={isPaying}
                              className="h-7 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                            >
                              Mark Paid
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedPayslip(pay)}
                            className="h-7 text-xs gap-1 text-zinc-600 hover:text-[#003399] dark:text-zinc-300 dark:hover:text-[#FFDA1A] cursor-pointer"
                          >
                            <Printer className="h-3.5 w-3.5" />
                            <span>Payslip</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </StorePageCard>

      {/* ── Payslip Document Preview Dialog ───────────────────── */}
      {selectedPayslip && store && (
        <DocumentPreviewDialog
          open={Boolean(selectedPayslip)}
          onClose={() => setSelectedPayslip(null)}
          title={`Payslip - ${selectedPayslip.employeeId?.firstName} ${selectedPayslip.employeeId?.lastName}`}
          defaultPageSize="a4-portrait"
        >
          {(() => {
            const payslipData: PayslipData = {
              payslipNumber: `PAY-${selectedPayslip._id.slice(-6).toUpperCase()}`,
              period: `${new Date(Number(year), Number(month) - 1).toLocaleString("default", { month: "long" })} ${year}`,
              paymentDate: selectedPayslip.paidAt || new Date().toISOString(),
              status: (selectedPayslip.status === "paid" || selectedPayslip.status === "approved" ? selectedPayslip.status : "pending") as "paid" | "approved" | "pending",
              paymentMethod: selectedPayslip.paymentMethod || "bank_transfer",
              employee: {
                code: selectedPayslip.employeeId?.employeeCode || "EMP",
                name: `${selectedPayslip.employeeId?.firstName || ""} ${selectedPayslip.employeeId?.lastName || ""}`.trim(),
                designation: selectedPayslip.employeeId?.designationId?.title || "Staff",
                department: selectedPayslip.employeeId?.departmentId?.name || "General",
                joiningDate: selectedPayslip.employeeId?.joiningDate || selectedPayslip.employeeId?.createdAt || "",
                bankAccount: selectedPayslip.employeeId?.bankInfo?.accountNumber,
                phone: selectedPayslip.employeeId?.phone,
              },
              earnings: {
                basicSalary: selectedPayslip.basicSalary || 0,
                houseRent: selectedPayslip.houseRent || 0,
                medical: selectedPayslip.medical || 0,
                conveyance: selectedPayslip.conveyance || 0,
                overtimeHours: selectedPayslip.overtimeHours || 0,
                overtimePay: selectedPayslip.overtimePay || 0,
                otherAllowances: selectedPayslip.otherAllowances || 0,
              },
              deductions: {
                taxDeduction: selectedPayslip.totalDeductions || 0,
              },
              grossSalary: selectedPayslip.grossSalary || 0,
              totalDeductions: selectedPayslip.totalDeductions || 0,
              netSalary: selectedPayslip.netSalary || 0,
            };

            return (
              <PayslipDocument
                payslip={payslipData}
                store={store}
              />
            );
          })()}
        </DocumentPreviewDialog>
      )}
    </div>
  );
}
