"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useGetStoreBySlugQuery } from "@/redux/api/store-api";
import {
  useGetTicketsQuery,
  useCreateTicketMutation,
  useAddTicketReplyMutation,
  type SupportTicket,
} from "@/redux/api/support-api";
import { useLanguage } from "@/providers/language-provider";
import { useHasPermission } from "@/features/session/hooks";
import {
  LifeBuoy,
  Plus,
  Send,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Clock,
  RefreshCw,
  User,
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function SupportTicketsPage() {
  const params = useParams();
  const storeSlug = String(params.storeSlug);
  const { data: storeData } = useGetStoreBySlugQuery(storeSlug, { skip: !storeSlug });
  const store = storeData?.data?.store;
  const storeId = store?._id ?? "";

  const { language } = useLanguage();
  const isBn = language === "bn";

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState("");

  // Create Ticket Form
  const [subject, setSubject] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [priority, setPriority] = useState("medium");
  const [initialMessage, setInitialMessage] = useState("");

  const hasAccess = useHasPermission("support:read");

  const { data: ticketsData, isLoading, refetch } = useGetTicketsQuery(
    {
      storeId,
      page,
      limit: 20,
      status: statusFilter !== "all" ? statusFilter : undefined,
    },
    { skip: !storeId }
  );

  const [createTicket, { isLoading: isCreating }] = useCreateTicketMutation();
  const [addReply, { isLoading: isReplying }] = useAddTicketReplyMutation();

  const tickets = ticketsData?.data?.tickets ?? [];
  const total = ticketsData?.data?.total ?? 0;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !customerName.trim() || !initialMessage.trim()) {
      toast.error(isBn ? "বিষয়, গ্রাহক নাম এবং বার্তা পূরণ করুন" : "Subject, customer name, and message are required");
      return;
    }

    try {
      await createTicket({
        storeId,
        body: {
          subject: subject.trim(),
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim() || undefined,
          customerPhone: customerPhone.trim() || undefined,
          priority,
          initialMessage: initialMessage.trim(),
        },
      }).unwrap();

      toast.success(isBn ? "সাপোর্ট টিকেট খোলা হয়েছে" : "Support ticket opened");
      setIsModalOpen(false);
      setSubject("");
      setCustomerName("");
      setCustomerEmail("");
      setCustomerPhone("");
      setInitialMessage("");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create ticket");
    }
  };

  const handleSendReply = async () => {
    if (!selectedTicket || !replyText.trim()) return;

    try {
      const updated = await addReply({
        storeId,
        ticketId: selectedTicket._id,
        content: replyText.trim(),
      }).unwrap();

      toast.success(isBn ? "উত্তর পাঠানো হয়েছে" : "Reply sent");
      setReplyText("");
      setSelectedTicket(updated.data);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to send reply");
    }
  };

  const handleResolve = async (ticketId: string) => {
    try {
      await addReply({
        storeId,
        ticketId,
        content: isBn ? "টিকেটটির সমস্যা সমাধান করা হয়েছে।" : "Ticket marked as resolved.",
        status: "resolved",
      }).unwrap();

      toast.success(isBn ? "টিকেট সমাধান সম্পন্ন হয়েছে" : "Ticket marked as resolved");
      setSelectedTicket(null);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to resolve ticket");
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
            <LifeBuoy className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
            <span>{isBn ? "গ্রাহক সহায়তা ও হেল্পডেস্ক (Support Desk)" : "Support Desk & Ticketing"}</span>
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {isBn
              ? "গ্রাহকদের অভিযোগ ও সহায়তা বার্তা গ্রহণ, উত্তর প্রদান এবং রেজোলিউশন ট্র্যাকিং।"
              : "Customer inquiries, complaints, ticket resolution tracking, and support thread messaging."}
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
            <span>{isBn ? "নতুন টিকেট খুলুন" : "Open Ticket"}</span>
          </Button>
        </div>
      </div>

      {/* Tickets Table */}
      <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm">
        <CardHeader className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] h-9 text-xs">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isBn ? "সকল স্ট্যাটাস" : "All Statuses"}</SelectItem>
                <SelectItem value="open">{isBn ? "উন্মুক্ত (Open)" : "Open"}</SelectItem>
                <SelectItem value="waiting_customer">{isBn ? "গ্রাহকের উত্তরের অপেক্ষায়" : "Waiting on Customer"}</SelectItem>
                <SelectItem value="resolved">{isBn ? "সমাধানকৃত (Resolved)" : "Resolved"}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="text-xs text-zinc-500">
            {isBn ? `মোট ${total} টি টিকেট` : `${total} total tickets`}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-xs uppercase text-zinc-500 font-semibold border-b border-zinc-200/80 dark:border-zinc-800">
                <tr>
                  <th className="px-4 py-3">{isBn ? "টিকেট #" : "Ticket #"}</th>
                  <th className="px-4 py-3">{isBn ? "বিষয়" : "Subject"}</th>
                  <th className="px-4 py-3">{isBn ? "গ্রাহক" : "Customer"}</th>
                  <th className="px-4 py-3">{isBn ? "অগ্রাধিকার" : "Priority"}</th>
                  <th className="px-4 py-3">{isBn ? "স্ট্যাটাস" : "Status"}</th>
                  <th className="px-4 py-3">{isBn ? "বার্তার সংখ্যা" : "Messages"}</th>
                  <th className="px-4 py-3 text-right">{isBn ? "অ্যাকশন" : "Action"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-zinc-400">
                      {isBn ? "লোড হচ্ছে..." : "Loading tickets..."}
                    </td>
                  </tr>
                ) : tickets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-zinc-400">
                      <LifeBuoy className="h-8 w-8 mx-auto mb-2 text-zinc-300" />
                      <p className="text-sm">{isBn ? "কোনো সহায়তা টিকেট নেই" : "No support tickets found"}</p>
                    </td>
                  </tr>
                ) : (
                  tickets.map((t) => (
                    <tr key={t._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                      <td className="px-4 py-3 font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                        {t.ticketNumber}
                      </td>
                      <td className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-100">
                        {t.subject}
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-600 dark:text-zinc-400">
                        <div>{t.customerName}</div>
                        {t.customerPhone && <div className="text-zinc-400 text-[11px]">{t.customerPhone}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium capitalize ${
                            t.priority === "urgent" || t.priority === "high"
                              ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                              : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                          }`}
                        >
                          {t.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium capitalize ${
                            t.status === "resolved"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                              : "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                          }`}
                        >
                          {t.status?.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-500 font-mono">
                        {t.messages?.length || 1} msg
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedTicket(t)}
                          className="h-7 text-xs px-2.5 gap-1"
                        >
                          <MessageSquare className="h-3.5 w-3.5 text-indigo-600" />
                          <span>{isBn ? "উত্তর দিন" : "View & Reply"}</span>
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Ticket Thread Modal */}
      {selectedTicket && (
        <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
          <DialogContent className="sm:max-w-[600px] p-6 max-h-[85vh] flex flex-col">
            <DialogHeader className="border-b pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <DialogTitle className="text-base font-bold flex items-center gap-2">
                    <span className="font-mono text-indigo-600">[{selectedTicket.ticketNumber}]</span>
                    <span>{selectedTicket.subject}</span>
                  </DialogTitle>
                  <DialogDescription className="text-xs mt-1">
                    {isBn ? "গ্রাহক:" : "Customer:"} {selectedTicket.customerName} ({selectedTicket.customerEmail || selectedTicket.customerPhone || "Direct"})
                  </DialogDescription>
                </div>
                {selectedTicket.status !== "resolved" && (
                  <Button
                    size="sm"
                    onClick={() => handleResolve(selectedTicket._id)}
                    className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{isBn ? "সমাধান চিহ্নিত করুন" : "Mark Resolved"}</span>
                  </Button>
                )}
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto py-4 space-y-3 max-h-[350px]">
              {selectedTicket.messages?.map((m, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg text-xs ${
                    m.senderType === "agent"
                      ? "bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/40 ml-6"
                      : "bg-zinc-100 dark:bg-zinc-800 mr-6"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1 text-[11px] font-semibold text-zinc-500">
                    <span>{m.sender} ({m.senderType})</span>
                    <span className="font-normal">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">{m.content}</div>
                </div>
              ))}
            </div>

            {selectedTicket.status !== "resolved" && (
              <div className="pt-3 border-t space-y-2">
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={isBn ? "গ্রাহককে উত্তর লিখুন..." : "Type reply to customer..."}
                  rows={2}
                  className="text-xs"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleSendReply}
                    disabled={isReplying || !replyText.trim()}
                    className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white h-8 text-xs"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{isReplying ? (isBn ? "পাঠানো হচ্ছে..." : "Sending...") : (isBn ? "উত্তর পাঠান" : "Send Reply")}</span>
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* Open Ticket Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <LifeBuoy className="h-5 w-5 text-indigo-600" />
                <span>{isBn ? "নতুন সাপোর্ট টিকেট খুলুন" : "Open Support Ticket"}</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3.5 py-3">
              <div className="space-y-1">
                <Label>{isBn ? "টিকেটের বিষয় *" : "Ticket Subject *"}</Label>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Order Delivery Delayed" required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>{isBn ? "গ্রাহকের নাম *" : "Customer Name *"}</Label>
                  <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="e.g. Farhan Ali" required />
                </div>
                <div className="space-y-1">
                  <Label>{isBn ? "ফোন নম্বর" : "Phone"}</Label>
                  <Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="017XXXXXXXX" />
                </div>
              </div>

              <div className="space-y-1">
                <Label>{isBn ? "গ্রাহকের বার্তা / অভিযোগ *" : "Customer Message *"}</Label>
                <Textarea
                  value={initialMessage}
                  onChange={(e) => setInitialMessage(e.target.value)}
                  placeholder={isBn ? "অভিযোগ বা জিজ্ঞাসার বিস্তারিত বিবরণ..." : "Describe the customer issue..."}
                  rows={3}
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>{isBn ? "বাতিল" : "Cancel"}</Button>
              <Button type="submit" disabled={isCreating} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {isCreating ? (isBn ? "তৈরি হচ্ছে..." : "Creating...") : isBn ? "টিকেট খুলুন" : "Create Ticket"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
