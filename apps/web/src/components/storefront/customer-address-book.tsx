"use client";

import { useEffect, useMemo, useState } from "react";
import { Home, MapPin, Plus, Pencil, Trash2, Check, Briefcase, MapPinned } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { CustomerAuthLoader } from "@/components/auth/customer-auth-loader";
import { cn } from "@/lib/utils";
import { useStorefrontSurface } from "@/components/storefront/storefront-ui";
import {
  useCreateCustomerAddressMutation,
  useDeleteCustomerAddressMutation,
  useGetCustomerAddressesQuery,
  useSetDefaultCustomerAddressMutation,
  useUpdateCustomerAddressMutation,
  type CustomerAddress,
  type CustomerAddressPayload,
} from "@/redux/api/customer-api";

const EMPTY_FORM: CustomerAddressPayload = {
  label: "Home",
  fullName: "",
  phone: "",
  email: "",
  country: "Bangladesh",
  state: "",
  city: "",
  area: "",
  street: "",
  apartment: "",
  zip: "",
  landmark: "",
  orderNotes: "",
  isDefault: false,
};

type Props = {
  mode?: "checkout" | "account";
  selectedAddressId?: string | null;
  onSelectAddress?: (address: CustomerAddress) => void;
  onDefaultAddressLoaded?: (address: CustomerAddress | null) => void;
};

