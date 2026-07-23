"use client";

import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLandingLocale } from "./landing-locale";
import { TrendingUp, ShoppingBag, Store, Users, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const BAR_HEIGHTS = [
  "h-[45%]",
  "h-[60%]",
  "h-[40%]",
  "h-[75%]",
  "h-[55%]",
  "h-[90%]",
  "h-[80%]",
  "h-[95%]",
  "h-[70%]",
  "h-[85%]",
  "h-[92%]",
  "h-full",
] as const;

export function DashboardShowcase() {
  const { t } = useLandingLocale();
  const h = t.hero;
  const trust = t.trust;

  const stats = [
    { label: trust.stores, value: "500+", icon: Store },
    { label: trust.products, value: "10K+", icon: ShoppingBag },
    { label: trust.orders, value: "50K+", icon: Users },
    { label: trust.rating, value: "4.9★", icon: ArrowUpRight },
  ];

  return (
    <div id="platform" className="relative w-full">
      {/* 3 floating cards — center elevated */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 items-end gap-4 sm:gap-5 md:grid-cols-3 md:gap-6"
      >
        {/* Left — bar chart */}
        <Card className="flex flex-col justify-between rounded-apple-xl border border-border bg-card p-5 shadow-md sm:p-6">
          <CardHeader className="mb-4 flex flex-row items-start justify-between space-y-0 p-0">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {h.orders}
              </p>
              <CardTitle className="mt-1 text-3xl font-bold tracking-tight text-foreground">
                1,248
              </CardTitle>
            </div>
            <Badge variant="primary" className="text-[10px]">
              {h.live}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3 p-0">
            <p className="text-xs font-medium text-muted-foreground">
              {h.revenueMonth}
            </p>
            <div className="flex h-32 items-end gap-1.5 pt-2 sm:h-36">
              {BAR_HEIGHTS.map((heightClass, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex-1 rounded-t-md bg-primary/25 transition-colors hover:bg-primary",
                    heightClass,
                  )}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Center — elevated gauge */}
        <Card className="relative z-[1] flex flex-col justify-between rounded-apple-xl border border-primary/25 bg-card p-5 shadow-xl sm:p-6 md:-translate-y-3 md:scale-[1.04]">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge
              variant="primary"
              className="bg-primary px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-sm ring-0"
            >
              {h.conversion}
            </Badge>
          </div>
          <CardHeader className="mb-4 mt-2 space-y-0 p-0 text-center">
            <CardTitle className="text-4xl font-extrabold text-foreground">78%</CardTitle>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              {h.revenueMonth}
            </p>
          </CardHeader>
          <CardContent className="flex flex-col items-center p-0">
            <div className="relative flex h-36 w-36 items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100" aria-hidden>
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-muted"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray="251.2"
                  strokeDashoffset="55"
                  strokeLinecap="round"
                  className="text-primary"
                />
              </svg>
              <div className="absolute text-center">
                <TrendingUp className="mx-auto h-6 w-6 text-primary" aria-hidden />
                <span className="text-[11px] font-bold text-foreground">+18%</span>
              </div>
            </div>

            <div className="mt-4 w-full space-y-2 border-t border-border pt-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-primary" aria-hidden />
                  {h.orders}
                </span>
                <span className="font-bold text-foreground">842</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-success" aria-hidden />
                  {h.customers}
                </span>
                <span className="font-bold text-foreground">316</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right — stacked breakdown */}
        <Card className="flex flex-col justify-between rounded-apple-xl border border-border bg-card p-5 shadow-md sm:p-6">
          <CardHeader className="mb-4 space-y-0 p-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {h.products}
            </p>
            <CardTitle className="mt-1 text-3xl font-bold tracking-tight text-foreground">
              2,540
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-0">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-apple-lg border border-border bg-muted/40 p-3">
                <Store className="mb-1 h-4 w-4 text-primary" aria-hidden />
                <p className="text-[11px] font-semibold text-muted-foreground">{h.dashboard}</p>
                <p className="text-lg font-bold text-foreground">Live</p>
              </div>
              <div className="rounded-apple-lg border border-border bg-muted/40 p-3">
                <Users className="mb-1 h-4 w-4 text-success" aria-hidden />
                <p className="text-[11px] font-semibold text-muted-foreground">{h.customers}</p>
                <p className="text-lg font-bold text-foreground">1.2K</p>
              </div>
            </div>

            <div className="space-y-2 rounded-apple-lg border border-border bg-card p-3.5">
              <div className="flex justify-between text-xs font-semibold text-foreground">
                <span>{h.conversion}</span>
                <span className="font-bold text-success">92%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-pill bg-muted">
                <div className="h-full w-[92%] rounded-pill bg-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats row under cards */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:mt-10 sm:grid-cols-4 sm:gap-6">
        {stats.map((item) => (
          <div key={item.label} className="text-center">
            <p className="text-2xl font-extrabold tracking-tight text-primary sm:text-3xl">
              {item.value}
            </p>
            <p className="mt-1 text-xs font-medium text-muted-foreground sm:text-sm">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
