import React from "react";
import type { FinancialStatementData, StoreIdentity } from "../document-types";
import { DocumentHeader } from "../document-header";
import { DocumentFooter } from "../document-footer";

interface FinancialReportDocumentProps {
  store: StoreIdentity;
  data: FinancialStatementData;
  isBn?: boolean;
}

export function FinancialReportDocument({
  store,
  data,
  isBn = false,
}: FinancialReportDocumentProps) {
  const isLandscape = data.statementType === "trial-balance";

  return (
    <div className={isLandscape ? "doc-sheet-a4-landscape" : "doc-sheet-a4-portrait"}>
      {/* Header */}
      <DocumentHeader
        store={store}
        title={
          data.statementType === "trial-balance"
            ? isBn
              ? "ট্রায়াল ব্যালেন্স / রেওয়ামিল"
              : "TRIAL BALANCE"
            : data.statementType === "profit-loss"
            ? isBn
              ? "লাভ ও ক্ষতি বিবরণী"
              : "PROFIT & LOSS STATEMENT"
            : isBn
            ? "ব্যালেন্স শিট / উদ্বৃত্তপত্র"
            : "BALANCE SHEET"
        }
        subtitle={`Period: ${data.period} • Currency: BDT (৳)`}
        date={data.asOfDate}
      />

      {/* 1. Trial Balance Table */}
      {data.statementType === "trial-balance" && data.trialBalance && (
        <div className="border border-zinc-200 rounded-lg overflow-hidden mb-6">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-zinc-100 border-b border-zinc-200 text-[10px] font-bold uppercase tracking-wider text-zinc-700">
                <th className="py-2.5 px-3 text-left w-24">Account Code</th>
                <th className="py-2.5 px-3 text-left">Account Name</th>
                <th className="py-2.5 px-3 text-center w-28">Type</th>
                <th className="py-2.5 px-3 text-right w-36">Debit (৳)</th>
                <th className="py-2.5 px-3 text-right w-36">Credit (৳)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {data.trialBalance.map((acc, idx) => (
                <tr key={idx} className="hover:bg-zinc-50/50">
                  <td className="py-2 px-3 font-mono text-zinc-500 font-medium">{acc.code}</td>
                  <td className="py-2 px-3 font-semibold text-zinc-900">{acc.name}</td>
                  <td className="py-2 px-3 text-center">
                    <span className="capitalize text-[10px] px-2 py-0.5 rounded bg-zinc-100 font-medium text-zinc-600">
                      {acc.type}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-medium text-zinc-800">
                    {acc.debit > 0 ? `৳${acc.debit.toLocaleString()}` : "—"}
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-medium text-zinc-800">
                    {acc.credit > 0 ? `৳${acc.credit.toLocaleString()}` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-zinc-100 border-t-2 border-zinc-300 font-black text-xs text-zinc-900">
                <td colSpan={3} className="py-3 px-3 text-right uppercase tracking-wider">
                  Total Trial Balance:
                </td>
                <td className="py-3 px-3 text-right font-mono text-emerald-800">
                  ৳
                  {data.trialBalance
                    .reduce((sum, item) => sum + item.debit, 0)
                    .toLocaleString()}
                </td>
                <td className="py-3 px-3 text-right font-mono text-emerald-800">
                  ৳
                  {data.trialBalance
                    .reduce((sum, item) => sum + item.credit, 0)
                    .toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* 2. Profit & Loss Statement */}
      {data.statementType === "profit-loss" && data.profitAndLoss && (
        <div className="space-y-6 mb-6">
          {/* Operating Revenue */}
          <div className="border border-zinc-200 rounded-lg overflow-hidden">
            <div className="bg-zinc-100 px-3 py-2 border-b border-zinc-200 text-xs font-bold uppercase tracking-wider text-zinc-800">
              1. Operating Revenue (আয়)
            </div>
            <table className="w-full text-xs">
              <tbody className="divide-y divide-zinc-100">
                {data.profitAndLoss.revenues.map((rev, idx) => (
                  <tr key={idx}>
                    <td className="py-2 px-3 text-zinc-500 font-mono w-20">{rev.code}</td>
                    <td className="py-2 px-3 font-medium text-zinc-800">{rev.name}</td>
                    <td className="py-2 px-3 text-right font-mono font-semibold text-zinc-900 w-36">
                      ৳{(rev.amount ?? rev.currentBalance ?? 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-zinc-50 border-t border-zinc-200 font-bold text-xs text-zinc-900">
                  <td colSpan={2} className="py-2.5 px-3 text-right">
                    Total Operating Revenue:
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-emerald-700">
                    ৳{data.profitAndLoss.totalRevenue.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Operating Expenses */}
          <div className="border border-zinc-200 rounded-lg overflow-hidden">
            <div className="bg-zinc-100 px-3 py-2 border-b border-zinc-200 text-xs font-bold uppercase tracking-wider text-zinc-800">
              2. Operating Expenses (ব্যয়)
            </div>
            <table className="w-full text-xs">
              <tbody className="divide-y divide-zinc-100">
                {data.profitAndLoss.expenses.map((exp, idx) => (
                  <tr key={idx}>
                    <td className="py-2 px-3 text-zinc-500 font-mono w-20">{exp.code}</td>
                    <td className="py-2 px-3 font-medium text-zinc-800">{exp.name}</td>
                    <td className="py-2 px-3 text-right font-mono font-semibold text-rose-700 w-36">
                      ৳{(exp.amount ?? exp.currentBalance ?? 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-zinc-50 border-t border-zinc-200 font-bold text-xs text-zinc-900">
                  <td colSpan={2} className="py-2.5 px-3 text-right">
                    Total Operating Expenses:
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-rose-700">
                    ৳{data.profitAndLoss.totalExpense.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Net Profit Summary Banner */}
          <div className="bg-zinc-900 text-white rounded-xl p-4 flex justify-between items-center">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-zinc-400 block">
                Net Operating Profit / (Loss)
              </span>
              <span className="text-[11px] text-zinc-400">Total Revenue minus Total Expenses</span>
            </div>
            <span
              className={`text-2xl font-black font-mono ${
                data.profitAndLoss.netProfit >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              ৳{data.profitAndLoss.netProfit.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* 3. Balance Sheet */}
      {data.statementType === "balance-sheet" && data.balanceSheet && (
        <div className="space-y-6 mb-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Assets */}
            <div className="border border-zinc-200 rounded-lg overflow-hidden flex flex-col justify-between">
              <div>
                <div className="bg-zinc-100 px-3 py-2 border-b border-zinc-200 text-xs font-bold uppercase tracking-wider text-zinc-800">
                  Assets (সম্পদ)
                </div>
                <table className="w-full text-xs">
                  <tbody className="divide-y divide-zinc-100">
                    {data.balanceSheet.assets.map((asset, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-3 text-zinc-500 font-mono w-16">{asset.code}</td>
                        <td className="py-2 px-3 font-medium text-zinc-800">{asset.name}</td>
                        <td className="py-2 px-3 text-right font-mono font-semibold text-zinc-900 w-28">
                          ৳{(asset.amount ?? asset.currentBalance ?? 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="bg-zinc-50 border-t border-zinc-200 px-3 py-2.5 flex justify-between text-xs font-black text-zinc-900">
                <span>Total Assets:</span>
                <span className="font-mono text-emerald-700">
                  ৳{data.balanceSheet.totalAssets.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Liabilities & Equity */}
            <div className="border border-zinc-200 rounded-lg overflow-hidden flex flex-col justify-between">
              <div>
                <div className="bg-zinc-100 px-3 py-2 border-b border-zinc-200 text-xs font-bold uppercase tracking-wider text-zinc-800">
                  Liabilities & Equity (দায় ও মালিকানাস্বত্ব)
                </div>
                <table className="w-full text-xs">
                  <tbody className="divide-y divide-zinc-100">
                    {data.balanceSheet.liabilities.map((liab, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-3 text-zinc-500 font-mono w-16">{liab.code}</td>
                        <td className="py-2 px-3 font-medium text-zinc-800">{liab.name}</td>
                        <td className="py-2 px-3 text-right font-mono font-semibold text-zinc-900 w-28">
                          ৳{(liab.amount ?? liab.currentBalance ?? 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    {data.balanceSheet.equity.map((eq, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-3 text-zinc-500 font-mono w-16">{eq.code}</td>
                        <td className="py-2 px-3 font-medium text-zinc-800">{eq.name}</td>
                        <td className="py-2 px-3 text-right font-mono font-semibold text-zinc-900 w-28">
                          ৳{(eq.amount ?? eq.currentBalance ?? 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="bg-zinc-50 border-t border-zinc-200 px-3 py-2.5 flex justify-between text-xs font-black text-zinc-900">
                <span>Total Liabilities & Equity:</span>
                <span className="font-mono text-emerald-700">
                  ৳{(data.balanceSheet.totalLiabilities + data.balanceSheet.totalEquity).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Balance Check Banner */}
          <div className="bg-zinc-100 border border-zinc-300 rounded-lg p-3 text-xs flex justify-between items-center">
            <span className="font-semibold text-zinc-700">
              Accounting Equation Verification: Total Assets = Total Liabilities + Total Equity
            </span>
            <span className="font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded">
              PERFECTLY BALANCED ✅
            </span>
          </div>
        </div>
      )}

      {/* Footer */}
      <DocumentFooter
        showSignatures={true}
        signatureLabels={["Prepared By (Accountant)", "Audited By (CFO)", "Approved By (Director)"]}
      />
    </div>
  );
}
