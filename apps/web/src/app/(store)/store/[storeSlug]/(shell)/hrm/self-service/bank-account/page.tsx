"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useGetStoreBySlugQuery } from "@/redux/api/store-api";
import {
  useGetMyBankAccountQuery,
  useRequestBankAccountChangeMutation,
} from "@/redux/api/hrm-api";
import { useLanguage } from "@/providers/language-provider";
import {
  CreditCard,
  Building2,
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  Loader2,
  ShieldCheck,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function BankAccountPage() {
  const params = useParams();
  const storeSlug = String(params.storeSlug);
  const { data: storeData } = useGetStoreBySlugQuery(storeSlug, { skip: !storeSlug });
  const store = storeData?.data?.store;
  const storeId = store?._id ?? "";

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [branchName, setBranchName] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [mobileWalletNumber, setMobileWalletNumber] = useState("");
  const [walletProvider, setWalletProvider] = useState("bKash");
  const [reason, setReason] = useState("");

  const { data: bankData, isLoading, refetch } = useGetMyBankAccountQuery(storeId, {
    skip: !storeId,
  });
  const [requestChange, { isLoading: isSubmitting }] = useRequestBankAccountChangeMutation();

  const bankInfo = bankData?.data?.bankInfo;
  const pendingRequest = bankData?.data?.pendingRequest;
  const history = bankData?.data?.history ?? [];

  const handleOpenModal = () => {
    setBankName(bankInfo?.bankName || "");
    setAccountName(bankInfo?.accountName || "");
    setAccountNumber(bankInfo?.accountNumber || "");
    setBranchName(bankInfo?.branchName || "");
    setRoutingNumber(bankInfo?.routingNumber || "");
    setMobileWalletNumber(bankInfo?.mobileWalletNumber || "");
    setWalletProvider(bankInfo?.walletProvider || "bKash");
    setReason("");
    setEditModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountNumber && !mobileWalletNumber) {
      toast.error("Please provide either a bank account number or a mobile wallet number");
      return;
    }

    try {
      await requestChange({
        storeId,
        bankName,
        accountName,
        accountNumber,
        branchName,
        routingNumber,
        mobileWalletNumber,
        walletProvider,
        reason,
      }).unwrap();

      toast.success("Bank account change request submitted for HR approval!");
      setEditModalOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to submit bank change request");
    }
  };

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
            <CreditCard className="h-6 w-6 text-[#003399]" />
            <span>Bank Account Information</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Manage your official salary disbursement account and mobile wallet details.
          </p>
        </div>

        <Button
          onClick={handleOpenModal}
          disabled={Boolean(pendingRequest)}
          size="sm"
          className="bg-[#003399] hover:bg-[#002B80] text-white gap-2 font-bold shadow-sm"
        >
          <CreditCard className="h-4 w-4" />
          <span>Update Bank Account</span>
        </Button>
      </div>

      {/* Pending Approval Notice Banner */}
      {pendingRequest && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-900/60 dark:bg-amber-950/20">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                Pending HR Review: Bank Account Update Request
              </h3>
              <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                You submitted an update on {new Date(pendingRequest.createdAt).toLocaleDateString()}. For security and payroll compliance, new banking details require approval from HR/Admin before replacing your official disbursement profile.
              </p>
              <div className="mt-2 text-[11px] font-mono bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-amber-200 dark:border-amber-900/50 inline-block">
                Proposed: {pendingRequest.data?.bankName || "Bank"} • Account: {pendingRequest.data?.accountNumber || pendingRequest.data?.mobileWalletNumber} • Holder: {pendingRequest.data?.accountName || "N/A"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Current Official Bank Account Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Direct Bank Account */}
        <Card className="border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#003399]" />
              <CardTitle className="text-sm font-bold text-zinc-900 dark:text-white">
                Primary Bank Account
              </CardTitle>
            </div>
            <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
              Active Record
            </span>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-zinc-500">Bank Name</span>
              <span className="font-bold text-zinc-900 dark:text-white">
                {bankInfo?.bankName || "Not configured"}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-zinc-500">Account Holder Name</span>
              <span className="font-bold text-zinc-900 dark:text-white">
                {bankInfo?.accountName || "—"}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-zinc-500">Account Number</span>
              <span className="font-mono font-bold text-zinc-900 dark:text-white">
                {bankInfo?.accountNumber || "—"}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-zinc-500">Branch Name</span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                {bankInfo?.branchName || "—"}
              </span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-zinc-500">Routing Number</span>
              <span className="font-mono text-zinc-800 dark:text-zinc-200">
                {bankInfo?.routingNumber || "—"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Mobile Financial Services (MFS) */}
        <Card className="border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-violet-600" />
              <CardTitle className="text-sm font-bold text-zinc-900 dark:text-white">
                Mobile Financial Services (MFS)
              </CardTitle>
            </div>
            <span className="text-[10px] uppercase font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
              Secondary
            </span>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-zinc-500">Wallet Provider</span>
              <span className="font-bold text-zinc-900 dark:text-white">
                {bankInfo?.walletProvider || "bKash"}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-zinc-500">Mobile Wallet Number</span>
              <span className="font-mono font-bold text-zinc-900 dark:text-white">
                {bankInfo?.mobileWalletNumber || "Not configured"}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 pt-2 leading-relaxed">
              If enabled by your company policy, allowances or disbursements may be credited directly to your mobile wallet.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Change Requests History */}
      <Card className="border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <History className="h-4 w-4 text-zinc-500" />
            <span>Bank Change Requests History</span>
          </CardTitle>
          <CardDescription className="text-xs text-zinc-500 mt-0.5">
            Audit history of your bank account update submissions and HR approval outcomes.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {history.length === 0 ? (
            <div className="p-8 text-center text-zinc-400 text-xs">
              No change requests submitted yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 border-y border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="py-3 px-4 font-bold">Submitted Date</th>
                    <th className="py-3 px-4 font-bold">Proposed Account</th>
                    <th className="py-3 px-4 font-bold">Reason</th>
                    <th className="py-3 px-4 font-bold text-center">Status</th>
                    <th className="py-3 px-4 font-bold">HR Reviewer Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {history.map((req: any) => (
                    <tr key={req._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                      <td className="py-3 px-4 font-mono text-zinc-500">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-zinc-900 dark:text-white block">
                          {req.data?.bankName || req.data?.walletProvider || "Bank"}
                        </span>
                        <span className="font-mono text-[11px] text-zinc-500">
                          {req.data?.accountNumber || req.data?.mobileWalletNumber}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">
                        {req.data?.reason || req.description}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge
                          variant={
                            req.status === "approved"
                              ? "success"
                              : req.status === "pending"
                              ? "warning"
                              : "danger"
                          }
                        >
                          {req.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-zinc-500 italic">
                        {req.reviewNote ? `${req.reviewNote} (${req.reviewerName || "HR"})` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bank Account Update Request Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Update Bank Account Details</DialogTitle>
            <DialogDescription>
              Submit proposed banking changes. To protect your salary disbursement, updates must be reviewed and approved by HR/Admin before taking effect.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Bank Name *</Label>
              <Input
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g. Dutch-Bangla Bank, BRAC Bank, Eastern Bank"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Account Holder Name *</Label>
                <Input
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="Official Name on Account"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>Account Number *</Label>
                <Input
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="1234567890"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Branch Name</Label>
                <Input
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  placeholder="e.g. Dhanmondi Branch"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Routing Number</Label>
                <Input
                  value={routingNumber}
                  onChange={(e) => setRoutingNumber(e.target.value)}
                  placeholder="9-digit routing number"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-2">
                Mobile Financial Services (Optional)
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Wallet Provider</Label>
                  <Select value={walletProvider} onValueChange={setWalletProvider}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bKash">bKash</SelectItem>
                      <SelectItem value="Nagad">Nagad</SelectItem>
                      <SelectItem value="Rocket">Rocket</SelectItem>
                      <SelectItem value="Upay">Upay</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Wallet Number</Label>
                  <Input
                    value={mobileWalletNumber}
                    onChange={(e) => setMobileWalletNumber(e.target.value)}
                    placeholder="017XXXXXXXX"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Reason for Update *</Label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Changed primary salary bank / opened new account..."
                rows={2}
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#003399] hover:bg-[#002B80] text-white font-bold"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                <span>Submit for HR Approval</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
