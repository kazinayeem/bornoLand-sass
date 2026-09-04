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
  RefreshCw,
  CreditCard,
  Building,
  ShieldAlert,
  DollarSign,
  Loader2,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StorePageHeader } from "@/components/store-dashboard/store-page-header";
import { StorePageCard } from "@/components/store-dashboard/store-page";
import { MetricCard } from "@/components/ui/metric-card";
import { Badge } from "@/components/ui/badge";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
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
import { cn } from "@/lib/utils";

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

  const { data: expData, isLoading, refetch, isError } = useGetExpensesQuery(
    {
      storeId,
      page,
      limit: 30,
      category: categoryFilter !== "all" ? categoryFilter : undefined,
    },
    { skip: !storeId }
  );

  const { data: accountsData } = useGetAccountsQuery({ storeId }, { skip: !storeId || !isModalOpen });

  const [createExpense, { isLoading: isCreating }] = useCreateExpenseMutation();

  const expenses = expData?.data?.expenses ?? [];
  const totalSpent = expData?.data?.totalSpent ?? 0;
  const total = expData?.data?.total ?? expenses.length;
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
        <h2 className="mt-4 text-lg font-bold">{isBn ? "অনুমতি নেই" : "Access Denied"}</h2>
        <p className="text-xs text-zinc-500 mt-1">
          {isBn ? "ব্যয় তালিকা দেখার অনুমতি নেই।" : "You do not have permission to view expenses."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StorePageHeader
        title="Expense Management & Operating Costs"
        description="Track operating expenditures, categorize costs, attach vendors, and auto-post into general ledger."
        breadcrumbs={[
          { label: "Dashboard", href: store ? `/store/${store.slug}/dashboard` : "#" },
          { label: "Finance" },
          { label: "Expenses" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5 text-xs font-semibold cursor-pointer">
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Refresh</span>
            </Button>
            <Button
              onClick={() => setIsModalOpen(true)}
              size="sm"
              className="gap-1.5 bg-[#003399] hover:bg-[#002B80] text-white text-xs font-bold shadow-2xs cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Record Expense</span>
            </Button>
          </div>
        }
      />

      {/* ── KPI Cards ─────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          title="Total Operating Expenses (BDT)"
          value={`৳${totalSpent.toLocaleString()}`}
          subtitle="All recorded expenditure"
          icon={TrendingDown}
          iconClassName="text-rose-600 bg-rose-50 dark:bg-rose-950/30"
        />

        <MetricCard
          title="Recorded Vouchers"
          value={total}
          subtitle="Expense entries"
          icon={Receipt}
          iconClassName="text-blue-600 bg-blue-50 dark:bg-blue-950/30"
        />

        <MetricCard
          title="Average Expense Size"
          value={`৳${total > 0 ? Math.round(totalSpent / total).toLocaleString() : "0"}`}
          subtitle="Per recorded voucher"
          icon={DollarSign}
          iconClassName="text-purple-600 bg-purple-50 dark:bg-purple-950/30"
        />
      </div>

      {/* ── Expense Records Table ─────────────────────────────── */}
      <StorePageCard>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-[#003399] dark:text-[#FFDA1A]" />
            <span className="text-sm font-bold text-zinc-950 dark:text-white">Expense Vouchers</span>
          </div>

          <div className="flex items-center gap-2">
            <Select value={categoryFilter} onValueChange={(val) => { setCategoryFilter(val); setPage(1); }}>
              <SelectTrigger className="w-44 h-8 text-xs">
                <SelectValue placeholder="Category filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Rent & Utilities">Rent &amp; Utilities</SelectItem>
                <SelectItem value="Packaging & Delivery">Packaging &amp; Delivery</SelectItem>
                <SelectItem value="Marketing & Ads">Marketing &amp; Ads</SelectItem>
                <SelectItem value="Office & Supplies">Office &amp; Supplies</SelectItem>
                <SelectItem value="Staff & Refreshment">Staff &amp; Refreshment</SelectItem>
                <SelectItem value="Software & Tools">Software &amp; Tools</SelectItem>
                <SelectItem value="Miscellaneous">Miscellaneous</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-[#003399]" />
            </div>
          ) : isError ? (
            <ErrorState
              title="Unable to load expenses"
              message="Check your network connection"
              onRetry={refetch}
            />
          ) : expenses.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No expenses recorded"
              description="Record recurring or one-off operational costs to keep your financial ledger balanced."
              action={
                <Button
                  onClick={() => setIsModalOpen(true)}
                  size="sm"
                  className="bg-[#003399] text-white hover:bg-[#002B80] text-xs font-bold cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Record Expense
                </Button>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Title / Particulars</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Vendor</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4 text-right">Amount (BDT)</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800">
                  {expenses.map((exp) => (
                    <tr
                      key={exp._id}
                      className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono text-zinc-500">
                        {new Date(exp.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-zinc-900 dark:text-zinc-100">{exp.title}</p>
                        {exp.notes && (
                          <p className="text-[11px] text-zinc-400 line-clamp-1">{exp.notes}</p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-xs text-zinc-700 dark:text-zinc-300">
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">
                        {exp.vendor || "—"}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-600 dark:text-zinc-300 uppercase">
                          <CreditCard className="h-3 w-3 text-zinc-400" />
                          {exp.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                        -৳{exp.amount?.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="success">Posted</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </StorePageCard>

      {/* ── Record Expense Modal ──────────────────────────────── */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isBn ? "ব্যয় রেকর্ড করুন" : "Record Operating Expense"}</DialogTitle>
            <DialogDescription>
              {isBn ? "খরচের বিবরণ ও অ্যাকাউন্ট পোস্টিং নির্ধারণ করুন।" : "Enter expense voucher details and optional accounting ledger linkage."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>{isBn ? "খরচের বিবরণ *" : "Expense Title *"}</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Shop Rent for September, Courier Bags"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{isBn ? "ক্যাটাগরি" : "Category"}</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Rent & Utilities">Rent &amp; Utilities</SelectItem>
                    <SelectItem value="Packaging & Delivery">Packaging &amp; Delivery</SelectItem>
                    <SelectItem value="Marketing & Ads">Marketing &amp; Ads</SelectItem>
                    <SelectItem value="Office & Supplies">Office &amp; Supplies</SelectItem>
                    <SelectItem value="Staff & Refreshment">Staff &amp; Refreshment</SelectItem>
                    <SelectItem value="Software & Tools">Software &amp; Tools</SelectItem>
                    <SelectItem value="Miscellaneous">Miscellaneous</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>{isBn ? "টাকার পরিমাণ (BDT) *" : "Amount (BDT) *"}</Label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="2500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{isBn ? "পেমেন্ট মাধ্যম" : "Payment Method"}</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash in Hand</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="mobile_banking">Mobile Banking (bKash/Nagad)</SelectItem>
                    <SelectItem value="card">Company Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>{isBn ? "ভেন্ডর / প্রাপক" : "Vendor / Payee"}</Label>
                <Input
                  value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
                  placeholder="e.g. Landlord, Paper Vendor"
                />
              </div>
            </div>

            {accounts.length > 0 && (
              <div className="grid grid-cols-2 gap-3 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-zinc-500">Paid From Account</Label>
                  <Select value={paidFromAccId} onValueChange={setPaidFromAccId}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Select asset" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((a) => (
                        <SelectItem key={a._id} value={a._id}>
                          {a.code} - {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[11px] text-zinc-500">Expense Account</Label>
                  <Select value={expenseAccId} onValueChange={setExpenseAccId}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Select ledger" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((a) => (
                        <SelectItem key={a._id} value={a._id}>
                          {a.code} - {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating} className="bg-[#003399] hover:bg-[#002B80] text-white font-bold">
                {isCreating ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                <span>Record Expense</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
