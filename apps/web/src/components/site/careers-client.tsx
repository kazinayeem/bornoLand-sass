"use client";

import React from "react";
import Link from "next/link";
import {
  Briefcase,
  Sparkles,
  CheckCircle2,
  MapPin,
  Clock,
  ArrowRight,
  Heart,
  Zap,
  Shield,
  Users,
} from "lucide-react";

const POSITIONS = [
  {
    title: "Senior Full-Stack Engineer (Next.js & Node.js)",
    department: "Core Engineering",
    location: "Dhaka, Bangladesh (Hybrid)",
    type: "Full-time",
    description:
      "Help architect and scale our real-time POS sync engine, relational database clustering, and high-throughput commerce APIs.",
  },
  {
    title: "Frontend Product Designer (UI/UX)",
    department: "Product Design",
    location: "Dhaka, Bangladesh (Hybrid)",
    type: "Full-time",
    description:
      "Craft world-class enterprise SaaS interfaces with Google-grade minimalism, crisp typography, and high-speed cashier workflows.",
  },
  {
    title: "Merchant Solutions Architect",
    department: "Customer Success",
    location: "Dhaka, Bangladesh (On-site)",
    type: "Full-time",
    description:
      "Work alongside leading retail brands to implement multi-warehouse inventory, POS hardware registers, and ERP migrations.",
  },
  {
    title: "Technical Support Engineer",
    department: "Support & Operations",
    location: "Dhaka, Bangladesh (Shift-based)",
    type: "Full-time",
    description:
      "Provide 24/7 technical incident assistance for merchant POS hardware, courier webhooks, and domestic payment integrations.",
  },
];

export function CareersClient() {
  return (
    <div className="min-h-screen bg-[#f7f9ff] text-[#181c20] font-sans antialiased py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#ebeef4] rounded-full text-xs font-semibold text-[#1664d9] mb-3 border border-[#dfe3e8]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Join the BornoSoft &amp; BornoLand Team</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#181c20]">
            Build the Future of Enterprise Commerce
          </h1>
          <p className="text-sm sm:text-base text-[#424754] mt-3 leading-relaxed">
            We are engineering the unified business operating system empowering thousands of retailers, entrepreneurs, and commerce teams across Bangladesh.
          </p>
        </div>

        {/* Culture / Values 4-Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          <div className="bg-white p-6 rounded-2xl border border-[#dfe3e8] shadow-2xs space-y-2">
            <Zap className="w-6 h-6 text-[#1664d9] mb-2" />
            <h3 className="text-sm font-bold text-[#181c20]">High Velocity &amp; Ownership</h3>
            <p className="text-xs text-[#424754] leading-relaxed">
              We ship robust production code rapidly and trust engineers with end-to-end feature ownership.
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-[#dfe3e8] shadow-2xs space-y-2">
            <Shield className="w-6 h-6 text-[#006e2a] mb-2" />
            <h3 className="text-sm font-bold text-[#181c20]">Customer First</h3>
            <p className="text-xs text-[#424754] leading-relaxed">
              Every feature we build solves real operational bottlenecks for physical store merchants and growing brands.
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-[#dfe3e8] shadow-2xs space-y-2">
            <Heart className="w-6 h-6 text-rose-500 mb-2" />
            <h3 className="text-sm font-bold text-[#181c20]">Competitive Compensation</h3>
            <p className="text-xs text-[#424754] leading-relaxed">
              Above-market salary packages, festival bonuses, health insurance, and continuous learning allowances.
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-[#dfe3e8] shadow-2xs space-y-2">
            <Users className="w-6 h-6 text-purple-600 mb-2" />
            <h3 className="text-sm font-bold text-[#181c20]">Collaborative Culture</h3>
            <p className="text-xs text-[#424754] leading-relaxed">
              A flat, transparent work culture with mentorship, hackathons, and flexible hybrid scheduling.
            </p>
          </div>
        </div>

        {/* Open Positions */}
        <div className="space-y-6 max-w-4xl mx-auto mb-16">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#181c20]">Open Opportunities</h2>
            <span className="text-xs text-[#727785]">{POSITIONS.length} active positions</span>
          </div>

          <div className="space-y-4">
            {POSITIONS.map((pos, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-[#dfe3e8] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#1664d9] transition-all"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 bg-[#ebeef4] text-[#424754] rounded font-semibold text-[11px]">
                      {pos.department}
                    </span>
                    <span className="text-[#727785] flex items-center gap-1 text-[11px]">
                      <MapPin className="w-3 h-3" />
                      {pos.location}
                    </span>
                    <span className="text-[#727785] flex items-center gap-1 text-[11px]">
                      <Clock className="w-3 h-3" />
                      {pos.type}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#181c20]">{pos.title}</h3>
                  <p className="text-xs text-[#424754] max-w-xl leading-relaxed">
                    {pos.description}
                  </p>
                </div>

                <div className="shrink-0">
                  <Link
                    href={`/contact?subject=${encodeURIComponent(`Job Application: ${pos.title}`)}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1664d9] hover:bg-[#004caf] text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                  >
                    <span>Apply Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* General Application */}
        <div className="max-w-4xl mx-auto p-8 bg-white rounded-2xl border border-[#dfe3e8] text-center space-y-3">
          <h3 className="text-base font-bold text-[#181c20]">Don&apos;t see a matching role?</h3>
          <p className="text-xs sm:text-sm text-[#424754] max-w-lg mx-auto">
            We are always interested in meeting exceptional software engineers, product thinkers, and sales leaders. Send your portfolio to our team.
          </p>
          <div className="pt-2">
            <Link
              href="/contact?subject=General+Career+Inquiry"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#1664d9] hover:underline"
            >
              <span>Send General Application</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
