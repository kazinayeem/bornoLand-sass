"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useGetStoreBySlugQuery } from "@/redux/api/store-api";
import {
  useGetDealsQuery,
  useCreateDealMutation,
  useUpdateDealStageMutation,
  type CrmDeal,
} from "@/redux/api/crm-api";
import { useLanguage } from "@/providers/language-provider";
import { useHasPermission } from "@/features/session/hooks";
import {
  Target,
  Plus,
  TrendingUp,
  DollarSign,
  User,
  Phone,
  ArrowRight,
  RefreshCw,
  Award,
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

const PIPELINE_STAGES = [
  { id: "lead", nameBn: "নতুন লিড (Lead)", nameEn: "New Lead", color: "border-zinc-300 dark:border-zinc-700" },
  { id: "contacted", nameBn: "যোগাযোগকৃত (Contacted)", nameEn: "Contacted", color: "border-blue-400 dark:border-blue-700" },
  { id: "proposal_sent", nameBn: "প্রস্তাবনা পাঠানো (Proposal)", nameEn: "Proposal Sent", color: "border-purple-400 dark:border-purple-700" },
  { id: "negotiation", nameBn: "দর কষাকষি (Negotiation)", nameEn: "Negotiation", color: "border-amber-400 dark:border-amber-700" },
  { id: "won", nameBn: "সফল চুক্তি (Won)", nameEn: "Closed Won", color: "border-emerald-500 dark:border-emerald-600" },
];

export default function DealsPipelinePage() {
  const params = useParams();
  const storeSlug = String(params.storeSlug);
  const { data: storeData } = useGetStoreBySlugQuery(storeSlug, { skip: !storeSlug });
  const store = storeData?.data?.store;
  const storeId = store?._id ?? "";

  const { language } = useLanguage();
  const isBn = language === "bn";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [value, setValue] = useState("50000");
  const [stage, setStage] = useState("lead");

  const hasAccess = useHasPermission("crm:read");

  const { data: dealsData, isLoading, refetch } = useGetDealsQuery({ storeId }, { skip: !storeId });
  const [createDeal, { isLoading: isCreating }] = useCreateDealMutation();
  const [updateStage] = useUpdateDealStageMutation();

  const deals = dealsData?.data?.deals ?? [];
  const summary = dealsData?.data?.summary ?? { totalPipelineValue: 0, wonValue: 0, leadsCount: 0, wonCount: 0 };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !customerName.trim() || Number(value) <= 0) {
      toast.error(isBn ? "ডিল ও গ্রাহকের নাম এবং সম্ভাব্য মূল্য দিন" : "Title, customer, and deal value are required");
      return;
    }

    try {
      await createDeal({
        storeId,
        body: {
          title: title.trim(),
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim() || undefined,
          customerEmail: customerEmail.trim() || undefined,
          value: Number(value),
          stage,
        },
      }).unwrap();

      toast.success(isBn ? "নতুন ডিল তৈরি হয়েছে" : "New CRM deal created");
      setIsModalOpen(false);
      setTitle("");
      setCustomerName("");
      setCustomerPhone("");
      setCustomerEmail("");
      setValue("50000");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create deal");
    }
  };

  const handleStageChange = async (dealId: string, nextStage: string) => {
    try {
      await updateStage({ storeId, dealId, stage: nextStage }).unwrap();
      toast.success(isBn ? "ডিলের ধাপ পরিবর্তন হয়েছে" : "Deal stage updated");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update stage");
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
            <Target className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
            <span>{isBn ? "গ্রাহক সম্পর্ক ও সেলস পাইপলাইন (CRM Deals)" : "Sales Pipeline & CRM Deals"}</span>
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {isBn
              ? "সম্ভাব্য লিড, অফার পাঠানো, দর কষাকষি এবং ক্লোজড সেলস কানবান পাইপলাইনে পরিচালনা করুন।"
              : "Track sales prospects, deal values, lead stages, and win rates across the CRM pipeline."}
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
            <span>{isBn ? "+ নতুন ডিল যোগ করুন" : "+ Add Deal"}</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500 flex items-center justify-between">
              <span>{isBn ? "মোট পাইপলাইন মূল্য" : "Total Pipeline Value"}</span>
              <DollarSign className="h-4 w-4 text-indigo-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              ৳{summary.totalPipelineValue.toLocaleString()}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              {isBn ? "চলমান সমস্ত ডিলের সম্ভাব্য মূল্য" : "Active deals under management"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500 flex items-center justify-between">
              <span>{isBn ? "সফলভাবে অর্জিত ডিল (Won)" : "Closed Won Revenue"}</span>
              <Award className="h-4 w-4 text-emerald-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              ৳{summary.wonValue.toLocaleString()}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              {summary.wonCount} {isBn ? "টি চুক্তি সফলভাবে সম্পন্ন হয়েছে" : "deals converted to won"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500 flex items-center justify-between">
              <span>{isBn ? "কনভার্সন হার" : "Win Rate"}</span>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-white">
              {deals.length > 0 ? `${((summary.wonCount / deals.length) * 100).toFixed(0)}%` : "0%"}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              {isBn ? "মোট লিড থেকে অর্জিত সাফল্যের হার" : "Conversion from leads to closed deals"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Kanban Stages Board */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {PIPELINE_STAGES.map((s) => {
          const stageDeals = deals.filter((d) => d.stage === s.id);
          const stageValue = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0);

          return (
            <div
              key={s.id}
              className={`flex flex-col bg-zinc-50/70 dark:bg-zinc-900/40 rounded-xl p-3 border-t-4 ${s.color} border-zinc-200/80 dark:border-zinc-800 min-h-[420px]`}
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-200/60 dark:border-zinc-800">
                <div>
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                    {isBn ? s.nameBn : s.nameEn}
                  </h3>
                  <div className="text-[11px] font-semibold text-zinc-500 mt-0.5">
                    ৳{stageValue.toLocaleString()} ({stageDeals.length})
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 flex-1">
                {stageDeals.length === 0 ? (
                  <div className="text-center py-10 text-xs text-zinc-400">
                    {isBn ? "কোনো ডিল নেই" : "No deals"}
                  </div>
                ) : (
                  stageDeals.map((deal) => (
                    <Card
                      key={deal._id}
                      className="border-zinc-200/90 dark:border-zinc-800 shadow-sm p-3 hover:shadow-md transition-shadow relative"
                    >
                      <div className="font-semibold text-sm text-zinc-900 dark:text-white leading-tight">
                        {deal.title}
                      </div>
                      <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                        ৳{deal.value?.toLocaleString()}
                      </div>

                      <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                        <div className="flex items-center gap-1.5 font-medium">
                          <User className="h-3 w-3 text-zinc-400" />
                          <span>{deal.customerName}</span>
                        </div>
                        {deal.customerPhone && (
                          <div className="flex items-center gap-1.5 text-zinc-400 text-[11px]">
                            <Phone className="h-3 w-3" />
                            <span>{deal.customerPhone}</span>
                          </div>
                        )}
                      </div>

                      {/* Quick Move Stage Select */}
                      <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                        <Select
                          value={deal.stage}
                          onValueChange={(val) => handleStageChange(deal._id, val)}
                        >
                          <SelectTrigger className="h-6 text-[10px] w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PIPELINE_STAGES.map((st) => (
                              <SelectItem key={st.id} value={st.id} className="text-xs">
                                {isBn ? st.nameBn : st.nameEn}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Deal Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-indigo-600" />
                <span>{isBn ? "নতুন সেলস ডিল যুক্ত করুন" : "Add Sales Deal"}</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3.5 py-3">
              <div className="space-y-1">
                <Label>{isBn ? "ডিল শিরোনাম *" : "Deal Title *"}</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Bulk Wholesale Supply Order" required />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1 min-w-0">
                  <Label>{isBn ? "গ্রাহকের নাম *" : "Customer Name *"}</Label>
                  <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="e.g. Ahmed Trading" required />
                </div>

                <div className="space-y-1 min-w-0">
                  <Label>{isBn ? "সম্ভাব্য ডিল মূল্য (৳) *" : "Deal Value (৳) *"}</Label>
                  <Input type="number" min="1" step="100" value={value} onChange={(e) => setValue(e.target.value)} required />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1 min-w-0">
                  <Label>{isBn ? "ফোন নম্বর" : "Phone"}</Label>
                  <Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="017XXXXXXXX" />
                </div>

                <div className="space-y-1 min-w-0">
                  <Label>{isBn ? "ইমেইল" : "Email"}</Label>
                  <Input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="client@domain.com" />
                </div>
              </div>

              <div className="space-y-1">
                <Label>{isBn ? "পাইপলাইন ধাপ" : "Pipeline Stage"}</Label>
                <Select value={stage} onValueChange={setStage}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PIPELINE_STAGES.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{isBn ? s.nameBn : s.nameEn}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>{isBn ? "বাতিল" : "Cancel"}</Button>
              <Button type="submit" disabled={isCreating} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {isCreating ? (isBn ? "সংরক্ষণ হচ্ছে..." : "Creating...") : isBn ? "ডিল তৈরি করুন" : "Create Deal"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
