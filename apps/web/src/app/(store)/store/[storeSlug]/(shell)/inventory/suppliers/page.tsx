"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useGetStoreBySlugQuery } from "@/redux/api/store-api";
import {
  useGetInventorySuppliersQuery,
  useCreateInventorySupplierMutation,
} from "@/redux/api/inventory-api";
import { useLanguage } from "@/providers/language-provider";
import { useHasPermission } from "@/features/session/hooks";
import {
  Truck,
  Plus,
  Phone,
  Mail,
  Building,
  RefreshCw,
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

export default function SuppliersPage() {
  const params = useParams();
  const storeSlug = String(params.storeSlug);
  const { data: storeData } = useGetStoreBySlugQuery(storeSlug, { skip: !storeSlug });
  const store = storeData?.data?.store;
  const storeId = store?._id ?? "";

  const { language } = useLanguage();
  const isBn = language === "bn";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const hasAccess = useHasPermission("procurement:read");

  const { data: suppliersData, isLoading, refetch } = useGetInventorySuppliersQuery(storeId, {
    skip: !storeId,
  });

  const [createSupplier, { isLoading: isCreating }] = useCreateInventorySupplierMutation();

  const suppliers = (suppliersData?.data as any)?.suppliers ?? [];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error(isBn ? "সরবরাহকারীর নাম লিখুন" : "Supplier name is required");
      return;
    }

    try {
      await createSupplier({
        storeId,
        name: name.trim(),
        company: company.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        address: address.trim() || undefined,
      }).unwrap();

      toast.success(isBn ? "সরবরাহকারী যুক্ত হয়েছে" : "Supplier added successfully");
      setIsModalOpen(false);
      setName("");
      setCompany("");
      setPhone("");
      setEmail("");
      setAddress("");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to add supplier");
    }
  };

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <ShieldAlert className="h-10 w-10 text-rose-500" />
        <h2 className="mt-4 text-lg font-semibold">{isBn ? "অনুমতি নেই" : "Access Denied"}</h2>
        <p className="text-sm text-zinc-500 mt-1">
          {isBn ? "সরবরাহকারী তালিকা দেখার অনুমতি নেই।" : "You do not have permission to view suppliers."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white flex items-center gap-2.5">
            <Truck className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
            <span>{isBn ? "সরবরাহকারী মাস্টার (Suppliers Master)" : "Supplier Directory"}</span>
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {isBn
              ? "পাইকারি সরবরাহকারী, নির্মাতা ও ভেন্ডরদের তালিকা, যোগাযোগ এবং ক্রয়ের হিসেব।"
              : "Manage wholesale vendors, manufacturers, procurement contacts, and supplier purchasing history."}
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
            <span>{isBn ? "নতুন সরবরাহকারী যোগ করুন" : "Add Supplier"}</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-zinc-400">
            {isBn ? "সরবরাহকারী লোড হচ্ছে..." : "Loading suppliers..."}
          </div>
        ) : suppliers.length === 0 ? (
          <Card className="col-span-full border-dashed p-10 text-center">
            <Truck className="h-10 w-10 mx-auto text-zinc-400 mb-3" />
            <h3 className="font-semibold text-zinc-900 dark:text-white">
              {isBn ? "কোনো সরবরাহকারী পাওয়া যায়নি" : "No Suppliers Found"}
            </h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              {isBn
                ? "পণ্য ক্রয়ের জন্য আপনার পাইকারি ভেন্ডর বা নির্মাতাকে যুক্ত করুন।"
                : "Add your product vendors and suppliers to begin issuing purchase orders."}
            </p>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus className="h-4 w-4" />
              <span>{isBn ? "প্রথম সরবরাহকারী যোগ করুন" : "Add First Supplier"}</span>
            </Button>
          </Card>
        ) : (
          suppliers.map((s: any) => (
            <Card key={s._id} className="border-zinc-200/80 dark:border-zinc-800 shadow-sm relative overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Truck className="h-4 w-4 text-indigo-500" />
                  <span>{s.name}</span>
                </CardTitle>
                {s.company && (
                  <CardDescription className="text-xs mt-0.5 flex items-center gap-1.5 font-medium text-zinc-700 dark:text-zinc-300">
                    <Building className="h-3 w-3 text-zinc-400" />
                    <span>{s.company}</span>
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                {s.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-zinc-400" />
                    <span>{s.phone}</span>
                  </div>
                )}
                {s.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-zinc-400" />
                    <span>{s.email}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1">
                  <span>{isBn ? "স্ট্যাটাস:" : "Status:"}</span>
                  <span className="capitalize text-emerald-600 font-medium">
                    {s.status || "Active"}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add Supplier Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-indigo-600" />
                <span>{isBn ? "নতুন সরবরাহকারী যোগ করুন" : "Add New Supplier"}</span>
              </DialogTitle>
              <DialogDescription>
                {isBn
                  ? "পণ্য ক্রয়ের জন্য সরবরাহকারীর যোগাযোগের তথ্য সংরক্ষণ করুন।"
                  : "Save supplier or vendor details for seamless PO processing."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label>{isBn ? "সরবরাহকারীর নাম *" : "Contact Name *"}</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Tanvir Hossain"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>{isBn ? "প্রতিষ্ঠানের নাম" : "Company / Brand Name"}</Label>
                <Input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Apex Wholesale Ltd"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>{isBn ? "ফোন নম্বর" : "Phone"}</Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{isBn ? "ইমেইল" : "Email"}</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vendor@company.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>{isBn ? "ঠিকানা" : "Address"}</Label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Chawkbazar, Dhaka"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                {isBn ? "বাতিল" : "Cancel"}
              </Button>
              <Button type="submit" disabled={isCreating} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {isCreating ? (isBn ? "সংরক্ষণ হচ্ছে..." : "Saving...") : isBn ? "সংরক্ষণ করুন" : "Save Supplier"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
