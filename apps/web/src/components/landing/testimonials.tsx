"use client";

import { landingContainer } from "./landing-ui";
import { Star } from "lucide-react";

export function Testimonials() {
  const STORIES = [
    {
      quote:
        "Bornoland helped us launch our brand in under an afternoon. Having native bKash merchant verification and Steadfast courier sync in one place saved us weeks of custom development.",
      author: "Farhan Kabir",
      role: "Founder & Creative Director",
      brand: "Aura Lifestyle BD",
      rating: 5,
    },
    {
      quote:
        "We scaled from 10 to over 300 orders a day without a single server hiccup. The automated PDF invoice generator and live order status stream keep our warehouse running like clockwork.",
      author: "Nusrat Jahan",
      role: "Operations Head",
      brand: "Modest Living Home",
      rating: 5,
    },
    {
      quote:
        "Managing multiple storefronts under a single login is game-changing. We run three distinct niche stores with separate custom domains, inventory, and staff permissions effortlessly.",
      author: "Tanvir Hasan",
      role: "E-Commerce Manager",
      brand: "TechGear & Prime Organics",
      rating: 5,
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-white border-b border-zinc-200/80">
      <div className={landingContainer}>
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-16">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            MERCHANT STORIES
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950">
            Trusted by creators and brands.
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
            Real stories from entrepreneurs building thriving e-commerce businesses on Bornoland.
          </p>
        </div>

        {/* 3 Story Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {STORIES.map((story, idx) => (
            <div
              key={idx}
              className="p-7 rounded-2xl border border-zinc-200/80 bg-zinc-50/40 hover:bg-white hover:shadow-lg hover:border-zinc-300 transition-all flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="flex gap-1 text-amber-500">
                  {Array.from({ length: story.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-zinc-700 leading-relaxed font-normal italic">
                  &ldquo;{story.quote}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-zinc-200/60">
                <p className="text-xs font-bold text-zinc-950">{story.author}</p>
                <p className="text-[11px] text-zinc-500">{story.role} · <span className="font-semibold text-zinc-700">{story.brand}</span></p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
