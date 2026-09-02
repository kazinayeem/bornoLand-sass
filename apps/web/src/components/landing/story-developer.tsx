"use client";

import { useState } from "react";
import { landingContainer } from "./landing-ui";
import { useLandingLocale } from "./landing-locale";
import { Reveal } from "./motion-primitives";
import {
  Users,
  Clock,
  CalendarCheck,
  FileText,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  UserCheck,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function StoryDeveloper() {
  const { locale, t } = useLandingLocale();
  const [payslipSent, setPayslipSent] = useState(false);

  const EMPLOYEES = [
    { name: "Tanvir Ahmed", role: "POS Lead Cashier", attendance: "100%", salary: "৳২৫,০০০", status: "Present" },
    { name: "Farhana Yasmin", role: "Inventory Manager", attendance: "96%", salary: "৳৩২,০০০", status: "Present" },
    { name: "Mahmudul Hasan", role: "Store Operations", attendance: "92%", salary: "৳২৮,০০০", status: "On Leave" },
  ];

  return (
    <section id="hrm" className="py-20 sm:py-24 bg-white border-b border-zinc-200/80 scroll-mt-20">
      <div className={landingContainer}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center max-w-6xl mx-auto">
          {/* Left Column: Value Copy */}
          <div className="lg:col-span-5 space-y-6">
            <Reveal direction="down" delay={50}>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#003399] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                {t.hrm.eyebrow}
              </span>
            </Reveal>

            <Reveal direction="up" delay={100}>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950 leading-tight">
                {t.hrm.title}
              </h2>
            </Reveal>

            <Reveal direction="up" delay={160}>
              <p className="text-base text-zinc-600 leading-relaxed font-normal">
                {t.hrm.description}
              </p>
            </Reveal>

            <Reveal direction="up" delay={220}>
              <div className="space-y-3 pt-2">
                {t.hrm.bullets.map((bullet, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-zinc-700 font-medium">
                    <CheckCircle2 className="h-4 w-4 text-[#0A8A00] shrink-0 mt-0.5" />
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal direction="up" delay={280}>
              <div className="pt-3">
                <a
                  href="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#003399] text-white text-xs font-bold shadow-xs hover:bg-[#002B80] transition-all"
                >
                  <span>{t.hrm.cta}</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </Reveal>
          </div>

          {/* Right Column: HRM & Payroll Dashboard Mockup */}
          <div className="lg:col-span-7">
            <Reveal direction="scale" delay={180}>
              <div className="rounded-2xl border border-zinc-200/90 bg-zinc-50/60 p-5 sm:p-6 shadow-md space-y-4">
                {/* HRM Header */}
                <div className="flex items-center justify-between border-b border-zinc-200/80 pb-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#003399]" />
                    <span className="font-extrabold text-zinc-950">{t.hrm.portalTitle}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-[10px] font-bold text-purple-700">
                    Audit-Verified Payroll
                  </span>
                </div>

                {/* 3 Quick Stats */}
                <div className="grid grid-cols-3 gap-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-white border border-zinc-200 shadow-2xs space-y-1">
                    <span className="text-[10px] text-zinc-500 font-semibold">{t.hrm.activeEmployees}</span>
                    <p className="text-base font-extrabold text-zinc-950">১৮ জন</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-zinc-200 shadow-2xs space-y-1">
                    <span className="text-[10px] text-zinc-500 font-semibold">{t.hrm.onTimeAttendance}</span>
                    <p className="text-base font-extrabold text-[#0A8A00]">৯৬.৪%</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-zinc-200 shadow-2xs space-y-1">
                    <span className="text-[10px] text-zinc-500 font-semibold">Monthly Payroll</span>
                    <p className="text-base font-extrabold text-[#003399]">৳৪,৮৫,০০০</p>
                  </div>
                </div>

                {/* Employee Directory Table */}
                <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-2xs text-xs">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-zinc-100 bg-zinc-50 text-[10px] font-bold uppercase text-zinc-500">
                        <th className="py-2.5 px-3.5">Staff Member</th>
                        <th className="py-2.5 px-3.5">Attendance</th>
                        <th className="py-2.5 px-3.5">Net Salary</th>
                        <th className="py-2.5 px-3.5 text-right">Today</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {EMPLOYEES.map((emp, idx) => (
                        <tr key={idx} className="hover:bg-zinc-50/50 transition-colors">
                          <td className="py-3 px-3.5">
                            <p className="font-bold text-zinc-900">{emp.name}</p>
                            <p className="text-[10px] text-zinc-400">{emp.role}</p>
                          </td>
                          <td className="py-3 px-3.5 font-bold text-zinc-700">
                            {emp.attendance}
                          </td>
                          <td className="py-3 px-3.5 font-mono font-bold text-zinc-950">
                            {emp.salary}
                          </td>
                          <td className="py-3 px-3.5 text-right">
                            <span
                              className={cn(
                                "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                                emp.status === "Present"
                                  ? "text-[#0A8A00] bg-emerald-50 border-emerald-200"
                                  : "text-amber-700 bg-amber-50 border-amber-200"
                              )}
                            >
                              {emp.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 1-Click Payslip Trigger Action */}
                <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-200/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-purple-900 font-bold">
                    <FileText className="h-4 w-4 text-purple-700" />
                    <span>{t.hrm.payslipGenerated}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPayslipSent(true)}
                    className="px-3 py-1.5 rounded-lg bg-purple-700 text-white text-[11px] font-bold hover:bg-purple-800 transition-colors cursor-pointer shadow-2xs"
                  >
                    {payslipSent ? "Dispatched ✓" : "Send Payslips"}
                  </button>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
