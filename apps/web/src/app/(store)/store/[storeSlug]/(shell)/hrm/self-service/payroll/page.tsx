"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useGetStoreBySlugQuery } from "@/redux/api/store-api";
import { useGetMyPayslipsQuery, type Payroll } from "@/redux/api/hrm-api";
import { useLanguage } from "@/providers/language-provider";
import {
  Wallet,
  ArrowLeft,
  FileText,
  DollarSign,
  Download,
  Printer,
  Calendar,
  CreditCard,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DocumentPreviewDialog } from "@/components/documents/document-preview-dialog";
import { PayslipDocument } from "@/components/documents/templates/payslip-document";
import type { PayslipData } from "@/components/documents/document-types";

export default function PayslipsPage() {
  const params = useParams();
  const storeSlug = String(params.storeSlug);
  const { data: storeData } = useGetStoreBySlugQuery(storeSlug, { skip: !storeSlug });
  const store = storeData?.data?.store;
  const storeId = store?._id ?? "";

  const [selectedPayslip, setSelectedPayslip] = useState<Payroll | null>(null);

  const { data: payslipsData, isLoading } = useGetMyPayslipsQuery(storeId, { skip: !storeId });

  const payslips = payslipsData?.data?.payslips ?? [];
  const salaryStructure = payslipsData?.data?.salaryStructure;
  const bankInfo = payslipsData?.data?.bankInfo;

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
            <Wallet className="h-6 w-6 text-[#003399]" />
            <span>Payslips & Salary</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            View monthly salary breakdown, official payslips, and payment records.
          </p>
        </div>
      </div>

      {/* Current Salary Overview */}
      {salaryStructure && (
        <Card className="border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-500 flex items-center justify-between">
              <span>Salary Structure Overview</span>
              <span className="text-xs text-zinc-400 font-normal">Official HR Record</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <span className="text-xs text-zinc-500 block font-medium">Basic Salary</span>
                <span className="text-xl font-bold font-mono text-zinc-900 dark:text-white mt-1 block">
                  ৳{(salaryStructure.basic || 0).toLocaleString()}
                </span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">Base pay</span>
              </div>

              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <span className="text-xs text-zinc-500 block font-medium">House Rent</span>
                <span className="text-xl font-bold font-mono text-zinc-900 dark:text-white mt-1 block">
                  ৳{(salaryStructure.houseRent || 0).toLocaleString()}
                </span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">Allowance</span>
              </div>

              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <span className="text-xs text-zinc-500 block font-medium">Medical & Conv.</span>
                <span className="text-xl font-bold font-mono text-zinc-900 dark:text-white mt-1 block">
                  ৳{((salaryStructure.medical || 0) + (salaryStructure.conveyance || 0)).toLocaleString()}
                </span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">Allowances</span>
              </div>

              <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-900">
                <span className="text-xs text-blue-700 dark:text-blue-300 block font-bold">Gross Salary</span>
                <span className="text-xl font-bold font-mono text-[#003399] dark:text-blue-400 mt-1 block">
                  ৳{(salaryStructure.grossSalary || salaryStructure.basic || 0).toLocaleString()}
                </span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 block mt-0.5">Total monthly</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monthly Payslips History Table */}
      <Card className="border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-zinc-900 dark:text-white">
            Payslip History
          </CardTitle>
          <CardDescription className="text-xs text-zinc-500 mt-0.5">
            Official monthly payslips generated by your employer.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {payslips.length === 0 ? (
            <div className="p-12 text-center text-zinc-400 text-xs">
              No payslips generated yet. Monthly payslips will appear here once processed by HR.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 border-y border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="py-3 px-4 font-bold">Period</th>
                    <th className="py-3 px-4 font-bold">Gross Salary</th>
                    <th className="py-3 px-4 font-bold">Deductions</th>
                    <th className="py-3 px-4 font-bold">Net Payable</th>
                    <th className="py-3 px-4 font-bold text-center">Payment Status</th>
                    <th className="py-3 px-4 font-bold">Payment Date</th>
                    <th className="py-3 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {payslips.map((p: any) => {
                    const monthName = new Date(p.year, p.month - 1).toLocaleString("default", {
                      month: "long",
                    });
                    return (
                      <tr key={p._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                        <td className="py-3 px-4 font-bold text-zinc-900 dark:text-white">
                          {monthName} {p.year}
                        </td>
                        <td className="py-3 px-4 font-mono">
                          ৳{(p.grossSalary || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-mono text-rose-600">
                          -৳{(p.deductions?.total || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-[#003399] dark:text-blue-400 text-sm">
                          ৳{(p.netSalary || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant={p.status === "paid" ? "success" : "warning"}>
                            {p.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 font-mono text-zinc-500">
                          {p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : "—"}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedPayslip(p)}
                            className="h-7 text-[11px] gap-1.5 font-semibold text-[#003399] border-zinc-200 dark:border-zinc-800 hover:bg-blue-50"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            <span>View Payslip</span>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payslip Document Preview Dialog */}
      {selectedPayslip && store && (
        <DocumentPreviewDialog
          open={Boolean(selectedPayslip)}
          onClose={() => setSelectedPayslip(null)}
          title={`Payslip - ${new Date(selectedPayslip.year, selectedPayslip.month - 1).toLocaleString("default", { month: "long" })} ${selectedPayslip.year}`}
          defaultPageSize="a4-portrait"
        >
          {(() => {
            const payslipData: PayslipData = {
              payslipNumber: selectedPayslip.payslipNumber || `PAY-${selectedPayslip._id.slice(-6).toUpperCase()}`,
              period: `${new Date(selectedPayslip.year, selectedPayslip.month - 1).toLocaleString("default", { month: "long" })} ${selectedPayslip.year}`,
              paymentDate: selectedPayslip.paidAt || selectedPayslip.createdAt,
              status: (selectedPayslip.status === "paid" || selectedPayslip.status === "approved" ? selectedPayslip.status : "pending") as "paid" | "approved" | "pending",
              paymentMethod: selectedPayslip.paymentMethod || "bank_transfer",
              employee: {
                code: selectedPayslip.employeeId?.employeeCode || "EMP",
                name: `${selectedPayslip.employeeId?.firstName || ""} ${selectedPayslip.employeeId?.lastName || ""}`.trim(),
                designation: selectedPayslip.employeeId?.designationId?.name || "Staff",
                department: selectedPayslip.employeeId?.departmentId?.name || "General",
                joiningDate: selectedPayslip.employeeId?.joiningDate || selectedPayslip.employeeId?.createdAt || "",
                bankAccount: bankInfo?.accountNumber || bankInfo?.mobileWalletNumber,
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
