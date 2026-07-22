"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Pencil, Mail, MapPin, Phone, Trash2, LockKeyhole, Camera, Upload, XCircle } from "lucide-react";
import { toast } from "sonner";
import { usePathname, useRouter } from "next/navigation";

import { CustomerAccountShell } from "@/components/storefront/customer-account-shell";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useStorefrontSurface } from "@/components/storefront/storefront-ui";
import { cn } from "@/lib/utils";
import { useAppDispatch } from "@/hooks/redux";
import { setCustomerFromToken } from "@/redux/slices/customer-slice";

import {
  useGetCustomerMeQuery,
  useGetCustomerAddressesQuery,
  useUpdateCustomerProfileMutation,
  useUploadCustomerAvatarMutation,
  useRemoveCustomerAvatarMutation,
} from "@/redux/api/customer-api";
import { resolveStoreHref } from "@/lib/store-href";

export default function ProfileAccountPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname() || "";
  const { classes, primaryColor } = useStorefrontSurface();

  const { data, isLoading, isFetching, refetch } = useGetCustomerMeQuery();
  const { data: addressData } = useGetCustomerAddressesQuery();
  const profile = data?.data?.customer;
  const defaultAddress = addressData?.data?.addresses?.find((item) => item.isDefault) ?? null;

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthday, setBirthday] = useState("");
  const [gender, setGender] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const initials = useMemo(() => {
    const n = profile?.name ?? "";
    return (
      n
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0])
        .join("")
        .toUpperCase() || "U"
    );
  }, [profile?.name]);

  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(avatarFile);
    setAvatarPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  const onOpenEdit = () => {
    setName(profile?.name ?? "");
    setPhone(profile?.phone ?? "");
    setBirthday(profile?.birthday ? String(profile.birthday).slice(0, 10) : "");
    setGender(profile?.gender ?? "");
    setAvatarFile(null);
    setOpen(true);
  };

  const [updateProfile] = useUpdateCustomerProfileMutation();
  const [uploadAvatar] = useUploadCustomerAvatarMutation();
  const [removeAvatar] = useRemoveCustomerAvatarMutation();

  const onSave = async () => {
    if (!profile?._id) return;
    if (!name.trim() || !phone.trim()) {
      toast.error("Name and phone are required");
      return;
    }

    setBusy(true);
    try {
      let nextToken: string | null = null;

      if (avatarFile) {
        const fd = new FormData();
        fd.append("avatar", avatarFile);
        const res = await uploadAvatar(fd).unwrap();
        nextToken = res.data?.token ?? null;
      }

      const updated = await updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        birthday: birthday || null,
        gender,
      }).unwrap();
      nextToken = updated.data?.token ?? nextToken;

      if (nextToken) {
        localStorage.setItem("customer_token", nextToken);
        dispatch(setCustomerFromToken(nextToken));
      }

      toast.success("Profile updated");
      setOpen(false);
      setAvatarFile(null);
      await refetch();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Could not update profile");
    } finally {
      setBusy(false);
    }
  };

  const onRemoveAvatar = async () => {
    if (!profile) return;
    setBusy(true);
    try {
      const res = await removeAvatar().unwrap();
      if (res.data?.token) {
        localStorage.setItem("customer_token", res.data.token);
        dispatch(setCustomerFromToken(res.data.token));
      }
      toast.success("Profile photo removed");
      setAvatarFile(null);
      await refetch();
    } catch {
      toast.error("Could not remove photo");
    } finally {
      setBusy(false);
    }
  };

  const applyAvatarFile = (file: File | null) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Upload a JPG, PNG, or WebP image");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5 MB");
      return;
    }
    setAvatarFile(file);
  };

  return (
    <CustomerAccountShell>
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Profile</h1>
            <p className="mt-1 text-sm" style={{ color: "#6B7280" }}>
              Edit your name, phone and profile photo.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => void refetch()} disabled={isLoading || isFetching}>
              {isFetching ? "Refreshing…" : "Refresh"}
            </Button>
                  <Button variant="outline" onClick={() => router.push(resolveStoreHref("/account/password", pathname))} disabled={!profile || isLoading}>
                    <LockKeyhole className="h-4 w-4" /> Change password
                  </Button>
            <Button onClick={onOpenEdit} disabled={!profile || isLoading}>
              <Pencil className="h-4 w-4" /> Edit profile
            </Button>
          </div>
        </div>

        {isLoading || !profile ? (
          <div className="grid gap-4 rounded-apple-lg border p-4" style={{ borderColor: "#E5E7EB" }}>
            <div className="h-28 w-full animate-pulse rounded-apple-lg bg-apple-canvas-parchment" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-4 lg:grid-cols-[220px_1fr]"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="relative h-28 w-28 overflow-hidden rounded-full bg-black/5">
                {profile.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatar} alt={profile.name} className="h-full w-full object-cover" />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center"
                    style={{ backgroundColor: `${primaryColor}22` }}
                  >
                    <span className="text-2xl font-semibold" style={{ color: primaryColor }}>
                      {initials}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-xs font-medium text-apple-ink-muted-48">Profile photo</p>
            </div>

            <div className="space-y-4">
                    <div className="rounded-apple-lg border p-4" style={{ borderColor: "#E5E7EB" }}>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <p className="text-xs font-medium" style={{ color: "#6B7280" }}>
                      Full name
                    </p>
                    <p className="mt-1 text-sm font-semibold">{profile.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium" style={{ color: "#6B7280" }}>
                      Phone
                    </p>
                    <p className="mt-1 text-sm font-semibold">{profile.phone || "—"}</p>
                  </div>
                        <div>
                          <p className="text-xs font-medium" style={{ color: "#6B7280" }}>
                            Total orders
                          </p>
                          <p className="mt-1 text-sm font-semibold">{profile.totalOrders ?? 0}</p>
                        </div>
                </div>
              </div>

              <div className="rounded-apple-lg border p-4" style={{ borderColor: "#E5E7EB" }}>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <p className="text-xs font-medium" style={{ color: "#6B7280" }}>
                      Email
                    </p>
                    <p className="mt-1 flex items-center gap-2 text-sm font-medium">
                      <Mail className="h-4 w-4 text-apple-ink-muted-48" />
                      {profile.email}
                    </p>
                    <p className="mt-2 text-xs" style={{ color: "#6B7280" }}>
                      Email should not be editable directly.
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium" style={{ color: "#6B7280" }}>
                            Member since
                    </p>
                    <p className="mt-1 text-sm font-semibold">
                            {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium" style={{ color: "#6B7280" }}>
                            Birthday
                          </p>
                          <p className="mt-1 text-sm font-semibold">
                            {profile.birthday ? new Date(profile.birthday).toLocaleDateString() : "—"}
                    </p>
                  </div>
                </div>
              </div>

                    <div className="rounded-apple-lg border p-4" style={{ borderColor: "#E5E7EB" }}>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <p className="text-xs font-medium" style={{ color: "#6B7280" }}>
                            Gender
                          </p>
                          <p className="mt-1 text-sm font-semibold">{profile.gender ? profile.gender.replace(/_/g, " ") : "—"}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium" style={{ color: "#6B7280" }}>
                            Default address
                          </p>
                          <p className="mt-1 text-sm font-semibold">
                            {defaultAddress ? `${defaultAddress.street}, ${defaultAddress.city}` : "No default address yet"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {(profile.phone || "").trim() || defaultAddress ? (
                <div className="flex items-center gap-2 rounded-apple-lg border p-4" style={{ borderColor: "#E5E7EB" }}>
                        {defaultAddress ? <MapPin className="h-4 w-4 text-apple-ink-muted-48" /> : <Phone className="h-4 w-4 text-apple-ink-muted-48" />}
                  <p className="text-sm" style={{ color: "#6B7280" }}>
                          {defaultAddress ? "Your default delivery address is ready for faster checkout." : "We use your phone for delivery updates."}
                  </p>
                </div>
              ) : null}
            </div>
          </motion.div>
        )}

        <Modal
          open={open}
          onClose={() => !busy && setOpen(false)}
          title="Edit Profile"
          description="Update your name, phone and profile photo."
          loading={busy}
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)} disabled={busy}>
                Cancel
              </Button>
              <Button loading={busy} loadingKey="save" onClick={() => void onSave()} disabled={!name.trim() || !phone.trim()}>
                Save changes
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-[180px_1fr]">
              <div className="flex flex-col items-start gap-2">
                <p className="text-sm font-semibold">Avatar</p>
                <p className="text-xs" style={{ color: "#6B7280" }}>
                  Upload a JPG, PNG or WebP.
                </p>
              </div>

              <div>
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-apple-lg border p-3 transition-colors",
                    dragOver && "border-black bg-apple-canvas-parchment",
                  )}
                  style={{ borderColor: "#E5E7EB" }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    applyAvatarFile(e.dataTransfer.files?.[0] ?? null);
                  }}
                >
                  <div className="relative h-12 w-12 overflow-hidden rounded-full bg-black/5">
                    {avatarPreviewUrl || avatarFile ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatarPreviewUrl ?? undefined} alt="New avatar preview" className="h-full w-full object-cover" />
                    ) : profile?.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={profile.avatar} alt="Current avatar" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="text-base font-semibold" style={{ color: primaryColor }}>
                          {initials}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-center bg-black/60 py-1 text-white">
                      <Camera className="h-3.5 w-3.5" />
                    </div>
                  </div>

                  <div className="flex-1">
                    <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-apple-ink">
                      <Upload className="h-4 w-4" />
                      <span>{avatarFile ? "Replace photo" : "Upload photo"}</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => applyAvatarFile(e.target.files?.[0] ?? null)}
                        disabled={busy}
                        className="hidden"
                      />
                    </label>
                    <p className="mt-1 text-xs text-apple-ink-muted-48">
                      Click to upload or drag and drop. We automatically optimize the image before saving.
                    </p>
                    {avatarFile ? (
                      <button
                        type="button"
                        onClick={() => setAvatarFile(null)}
                        className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-apple-ink-muted-80 hover:text-apple-ink"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Cancel pending change
                      </button>
                    ) : null}
                    {profile?.avatar ? (
                      <button
                        type="button"
                        onClick={() => void onRemoveAvatar()}
                        disabled={busy}
                        className={cn(
                          "mt-2 inline-flex items-center gap-2 text-xs font-medium text-red-600 hover:text-red-700",
                        )}
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Remove photo
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

                  <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Full name</label>
                <input
                  className={classes.inputCompact}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={busy}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Phone</label>
                <input
                  className={classes.inputCompact}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={busy}
                />
              </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">Birthday</label>
                      <input
                        className={classes.inputCompact}
                        type="date"
                        value={birthday}
                        onChange={(e) => setBirthday(e.target.value)}
                        disabled={busy}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">Gender</label>
                      <select
                        className={classes.inputCompact}
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        disabled={busy}
                      >
                        <option value="">Prefer not to say</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="non_binary">Non-binary</option>
                        <option value="prefer_not_to_say">Prefer not to say</option>
                      </select>
                    </div>
            </div>
          </div>
        </Modal>
      </div>
    </CustomerAccountShell>
  );
}
