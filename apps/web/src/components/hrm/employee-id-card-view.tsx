"use client";

import React from "react";
import type { EmployeeIdCardData } from "@/redux/api/hrm-api";

interface IdCardViewProps {
  cardData: EmployeeIdCardData;
  className?: string;
  isPrint?: boolean;
}

/**
 * Renders the FRONT side of the Employee ID Card.
 * Proportioned for CR80 vertical format:
 * Screen: 300px × 475px (or flexible in container)
 * Print: 53.98mm × 85.60mm
 */
export function EmployeeIdCardFront({ cardData, className = "", isPrint = false }: IdCardViewProps) {
  const { employee, store } = cardData;
  const brandColor = store.brandColor || "#003399";
  const initials = `${employee.firstName[0] || ""}${employee.lastName[0] || ""}`.toUpperCase() || "EM";

  return (
    <div
      className={`relative flex flex-col justify-between overflow-hidden bg-white text-zinc-900 select-none ${
        isPrint ? "id-card-print-card" : "w-[300px] h-[475px] rounded-2xl shadow-xl border border-zinc-200/90 dark:border-zinc-800"
      } ${className}`}
      style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Top Header Geometric Brand Accent */}
      <div className="relative pt-5 px-5 pb-3 overflow-hidden" style={{ backgroundColor: brandColor }}>
        {/* Subtle geometric pattern overlay */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:8px_8px]" />

        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {store.logoUrl ? (
              <img
                src={store.logoUrl}
                alt={store.name}
                className="h-8 w-8 rounded-lg object-contain bg-white p-0.5 shadow-xs shrink-0"
              />
            ) : (
              <div className="h-8 w-8 rounded-lg bg-white/20 text-white font-bold text-xs flex items-center justify-center backdrop-blur-xs shrink-0">
                {store.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="leading-tight truncate">
              <h3 className="font-extrabold text-white text-xs tracking-wide uppercase truncate">
                {store.name}
              </h3>
              <p className="text-[9px] text-white/80 font-medium tracking-wider uppercase">
                Staff Identity Card
              </p>
            </div>
          </div>

          <span className="text-[8px] tracking-widest font-black uppercase px-1.5 py-0.5 rounded bg-white/20 text-white border border-white/30 backdrop-blur-xs shrink-0">
            CR80
          </span>
        </div>
      </div>

      {/* Main Body with Employee Photo & Details */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 pt-3 pb-2 text-center">
        {/* Profile Photo */}
        <div className="relative mb-3.5">
          <div
            className="w-24 h-28 rounded-xl overflow-hidden p-1 shadow-md bg-white border-2"
            style={{ borderColor: brandColor }}
          >
            {employee.photoUrl ? (
              <img
                src={employee.photoUrl}
                alt={employee.fullName}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-full rounded-lg bg-zinc-100 flex flex-col items-center justify-center text-zinc-600">
                <span className="text-xl font-black">{initials}</span>
                <span className="text-[8px] font-semibold text-zinc-400 mt-1 uppercase">No Photo</span>
              </div>
            )}
          </div>

          {/* Status Badge */}
          <div className="absolute -bottom-2 inset-x-0 flex justify-center">
            <span
              className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs border ${
                employee.status === "active"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                  : employee.status === "on_leave"
                  ? "bg-amber-50 text-amber-700 border-amber-300"
                  : "bg-red-50 text-red-700 border-red-300"
              }`}
            >
              {employee.status.replace("_", " ")}
            </span>
          </div>
        </div>

        {/* Employee Name & Title */}
        <div className="mt-1 space-y-0.5">
          <h2 className="text-base font-black text-zinc-900 tracking-tight uppercase leading-tight line-clamp-1">
            {employee.fullName}
          </h2>
          <p className="text-xs font-semibold" style={{ color: brandColor }}>
            {employee.designation}
          </p>
        </div>

        {/* Key Department & ID Attributes */}
        <div className="w-full grid grid-cols-2 gap-2 mt-3.5 pt-2.5 border-t border-zinc-100 text-left">
          <div className="bg-zinc-50 p-1.5 rounded-md border border-zinc-200/60">
            <span className="text-[8px] uppercase tracking-wider font-bold text-zinc-400 block">
              Employee ID
            </span>
            <span className="font-mono font-black text-[11px] text-zinc-900 block truncate">
              {employee.employeeCode}
            </span>
          </div>

          <div className="bg-zinc-50 p-1.5 rounded-md border border-zinc-200/60">
            <span className="text-[8px] uppercase tracking-wider font-bold text-zinc-400 block">
              Department
            </span>
            <span className="font-bold text-[10px] text-zinc-800 block truncate">
              {employee.department}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Footer with QR Verification & Corporate Label */}
      <div className="px-5 py-2.5 bg-zinc-50 border-t border-zinc-200/80 flex items-center justify-between gap-2">
        <div className="text-left">
          <span className="text-[8px] font-extrabold uppercase tracking-widest text-zinc-400 block">
            OFFICIAL EMPLOYEE
          </span>
          <span className="text-[9px] font-mono font-medium text-zinc-600 block">
            BornoLand • Verified
          </span>
        </div>

        {cardData.cardMeta?.qrCodeDataUrl ? (
          <img
            src={cardData.cardMeta.qrCodeDataUrl}
            alt="Scan to Verify"
            className="h-10 w-10 p-0.5 bg-white border border-zinc-200 rounded-md shrink-0 shadow-2xs"
          />
        ) : null}
      </div>

      {/* Decorative Bottom Colored Bar */}
      <div className="h-1.5 w-full shrink-0" style={{ backgroundColor: brandColor }} />
    </div>
  );
}

/**
 * Renders the BACK side of the Employee ID Card.
 * Contains emergency contacts, company return information, blood group, instructions, and verification seal.
 */
export function EmployeeIdCardBack({ cardData, className = "", isPrint = false }: IdCardViewProps) {
  const { employee, store, cardMeta } = cardData;
  const brandColor = store.brandColor || "#003399";

  return (
    <div
      className={`relative flex flex-col justify-between overflow-hidden bg-white text-zinc-900 select-none ${
        isPrint ? "id-card-print-card" : "w-[300px] h-[475px] rounded-2xl shadow-xl border border-zinc-200/90 dark:border-zinc-800"
      } ${className}`}
      style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Top Header Banner */}
      <div className="py-3 px-5 text-center" style={{ backgroundColor: brandColor }}>
        <h4 className="font-black text-white text-xs tracking-wider uppercase">
          {store.name}
        </h4>
        <p className="text-[8px] text-white/80 font-medium tracking-wider mt-0.5">
          {store.website || "www.bornoland.com"}
        </p>
      </div>

      {/* Body Information */}
      <div className="flex-1 px-5 py-3 flex flex-col justify-between text-left text-xs space-y-2.5">
        {/* Identification Summary */}
        <div className="space-y-1 pb-2 border-b border-zinc-100">
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-zinc-500 font-medium">Cardholder:</span>
            <span className="font-bold text-zinc-900">{employee.fullName}</span>
          </div>
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-zinc-500 font-medium">System ID:</span>
            <span className="font-mono font-bold text-zinc-800">{employee.employeeCode}</span>
          </div>
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-zinc-500 font-medium">Issue Date:</span>
            <span className="font-mono text-zinc-700">
              {new Date(cardMeta.issuedAt).toLocaleDateString("en-GB", {
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
          {employee.bloodGroup && (
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-zinc-500 font-medium">Blood Group:</span>
              <span className="font-black text-red-600 bg-red-50 px-1.5 py-0.2 rounded border border-red-200">
                {employee.bloodGroup}
              </span>
            </div>
          )}
        </div>

        {/* Emergency Contact (if recorded) */}
        {employee.emergencyContact && employee.emergencyContact.phone ? (
          <div className="bg-zinc-50 p-2 rounded-lg border border-zinc-200/70 text-[9px] space-y-0.5">
            <span className="font-bold text-zinc-700 block uppercase tracking-wider">
              Emergency Contact
            </span>
            <p className="text-zinc-900 font-semibold">
              {employee.emergencyContact.name}{" "}
              {employee.emergencyContact.relation ? `(${employee.emergencyContact.relation})` : ""}
            </p>
            <p className="font-mono text-zinc-600">{employee.emergencyContact.phone}</p>
          </div>
        ) : null}

        {/* Workplace Rules / Return Policy */}
        <div className="text-[8px] text-zinc-500 leading-relaxed space-y-1">
          <p className="font-bold text-zinc-700 uppercase tracking-wider">
            Terms & Conditions
          </p>
          <ul className="list-disc pl-3 space-y-0.5 text-zinc-500">
            <li>This card is non-transferable and remains property of the company.</li>
            <li>Must be displayed during office and client representations.</li>
            <li>Loss or damage must be reported immediately to HR.</li>
          </ul>
        </div>

        {/* If Found Section */}
        <div className="pt-2 border-t border-zinc-100 text-center text-[8px] text-zinc-500">
          <p className="font-bold text-zinc-700">If found, please return to:</p>
          <p className="text-zinc-600 mt-0.5 truncate">{store.name}</p>
          <p className="text-zinc-400 font-mono text-[7px]">{store.website || "support@bornoland.com"}</p>
        </div>
      </div>

      {/* Bottom Authenticity Seal Bar */}
      <div className="px-5 py-2 bg-zinc-100 border-t border-zinc-200 flex items-center justify-between text-[8px] text-zinc-500 font-mono">
        <span>SECURITY LEVEL: 1</span>
        <span className="font-bold text-zinc-800">BORNO SECURE ID</span>
      </div>

      <div className="h-1.5 w-full shrink-0" style={{ backgroundColor: brandColor }} />
    </div>
  );
}
