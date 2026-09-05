"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  Building2,
  Briefcase,
  IdCard,
  Calendar,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";
import type { PublicEmployeeVerification } from "@/redux/api/hrm-api";

interface EmployeeVerifyClientProps {
  data: PublicEmployeeVerification | null;
  token: string;
}

export function EmployeeVerifyClient({ data, token }: EmployeeVerifyClientProps) {
  if (!data || !data.verifiedAt) {
    return (
      <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl bg-white dark:bg-zinc-900 shadow-xl border border-red-200 dark:border-red-950 p-6 sm:p-8 text-center animate-in fade-in zoom-in-95">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 mb-4">
            <ShieldAlert className="h-7 w-7" />
          </div>

          <h1 className="text-xl font-black text-zinc-900 dark:text-zinc-100">
            Unverified ID Token
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
            The verification token provided is either invalid, revoked, or does not correspond to an
            active staff identity record.
          </p>

          <div className="mt-4 p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-left font-mono text-xs text-zinc-500 break-all">
            Token: {token}
          </div>

          <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Return to BornoLand</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const { employee, store, verifiedAt } = data;
  const brandColor = store.brandColor || "#003399";
  const initials = employee.fullName ? employee.fullName.slice(0, 2).toUpperCase() : "EM";

  return (
    <main className="min-h-screen bg-zinc-100/70 dark:bg-zinc-950 flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full rounded-3xl bg-white dark:bg-zinc-900 shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Organization Header */}
        <div
          className="relative pt-6 px-6 pb-8 overflow-hidden text-white text-center"
          style={{ backgroundColor: brandColor }}
        >
          {/* Subtle background radial texture */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:10px_10px]" />

          <div className="relative z-10 flex flex-col items-center">
            {store.logoUrl ? (
              <img
                src={store.logoUrl}
                alt={store.name}
                className="h-12 w-12 rounded-xl object-contain bg-white p-1 shadow-md mb-2"
              />
            ) : (
              <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-extrabold text-sm text-white mb-2 shadow-sm">
                {store.name.slice(0, 2).toUpperCase()}
              </div>
            )}

            <h1 className="text-lg font-black tracking-wide uppercase">{store.name}</h1>
            <p className="text-xs text-white/80 font-medium">BornoLand Official Identification</p>
          </div>
        </div>

        {/* Verification Status Banner */}
        <div className="relative -mt-4 mx-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 p-3 shadow-md flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                Official Staff Verified
              </span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
            </div>
            <p className="text-[11px] text-emerald-700/90 dark:text-emerald-400 font-medium">
              Verified active employee record in BornoLand HRM.
            </p>
          </div>
        </div>

        {/* Employee Profile Section */}
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div
              className="h-20 w-16 rounded-xl overflow-hidden shadow-md bg-zinc-50 border-2 shrink-0 p-0.5"
              style={{ borderColor: brandColor }}
            >
              {employee.photoUrl ? (
                <img
                  src={employee.photoUrl}
                  alt={employee.fullName}
                  className="h-full w-full object-cover rounded-lg"
                />
              ) : (
                <div className="h-full w-full rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-zinc-500">
                  {initials}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <span
                className={`inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border mb-1 ${
                  employee.status === "active"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-400"
                    : "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/50 dark:text-amber-400"
                }`}
              >
                {employee.status.replace("_", " ")}
              </span>

              <h2 className="text-base font-black text-zinc-900 dark:text-zinc-100 truncate">
                {employee.fullName}
              </h2>
              <p className="text-xs font-semibold" style={{ color: brandColor }}>
                {employee.designation}
              </p>
            </div>
          </div>

          {/* Verification Details Table */}
          <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-zinc-200/50 dark:border-zinc-800">
              <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                <IdCard className="h-3.5 w-3.5" />
                <span>Employee ID</span>
              </div>
              <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                {employee.employeeCode}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-zinc-200/50 dark:border-zinc-800">
              <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                <Building2 className="h-3.5 w-3.5" />
                <span>Department</span>
              </div>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                {employee.department}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-zinc-200/50 dark:border-zinc-800">
              <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                <Briefcase className="h-3.5 w-3.5" />
                <span>Organization</span>
              </div>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                {store.name}
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                <Calendar className="h-3.5 w-3.5" />
                <span>Verified At</span>
              </div>
              <span className="font-mono text-zinc-600 dark:text-zinc-400">
                {new Date(verifiedAt).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Privacy & Security Note */}
          <div className="rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-900/60 p-3 flex items-start gap-2.5">
            <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-blue-900 dark:text-blue-200 leading-relaxed">
              <strong>Cryptographically Verified:</strong> This identity is authenticated directly
              against BornoLand HRM records. In compliance with security standards, sensitive contact,
              salary, and banking records are never publicly disclosed.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-800/70 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
          <span className="font-mono text-[10px]">BORNO-VERIFY-V1</span>
          <Link
            href="/"
            className="inline-flex items-center gap-1 font-semibold text-zinc-700 dark:text-zinc-300 hover:text-blue-600"
          >
            <span>BornoLand Platform</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </main>
  );
}
