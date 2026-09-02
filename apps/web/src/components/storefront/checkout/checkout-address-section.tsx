"use client";

import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { CustomerAddressBook } from "@/components/storefront/customer-address-book";
import type { CustomerAddress } from "@/redux/api/customer-api";
import { LocationSelect, type LocationOption } from "@/components/ui/location-select";
import {
  getDivisions,
  getDistricts,
  getUpazilas,
  getUnions,
  findDivision,
  findDistrict,
  findUpazila,
} from "@/lib/bangladesh-locations";
import type { CheckoutFormState } from "./checkout-types";
import { Truck } from "lucide-react";

type CheckoutAddressSectionProps = {
  form: CheckoutFormState;
  setForm: React.Dispatch<React.SetStateAction<CheckoutFormState>>;
  selectedSavedAddressId: string | null;
  setSelectedSavedAddressId: (id: string | null) => void;
  onDistrictChanged?: (districtId: string) => void;
  onFieldChanged?: () => void;
};

export const CheckoutAddressSection = React.memo(function CheckoutAddressSection({
  form,
  setForm,
  selectedSavedAddressId,
  setSelectedSavedAddressId,
  onDistrictChanged,
  onFieldChanged,
}: CheckoutAddressSectionProps) {
  const customer = useSelector((state: RootState) => state.customer.customer);

  const divisions = useMemo(() => getDivisions(), []);
  const districts = useMemo(() => getDistricts(form.divisionId), [form.divisionId]);
  const upazilas = useMemo(() => getUpazilas(form.districtId), [form.districtId]);
  const unions = useMemo(() => getUnions(form.upazilaId), [form.upazilaId]);

  const handleDivisionChange = (divId: string, item?: LocationOption) => {
    const divObj = item || findDivision(divId);
    setForm((prev) => ({
      ...prev,
      divisionId: divId,
      divisionName: divObj?.name || "",
      divisionNameBn: divObj?.nameBn || "",
      state: divObj?.name || "",
      districtId: "",
      districtName: "",
      districtNameBn: "",
      city: "",
      upazilaId: "",
      upazilaName: "",
      upazilaNameBn: "",
      area: "",
      unionId: "",
      unionName: "",
      village: "",
    }));
    onFieldChanged?.();
  };

  const handleDistrictChange = (distId: string, item?: LocationOption) => {
    const distObj = item || findDistrict(distId);
    setForm((prev) => ({
      ...prev,
      districtId: distId,
      districtName: distObj?.name || "",
      districtNameBn: distObj?.nameBn || "",
      city: distObj?.name || "",
      zip: (distObj as any)?.defaultPostalCode || prev.zip,
      upazilaId: "",
      upazilaName: "",
      upazilaNameBn: "",
      area: "",
      unionId: "",
      unionName: "",
      village: "",
    }));
    onDistrictChanged?.(distId);
    onFieldChanged?.();
  };

  const handleUpazilaChange = (upzId: string, item?: LocationOption) => {
    const upzObj = item || findUpazila(upzId);
    setForm((prev) => ({
      ...prev,
      upazilaId: upzId,
      upazilaName: upzObj?.name || "",
      upazilaNameBn: upzObj?.nameBn || "",
      area: upzObj?.name || "",
      zip: (upzObj as any)?.postalCodes?.[0] || prev.zip,
      unionId: "",
      unionName: "",
      village: "",
    }));
    onFieldChanged?.();
  };

  const applySavedAddress = (address: CustomerAddress) => {
    setSelectedSavedAddressId(address._id);
    const divObj = findDivision((address as any).divisionId || address.state);
    const distObj = findDistrict((address as any).districtId || address.city);
    const upzObj = findUpazila((address as any).upazilaId || address.area);

    setForm((prev) => ({
      ...prev,
      label: address.label || "Home",
      fullName: address.fullName,
      phone: address.phone,
      email: address.email ?? prev.email,
      country: address.country || "Bangladesh",
      countryCode: "BD",
      divisionId: divObj?.id || (address as any).divisionId || "",
      divisionName: divObj?.name || address.state || "",
      divisionNameBn: divObj?.nameBn || "",
      districtId: distObj?.id || (address as any).districtId || "",
      districtName: distObj?.name || address.city || "",
      districtNameBn: distObj?.nameBn || "",
      upazilaId: upzObj?.id || (address as any).upazilaId || "",
      upazilaName: upzObj?.name || address.area || "",
      upazilaNameBn: upzObj?.nameBn || "",
      unionId: (address as any).unionId || "",
      unionName: (address as any).union || "",
      village: (address as any).village || "",
      state: divObj?.name || address.state || "",
      city: distObj?.name || address.city || "",
      area: upzObj?.name || address.area || "",
      street: address.street,
      apartment: address.apartment ?? "",
      zip: address.zip ?? (distObj as any)?.defaultPostalCode ?? "",
      landmark: address.landmark ?? "",
      notes: address.orderNotes ?? "",
    }));
    if (distObj?.id) {
      onDistrictChanged?.(distObj.id);
    }
    onFieldChanged?.();
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3 border-b border-zinc-100 pb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white">
          <Truck className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-base font-bold text-zinc-900">Shipping & Delivery Details</h2>
          <p className="text-xs text-zinc-500">Where should we deliver your order?</p>
        </div>
      </div>

      {customer && (
        <div className="mt-4">
          <CustomerAddressBook
            selectedAddressId={selectedSavedAddressId}
            onSelectAddress={applySavedAddress}
          />
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-semibold text-zinc-700">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Mohammad Ali"
            value={form.fullName}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, fullName: e.target.value }));
              onFieldChanged?.();
            }}
            className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700">
            Mobile Phone Number <span className="text-rose-500">*</span>
          </label>
          <input
            type="tel"
            required
            placeholder="01XXXXXXXXX"
            value={form.phone}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, phone: e.target.value }));
              onFieldChanged?.();
            }}
            className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-zinc-700">
            Email Address <span className="text-xs font-normal text-zinc-400">(Optional for invoice)</span>
          </label>
          <input
            type="email"
            placeholder="your.email@example.com"
            value={form.email}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, email: e.target.value }));
              onFieldChanged?.();
            }}
            className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
          />
        </div>

        {/* Bangladesh Administrative Location Hierarchy */}
        <div>
          <LocationSelect
            label="Division"
            required
            options={divisions.map((d) => ({ id: d.id, name: d.name, nameBn: d.nameBn }))}
            value={form.divisionId || form.divisionName}
            onChange={handleDivisionChange}
            placeholder="Select Division"
          />
        </div>

        <div>
          <LocationSelect
            label="District / Zila"
            required
            disabled={!form.divisionId && !form.divisionName}
            options={districts.map((d) => ({ id: d.id, name: d.name, nameBn: d.nameBn }))}
            value={form.districtId || form.districtName}
            onChange={handleDistrictChange}
            placeholder="Select District"
          />
        </div>

        <div>
          <LocationSelect
            label="Upazila / Thana"
            disabled={!form.districtId && !form.districtName}
            options={upazilas.map((u) => ({ id: u.id, name: u.name, nameBn: u.nameBn }))}
            value={form.upazilaId || form.upazilaName}
            onChange={handleUpazilaChange}
            placeholder="Select Upazila / Thana"
          />
        </div>

        <div>
          <LocationSelect
            label="Union / Area / Ward"
            disabled={!form.upazilaId && !form.upazilaName}
            options={unions.map((un) => ({ id: un.id, name: un.name, nameBn: un.nameBn }))}
            value={form.unionId || form.unionName || ""}
            onChange={(uId, item) => {
              setForm((prev) => ({
                ...prev,
                unionId: uId,
                unionName: item?.name || uId,
              }));
              onFieldChanged?.();
            }}
            placeholder="Select Union (Optional)"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-zinc-700">
            Street Address / House / Road <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="House #12, Road #4, Block B, Mirpur 1"
            value={form.street}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, street: e.target.value }));
              onFieldChanged?.();
            }}
            className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700">
            Apartment / Suite / Floor <span className="text-xs font-normal text-zinc-400">(Optional)</span>
          </label>
          <input
            type="text"
            placeholder="Flat 4B, 3rd Floor"
            value={form.apartment}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, apartment: e.target.value }));
              onFieldChanged?.();
            }}
            className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700">
            Postal / ZIP Code <span className="text-xs font-normal text-zinc-400">(Optional)</span>
          </label>
          <input
            type="text"
            placeholder="1216"
            value={form.zip}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, zip: e.target.value }));
              onFieldChanged?.();
            }}
            className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-zinc-700">
            Delivery Notes / Landmark <span className="text-xs font-normal text-zinc-400">(Optional)</span>
          </label>
          <textarea
            rows={2}
            placeholder="Near Central Mosque, Call before delivery..."
            value={form.notes}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, notes: e.target.value }));
              onFieldChanged?.();
            }}
            className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
          />
        </div>
      </div>
    </div>
  );
});
