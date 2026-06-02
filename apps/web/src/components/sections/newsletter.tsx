"use client";

import { useState } from "react";
import { SectionWrapper, type SectionData } from "./section-renderer";

export function Newsletter({ section }: { section: SectionData }) {
  const p = section.props;
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  return (
    <SectionWrapper section={section}>
      <div className="mx-auto max-w-lg px-4 text-center">
        {p.headline && (
          <h2 className="text-2xl font-bold sm:text-3xl" style={{ color: p.textColor || "#18181b" }}>
            {p.headline}
          </h2>
        )}
        {p.subheadline && (
          <p className="mt-3 text-sm" style={{ color: p.textColor ? `${p.textColor}cc` : "#52525b" }}>
            {p.subheadline}
          </p>
        )}
        {!subscribed ? (
          <form onSubmit={(e) => { e.preventDefault(); setSubscribed(true); }}
            className="mt-6 flex flex-col gap-3 sm:flex-row">
            {p.showName === "true" && (
              <input type="text" placeholder="Your name"
                className="h-11 flex-1 rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none focus:border-zinc-400" />
            )}
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              placeholder={p.placeholderText || "Enter your email"}
              className="h-11 flex-1 rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none focus:border-zinc-400" />
            <button type="submit"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-zinc-900 px-6 text-sm font-semibold text-white hover:bg-zinc-800 transition-all">
              {p.buttonText || "Subscribe"}
            </button>
          </form>
        ) : (
          <div className="mt-6 rounded-xl bg-emerald-50 p-4">
            <p className="text-sm font-semibold text-emerald-700">Thanks for subscribing!</p>
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}
