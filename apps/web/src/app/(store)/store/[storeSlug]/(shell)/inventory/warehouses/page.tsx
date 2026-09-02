"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useGetStoreBySlugQuery } from "@/redux/api/store-api";
import {
  useGetInventoryWarehousesQuery,
  useCreateInventoryWarehouseMutation,
} from "@/redux/api/inventory-api";
import { useLanguage } from "@/providers/language-provider";
import { useHasPermission } from "@/features/session/hooks";
import {
  Building2,
  Plus,
  MapPin,
  CheckCircle2,
  RefreshCw,
  Boxes,
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

export default function WarehousesPage() {
  const params = useParams();
  const storeSlug = String(params.storeSlug);
  const { data: storeData } = useGetStoreBySlugQuery(storeSlug, { skip: !storeSlug });
  const store = storeData?.data?.store;
  const storeId = store?._id ?? "";

  const { language } = useLanguage();
  const isBn = language === "bn";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [managerName, setManagerName] = useState("");

  const hasAccess = useHasPermission("warehouse:read");

  const { data: warehousesData, isLoading, refetch } = useGetInventoryWarehousesQuery(storeId, {
    skip: !storeId,
  });

  const [createWarehouse, { isLoading: isCreating }] = useCreateInventoryWarehouseMutation();

  const warehouses = (warehousesData?.data as any)?.warehouses ?? [];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error(isBn ? "ওয়্যারহাউসের নাম লিখুন" : "Warehouse name is required");
      return;
    }

    try {
      await createWarehouse({
        storeId,
        name: name.trim(),
        code: code.trim() || undefined,
        address: address.trim() || undefined,
        city: city.trim() || undefined,
        managerName: managerName.trim() || undefined,
      }).unwrap();

      toast.success(isBn ? "ওয়্যারহাউস সফলভাবে তৈরি হয়েছে" : "Warehouse created successfully");
      setIsModalOpen(false);
      setName("");
      setCode("");
      setAddress("");
      setCity("");
      setManagerName("");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || (isBn ? "তৈরি ব্যর্থ হয়েছে" : "Failed to create warehouse"));
    }
  };

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <ShieldAlert className="h-10 w-10 text-rose-500" />
        <h2 className="mt-4 text-lg font-semibold">{isBn ? "অনুমতি নেই" : "Access Denied"}</h2>
        <p className="text-sm text-zinc-500 mt-1">
          {isBn ? "ওয়্যারহাউস তথ্য দেখার অনুমতি আপনার নেই।" : "You do not have permission to view warehouses."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white flex items-center gap-2.5">
            <Building2 className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
            <span>{isBn ? "মাল্টি-ওয়্যারহাউস ও স্টোরেজ লোকেশন" : "Multi-Warehouse Management"}</span>
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {isBn
              ? "একাধিক স্টোর রুম, গুদাম এবং শাখা ওয়্যারহাউসের স্টক ট্র্যাক এবং স্থানান্তর করুন।"
              : "Manage central storage facilities, branch warehouses, stock allocations, and inter-facility transfers."}
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
            <span>{isBn ? "নতুন ওয়্যারহাউস যোগ করুন" : "Add Warehouse"}</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-zinc-400">
            {isBn ? "ওয়্যারহাউস লোড হচ্ছে..." : "Loading warehouses..."}
          </div>
        ) : warehouses.length === 0 ? (
          <Card className="col-span-full border-dashed p-10 text-center">
            <Building2 className="h-10 w-10 mx-auto text-zinc-400 mb-3" />
            <h3 className="font-semibold text-zinc-900 dark:text-white">
              {isBn ? "কোনো ওয়্যারহাউস পাওয়া যায়নি" : "No Warehouses Found"}
            </h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              {isBn
                ? "পণ্য মজুত করার জন্য আপনার প্রথম স্টোরেজ বা শাখা ওয়্যারহাউসটি যুক্ত করুন।"
                : "Create your primary storage facility or branch warehouse to track location-specific stock."}
            </p>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus className="h-4 w-4" />
              <span>{isBn ? "প্রথম ওয়্যারহাউস যোগ করুন" : "Create First Warehouse"}</span>
            </Button>
          </Card>
        ) : (
          warehouses.map((w: any) => (
            <Card key={w._id} className="border-zinc-200/80 dark:border-zinc-800 shadow-sm relative overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-indigo-500" />
                      <span>{w.name}</span>
                    </CardTitle>
                    <CardDescription className="text-xs mt-1 flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 text-zinc-400" />
                      <span>{w.city || w.address || (isBn ? "প্রধান শাখা" : "Main Location")}</span>
                    </CardDescription>
                  </div>
                  {w.isDefault && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                      <CheckCircle2 className="h-3 w-3" />
                      {isBn ? "ডিফল্ট" : "Default"}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                <div className="flex justify-between">
                  <span>{isBn ? "ওয়্যারহাউস কোড:" : "Facility Code:"}</span>
                  <span className="font-mono font-medium text-zinc-800 dark:text-zinc-200">
                    {w.code || "WH-MAIN"}
                  </span>
                </div>
                {w.managerName && (
                  <div className="flex justify-between">
                    <span>{isBn ? "ম্যানেজার:" : "Manager:"}</span>
                    <span className="font-medium text-zinc-800 dark:text-zinc-200">{w.managerName}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>{isBn ? "স্ট্যাটাস:" : "Status:"}</span>
                  <span className="capitalize text-emerald-600 font-medium">
                    {w.status || "Active"}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Warehouse Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-indigo-600" />
                <span>{isBn ? "নতুন ওয়্যারহাউস যুক্ত করুন" : "Add Storage Facility"}</span>
              </DialogTitle>
              <DialogDescription>
                {isBn
                  ? "নতুন স্টোরেজ বা শাখা ওয়্যারহাউস কনফিগার করুন।"
                  : "Set up a new storage location, central distribution hub, or branch facility."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label>{isBn ? "ওয়্যারহাউসের নাম *" : "Warehouse Name *"}</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dhaka Central Hub"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>{isBn ? "সুবিধা কোড" : "Facility Code"}</Label>
                  <Input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. WH-DHK-01"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{isBn ? "শহর" : "City"}</Label>
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Dhaka"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>{isBn ? "সম্পূর্ণ ঠিকানা" : "Street Address"}</Label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Plot 12, Tejgaon I/A"
                />
              </div>

              <div className="space-y-1.5">
                <Label>{isBn ? "ম্যানেজারের নাম" : "Facility Manager"}</Label>
                <Input
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                  placeholder="e.g. Rahim Ahmed"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                {isBn ? "বাতিল" : "Cancel"}
              </Button>
              <Button type="submit" disabled={isCreating} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {isCreating ? (isBn ? "তৈরি হচ্ছে..." : "Creating...") : isBn ? "সংরক্ষণ করুন" : "Save Warehouse"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
