import React from "react";
import type { PayslipData, StoreIdentity } from "../document-types";
import { DocumentHeader } from "../document-header";
import { DocumentFooter } from "../document-footer";

interface PayslipDocumentProps {
  store: StoreIdentity;
  payslip: PayslipData;
  isBn?: boolean;
}

export function PayslipDocument({
  store,
  payslip,
  isBn = false,
}: PayslipDocumentProps) {
  const emp = payslip.employee;
  const earn = payslip.earnings;
  const ded = payslip.deductions;

  return (
    <div className="doc-sheet-a4-portrait">
      {/* Header */}
      <DocumentHeader
        store={store}
        title={isBn ? "বেতন রসিদ / PAYSLIP" : "SALARY PAYSLIP"}
        subtitle={`Period: ${payslip.period}`}
        documentNumber={payslip.payslipNumber}
        date={payslip.paymentDate}
        status={payslip.status}
      />

      {/* Employee Details Grid */}
      <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 mb-6 text-xs grid grid-cols-2 gap-x-8 gap-y-2">
        <div className="flex justify-between border-b border-zinc-200/60 pb-1">
          <span className="text-zinc-500 font-medium">
            {isBn ? "কর্মকর্তার নাম (Name):" : "Employee Name:"}
          </span>
          <span className="font-bold text-zinc-900">{emp.name}</span>
        </div>
        <div className="flex justify-between border-b border-zinc-200/60 pb-1">
          <span className="text-zinc-500 font-medium">
            {isBn ? "আইডি নং (Employee ID):" : "Employee ID:"}
          </span>
          <span className="font-mono font-bold text-zinc-900">{emp.code}</span>
        </div>
        <div className="flex justify-between border-b border-zinc-200/60 pb-1">
          <span className="text-zinc-500 font-medium">
            {isBn ? "পদবী (Designation):" : "Designation:"}
          </span>
          <span className="font-semibold text-zinc-800">{emp.designation}</span>
        </div>
        <div className="flex justify-between border-b border-zinc-200/60 pb-1">
          <span className="text-zinc-500 font-medium">
            {isBn ? "বিভাগ (Department):" : "Department:"}
          </span>
          <span className="font-semibold text-zinc-800">{emp.department}</span>
        </div>
        {emp.bankAccount && (
          <div className="flex justify-between border-b border-zinc-200/60 pb-1">
            <span className="text-zinc-500 font-medium">
              {isBn ? "ব্যাংক হিসাব (Account):" : "Bank Account:"}
            </span>
            <span className="font-mono text-zinc-800">{emp.bankAccount}</span>
          </div>
        )}
        {payslip.paymentMethod && (
          <div className="flex justify-between border-b border-zinc-200/60 pb-1">
            <span className="text-zinc-500 font-medium">
              {isBn ? "পরিশোধ পদ্ধতি (Method):" : "Payment Method:"}
            </span>
            <span className="capitalize font-semibold text-zinc-800">
              {payslip.paymentMethod.replace("_", " ")}
            </span>
          </div>
        )}
      </div>

      {/* Earnings & Deductions Tables */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Earnings */}
        <div className="border border-zinc-200 rounded-lg overflow-hidden flex flex-col justify-between">
          <div>
            <div className="bg-zinc-100 px-3 py-2 border-b border-zinc-200 text-xs font-bold uppercase tracking-wider text-zinc-800 flex justify-between">
              <span>{isBn ? "উপার্জন (Earnings)" : "Earnings Description"}</span>
              <span>{isBn ? "পরিমাণ (Amount)" : "Amount (৳)"}</span>
            </div>
            <table className="w-full text-xs">
              <tbody>
                <tr className="border-b border-zinc-100">
                  <td className="px-3 py-2 text-zinc-700">{isBn ? "মূল বেতন (Basic Salary)" : "Basic Salary"}</td>
                  <td className="px-3 py-2 text-right font-medium">৳{earn.basicSalary.toLocaleString()}</td>
                </tr>
                <tr className="border-b border-zinc-100">
                  <td className="px-3 py-2 text-zinc-700">{isBn ? "বাড়ি ভাড়া (House Rent)" : "House Rent (40%)"}</td>
                  <td className="px-3 py-2 text-right font-medium">৳{earn.houseRent.toLocaleString()}</td>
                </tr>
                <tr className="border-b border-zinc-100">
                  <td className="px-3 py-2 text-zinc-700">{isBn ? "চিকিৎসা ভাতা (Medical Allowance)" : "Medical Allowance (10%)"}</td>
                  <td className="px-3 py-2 text-right font-medium">৳{earn.medical.toLocaleString()}</td>
                </tr>
                {(earn.conveyance || 0) > 0 && (
                  <tr className="border-b border-zinc-100">
                    <td className="px-3 py-2 text-zinc-700">{isBn ? "যাতায়াত ভাতা (Conveyance)" : "Conveyance Allowance"}</td>
                    <td className="px-3 py-2 text-right font-medium">৳{(earn.conveyance || 0).toLocaleString()}</td>
                  </tr>
                )}
                {(earn.overtimePay || 0) > 0 && (
                  <tr className="border-b border-zinc-100 bg-indigo-50/40">
                    <td className="px-3 py-2 text-indigo-900 font-medium">
                      {isBn ? `ওভারটাইম (${earn.overtimeHours} ঘণ্টা)` : `Overtime Pay (${earn.overtimeHours} hrs)`}
                    </td>
                    <td className="px-3 py-2 text-right font-bold text-indigo-700">
                      +৳{(earn.overtimePay || 0).toLocaleString()}
                    </td>
                  </tr>
                )}
                {(earn.otherAllowances || 0) > 0 && (
                  <tr className="border-b border-zinc-100">
                    <td className="px-3 py-2 text-zinc-700">{isBn ? "অন্যান্য বিশেষ ভাতা" : "Special Allowances"}</td>
                    <td className="px-3 py-2 text-right font-medium">৳{(earn.otherAllowances || 0).toLocaleString()}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="bg-zinc-50 border-t border-zinc-200 px-3 py-2.5 flex justify-between text-xs font-bold text-zinc-900">
            <span>{isBn ? "সর্বমোট উপার্জন (Gross Earnings):" : "Total Gross Earnings:"}</span>
            <span>৳{payslip.grossSalary.toLocaleString()}</span>
          </div>
        </div>

        {/* Deductions */}
        <div className="border border-zinc-200 rounded-lg overflow-hidden flex flex-col justify-between">
          <div>
            <div className="bg-zinc-100 px-3 py-2 border-b border-zinc-200 text-xs font-bold uppercase tracking-wider text-zinc-800 flex justify-between">
              <span>{isBn ? "কর্তন (Deductions)" : "Deduction Description"}</span>
              <span>{isBn ? "পরিমাণ (Amount)" : "Amount (৳)"}</span>
            </div>
            <table className="w-full text-xs">
              <tbody>
                <tr className="border-b border-zinc-100">
                  <td className="px-3 py-2 text-zinc-700">{isBn ? "আয়কর (Tax Deduction)" : "Income Tax Deduction"}</td>
                  <td className="px-3 py-2 text-right font-medium text-rose-700">
                    -৳{(ded.taxDeduction || 0).toLocaleString()}
                  </td>
                </tr>
                <tr className="border-b border-zinc-100">
                  <td className="px-3 py-2 text-zinc-700">{isBn ? "ভবিষ্য তহবিল (Provident Fund 5%)" : "Provident Fund (5%)"}</td>
                  <td className="px-3 py-2 text-right font-medium text-rose-700">
                    -৳{(ded.providentFundDeduction || 0).toLocaleString()}
                  </td>
                </tr>
                {(ded.unpaidLeaveDeduction || 0) > 0 && (
                  <tr className="border-b border-zinc-100">
                    <td className="px-3 py-2 text-zinc-700">{isBn ? "বিনা বেতনে ছুটি কর্তন" : "Unpaid Leave Deduction"}</td>
                    <td className="px-3 py-2 text-right font-medium text-rose-700">
                      -৳{(ded.unpaidLeaveDeduction || 0).toLocaleString()}
                    </td>
                  </tr>
                )}
                {(ded.otherDeductions || 0) > 0 && (
                  <tr className="border-b border-zinc-100">
                    <td className="px-3 py-2 text-zinc-700">{isBn ? "অন্যান্য কর্তন" : "Other Deductions"}</td>
                    <td className="px-3 py-2 text-right font-medium text-rose-700">
                      -৳{(ded.otherDeductions || 0).toLocaleString()}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="bg-zinc-50 border-t border-zinc-200 px-3 py-2.5 flex justify-between text-xs font-bold text-zinc-900">
            <span>{isBn ? "সর্বমোট কর্তন (Total Deductions):" : "Total Deductions:"}</span>
            <span className="text-rose-700">-৳{payslip.totalDeductions.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Net Pay Callout Banner */}
      <div className="bg-emerald-50 border-2 border-emerald-500/40 rounded-xl p-4 mb-6 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 block">
            {isBn ? "প্রদেয় সর্বমোট নিট বেতন (Net Payable Salary)" : "Net Salary Payable to Employee"}
          </span>
          <span className="text-[11px] text-emerald-700">
            {isBn
              ? "মাসিক নিয়মিত ও ওভারটাইম বেতনের মোট নিট সমন্বয়।"
              : "Calculated gross disbursement less total statutory & corporate deductions."}
          </span>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-emerald-950 font-mono tracking-tight">
            ৳{payslip.netSalary.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Signatures & Footer */}
      <DocumentFooter
        notes={payslip.notes}
        showSignatures={true}
        signatureLabels={[
          isBn ? "প্রস্তুতকারক (Prepared By)" : "Prepared By (HR)",
          isBn ? "যাচাইকারী (Audited By)" : "Audited By (Accounts)",
          isBn ? "অনুমোদনকারী (Approved By)" : "Approved By (Management)",
        ]}
      />
    </div>
  );
}
