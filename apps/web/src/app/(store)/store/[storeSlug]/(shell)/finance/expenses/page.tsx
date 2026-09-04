"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useGetStoreBySlugQuery } from "@/redux/api/store-api";
import {
  useGetExpensesQuery,
  useCreateExpenseMutation,
  useGetAccountsQuery,
} from "@/redux/api/accounting-api";
import { useLanguage } from "@/providers/language-provider";
import { useHasPermission } from "@/features/session/hooks";
import {
  Receipt,
  Plus,
  TrendingDown,
  Filter,
  RefreshCw,
  CreditCard,
  Building,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function ExpensesPage() {
  const params = useParams();
  const storeSlug = String(params.storeSlug);
  const { data: storeData } = useGetStoreBySlugQuery(storeSlug, { skip: !storeSlug });
  const store = storeData?.data?.store;
  const storeId = store?._id ?? "";

  const { language } = useLanguage();
  const isBn = false;

  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Rent & Utilities");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [vendor, setVendor] = useState("");
  const [notes, setNotes] = useState("");
  const [paidFromAccId, setPaidFromAccId] = useState("");
  const [expenseAccId, setExpenseAccId] = useState("");

  const hasAccess = useHasPermission("accounting:read");

  const { data: expData, isLoading, refetch } = useGetExpensesQuery(
    {
      storeId,
      page,
      limit: 20,
      category: categoryFilter !== "all" ? categoryFilter : undefined,
    },
    { skip: !storeId }
  );

  const { data: accountsData } = useGetAccountsQuery({ storeId }, { skip: !storeId || !isModalOpen });

  const [createExpense, { isLoading: isCreating }] = useCreateExpenseMutation();

  const expenses = expData?.data?.expenses ?? [];
  const totalSpent = expData?.data?.totalSpent ?? 0;
  const total = expData?.data?.total ?? 0;
  const accounts = accountsData?.data?.accounts ?? [];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(amount);
    if (!title.trim() || num <= 0) {
      toast.error(isBn ? "শিরোনাম এবং খরচের পরিমাণ দিন" : "Title and amount are required");
      return;
    }

    try {
      await createExpense({
        storeId,
        body: {
          title: title.trim(),
          category,
          amount: num,
          paymentMethod,
          vendor: vendor.trim() || undefined,
          notes: notes.trim() || undefined,
          paidFromAccountId: paidFromAccId || undefined,
          expenseAccountId: expenseAccId || undefined,
        },
      }).unwrap();

      toast.success(isBn ? "ব্যয় সফলভাবে রেকর্ড করা হয়েছে" : "Expense recorded successfully");
      setIsModalOpen(false);
      setTitle("");
      setAmount("");
      setVendor("");
      setNotes("");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to record expense");
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
            <Receipt className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
            <span>{isBn ? "ব্যয় ও খরচ ট্র্যাকার (Expense Management)" : "Expense Management"}</span>
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {isBn
              ? "ভাড়া, ইউটিলিটি, প্যাকেজিং, বিপণন ও বিবিধ ব্যবসায়িক পরিচালন ব্যয়ের সুশৃঙ্খল হিসেব।"
              : "Track operating expenditures, categorize costs, attach vendors, and auto-post into general ledger."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            <span>{isBn ? "রিফ্রেশ" : "Refresh"}</span>
          </Button>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>{isBn ? "নতুন ব্যয় যোগ করুন" : "Record Expense"}</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500 flex items-center justify-between">
              <span>{isBn ? "সর্বমোট ব্যয়" : "Total Operating Expenses"}</span>
              <TrendingDown className="h-4 w-4 text-rose-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              ৳{totalSpent.toLocaleString()}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              {isBn ? "মোট রেকর্ডকৃত খরচের পরিমাণ" : "Total spent across all categories"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500 flex items-center justify-between">
              <span>{isBn ? "মোট খরচের ভাউচার" : "Recorded Vouchers"}</span>
              <Receipt className="h-4 w-4 text-zinc-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-white">
              {total}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              {isBn ? "টি খরচের রেকর্ড" : "expense voucher entries"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500 flex items-center justify-between">
              <span>{isBn ? "গড় খরচ প্রতি ভাউচার" : "Average / Voucher"}</span>
              <CreditCard className="h-4 w-4 text-zinc-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-white">
              ৳{total > 0 ? (totalSpent / total).toFixed(2) : "0.00"}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              {isBn ? "গড় খরচের পরিমাণ" : "Average expenditure per entry"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Expenses Table */}
      <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm">
        <CardHeader className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <Filter className="h-4 w-4 text-zinc-400" />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px] h-9 text-xs">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isBn ? "সমস্ত ক্যাটাগরি" : "All Categories"}</SelectItem>
                <SelectItem value="Rent & Utilities">{isBn ? "ভাড়া ও ইউটিলিটি" : "Rent & Utilities"}</SelectItem>
                <SelectItem value="Marketing & Advertising">{isBn ? "বিপণন ও বিজ্ঞাপন" : "Marketing & Ads"}</SelectItem>
                <SelectItem value="Packaging & Supplies">{isBn ? "প্যাকেজিং ও সরবরাহ" : "Packaging & Supplies"}</SelectItem>
                <SelectItem value="Delivery & Courier Fees">{isBn ? "ডেলিভারি ও কুরিয়ার খরচ" : "Delivery Fees"}</SelectItem>
                <SelectItem value="Salaries & Wages">{isBn ? "বেতন ও মজুরি" : "Salaries & Wages"}</SelectItem>
                <SelectItem value="Other">{isBn ? "অন্যান্য পরিচালন ব্যয়" : "Other Operating"}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-xs uppercase text-zinc-500 font-semibold border-b border-zinc-200/80 dark:border-zinc-800">
                <tr>
                  <th className="px-4 py-3">{isBn ? "তারিখ" : "Date"}</th>
                  <th className="px-4 py-3">{isBn ? "ভাউচার #" : "Voucher #"}</th>
                  <th className="px-4 py-3">{isBn ? "শিরোনাম ও বিবরণ" : "Title & Details"}</th>
                  <th className="px-4 py-3">{isBn ? "ক্যাটাগরি" : "Category"}</th>
                  <th className="px-4 py-3">{isBn ? "পেমেন্ট মাধ্যম" : "Payment Method"}</th>
                  <th className="px-4 py-3 text-right">{isBn ? "পরিমাণ (৳)" : "Amount (BDT)"}</th>
                  <th className="px-4 py-3">{isBn ? "রেকর্ডকারী" : "Recorded By"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-zinc-400">
                      {isBn ? "লোড হচ্ছে..." : "Loading expenses..."}
                    </td>
                  </tr>
                ) : expenses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-zinc-400">
                      <Receipt className="h-8 w-8 mx-auto mb-2 text-zinc-300" />
                      <p className="text-sm">{isBn ? "কোনো ব্যয় রেকর্ড পাওয়া যায়নি" : "No expense records found"}</p>
                    </td>
                  </tr>
                ) : (
                  expenses.map((exp) => (
                    <tr key={exp._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                      <td className="px-4 py-3 text-xs text-zinc-500 whitespace-nowrap">
                        {new Date(exp.expenseDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-xs text-zinc-700 dark:text-zinc-300">
                        {exp.expenseNumber}
                      </td>
                      <td className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-100">
                        <div>{exp.title}</div>
                        {exp.vendor && <div className="text-[11px] text-zinc-400">Vendor: {exp.vendor}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400">
                          {exp.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs capitalize text-zinc-600 dark:text-zinc-400">
                        {exp.paymentMethod}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-rose-600">
                        ৳{exp.totalAmount?.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-500">
                        {exp.recordedBy}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Record Expense Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-indigo-600" />
                <span>{isBn ? "নতুন ব্যয় রেকর্ড করুন" : "Record Operating Expense"}</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3.5 py-3">
              <div className="space-y-1">
                <Label>{isBn ? "খরচের শিরোনাম *" : "Expense Title *"}</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Office Rent for Month" required />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>{isBn ? "ক্যাটাগরি" : "Category"}</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Rent & Utilities">{isBn ? "ভাড়া ও ইউটিলিটি" : "Rent & Utilities"}</SelectItem>
                      <SelectItem value="Marketing & Advertising">{isBn ? "বিপণন ও বিজ্ঞাপন" : "Marketing & Ads"}</SelectItem>
                      <SelectItem value="Packaging & Supplies">{isBn ? "প্যাকেজিং ও সরবরাহ" : "Packaging & Supplies"}</SelectItem>
                      <SelectItem value="Delivery & Courier Fees">{isBn ? "ডেলিভারি খরচ" : "Delivery Fees"}</SelectItem>
                      <SelectItem value="Salaries & Wages">{isBn ? "বেতন ও মজুরি" : "Salaries & Wages"}</SelectItem>
                      <SelectItem value="Other">{isBn ? "অন্যান্য" : "Other"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label>{isBn ? "টাকার পরিমাণ (৳) *" : "Amount (৳) *"}</Label>
                  <Input type="number" min="1" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>{isBn ? "পেমেন্ট মাধ্যম" : "Payment Method"}</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="bkash">bKash</SelectItem>
                      <SelectItem value="nagad">Nagad</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label>{isBn ? "ভেন্ডর / প্রাপক" : "Vendor / Payee"}</Label>
                  <Input value={vendor} onChange={(e) => setVendor(e.target.value)} placeholder="e.g. Building Landlord" />
                </div>
              </div>

              <div className="space-y-1">
                <Label>{isBn ? "নোট" : "Notes"}</Label>
                <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Cheque # 10492" />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>{isBn ? "বাতিল" : "Cancel"}</Button>
              <Button type="submit" disabled={isCreating} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {isCreating ? (isBn ? "সংরক্ষণ হচ্ছে..." : "Saving...") : isBn ? "ব্যয় সংরক্ষণ করুন" : "Save Expense"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
