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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

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

  const { data: accountsData, isLoading: loadingAccounts, refetch: refetchAccounts } = useGetAccountsQuery(
    { storeId },
    { skip: !storeId }
  );

  const { data: journalData, isLoading: loadingJournal, refetch: refetchJournal } = useGetJournalEntriesQuery(
    { storeId, limit: 30 },
    { skip: !storeId }
  );

  const [createAccount, { isLoading: isCreatingAcc }] = useCreateAccountMutation();
  const [postJournal, { isLoading: isPostingJournal }] = usePostJournalEntryMutation();

  const accounts = accountsData?.data?.accounts ?? [];
  const entries = journalData?.data?.entries ?? [];

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
        <h2 className="mt-4 text-lg font-semibold">{isBn ? "অনুমতি নেই" : "Access Denied"}</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white flex items-center gap-2.5">
            <BookOpen className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
            <span>{isBn ? "দ্বৈত দাখিলা হিসাব বিজ্ঞান (Double-Entry Accounting)" : "Double-Entry Accounting & Ledger"}</span>
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {isBn
              ? "সম্পদ, দায়, ইকুইটি, রাজস্ব ও ব্যয়ের চার্ট অব অ্যাকাউন্টস এবং সম্পূর্ণ সুষম ডেবিট-ক্রেডিট জার্নাল লেজার।"
              : "Chart of Accounts (COA) and strict double-entry general journal with balanced debit & credit validation."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetchAccounts();
              refetchJournal();
            }}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>{isBn ? "রিফ্রেশ" : "Refresh"}</span>
          </Button>
          <Button onClick={() => setAccountModal(true)} variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            <span>{isBn ? "+ নতুন অ্যাকাউন্ট" : "+ Account"}</span>
          </Button>
          <Button onClick={() => setJournalModal(true)} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
            <Scale className="h-4 w-4" />
            <span>{isBn ? "+ জার্নাল এন্ট্রি" : "+ Journal Entry"}</span>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-sm mb-4">
          <TabsTrigger value="accounts">{isBn ? "চার্ট অব অ্যাকাউন্টস (COA)" : "Chart of Accounts"}</TabsTrigger>
          <TabsTrigger value="journal">{isBn ? "জার্নাল লেজার (Journal)" : "Journal Entries"}</TabsTrigger>
        </TabsList>

        {/* Tab 1: Chart of Accounts */}
        <TabsContent value="accounts">
          <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-xs uppercase text-zinc-500 font-semibold border-b border-zinc-200/80 dark:border-zinc-800">
                    <tr>
                      <th className="px-4 py-3">{isBn ? "অ্যাকাউন্ট কোড" : "Code"}</th>
                      <th className="px-4 py-3">{isBn ? "অ্যাকাউন্টের নাম" : "Account Name"}</th>
                      <th className="px-4 py-3">{isBn ? "হিসাবের ধরন" : "Account Type"}</th>
                      <th className="px-4 py-3 text-right">{isBn ? "বর্তমান ব্যালেন্স" : "Balance (BDT)"}</th>
                      <th className="px-4 py-3">{isBn ? "স্ট্যাটাস" : "Status"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800">
                    {loadingAccounts ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-zinc-400">
                          {isBn ? "লোড হচ্ছে..." : "Loading accounts..."}
                        </td>
                      </tr>
                    ) : accounts.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-zinc-400">
                          <BookOpen className="h-8 w-8 mx-auto mb-2 text-zinc-300" />
                          <p className="text-sm">{isBn ? "কোনো অ্যাকাউন্ট পাওয়া যায়নি" : "No accounts found"}</p>
                        </td>
                      </tr>
                    ) : (
                      accounts.map((acc) => (
                        <tr key={acc._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                          <td className="px-4 py-3 font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                            {acc.code}
                          </td>
                          <td className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-100">
                            {acc.name}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium capitalize ${
                                acc.type === "asset"
                                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                                  : acc.type === "liability"
                                  ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                                  : acc.type === "revenue"
                                  ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                                  : acc.type === "expense"
                                  ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                                  : "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400"
                              }`}
                            >
                              {acc.type}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-zinc-900 dark:text-white">
                            ৳{acc.currentBalance?.toLocaleString() || "0.00"}
                          </td>
                          <td className="px-4 py-3 text-xs text-zinc-500">
                            {acc.isSystem ? "System Canonical" : "Custom"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Journal Entries */}
        <TabsContent value="journal">
          <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-xs uppercase text-zinc-500 font-semibold border-b border-zinc-200/80 dark:border-zinc-800">
                    <tr>
                      <th className="px-4 py-3">{isBn ? "তারিখ" : "Date"}</th>
                      <th className="px-4 py-3">{isBn ? "জার্নাল ভাউচার #" : "Voucher #"}</th>
                      <th className="px-4 py-3">{isBn ? "উৎস" : "Source"}</th>
                      <th className="px-4 py-3">{isBn ? "হিসাব খাত (Lines)" : "Accounts Involved"}</th>
                      <th className="px-4 py-3 text-right">{isBn ? "মোট ডেবিট/ক্রেডিট" : "Total (BDT)"}</th>
                      <th className="px-4 py-3">{isBn ? "পোস্টেড বাই" : "Posted By"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800">
                    {loadingJournal ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-zinc-400">
                          {isBn ? "লোড হচ্ছে..." : "Loading journal..."}
                        </td>
                      </tr>
                    ) : entries.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-zinc-400">
                          <Scale className="h-8 w-8 mx-auto mb-2 text-zinc-300" />
                          <p className="text-sm">{isBn ? "কোনো জার্নাল এন্ট্রি নেই" : "No journal entries found"}</p>
                        </td>
                      </tr>
                    ) : (
                      entries.map((entry) => (
                        <tr key={entry._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                          <td className="px-4 py-3 text-xs text-zinc-500 whitespace-nowrap">
                            {new Date(entry.date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 font-mono font-bold text-xs text-zinc-800 dark:text-zinc-200">
                            {entry.entryNumber}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 capitalize">
                              {entry.source?.replace(/_/g, " ")}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs space-y-1">
                            {entry.lines.map((line, idx) => (
                              <div key={idx} className="flex items-center justify-between gap-4 font-mono text-[11px]">
                                <span className={line.debit > 0 ? "font-semibold text-zinc-900 dark:text-zinc-100" : "pl-4 text-zinc-500"}>
                                  {line.accountId?.name || "Account"}
                                </span>
                                <span className={line.debit > 0 ? "text-emerald-600 font-semibold" : "text-blue-600"}>
                                  {line.debit > 0 ? `Dr. ৳${line.debit.toLocaleString()}` : `Cr. ৳${line.credit.toLocaleString()}`}
                                </span>
                              </div>
                            ))}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-zinc-900 dark:text-white">
                            ৳{entry.totalAmount?.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-xs text-zinc-500">
                            {entry.postedBy}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Account Modal */}
      <Dialog open={accountModal} onOpenChange={setAccountModal}>
        <DialogContent className="sm:max-w-[420px]">
          <form onSubmit={handleCreateAccount}>
            <DialogHeader>
              <DialogTitle>{isBn ? "নতুন লেজার অ্যাকাউন্ট তৈরি করুন" : "Create General Ledger Account"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-3">
              <div className="space-y-1">
                <Label>{isBn ? "অ্যাকাউন্ট কোড *" : "Account Code *"}</Label>
                <Input value={accCode} onChange={(e) => setAccCode(e.target.value)} placeholder="e.g. 1060" required />
              </div>
              <div className="space-y-1">
                <Label>{isBn ? "অ্যাকাউন্টের নাম *" : "Account Name *"}</Label>
                <Input value={accName} onChange={(e) => setAccName(e.target.value)} placeholder="e.g. Office Equipment Asset" required />
              </div>
              <div className="space-y-1">
                <Label>{isBn ? "হিসাবের ধরন *" : "Account Type *"}</Label>
                <Select value={accType} onValueChange={setAccType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asset">{isBn ? "সম্পদ (Asset)" : "Asset"}</SelectItem>
                    <SelectItem value="liability">{isBn ? "দায় (Liability)" : "Liability"}</SelectItem>
                    <SelectItem value="equity">{isBn ? "মালিকানা স্বত্ব (Equity)" : "Equity"}</SelectItem>
                    <SelectItem value="revenue">{isBn ? "রাজস্ব ও বিক্রয় (Revenue)" : "Revenue"}</SelectItem>
                    <SelectItem value="expense">{isBn ? "ব্যয় (Expense)" : "Expense"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAccountModal(false)}>{isBn ? "বাতিল" : "Cancel"}</Button>
              <Button type="submit" disabled={isCreatingAcc} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {isBn ? "সংরক্ষণ করুন" : "Save Account"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Journal Entry Modal */}
      <Dialog open={journalModal} onOpenChange={setJournalModal}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handlePostJournal}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-indigo-600" />
                <span>{isBn ? "দ্বৈত দাখিলা জার্নাল ভাউচার পোস্টিং" : "Post Balanced Journal Entry"}</span>
              </DialogTitle>
              <DialogDescription>
                {isBn ? "ডেবিট এবং ক্রেডিট উভয় খাতের টাকার পরিমাণ সমান হতে হবে।" : "Debits must equal Credits for double-entry ledger balance."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-3">
              <div className="space-y-1">
                <Label>{isBn ? "ডেবিট হিসাব (Debit Account) *" : "Debit Account *"}</Label>
                <Select value={debitAccId} onValueChange={setDebitAccId} required>
                  <SelectTrigger><SelectValue placeholder="Choose debit account..." /></SelectTrigger>
                  <SelectContent className="max-h-52">
                    {accounts.map((a) => (
                      <SelectItem key={a._id} value={a._id}>[{a.code}] {a.name} ({a.type})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>{isBn ? "ক্রেডিট হিসাব (Credit Account) *" : "Credit Account *"}</Label>
                <Select value={creditAccId} onValueChange={setCreditAccId} required>
                  <SelectTrigger><SelectValue placeholder="Choose credit account..." /></SelectTrigger>
                  <SelectContent className="max-h-52">
                    {accounts.map((a) => (
                      <SelectItem key={a._id} value={a._id}>[{a.code}] {a.name} ({a.type})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>{isBn ? "টাকার পরিমাণ (৳) *" : "Amount (৳) *"}</Label>
                <Input type="number" min="1" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
              </div>

              <div className="space-y-1">
                <Label>{isBn ? "বিবরণ / নোট" : "Description / Notes"}</Label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Capital injection, bank transfer" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setJournalModal(false)}>{isBn ? "বাতিল" : "Cancel"}</Button>
              <Button type="submit" disabled={isPostingJournal} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {isBn ? "জার্নাল পোস্ট করুন" : "Post to General Ledger"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
