"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useGetStoreBySlugQuery } from "@/redux/api/store-api";
import {
  useGetAccountsQuery,
  useCreateAccountMutation,
  useGetJournalEntriesQuery,
  usePostJournalEntryMutation,
} from "@/redux/api/accounting-api";
import { useLanguage } from "@/providers/language-provider";
import { useHasPermission } from "@/features/session/hooks";
import {
  BookOpen,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
  Scale,
  FileSpreadsheet,
  CheckCircle2,
  ShieldAlert,
  Loader2,
  DollarSign,
  Landmark,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AccountingPage() {
  const params = useParams();
  const storeSlug = String(params.storeSlug);
  const { data: storeData } = useGetStoreBySlugQuery(storeSlug, { skip: !storeSlug });
  const store = storeData?.data?.store;
  const storeId = store?._id ?? "";

  const { language } = useLanguage();
  const isBn = false;

  const [activeTab, setActiveTab] = useState("accounts");
  const [accountModal, setAccountModal] = useState(false);
  const [journalModal, setJournalModal] = useState(false);

  // Form for New Account
  const [accCode, setAccCode] = useState("");
  const [accName, setAccName] = useState("");
  const [accType, setAccType] = useState("asset");

  // Form for New Journal Entry
  const [debitAccId, setDebitAccId] = useState("");
  const [creditAccId, setCreditAccId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const hasAccess = useHasPermission("accounting:read");

  const { data: accountsData, isLoading: loadingAccounts, refetch: refetchAccounts, isError: accountsError } = useGetAccountsQuery(
    { storeId },
    { skip: !storeId }
  );

  const { data: journalData, isLoading: loadingJournal, refetch: refetchJournal, isError: journalError } = useGetJournalEntriesQuery(
    { storeId, limit: 30 },
    { skip: !storeId }
  );

  const [createAccount, { isLoading: isCreatingAcc }] = useCreateAccountMutation();
  const [postJournal, { isLoading: isPostingJournal }] = usePostJournalEntryMutation();

  const accounts = accountsData?.data?.accounts ?? [];
  const entries = journalData?.data?.entries ?? [];

  const metrics = {
    totalAccounts: accounts.length,
    totalEntries: entries.length,
    assetSum: accounts.filter((a) => a.type === "asset").reduce((s, a) => s + (a.currentBalance || 0), 0),
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accCode.trim() || !accName.trim()) return;

    try {
      await createAccount({
        storeId,
        body: { code: accCode.trim(), name: accName.trim(), type: accType },
      }).unwrap();
      toast.success(isBn ? "হিসাব অ্যাকাউন্ট তৈরি হয়েছে" : "Account created");
      setAccountModal(false);
      setAccCode("");
      setAccName("");
      refetchAccounts();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create account");
    }
  };

  const handlePostJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(amount);
    if (!debitAccId || !creditAccId || num <= 0) {
      toast.error(isBn ? "সঠিক ডেবিট ও ক্রেডিট হিসাব এবং টাকার পরিমাণ দিন" : "Please select debit & credit accounts and enter valid amount");
      return;
    }

    try {
      await postJournal({
        storeId,
        body: {
          reference: "MANUAL-JE",
          notes: description || "Manual double-entry adjustment",
          lines: [
            { accountId: debitAccId, debit: num, credit: 0, description },
            { accountId: creditAccId, debit: 0, credit: num, description },
          ],
        },
      }).unwrap();

      toast.success(isBn ? "জার্নাল এন্ট্রি সফলভাবে পোস্টিং হয়েছে" : "Journal entry posted successfully");
      setJournalModal(false);
      setAmount("");
      setDescription("");
      refetchJournal();
      refetchAccounts();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to post journal entry");
    }
  };

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <ShieldAlert className="h-10 w-10 text-rose-500" />
        <h2 className="mt-4 text-lg font-bold">{isBn ? "অনুমতি নেই" : "Access Denied"}</h2>
        <p className="text-xs text-zinc-500 mt-1">
          {isBn ? "হিসাব বিজ্ঞান দেখার অনুমতি নেই।" : "You do not have permission to view accounting records."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StorePageHeader
        title="Double-Entry Accounting & Ledger"
        description="Auditable Chart of Accounts (COA) and strict double-entry general journal with balanced debit & credit validation."
        breadcrumbs={[
          { label: "Dashboard", href: store ? `/store/${store.slug}/dashboard` : "#" },
          { label: "Finance" },
          { label: "Accounting" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                refetchAccounts();
                refetchJournal();
              }}
              className="gap-1.5 text-xs font-semibold cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Refresh</span>
            </Button>
            <Button
              onClick={() => setAccountModal(true)}
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs font-semibold cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>+ Account</span>
            </Button>
            <Button
              onClick={() => setJournalModal(true)}
              size="sm"
              className="gap-1.5 bg-[#003399] hover:bg-[#002B80] text-white text-xs font-bold shadow-2xs cursor-pointer"
            >
              <Scale className="h-4 w-4" />
              <span>+ Journal Entry</span>
            </Button>
          </div>
        }
      />

      {/* ── Metric Summary ─────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          title="Total Ledger Accounts"
          value={metrics.totalAccounts}
          subtitle="Chart of accounts nodes"
          icon={Landmark}
          iconClassName="text-blue-600 bg-blue-50 dark:bg-blue-950/30"
        />

        <MetricCard
          title="Total Journal Entries"
          value={metrics.totalEntries}
          subtitle="Posted double-entry transactions"
          icon={FileSpreadsheet}
          iconClassName="text-purple-600 bg-purple-50 dark:bg-purple-950/30"
        />

        <MetricCard
          title="Recorded Current Assets (BDT)"
          value={`৳${metrics.assetSum.toLocaleString()}`}
          subtitle="Active asset account balances"
          icon={DollarSign}
          iconClassName="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30"
        />
      </div>

      <StorePageCard>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <TabsList className="grid w-full grid-cols-2 max-w-xs">
              <TabsTrigger value="accounts" className="text-xs">Chart of Accounts</TabsTrigger>
              <TabsTrigger value="journal" className="text-xs">Journal Entries</TabsTrigger>
            </TabsList>
          </div>

          {/* Tab 1: Chart of Accounts */}
          <TabsContent value="accounts" className="mt-4">
            {loadingAccounts ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-[#003399]" />
              </div>
            ) : accountsError ? (
              <ErrorState title="Failed to load accounts" onRetry={refetchAccounts} />
            ) : accounts.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="No accounts in Chart of Accounts"
                description="Add initial asset, liability, revenue, or expense accounts to begin posting."
                action={
                  <Button
                    onClick={() => setAccountModal(true)}
                    size="sm"
                    className="bg-[#003399] text-white hover:bg-[#002B80] text-xs font-bold cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Create Account
                  </Button>
                }
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Code</th>
                      <th className="py-3 px-4">Account Name</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4 text-right">Balance (BDT)</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800">
                    {accounts.map((acc) => (
                      <tr key={acc._id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-zinc-900 dark:text-zinc-100">{acc.code}</td>
                        <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-100">{acc.name}</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-bold uppercase text-zinc-600 dark:text-zinc-400">
                            {acc.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-zinc-900 dark:text-zinc-100">
                          ৳{(acc.currentBalance || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant="success">Active</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          {/* Tab 2: Journal Entries */}
          <TabsContent value="journal" className="mt-4">
            {loadingJournal ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-[#003399]" />
              </div>
            ) : journalError ? (
              <ErrorState title="Failed to load journal entries" onRetry={refetchJournal} />
            ) : entries.length === 0 ? (
              <EmptyState
                icon={Scale}
                title="No journal entries posted"
                description="Double-entry debit and credit entries will be recorded in this permanent ledger."
                action={
                  <Button
                    onClick={() => setJournalModal(true)}
                    size="sm"
                    className="bg-[#003399] text-white hover:bg-[#002B80] text-xs font-bold cursor-pointer"
                  >
                    <Scale className="h-3.5 w-3.5 mr-1" />
                    Post Journal Entry
                  </Button>
                }
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Reference</th>
                      <th className="py-3 px-4">Description / Notes</th>
                      <th className="py-3 px-4 text-right">Debit (BDT)</th>
                      <th className="py-3 px-4 text-right">Credit (BDT)</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800">
                    {entries.map((entry) => {
                      const totalDebit = entry.lines?.reduce((s: number, l: any) => s + (l.debit || 0), 0) || 0;
                      const totalCredit = entry.lines?.reduce((s: number, l: any) => s + (l.credit || 0), 0) || 0;
                      return (
                        <tr key={entry._id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                          <td className="py-3 px-4 font-mono text-zinc-500">
                            {new Date(entry.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                            {entry.entryNumber || entry.reference || "JE"}
                          </td>
                          <td className="py-3 px-4 text-zinc-700 dark:text-zinc-300">
                            {entry.notes || "General Journal Entry"}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            ৳{totalDebit.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-blue-600 dark:text-blue-400">
                            ৳{totalCredit.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge variant="success">Posted</Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </StorePageCard>

      {/* ── Add Account Modal ─────────────────────────────────── */}
      <Dialog open={accountModal} onOpenChange={setAccountModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isBn ? "নতুন অ্যাকাউন্ট তৈরি করুন" : "Add COA Account"}</DialogTitle>
            <DialogDescription>
              {isBn ? "চার্ট অব অ্যাকাউন্টসে নতুন লেজার কোড যুক্ত করুন।" : "Create a new balance-sheet or P&L ledger account."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateAccount} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>{isBn ? "অ্যাকাউন্ট কোড *" : "Account Code *"}</Label>
              <Input
                value={accCode}
                onChange={(e) => setAccCode(e.target.value)}
                placeholder="e.g. 1010, 2010, 4010"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label>{isBn ? "অ্যাকাউন্টের নাম *" : "Account Name *"}</Label>
              <Input
                value={accName}
                onChange={(e) => setAccName(e.target.value)}
                placeholder="e.g. Cash in Hand, Bank Account"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label>{isBn ? "হিসাবের ধরন" : "Account Type"}</Label>
              <Select value={accType} onValueChange={setAccType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asset">Asset (সম্পদ)</SelectItem>
                  <SelectItem value="liability">Liability (দায়)</SelectItem>
                  <SelectItem value="equity">Equity (মূলধন / ইকুইটি)</SelectItem>
                  <SelectItem value="revenue">Revenue (রাজস্ব / আয়)</SelectItem>
                  <SelectItem value="expense">Expense (ব্যয় / খরচ)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setAccountModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCreatingAcc} className="bg-[#003399] hover:bg-[#002B80] text-white font-bold">
                {isCreatingAcc ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                <span>Create Account</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Post Journal Modal ────────────────────────────────── */}
      <Dialog open={journalModal} onOpenChange={setJournalModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{isBn ? "দ্বৈত দাখিলা জার্নাল এন্ট্রি" : "Post Double-Entry Journal"}</DialogTitle>
            <DialogDescription>
              {isBn ? "সুষম ডেবিট ও ক্রেডিট হিসাব পোস্টিং করুন।" : "Record balanced debit and credit transactions across ledger accounts."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handlePostJournal} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-emerald-700 dark:text-emerald-400 font-bold">Debit Account *</Label>
                <Select value={debitAccId} onValueChange={setDebitAccId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select debit" />
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
                <Label className="text-blue-700 dark:text-blue-400 font-bold">Credit Account *</Label>
                <Select value={creditAccId} onValueChange={setCreditAccId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select credit" />
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

            <div className="space-y-1.5">
              <Label>Amount (BDT) *</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="5000"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label>Notes &amp; Particulars</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Reason or transaction memo..."
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setJournalModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPostingJournal} className="bg-[#003399] hover:bg-[#002B80] text-white font-bold">
                {isPostingJournal ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                <span>Post Journal</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
