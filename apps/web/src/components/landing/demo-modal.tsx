"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sparkles, CheckCircle2, ArrowRight, Building2, Mail, User, Phone, ShieldCheck } from "lucide-react";

interface DemoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DemoModal({ open, onOpenChange }: DemoModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    monthlyVolume: "100-500 orders/mo",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate submission
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state after dialog animation finishes
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: "",
        email: "",
        company: "",
        phone: "",
        monthlyVolume: "100-500 orders/mo",
        notes: "",
      });
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent size="md" className="p-0 overflow-hidden border border-zinc-200/90 shadow-2xl rounded-2xl sm:rounded-3xl">
        <div className="relative p-6 sm:p-8 bg-white">
          {/* Subtle Ambient Header Gradient */}
          <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-blue-50/80 via-blue-50/20 to-transparent pointer-events-none" />

          {submitted ? (
            <div className="relative py-8 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-[#0A8A00] border border-emerald-200 shadow-xs">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-zinc-950 tracking-tight">Demo Requested</h3>
                <p className="text-sm text-zinc-600 max-w-sm mx-auto leading-relaxed">
                  Thank you, <span className="font-semibold text-zinc-900">{formData.name || "there"}</span>! A BornoLand platform specialist will reach out within 2 business hours to schedule your personalized product walkthrough.
                </p>
              </div>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-2.5 rounded-xl bg-[#003399] text-white text-xs font-bold shadow-xs hover:bg-[#002B80] transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <div className="relative space-y-5">
              <DialogHeader className="text-left space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-[10px] font-bold text-[#003399] uppercase tracking-wider w-fit">
                  <Sparkles className="h-3 w-3 text-amber-500" />
                  <span>Personalized Walkthrough</span>
                </div>
                <DialogTitle className="text-2xl font-black text-zinc-950 tracking-tight">
                  Book a BornoLand Platform Demo
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-500 leading-relaxed">
                  Discover how unifying your online store, retail POS, inventory, and accounting can accelerate your business growth.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-700 flex items-center gap-1">
                      <User className="h-3 w-3 text-zinc-400" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Morgan"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-zinc-50/50 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#003399] focus:bg-white transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-700 flex items-center gap-1">
                      <Mail className="h-3 w-3 text-zinc-400" />
                      Work Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="alex@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-zinc-50/50 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#003399] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-700 flex items-center gap-1">
                      <Building2 className="h-3 w-3 text-zinc-400" />
                      Company Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex Lifestyle Ltd."
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-zinc-50/50 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#003399] focus:bg-white transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-700 flex items-center gap-1">
                      <Phone className="h-3 w-3 text-zinc-400" />
                      Phone / WhatsApp
                    </label>
                    <input
                      type="tel"
                      placeholder="+880 1700 000000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-zinc-50/50 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#003399] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-700">
                    Monthly Order Volume / Scale
                  </label>
                  <select
                    value={formData.monthlyVolume}
                    onChange={(e) => setFormData({ ...formData, monthlyVolume: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-zinc-50/50 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#003399] focus:bg-white transition-all"
                  >
                    <option value="under-100">Under 100 orders/month (Starting Out)</option>
                    <option value="100-500">100 – 500 orders/month (Growing Brand)</option>
                    <option value="500-2000">500 – 2,000 orders/month (Multi-Branch)</option>
                    <option value="2000-plus">2,000+ orders/month (High-Volume Enterprise)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-700">
                    Specific Requirements or Questions (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Tell us about your retail channels, warehouses, or current software pain points..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-zinc-50/50 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#003399] focus:bg-white transition-all resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-[#003399] text-white text-xs font-bold shadow-md hover:bg-[#002B80] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                  >
                    {loading ? (
                      <span>Scheduling Demo...</span>
                    ) : (
                      <>
                        <span>Confirm Demo Request</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-400 pt-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Strict confidentiality • No spam • 1-on-1 expert session</span>
                </div>
              </form>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
