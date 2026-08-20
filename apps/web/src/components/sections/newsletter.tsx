"use client";

import { useState } from "react";
import { SectionWrapper, type SectionData } from "./section-renderer";
import { Mail, CheckCircle, ArrowRight } from "lucide-react";

export function Newsletter({ section }: { section: SectionData }) {
  const p = section.props;
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  return (
    <SectionWrapper section={section}>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className="rounded-3xl border border-zinc-200/80 bg-zinc-50 p-8 sm:p-12 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 mb-4">
            <Mail className="h-6 w-6" />
          </div>

          <h2
            className="font-extrabold tracking-tight text-zinc-900 leading-tight"
            style={{
              color: p.textColor || "#0f172a",
              fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
            }}
          >
            {p.headline || "Stay in the Loop"}
          </h2>

          <p
            className="mt-3 text-sm sm:text-base text-zinc-600 max-w-xl mx-auto leading-relaxed"
            style={{ color: p.textColor ? `${p.textColor}b3` : "#475569" }}
          >
            {p.subheadline || "Subscribe to our newsletter for exclusive discounts, new arrival drops, and special perks."}
          </p>

          {!subscribed ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSubscribed(true);
              }}
              className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-lg mx-auto"
            >
              {p.showName === "true" && (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className="h-12 w-full sm:w-1/3 rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 shadow-sm outline-none placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                />
              )}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder={p.placeholderText || "Enter your email address"}
                className="h-12 w-full sm:flex-1 rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 shadow-sm outline-none placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
              />
              <button
                type="submit"
                className="group flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-6 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-zinc-800 active:scale-95 shrink-0"
              >
                <span>{p.buttonText || "Subscribe"}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </form>
          ) : (
            <div className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200/60 px-6 py-3.5 text-emerald-700 shadow-sm">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              <span className="text-sm font-semibold">Thank you for subscribing! Check your inbox soon.</span>
            </div>
          )}
        </div>
      </div>
    </SectionWrapper>
  );
}

