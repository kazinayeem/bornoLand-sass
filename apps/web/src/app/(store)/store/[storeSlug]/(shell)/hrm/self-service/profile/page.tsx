"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useGetStoreBySlugQuery } from "@/redux/api/store-api";
import {
  useGetMySelfServiceProfileQuery,
  useUpdateMySelfServiceProfileMutation,
} from "@/redux/api/hrm-api";
import { useLanguage } from "@/providers/language-provider";
import {
  UserCheck,
  ArrowLeft,
  Camera,
  Lock,
  Mail,
  Phone,
  MapPin,
  HeartHandshake,
  ShieldAlert,
  Loader2,
  Save,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function MyProfilePage() {
  const params = useParams();
  const storeSlug = String(params.storeSlug);
  const { data: storeData } = useGetStoreBySlugQuery(storeSlug, { skip: !storeSlug });
  const store = storeData?.data?.store;
  const storeId = store?._id ?? "";

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const { data: profileData, isLoading, refetch } = useGetMySelfServiceProfileQuery(storeId, {
    skip: !storeId,
  });
  const [updateProfile, { isLoading: isUpdating }] = useUpdateMySelfServiceProfileMutation();

  const employee = profileData?.data?.employee;

  // Form states
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyRelation, setEmergencyRelation] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");

  useEffect(() => {
    if (employee) {
      setPhone(employee.phone || "");
      setAddress(employee.address || "");
      setEmergencyName(employee.emergencyContact?.name || "");
      setEmergencyRelation(employee.emergencyContact?.relation || "");
      setEmergencyPhone(employee.emergencyContact?.phone || "");
      setPhotoPreview(employee.photoUrl || null);
    }
  }, [employee]);

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Photo size must be less than 5MB");
      return;
    }

    // Validate type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      toast.error("Only JPEG, PNG, and WebP images are allowed");
      return;
    }

    // Local preview
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server
    try {
      setIsUploadingPhoto(true);
      const formData = new FormData();
      formData.append("photo", file);

      const res = await fetch(`/api/v1/stores/${storeId}/hrm/self-service/profile/photo`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to upload photo");

      toast.success("Profile photo updated successfully!");
      refetch();
    } catch (err: any) {
      toast.error(err?.message || "Photo upload failed");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        storeId,
        phone,
        address,
        emergencyContact: {
          name: emergencyName,
          relation: emergencyRelation,
          phone: emergencyPhone,
        },
      }).unwrap();

      toast.success("Personal information updated successfully!");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update profile");
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
            <UserCheck className="h-6 w-6 text-[#003399]" />
            <span>My Profile</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Manage your personal contact details, emergency contacts, and profile photo.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Photo & Identity Overview */}
        <Card className="border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm h-fit">
          <CardHeader className="pb-3 text-center">
            <CardTitle className="text-base font-bold text-zinc-900 dark:text-white">
              Profile Photo
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <div className="relative group">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Profile"
                  className="h-28 w-28 rounded-3xl object-cover border-2 border-[#003399]/20 shadow-md"
                />
              ) : (
                <div className="h-28 w-28 rounded-3xl bg-[#003399] text-white flex items-center justify-center font-bold text-3xl shadow-md">
                  {employee?.firstName?.[0]}
                  {employee?.lastName?.[0] || ""}
                </div>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingPhoto}
                className="absolute bottom-0 right-0 p-2 bg-[#003399] hover:bg-[#002B80] text-white rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer"
                title="Change Photo"
              >
                {isUploadingPhoto ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoSelect}
              className="hidden"
            />

            <div className="text-center space-y-1">
              <h3 className="font-bold text-base text-zinc-900 dark:text-white">
                {employee?.firstName} {employee?.lastName}
              </h3>
              <p className="text-xs text-zinc-500">
                {employee?.designationId?.name || "Team Member"} • {employee?.departmentId?.name || "General"}
              </p>
              <span className="inline-block mt-2 font-mono text-xs font-bold bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md text-zinc-700 dark:text-zinc-300">
                ID: {employee?.employeeCode}
              </span>
            </div>

            <div className="w-full pt-4 border-t border-zinc-100 dark:border-zinc-800 text-xs space-y-2">
              <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                <Mail className="h-3.5 w-3.5 text-zinc-400" />
                <span className="truncate">{employee?.email}</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                <Phone className="h-3.5 w-3.5 text-zinc-400" />
                <span>{employee?.phone || "No phone registered"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Permitted Personal Fields */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSaveProfile}>
            <Card className="border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-zinc-900 dark:text-white">
                  Personal Information
                </CardTitle>
                <CardDescription className="text-xs text-zinc-500">
                  Update your contact telephone, home address, and emergency contact details.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Personal Phone Number *</Label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="017XXXXXXXX"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Login Email Address (Read Only)</Label>
                    <Input value={employee?.email || ""} disabled className="bg-zinc-50 dark:bg-zinc-800 cursor-not-allowed" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Current Residential Address</Label>
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House, Road, Area, City"
                  />
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block mb-3 flex items-center gap-2">
                    <HeartHandshake className="h-4 w-4 text-rose-600" />
                    <span>Emergency Contact Information</span>
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label>Contact Name</Label>
                      <Input
                        value={emergencyName}
                        onChange={(e) => setEmergencyName(e.target.value)}
                        placeholder="e.g. Spouse, Parent"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label>Relationship</Label>
                      <Input
                        value={emergencyRelation}
                        onChange={(e) => setEmergencyRelation(e.target.value)}
                        placeholder="e.g. Father, Mother, Spouse"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label>Contact Phone</Label>
                      <Input
                        value={emergencyPhone}
                        onChange={(e) => setEmergencyPhone(e.target.value)}
                        placeholder="018XXXXXXXX"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={isUpdating}
                    className="bg-[#003399] hover:bg-[#002B80] text-white font-bold gap-2"
                  >
                    {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    <span>Save Changes</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>

          {/* Protected HR Fields (Read Only) */}
          <Card className="border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Lock className="h-4 w-4 text-amber-600" />
                  <span>Protected Official HR Records</span>
                </CardTitle>
                <CardDescription className="text-xs text-zinc-500 mt-0.5">
                  These fields are governed by HR administration and cannot be directly modified by employees.
                </CardDescription>
              </div>
              <Link
                href={`/store/${storeSlug}/hrm/self-service/requests`}
                className="text-xs font-bold text-[#003399] hover:underline dark:text-blue-400"
              >
                Submit HR Request
              </Link>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
                  <span className="text-zinc-400 block text-[11px] font-medium">Employee ID</span>
                  <span className="font-mono font-bold text-zinc-900 dark:text-white mt-1 block">
                    {employee?.employeeCode}
                  </span>
                </div>

                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
                  <span className="text-zinc-400 block text-[11px] font-medium">Department</span>
                  <span className="font-bold text-zinc-900 dark:text-white mt-1 block">
                    {employee?.departmentId?.name || "General"}
                  </span>
                </div>

                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
                  <span className="text-zinc-400 block text-[11px] font-medium">Designation</span>
                  <span className="font-bold text-zinc-900 dark:text-white mt-1 block">
                    {employee?.designationId?.name || "Member"}
                  </span>
                </div>

                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
                  <span className="text-zinc-400 block text-[11px] font-medium">Joining Date</span>
                  <span className="font-mono font-bold text-zinc-900 dark:text-white mt-1 block">
                    {employee?.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : "—"}
                  </span>
                </div>

                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
                  <span className="text-zinc-400 block text-[11px] font-medium">Employment Type</span>
                  <span className="capitalize font-bold text-zinc-900 dark:text-white mt-1 block">
                    {employee?.employmentType?.replace("_", " ") || "Full Time"}
                  </span>
                </div>

                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
                  <span className="text-zinc-400 block text-[11px] font-medium">Employment Status</span>
                  <span className="capitalize font-bold text-emerald-600 mt-1 block">
                    {employee?.status || "Active"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
