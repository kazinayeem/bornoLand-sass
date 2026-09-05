"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  X,
  RotateCw,
  Printer,
  Download,
  Copy,
  Check,
  ShieldCheck,
  UploadCloud,
  Loader2,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import type { EmployeeIdCardData } from "@/redux/api/hrm-api";
import { useUploadEmployeePhotoAdminMutation } from "@/redux/api/hrm-api";
import { PrintPortal } from "@/components/documents/print-portal";
import { EmployeeIdCardFront, EmployeeIdCardBack } from "./employee-id-card-view";

interface EmployeeIdCardModalProps {
  open: boolean;
  onClose: () => void;
  cardData: EmployeeIdCardData | undefined;
  isLoading?: boolean;
  storeSlug?: string;
  employeeId?: string;
  canUploadPhoto?: boolean;
}

export function EmployeeIdCardModal({
  open,
  onClose,
  cardData,
  isLoading = false,
  storeSlug,
  employeeId,
  canUploadPhoto = false,
}: EmployeeIdCardModalProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadPhoto, { isLoading: isUploadingPhoto }] = useUploadEmployeePhotoAdminMutation();

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleCopyLink = useCallback(async () => {
    if (!cardData?.verificationUrl) return;
    try {
      await navigator.clipboard.writeText(cardData.verificationUrl);
      setCopied(true);
      toast.success("Verification link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  }, [cardData?.verificationUrl]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !storeSlug || !employeeId) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WebP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Photo size must not exceed 5MB");
      return;
    }

    try {
      await uploadPhoto({ storeSlug, employeeId, file }).unwrap();
      toast.success("Employee photo updated successfully");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update employee photo");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  /**
   * Generates a high-resolution CR80 PNG (600 × 950 px) directly on an HTML5 canvas.
   */
  const handleDownloadSide = useCallback(
    async (side: "front" | "back") => {
      if (!cardData) return;
      setIsDownloading(true);

      try {
        const width = 600;
        const height = 950;
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas 2D context unavailable");

        const brandColor = cardData.store.brandColor || "#003399";
        const emp = cardData.employee;

        // Draw card background with rounded corners (r=24px at 2x)
        const radius = 24;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(radius, 0);
        ctx.lineTo(width - radius, 0);
        ctx.quadraticCurveTo(width, 0, width, radius);
        ctx.lineTo(width, height - radius);
        ctx.quadraticCurveTo(width, height, width - radius, height);
        ctx.lineTo(radius, height);
        ctx.quadraticCurveTo(0, height, 0, height - radius);
        ctx.lineTo(0, radius);
        ctx.quadraticCurveTo(0, 0, radius, 0);
        ctx.closePath();
        ctx.clip();

        // White background
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);

        if (side === "front") {
          // Top Header Banner
          ctx.fillStyle = brandColor;
          ctx.fillRect(0, 0, width, 140);

          // Store Name
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 26px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
          ctx.fillText(cardData.store.name.toUpperCase(), 40, 60);

          ctx.font = "500 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
          ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
          ctx.fillText("STAFF IDENTITY CARD", 40, 92);

          // CR80 tag
          ctx.font = "bold 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
          ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
          ctx.fillText("CR80", width - 80, 60);

          // Employee Photo or Avatar
          const photoW = 200;
          const photoH = 240;
          const photoX = (width - photoW) / 2;
          const photoY = 190;

          if (emp.photoUrl) {
            try {
              const img = new Image();
              img.crossOrigin = "anonymous";
              await new Promise<void>((resolve, reject) => {
                img.onload = () => resolve();
                img.onerror = () => reject();
                img.src = emp.photoUrl!;
              });
              ctx.drawImage(img, photoX, photoY, photoW, photoH);
              ctx.strokeStyle = brandColor;
              ctx.lineWidth = 4;
              ctx.strokeRect(photoX, photoY, photoW, photoH);
            } catch {
              // Fallback placeholder
              ctx.fillStyle = "#f4f4f5";
              ctx.fillRect(photoX, photoY, photoW, photoH);
              ctx.fillStyle = "#52525b";
              ctx.font = "bold 48px sans-serif";
              ctx.textAlign = "center";
              ctx.fillText(`${emp.firstName[0] || ""}${emp.lastName[0] || ""}`, width / 2, photoY + 130);
              ctx.textAlign = "left";
            }
          } else {
            ctx.fillStyle = "#f4f4f5";
            ctx.fillRect(photoX, photoY, photoW, photoH);
            ctx.fillStyle = "#52525b";
            ctx.font = "bold 48px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(`${emp.firstName[0] || ""}${emp.lastName[0] || ""}`, width / 2, photoY + 130);
            ctx.textAlign = "left";
          }

          // Full Name
          ctx.fillStyle = "#09090b";
          ctx.font = "bold 32px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(emp.fullName.toUpperCase(), width / 2, 490);

          // Designation
          ctx.fillStyle = brandColor;
          ctx.font = "600 22px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
          ctx.fillText(emp.designation, width / 2, 530);

          // Employee Code & Department
          ctx.textAlign = "left";
          ctx.fillStyle = "#f8fafc";
          ctx.fillRect(40, 570, 240, 90);
          ctx.fillRect(320, 570, 240, 90);

          ctx.fillStyle = "#71717a";
          ctx.font = "bold 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
          ctx.fillText("EMPLOYEE ID", 60, 605);
          ctx.fillText("DEPARTMENT", 340, 605);

          ctx.fillStyle = "#09090b";
          ctx.font = "bold 20px monospace";
          ctx.fillText(emp.employeeCode, 60, 638);
          ctx.font = "bold 18px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
          ctx.fillText(emp.department, 340, 638);

          // Bottom Bar & QR
          ctx.fillStyle = "#f8fafc";
          ctx.fillRect(0, 780, width, 155);

          ctx.fillStyle = "#71717a";
          ctx.font = "bold 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
          ctx.fillText("OFFICIAL EMPLOYEE", 40, 835);
          ctx.font = "500 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
          ctx.fillStyle = "#3f3f46";
          ctx.fillText("BornoLand Verified", 40, 870);

          // Draw QR Code if present
          if (cardData.cardMeta.qrCodeDataUrl) {
            try {
              const qrImg = new Image();
              await new Promise<void>((resolve, reject) => {
                qrImg.onload = () => resolve();
                qrImg.onerror = () => reject();
                qrImg.src = cardData.cardMeta.qrCodeDataUrl!;
              });
              ctx.drawImage(qrImg, width - 150, 795, 110, 110);
            } catch {
              // Ignore QR draw error
            }
          }

          // Bottom Accent Strip
          ctx.fillStyle = brandColor;
          ctx.fillRect(0, 935, width, 15);
        } else {
          // BACK SIDE
          ctx.fillStyle = brandColor;
          ctx.fillRect(0, 0, width, 100);

          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(cardData.store.name.toUpperCase(), width / 2, 50);

          ctx.font = "500 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
          ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
          ctx.fillText(cardData.store.website || "www.bornoland.com", width / 2, 75);

          // Card details
          ctx.textAlign = "left";
          ctx.font = "16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
          ctx.fillStyle = "#71717a";
          ctx.fillText("Cardholder:", 40, 160);
          ctx.fillText("System ID:", 40, 205);
          ctx.fillText("Issue Date:", 40, 250);

          ctx.fillStyle = "#09090b";
          ctx.font = "bold 18px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
          ctx.fillText(emp.fullName, 200, 160);
          ctx.font = "bold 18px monospace";
          ctx.fillText(emp.employeeCode, 200, 205);
          ctx.font = "500 18px monospace";
          ctx.fillText(
            new Date(cardData.cardMeta.issuedAt).toLocaleDateString("en-GB", {
              month: "short",
              year: "numeric",
            }),
            200,
            250
          );

          if (emp.bloodGroup) {
            ctx.fillStyle = "#71717a";
            ctx.font = "16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
            ctx.fillText("Blood Group:", 40, 295);
            ctx.fillStyle = "#dc2626";
            ctx.font = "bold 20px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
            ctx.fillText(emp.bloodGroup, 200, 295);
          }

          // Emergency Contact
          if (emp.emergencyContact && emp.emergencyContact.phone) {
            ctx.fillStyle = "#f8fafc";
            ctx.fillRect(40, 340, width - 80, 110);
            ctx.strokeStyle = "#e2e8f0";
            ctx.strokeRect(40, 340, width - 80, 110);

            ctx.fillStyle = "#475569";
            ctx.font = "bold 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
            ctx.fillText("EMERGENCY CONTACT", 60, 375);

            ctx.fillStyle = "#0f172a";
            ctx.font = "bold 18px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
            ctx.fillText(
              `${emp.emergencyContact.name} ${
                emp.emergencyContact.relation ? `(${emp.emergencyContact.relation})` : ""
              }`,
              60,
              405
            );

            ctx.fillStyle = "#64748b";
            ctx.font = "bold 16px monospace";
            ctx.fillText(emp.emergencyContact.phone, 60, 432);
          }

          // Terms and conditions
          ctx.fillStyle = "#334155";
          ctx.font = "bold 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
          ctx.fillText("TERMS & CONDITIONS", 40, 500);

          ctx.font = "14px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
          ctx.fillStyle = "#64748b";
          ctx.fillText("• This card is non-transferable property of the organization.", 40, 530);
          ctx.fillText("• Must be worn and produced on demand on company premises.", 40, 560);
          ctx.fillText("• If lost, report immediately to Human Resources department.", 40, 590);

          // Return address
          ctx.textAlign = "center";
          ctx.font = "bold 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
          ctx.fillStyle = "#334155";
          ctx.fillText("If found, please return to:", width / 2, 700);
          ctx.font = "600 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
          ctx.fillStyle = "#0f172a";
          ctx.fillText(cardData.store.name, width / 2, 730);

          // Security seal bar
          ctx.fillStyle = "#f1f5f9";
          ctx.fillRect(0, 860, width, 75);
          ctx.fillStyle = "#64748b";
          ctx.font = "bold 14px monospace";
          ctx.textAlign = "left";
          ctx.fillText("SECURITY LEVEL: 1", 40, 905);
          ctx.textAlign = "right";
          ctx.fillText("BORNO SECURE ID", width - 40, 905);

          // Bottom Accent Strip
          ctx.fillStyle = brandColor;
          ctx.fillRect(0, 935, width, 15);
        }

        ctx.restore();

        // Trigger Download
        const dataUrl = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = `${emp.employeeCode || "employee"}-id-${side}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        toast.success(`Downloaded ${side} side of ID Card`);
      } catch (err) {
        console.error("Failed to generate ID card image:", err);
        toast.error("Failed to download image. You can also use the Print/PDF button.");
      } finally {
        setIsDownloading(false);
      }
    },
    [cardData]
  );

  if (!open) return null;

  return (
    <>
      {/* 1. Modal Dialog for Screen (hidden in print) */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto no-print">
        <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden my-auto animate-in fade-in-50 zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 bg-zinc-50/70 dark:bg-zinc-900/50">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
                  Employee Identification Card
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  CR80 Standard Physical Dimensions (53.98mm × 85.60mm)
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6">
            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3 text-zinc-500">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="text-sm font-medium">Generating official employee ID card...</p>
              </div>
            ) : !cardData ? (
              <div className="py-16 text-center text-zinc-500">
                <p className="font-semibold text-zinc-800 dark:text-zinc-200">Unable to load ID card</p>
                <p className="text-xs mt-1">Please ensure the employee record exists and is active.</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                {/* 3D Flip Card Container */}
                <div
                  className="relative group cursor-pointer my-2"
                  style={{ perspective: "1200px" }}
                  onClick={handleFlip}
                  title="Click to flip card"
                >
                  <div
                    className="relative transition-transform duration-700 ease-in-out"
                    style={{
                      transformStyle: "preserve-3d",
                      transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                      width: "300px",
                      height: "475px",
                    }}
                  >
                    {/* Front Face */}
                    <div
                      className="absolute inset-0"
                      style={{
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                      }}
                    >
                      <EmployeeIdCardFront cardData={cardData} />
                    </div>

                    {/* Back Face */}
                    <div
                      className="absolute inset-0"
                      style={{
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                      }}
                    >
                      <EmployeeIdCardBack cardData={cardData} />
                    </div>
                  </div>
                </div>

                {/* Flip Indicator & Side Badge */}
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                    Showing: {isFlipped ? "Back Side" : "Front Side"}
                  </span>
                  <button
                    onClick={handleFlip}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 py-1 px-2.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                  >
                    <RotateCw className="h-3.5 w-3.5" />
                    <span>Flip Card (3D)</span>
                  </button>
                </div>

                {/* Admin Photo Upload Section */}
                {canUploadPhoto && storeSlug && employeeId && (
                  <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 w-full flex items-center justify-between px-2">
                    <div className="text-left">
                      <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block">
                        Card Portrait Photo
                      </span>
                      <span className="text-[11px] text-zinc-500">
                        Update official photo on this employee ID card
                      </span>
                    </div>

                    <div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={handlePhotoSelect}
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingPhoto}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold py-1.5 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors disabled:opacity-50"
                      >
                        {isUploadingPhoto ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <UploadCloud className="h-3.5 w-3.5 text-zinc-500" />
                        )}
                        <span>{cardData.employee.photoUrl ? "Change Photo" : "Upload Photo"}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Bar Footer */}
          {cardData && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 dark:border-zinc-800 px-6 py-4 bg-zinc-50/70 dark:bg-zinc-900/50">
              <div className="flex items-center gap-2">
                {/* Copy Verification Link */}
                <button
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold py-2 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors"
                  title="Copy public verification link"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-zinc-500" />
                  )}
                  <span>{copied ? "Copied Link!" : "Copy Verify URL"}</span>
                </button>

                {/* View Verification Page */}
                {cardData.verificationUrl && (
                  <a
                    href={cardData.verificationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 px-2 py-1.5"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Test QR</span>
                  </a>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Download Options */}
                <button
                  onClick={() => handleDownloadSide("front")}
                  disabled={isDownloading}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold py-2 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors disabled:opacity-50"
                  title="Download Front side as PNG"
                >
                  <Download className="h-3.5 w-3.5 text-zinc-500" />
                  <span>Front (PNG)</span>
                </button>

                <button
                  onClick={() => handleDownloadSide("back")}
                  disabled={isDownloading}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold py-2 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors disabled:opacity-50"
                  title="Download Back side as PNG"
                >
                  <Download className="h-3.5 w-3.5 text-zinc-500" />
                  <span>Back (PNG)</span>
                </button>

                {/* Print Button */}
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 text-xs font-bold py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-colors"
                >
                  <Printer className="h-4 w-4" />
                  <span>Print CR80</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Isolated Printable DOM (Rendered in #bornoland-print-root for window.print()) */}
      {cardData && (
        <PrintPortal active={open} pageSize="a4-portrait">
          <div className="id-card-print-container">
            <div className="id-card-print-card">
              <EmployeeIdCardFront cardData={cardData} isPrint={true} />
            </div>
            <div className="id-card-print-card">
              <EmployeeIdCardBack cardData={cardData} isPrint={true} />
            </div>
          </div>
        </PrintPortal>
      )}
    </>
  );
}