export function CustomerAddressBook({
  mode = "account",
  selectedAddressId,
  onSelectAddress,
  onDefaultAddressLoaded,
}: Props) {
  const { classes } = useStorefrontSurface();
  const { data, isLoading, isFetching, isError, refetch } = useGetCustomerAddressesQuery();
  const [createAddress, { isLoading: creating }] = useCreateCustomerAddressMutation();
  const [updateAddress, { isLoading: updating }] = useUpdateCustomerAddressMutation();
  const [deleteAddress, { isLoading: deleting }] = useDeleteCustomerAddressMutation();
  const [setDefaultAddress, { isLoading: settingDefault }] = useSetDefaultCustomerAddressMutation();

  const addresses = data?.data?.addresses ?? [];
  const maxAddresses = data?.data?.maxAddresses ?? 2;
  const defaultAddress = useMemo(() => addresses.find((address) => address.isDefault) ?? null, [addresses]);
  const canAdd = addresses.length < maxAddresses;

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CustomerAddress | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CustomerAddress | null>(null);
  const [form, setForm] = useState<CustomerAddressPayload>(EMPTY_FORM);

  useEffect(() => {
    onDefaultAddressLoaded?.(defaultAddress);
  }, [defaultAddress, onDefaultAddressLoaded]);

  useEffect(() => {
    if (!selectedAddressId && defaultAddress && mode === "checkout") {
      onSelectAddress?.(defaultAddress);
    }
  }, [defaultAddress, mode, onSelectAddress, selectedAddressId]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, isDefault: addresses.length === 0 });
    setModalOpen(true);
  };

  const openEdit = (address: CustomerAddress) => {
    setEditing(address);
    setForm({
      label: address.label,
      fullName: address.fullName,
      phone: address.phone,
      email: address.email ?? "",
      country: address.country,
      state: address.state,
      city: address.city,
      area: address.area ?? "",
      street: address.street,
      apartment: address.apartment ?? "",
      zip: address.zip ?? "",
      landmark: address.landmark ?? "",
      orderNotes: address.orderNotes ?? "",
      isDefault: address.isDefault,
    });
    setModalOpen(true);
  };

  const saveAddress = async () => {
    try {
      if (editing) {
        await updateAddress({ id: editing._id, data: form }).unwrap();
        toast.success("Address updated");
      } else {
        await createAddress(form).unwrap();
        toast.success("Address saved");
      }
      setModalOpen(false);
      setEditing(null);
      setForm(EMPTY_FORM);
    } catch (error: any) {
      toast.error(error?.data?.message ?? "Could not save address");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAddress(deleteTarget._id).unwrap();
      toast.success("Address deleted");
      setDeleteTarget(null);
    } catch (error: any) {
      toast.error(error?.data?.message ?? "Could not delete address");
    }
  };

  const handleSetDefault = async (address: CustomerAddress) => {
    try {
      await setDefaultAddress(address._id).unwrap();
      toast.success("Default address updated");
    } catch (error: any) {
      toast.error(error?.data?.message ?? "Could not update default address");
    }
  };

  const cardLabelIcon = (label: CustomerAddress["label"]) => {
    if (label === "Office") return <Briefcase className="h-4 w-4" />;
    if (label === "Other") return <MapPinned className="h-4 w-4" />;
    return <Home className="h-4 w-4" />;
  };

  const busy = creating || updating || deleting || settingDefault;

  if (isLoading && addresses.length === 0) {
    return <CustomerAuthLoader message="Loading your saved addresses…" />;
  }

  if (isError) {
    return <ErrorState message="Failed to load saved addresses." onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className={cn("font-semibold", classes.heading)}>
            {mode === "checkout" ? "Saved Addresses" : "Saved Addresses"}
          </h2>
          <p className={cn("text-sm", classes.muted)}>
            Save up to {maxAddresses} addresses for faster checkout.
          </p>
        </div>
        {canAdd ? (
          <Button variant="outline" size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" /> Add New Address
          </Button>
        ) : (
          <span className={cn("text-xs", classes.muted)}>You can save up to 2 addresses.</span>
        )}
      </div>

      {addresses.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No saved addresses yet"
          description="Your first successful order will save its shipping address automatically."
          action={canAdd ? <Button variant="default" size="sm" onClick={openCreate}><Plus className="h-4 w-4" /> Add New Address</Button> : undefined}
        />
      ) : (
        <div className="grid gap-3">
          {addresses.map((address) => {
            const isSelected = selectedAddressId === address._id;
            return (
              <div
                key={address._id}
                className={cn(
                  "rounded-apple-lg border p-4 transition-all",
                  classes.card,
                  isSelected && "border-apple-primary ring-1 ring-apple-primary/20",
                  isFetching && "opacity-80",
                )}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={cn("inline-flex items-center gap-1 rounded-apple-pill px-3 py-1 text-xs font-medium", classes.chip)}>
                        {cardLabelIcon(address.label)}
                        {address.label}
                      </span>
                      {address.isDefault && (
                        <span className="inline-flex items-center gap-1 rounded-apple-pill bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                          <Check className="h-3.5 w-3.5" /> Default
                        </span>
                      )}
                    </div>
                    <div className={cn("space-y-1 text-sm", classes.body)}>
                      <p className={cn("font-medium", classes.heading)}>{address.fullName}</p>
                      <p>{address.phone}</p>
                      <p>
                        {[address.area, address.street, address.apartment].filter(Boolean).join(", ")}
                      </p>
                      <p>
                        {[address.city, address.state, address.zip].filter(Boolean).join(", ")}
                      </p>
                      {address.landmark ? <p>Landmark: {address.landmark}</p> : null}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {mode === "checkout" && onSelectAddress ? (
                      <Button variant={isSelected ? "default" : "outline"} size="sm" onClick={() => onSelectAddress(address)}>
                        Use
                      </Button>
                    ) : null}
                    <Button variant="ghost" size="sm" onClick={() => openEdit(address)}>
                      <Pencil className="h-4 w-4" /> Edit
                    </Button>
                    {!address.isDefault ? (
                      <Button variant="ghost" size="sm" onClick={() => handleSetDefault(address)}>
                        Set Default
                      </Button>
                    ) : null}
                    <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-600" onClick={() => setDeleteTarget(address)}>
                      <Trash2 className="h-4 w-4" /> Delete
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => !busy && setModalOpen(false)}
        title={editing ? "Edit Address" : "Add New Address"}
        description="Save an address for faster checkout."
        size="xl"
        loading={busy}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={busy}>Cancel</Button>
            <Button onClick={saveAddress} loading={busy} loadingKey="save">{editing ? "Update Address" : "Save Address"}</Button>
          </div>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Label">
            <select value={form.label} onChange={(e) => setForm((prev) => ({ ...prev, label: e.target.value as CustomerAddress["label"] }))} className={fieldClass(classes.inputCompact)}>
              <option value="Home">Home</option>
              <option value="Office">Office</option>
              <option value="Other">Other</option>
            </select>
          </Field>
          <Field label="Full Name *"><input value={form.fullName} onChange={onField(setForm, "fullName")} className={fieldClass(classes.inputCompact)} /></Field>
          <Field label="Phone *"><input value={form.phone} onChange={onField(setForm, "phone")} className={fieldClass(classes.inputCompact)} /></Field>
          <Field label="Email"><input value={form.email ?? ""} onChange={onField(setForm, "email")} className={fieldClass(classes.inputCompact)} /></Field>
          <Field label="Country *"><input value={form.country} onChange={onField(setForm, "country")} className={fieldClass(classes.inputCompact)} /></Field>
          <Field label="Division / State *"><input value={form.state} onChange={onField(setForm, "state")} className={fieldClass(classes.inputCompact)} /></Field>
          <Field label="District / City *"><input value={form.city} onChange={onField(setForm, "city")} className={fieldClass(classes.inputCompact)} /></Field>
          <Field label="Area"><input value={form.area ?? ""} onChange={onField(setForm, "area")} className={fieldClass(classes.inputCompact)} /></Field>
          <Field label="Street Address *"><input value={form.street} onChange={onField(setForm, "street")} className={fieldClass(classes.inputCompact)} /></Field>
          <Field label="Apartment / Flat"><input value={form.apartment ?? ""} onChange={onField(setForm, "apartment")} className={fieldClass(classes.inputCompact)} /></Field>
          <Field label="Postal Code"><input value={form.zip ?? ""} onChange={onField(setForm, "zip")} className={fieldClass(classes.inputCompact)} /></Field>
          <Field label="Landmark"><input value={form.landmark ?? ""} onChange={onField(setForm, "landmark")} className={fieldClass(classes.inputCompact)} /></Field>
          <Field label="Order Notes" className="md:col-span-2"><textarea rows={3} value={form.orderNotes ?? ""} onChange={onField(setForm, "orderNotes")} className={fieldClass("w-full rounded-apple-md px-4 py-3 text-sm", classes.inputCompact)} /></Field>
          <label className={cn("md:col-span-2 inline-flex items-center gap-2 text-sm", classes.body)}>
            <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm((prev) => ({ ...prev, isDefault: e.target.checked }))} />
            Set as default address
          </label>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete address?"
        message="This removes the saved address for future orders only. Existing orders will stay unchanged."
        confirmLabel="Delete"
        loading={deleting}
      />
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("block space-y-1.5", className)}>
      <span className="text-xs font-medium text-apple-ink-muted-80">{label}</span>
      {children}
    </label>
  );
}

function onField(
  setForm: React.Dispatch<React.SetStateAction<CustomerAddressPayload>>,
  key: keyof CustomerAddressPayload,
) {
  return (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };
}

function fieldClass(...values: Array<string | undefined>) {
  return cn("w-full px-4", ...values);
}
