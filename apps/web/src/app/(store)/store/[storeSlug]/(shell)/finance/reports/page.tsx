"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useGetStoreBySlugQuery } from "@/redux/api/store-api";
import { useGetFinancialStatementsQuery } from "@/redux/api/accounting-api";
import { useLanguage } from "@/providers/language-provider";
import { useHasPermission } from "@/features/session/hooks";
import {
  FileSpreadsheet,
  TrendingUp,
  Scale,
  Building,
  RefreshCw,
  Printer,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentPreviewDialog } from "@/components/documents/document-preview-dialog";
import { FinancialReportDocument } from "@/components/documents/templates/financial-report-document";

export default function FinancialReportsPage() {
  const params = useParams();
  const storeSlug = String(params.storeSlug);
  const { data: storeData } = useGetStoreBySlugQuery(storeSlug, { skip: !storeSlug });
  const store = storeData?.data?.store;
  const storeId = store?._id ?? "";

  const { language } = useLanguage();
  const isBn = language === "bn";

  const [activeTab, setActiveTab] = useState("pl");

  const hasAccess = useHasPermission("accounting:read");

  const { data: stmtData, isLoading, refetch } = useGetFinancialStatementsQuery(storeId, {
    skip: !storeId,
  });

  const pl = stmtData?.data?.profitAndLoss;
  const bs = stmtData?.data?.balanceSheet;
  const tb = stmtData?.data?.trialBalance ?? [];

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
            <FileSpreadsheet className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
            <span>{isBn ? "আর্থিক বিবরণী ও রিপোর্ট (Financial Statements)" : "Financial Statements & Reports"}</span>
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {isBn
              ? "লাভ-ক্ষতি বিবরণী (P&L), ব্যালেন্স শিট এবং ট্রায়াল ব্যালেন্সের স্বয়ংক্রিয় ডাবল-এন্ট্রি আর্থিক প্রতিবেদন।"
              : "Standard double-entry Income Statement (P&L), Balance Sheet, and Trial Balance computed from active ledger."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            <span>{isBn ? "রিফ্রেশ" : "Refresh"}</span>
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-2">
            <Printer className="h-4 w-4" />
            <span>{isBn ? "রিপোর্ট প্রিন্ট" : "Print Report"}</span>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md mb-4">
          <TabsTrigger value="pl">{isBn ? "লাভ ও ক্ষতি (P&L)" : "Profit & Loss"}</TabsTrigger>
          <TabsTrigger value="bs">{isBn ? "ব্যালেন্স শিট" : "Balance Sheet"}</TabsTrigger>
          <TabsTrigger value="tb">{isBn ? "ট্রায়াল ব্যালেন্স" : "Trial Balance"}</TabsTrigger>
        </TabsList>

        {/* 1. Profit & Loss */}
        <TabsContent value="pl">
          <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm max-w-3xl">
            <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <CardTitle className="text-base font-bold flex items-center justify-between">
                <span>{isBn ? "লাভ-ক্ষতি আয় বিবরণী (Income Statement)" : "Profit & Loss Income Statement"}</span>
                <span className={`text-base font-bold ${(pl?.netProfit ?? 0) >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  {isBn ? "নিট মুনাফা: " : "Net Profit: "}
                  ৳{(pl?.netProfit ?? 0).toLocaleString()}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6 text-sm">
              {/* Revenue */}
              <div className="space-y-2">
                <div className="font-bold text-xs uppercase text-zinc-400 tracking-wider">
                  {isBn ? "১. রাজস্ব ও মোট বিক্রয় (Revenue)" : "1. Operating Revenue"}
                </div>
                <div className="space-y-1.5 pl-2 border-l-2 border-emerald-500/40">
                  {pl?.revenues?.map((r: any) => (
                    <div key={r._id} className="flex justify-between py-1 text-xs">
                      <span>{r.name}</span>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">৳{r.currentBalance?.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2 border-t font-bold text-emerald-600">
                    <span>{isBn ? "সর্বমোট আয় (Total Revenue):" : "Total Revenue:"}</span>
                    <span>৳{pl?.totalRevenue?.toLocaleString() || "0"}</span>
                  </div>
                </div>
              </div>

              {/* Operating Expenses */}
              <div className="space-y-2">
                <div className="font-bold text-xs uppercase text-zinc-400 tracking-wider">
                  {isBn ? "২. পরিচালন ব্যয় ও খরচ (Operating Expenses)" : "2. Operating Expenses & COGS"}
                </div>
                <div className="space-y-1.5 pl-2 border-l-2 border-rose-500/40">
                  {pl?.expenses?.map((e: any) => (
                    <div key={e._id} className="flex justify-between py-1 text-xs">
                      <span>{e.name}</span>
                      <span className="font-semibold text-rose-600">৳{e.currentBalance?.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2 border-t font-bold text-rose-600">
                    <span>{isBn ? "সর্বমোট খরচ (Total Expenses):" : "Total Expenses:"}</span>
                    <span>৳{pl?.totalExpense?.toLocaleString() || "0"}</span>
                  </div>
                </div>
              </div>

              {/* Net Profit */}
              <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex justify-between items-center text-base font-bold">
                <span className="text-zinc-900 dark:text-white">
                  {isBn ? "নিট অপারেটিং লাভ / ক্ষতি (Net Operating Income):" : "Net Operating Income (Loss):"}
                </span>
                <span className={(pl?.netProfit ?? 0) >= 0 ? "text-emerald-600 text-lg" : "text-rose-600 text-lg"}>
                  ৳{(pl?.netProfit ?? 0).toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. Balance Sheet */}
        <TabsContent value="bs">
          <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm max-w-3xl">
            <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <CardTitle className="text-base font-bold flex items-center justify-between">
                <span>{isBn ? "ব্যালেন্স শিট (Balance Sheet)" : "Balance Sheet Statement"}</span>
                <span className="text-xs text-zinc-500 font-mono">
                  {isBn ? "সম্পদ = দায় + মালিকানা স্বত্ব" : "Assets = Liabilities + Equity"}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6 text-sm">
              {/* Assets */}
              <div className="space-y-2">
                <div className="font-bold text-xs uppercase text-zinc-400 tracking-wider">
                  {isBn ? "সম্পদসমূহ (Assets)" : "Assets"}
                </div>
                <div className="space-y-1.5 pl-2 border-l-2 border-blue-500/40">
                  {bs?.assets?.map((a: any) => (
                    <div key={a._id} className="flex justify-between py-1 text-xs">
                      <span>{a.name}</span>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">৳{a.currentBalance?.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2 border-t font-bold text-blue-600">
                    <span>{isBn ? "সর্বমোট সম্পদ (Total Assets):" : "Total Assets:"}</span>
                    <span>৳{bs?.totalAssets?.toLocaleString() || "0"}</span>
                  </div>
                </div>
              </div>

              {/* Liabilities & Equity */}
              <div className="space-y-2">
                <div className="font-bold text-xs uppercase text-zinc-400 tracking-wider">
                  {isBn ? "দায় ও মালিকানা স্বত্ব (Liabilities & Equity)" : "Liabilities & Owner Equity"}
                </div>
                <div className="space-y-1.5 pl-2 border-l-2 border-amber-500/40">
                  {bs?.liabilities?.map((l: any) => (
                    <div key={l._id} className="flex justify-between py-1 text-xs">
                      <span>{l.name}</span>
                      <span className="font-semibold">৳{l.currentBalance?.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between py-1 text-xs text-zinc-600">
                    <span>{isBn ? "চলতি নিট লাভ ও সংরক্ষিত আয়" : "Retained Earnings & Current Net Income"}</span>
                    <span className="font-semibold">৳{(pl?.netProfit ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t font-bold text-amber-600">
                    <span>{isBn ? "মোট দায় ও স্বত্ব (Total Liabilities & Equity):" : "Total Liabilities & Equity:"}</span>
                    <span>৳{((bs?.totalLiabilities ?? 0) + (bs?.totalEquity ?? 0))?.toLocaleString() || "0"}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. Trial Balance */}
        <TabsContent value="tb">
          <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm max-w-3xl">
            <CardContent className="p-0">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-xs uppercase text-zinc-500 font-semibold border-b border-zinc-200/80 dark:border-zinc-800">
                  <tr>
                    <th className="px-4 py-3">{isBn ? "অ্যাকাউন্ট কোড" : "Code"}</th>
                    <th className="px-4 py-3">{isBn ? "অ্যাকাউন্ট শিরোনাম" : "Account Title"}</th>
                    <th className="px-4 py-3">{isBn ? "ধরন" : "Type"}</th>
                    <th className="px-4 py-3 text-right">{isBn ? "ডেবিট (৳)" : "Debit (BDT)"}</th>
                    <th className="px-4 py-3 text-right">{isBn ? "ক্রেডিট (৳)" : "Credit (BDT)"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800">
                  {tb.map((row, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 text-xs">
                      <td className="px-4 py-2.5 font-mono text-zinc-500">{row.code}</td>
                      <td className="px-4 py-2.5 font-semibold text-zinc-900 dark:text-zinc-100">{row.name}</td>
                      <td className="px-4 py-2.5 capitalize text-zinc-500">{row.type}</td>
                      <td className="px-4 py-2.5 text-right font-medium text-emerald-600">
                        {row.debit > 0 ? `৳${row.debit.toLocaleString()}` : "—"}
                      </td>
                      <td className="px-4 py-2.5 text-right font-medium text-blue-600">
                        {row.credit > 0 ? `৳${row.credit.toLocaleString()}` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
