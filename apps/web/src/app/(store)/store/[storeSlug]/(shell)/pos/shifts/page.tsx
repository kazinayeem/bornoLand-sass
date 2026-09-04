"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useGetStoreBySlugQuery } from "@/redux/api/store-api";
import {
  useGetCurrentPosShiftQuery,
  useOpenPosShiftMutation,
  useClosePosShiftMutation,
  useListPosShiftsQuery,
} from "@/redux/api/pos-api";
import { useLanguage } from "@/providers/language-provider";
import { useHasPermission } from "@/features/session/hooks";
import {
  Clock,
  Plus,
  CheckCircle,
  AlertCircle,
  Calculator,
  RefreshCw,
  Lock,
  Unlock,
  Coins,
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
import { toast } from "sonner";

export default function PosShiftsPage() {
  const params = useParams();
  const storeSlug = String(params.storeSlug);
  const { data: storeData } = useGetStoreBySlugQuery(storeSlug, { skip: !storeSlug });
  const store = storeData?.data?.store;
  const storeId = store?._id ?? "";

  const { language } = useLanguage();
  const isBn = false;

  const [openModal, setOpenModal] = useState(false);
  const [closeModal, setCloseModal] = useState(false);
  const [openingFloat, setOpeningFloat] = useState("1000");
  const [actualClosingCash, setActualClosingCash] = useState("");
  const [closingNotes, setClosingNotes] = useState("");

  const hasAccess = useHasPermission("pos:read");

  const { data: currentShiftData, refetch: refetchCurrent } = useGetCurrentPosShiftQuery(storeId, {
    skip: !storeId,
  });
  const { data: listData, isLoading, refetch: refetchList } = useListPosShiftsQuery(
    { storeId, limit: 20 },
    { skip: !storeId }
  );

  const [openShift, { isLoading: isOpening }] = useOpenPosShiftMutation();
  const [closeShift, { isLoading: isClosing }] = useClosePosShiftMutation();

  const currentShift = currentShiftData?.data;
  const shifts = listData?.data?.shifts ?? [];

  const handleOpenShift = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await openShift({
        storeId,
        openingFloat: Number(openingFloat) || 0,
      }).unwrap();
      toast.success(isBn ? "ক্যাশ রেজিস্টার সফলভাবে চালু হয়েছে" : "Register shift opened successfully");
      setOpenModal(false);
      refetchCurrent();
      refetchList();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to open shift");
    }
  };

  const handleCloseShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentShift?._id) return;
    try {
      await closeShift({
        storeId,
        shiftId: currentShift._id,
        actualClosingCash: Number(actualClosingCash) || 0,
        closingNotes,
      }).unwrap();
      toast.success(isBn ? "শিফট ও ক্যাশ ড্রয়ার সমাপ্ত হয়েছে" : "Shift closed and cash reconciled");
      setCloseModal(false);
      setActualClosingCash("");
      setClosingNotes("");
      refetchCurrent();
      refetchList();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to close shift");
    }
  };

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <ShieldAlert className="h-10 w-10 text-rose-500" />
        <h2 className="mt-4 text-lg font-semibold">{isBn ? "অনুমতি নেই" : "Access Denied"}</h2>
        <p className="text-sm text-zinc-500 mt-1">
          {isBn ? "POS শিফট দেখার অনুমতি আপনার নেই।" : "You do not have permission to view POS shifts."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white flex items-center gap-2.5">
            <Clock className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
            <span>{isBn ? "POS ক্যাশ রেজিস্টার ও শিফট হিসেব" : "POS Register & Shifts"}</span>
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {isBn
              ? "ক্যাশিয়ার শিফট শুরু (Opening Float), ক্যাশ/কার্ড/MFS সেলস ট্র্যাকিং এবং ক্লোজিং ক্যাশ ড্রয়ার রিকনসিলিয়েশন।"
              : "Track cashier register sessions, opening cash floats, tender breakdowns, and end-of-day discrepancy reconciliation."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetchCurrent();
              refetchList();
            }}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>{isBn ? "রিফ্রেশ" : "Refresh"}</span>
          </Button>

          {currentShift ? (
            <Button
              onClick={() => setCloseModal(true)}
              className="gap-2 bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
            >
              <Lock className="h-4 w-4" />
              <span>{isBn ? "বর্তমান শিফট ক্লোজ করুন" : "Close Current Shift"}</span>
            </Button>
          ) : (
            <Button
              onClick={() => setOpenModal(true)}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
            >
              <Unlock className="h-4 w-4" />
              <span>{isBn ? "নতুন শিফট শুরু করুন" : "Open Register Shift"}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Active Shift Card */}
      {currentShift && (
        <Card className="border-indigo-200 dark:border-indigo-900 bg-gradient-to-r from-indigo-50/50 to-blue-50/30 dark:from-indigo-950/20 dark:to-blue-950/10 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                </span>
                <CardTitle className="text-base font-bold text-zinc-900 dark:text-white">
                  {isBn ? "সক্রিয় ক্যাশিয়ার শিফট চালু আছে" : "Active Register Session in Progress"}
                </CardTitle>
              </div>
              <span className="text-xs text-zinc-500 font-mono">
                {isBn ? "চালুর সময়: " : "Opened: "}
                {new Date(currentShift.openedAt).toLocaleTimeString()}
              </span>
            </div>
            <CardDescription className="text-xs">
              {isBn ? `ক্যাশিয়ার: ${currentShift.cashierName} (টার্মিনাল: ${currentShift.terminalId})` : `Cashier: ${currentShift.cashierName} (${currentShift.terminalId})`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200/80 dark:border-zinc-800">
                <div className="text-xs text-zinc-500 font-medium">{isBn ? "ওপেনিং ক্যাশ" : "Opening Float"}</div>
                <div className="text-lg font-bold text-zinc-900 dark:text-white mt-0.5">
                  ৳{currentShift.openingFloat?.toLocaleString()}
                </div>
              </div>
              <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200/80 dark:border-zinc-800">
                <div className="text-xs text-zinc-500 font-medium">{isBn ? "ক্যাশ বিক্রয়" : "Cash Sales"}</div>
                <div className="text-lg font-bold text-emerald-600 mt-0.5">
                  +৳{currentShift.totalCashSales?.toLocaleString()}
                </div>
              </div>
              <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200/80 dark:border-zinc-800">
                <div className="text-xs text-zinc-500 font-medium">{isBn ? "কার্ড ও MFS" : "Card & Digital"}</div>
                <div className="text-lg font-bold text-blue-600 mt-0.5">
                  ৳{(currentShift.totalCardSales + currentShift.totalMfsSales)?.toLocaleString()}
                </div>
              </div>
              <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200/80 dark:border-zinc-800">
                <div className="text-xs text-zinc-500 font-medium">{isBn ? "প্রত্যাশিত ক্যাশ" : "Expected Cash"}</div>
                <div className="text-lg font-bold text-indigo-600 mt-0.5">
                  ৳{(currentShift.openingFloat + currentShift.totalCashSales - currentShift.totalRefunds)?.toLocaleString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historical Shifts Table */}
      <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm">
        <CardHeader className="p-4 border-b border-zinc-100 dark:border-zinc-800">
          <CardTitle className="text-base font-semibold">{isBn ? "শিফট হিস্ট্রি ও অডিট" : "Register Shift History"}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-xs uppercase text-zinc-500 font-semibold border-b border-zinc-200/80 dark:border-zinc-800">
                <tr>
                  <th className="px-4 py-3">{isBn ? "তারিখ" : "Date"}</th>
                  <th className="px-4 py-3">{isBn ? "ক্যাশিয়ার" : "Cashier"}</th>
                  <th className="px-4 py-3 text-right">{isBn ? "ওপেনিং ফ্লট" : "Opening Float"}</th>
                  <th className="px-4 py-3 text-right">{isBn ? "ক্যাশ বিক্রয়" : "Cash Sales"}</th>
                  <th className="px-4 py-3 text-right">{isBn ? "প্রত্যাশিত ক্যাশ" : "Expected Cash"}</th>
                  <th className="px-4 py-3 text-right">{isBn ? "প্রকৃত ক্যাশ" : "Actual Cash"}</th>
                  <th className="px-4 py-3 text-right">{isBn ? "গরমিল (Discrepancy)" : "Discrepancy"}</th>
                  <th className="px-4 py-3">{isBn ? "স্ট্যাটাস" : "Status"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-zinc-400">
                      {isBn ? "লোড হচ্ছে..." : "Loading shift logs..."}
                    </td>
                  </tr>
                ) : shifts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-zinc-400">
                      <Clock className="h-8 w-8 mx-auto mb-2 text-zinc-300" />
                      <p className="text-sm">{isBn ? "কোনো শিফট লগ পাওয়া যায়নি" : "No register shift records found"}</p>
                    </td>
                  </tr>
                ) : (
                  shifts.map((s) => {
                    const disc = s.cashDiscrepancy ?? 0;
                    return (
                      <tr key={s._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                        <td className="px-4 py-3 text-xs text-zinc-500 whitespace-nowrap">
                          {new Date(s.openedAt).toLocaleDateString()} {new Date(s.openedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                          {s.cashierName}
                        </td>
                        <td className="px-4 py-3 text-right text-xs text-zinc-600 dark:text-zinc-400">
                          ৳{s.openingFloat?.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-emerald-600">
                          ৳{s.totalCashSales?.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right text-xs text-zinc-600 dark:text-zinc-400">
                          ৳{s.expectedClosingCash?.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-zinc-900 dark:text-zinc-100">
                          {s.actualClosingCash != null ? `৳${s.actualClosingCash.toLocaleString()}` : "—"}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-xs">
                          {s.actualClosingCash != null ? (
                            <span className={disc === 0 ? "text-emerald-600" : disc > 0 ? "text-blue-600" : "text-rose-600"}>
                              {disc > 0 ? `+৳${disc.toLocaleString()}` : disc < 0 ? `-৳${Math.abs(disc).toLocaleString()}` : "৳0.00 (Match)"}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium capitalize ${
                              s.status === "open"
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                                : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Open Shift Modal */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="sm:max-w-[420px]">
          <form onSubmit={handleOpenShift}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-indigo-600" />
                <span>{isBn ? "ক্যাশ রেজিস্টার শিফট চালু করুন" : "Open Register Shift"}</span>
              </DialogTitle>
              <DialogDescription>
                {isBn
                  ? "কাউন্টারে ক্যাশ ড্রয়ারে রাখা প্রারম্ভিক ক্যাশ (Opening Float) লিখুন।"
                  : "Enter the starting cash drawer float to begin sales for this session."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label>{isBn ? "প্রারম্ভিক ক্যাশ ফ্লট (৳) *" : "Opening Cash Float (৳) *"}</Label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={openingFloat}
                  onChange={(e) => setOpeningFloat(e.target.value)}
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenModal(false)}>
                {isBn ? "বাতিল" : "Cancel"}
              </Button>
              <Button type="submit" disabled={isOpening} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {isOpening ? (isBn ? "চালু হচ্ছে..." : "Opening...") : isBn ? "শিফট শুরু করুন" : "Start Shift"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Close Shift Modal */}
      <Dialog open={closeModal} onOpenChange={setCloseModal}>
        <DialogContent className="sm:max-w-[450px]">
          <form onSubmit={handleCloseShift}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-amber-600" />
                <span>{isBn ? "ক্যাশ রেজিস্টার সমাপ্তি ও রিকনসিলিয়েশন" : "Close Register & Reconcile"}</span>
              </DialogTitle>
              <DialogDescription>
                {isBn
                  ? "ক্যাশ ড্রয়ার গুনে প্রাপ্ত প্রকৃত নগদ টাকার পরিমাণ লিখুন।"
                  : "Count your actual cash drawer money and record any session discrepancies."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {currentShift && (
                <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-800 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">{isBn ? "ওপেনিং ক্যাশ:" : "Opening Float:"}</span>
                    <span className="font-semibold">৳{currentShift.openingFloat?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">{isBn ? "মোট নগদ বিক্রয়:" : "Cash Sales:"}</span>
                    <span className="font-semibold text-emerald-600">+৳{currentShift.totalCashSales?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-zinc-200 dark:border-zinc-800 font-bold">
                    <span>{isBn ? "প্রত্যাশিত সমাপনী ক্যাশ:" : "Expected Cash in Drawer:"}</span>
                    <span className="text-indigo-600">৳{(currentShift.openingFloat + currentShift.totalCashSales - currentShift.totalRefunds)?.toLocaleString()}</span>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label>{isBn ? "গণনাকৃত প্রকৃত নগদ টাকা (৳) *" : "Counted Cash Drawer Money (৳) *"}</Label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={actualClosingCash}
                  onChange={(e) => setActualClosingCash(e.target.value)}
                  placeholder="Counted cash in drawer"
                  required
                />
              </div>

              {actualClosingCash !== "" && currentShift && (
                <div className="p-2.5 rounded bg-zinc-100 dark:bg-zinc-800 text-xs flex justify-between items-center">
                  <span>{isBn ? "ক্যাশ পার্থক্য (গরমিল):" : "Discrepancy:"}</span>
                  <span className={`font-bold ${
                    Number(actualClosingCash) - (currentShift.openingFloat + currentShift.totalCashSales - currentShift.totalRefunds) === 0
                      ? "text-emerald-600"
                      : "text-rose-600"
                  }`}>
                    {Number(actualClosingCash) - (currentShift.openingFloat + currentShift.totalCashSales - currentShift.totalRefunds) === 0
                      ? "৳0.00 (Exact Match)"
                      : `৳${(Number(actualClosingCash) - (currentShift.openingFloat + currentShift.totalCashSales - currentShift.totalRefunds)).toLocaleString()}`}
                  </span>
                </div>
              )}

              <div className="space-y-1.5">
                <Label>{isBn ? "ক্লোজিং নোট" : "Closing Remarks"}</Label>
                <Input
                  value={closingNotes}
                  onChange={(e) => setClosingNotes(e.target.value)}
                  placeholder="e.g. Shift handed over to Evening staff"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCloseModal(false)}>
                {isBn ? "বাতিল" : "Cancel"}
              </Button>
              <Button type="submit" disabled={isClosing} className="bg-amber-600 hover:bg-amber-700 text-white">
                {isClosing ? (isBn ? "ক্লোজ হচ্ছে..." : "Closing...") : isBn ? "শিফট সমাপ্ত করুন" : "Finalize & Close Shift"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
