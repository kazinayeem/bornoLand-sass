"use client";

import { Smartphone, ShoppingBag, BarChart3, Package, Bell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLandingLocale } from "./landing-locale";
import { landingContainer, LandingReveal } from "./landing-ui";
import { cn } from "@/lib/utils";

const screenItems = [
  { icon: ShoppingBag, title: "Manage Orders" },
  { icon: Package, title: "Manage Products" },
  { icon: BarChart3, title: "View Analytics" },
  { icon: Bell, title: "Inventory Updates" },
];

function TiltedPhone({
  tilt,
  className,
}: {
  tilt: "left" | "right";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-[160px] shrink-0 sm:w-[180px]",
        tilt === "left" ? "-rotate-6" : "rotate-6",
        className,
      )}
    >
      <Card className="overflow-hidden rounded-[1.5rem] border-2 border-primary-foreground/20 bg-card p-1.5 shadow-xl">
        <div className="overflow-hidden rounded-[1.15rem] bg-muted">
          <div className="flex justify-center px-3 pb-1.5 pt-2.5">
            <div className="h-4 w-16 rounded-pill bg-foreground/85" aria-hidden />
          </div>
          <CardContent className="space-y-2 px-2.5 pb-3 pt-1">
            <Badge variant="primary" className="text-[9px]">
              BornoLand
            </Badge>
            {screenItems.map((item) => (
              <div
                key={item.title}
                className="flex items-center gap-2 rounded-apple-md border border-border bg-card px-2 py-1.5"
              >
                <item.icon className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                <span className="truncate text-[10px] font-medium text-foreground">
                  {item.title}
                </span>
              </div>
            ))}
          </CardContent>
        </div>
      </Card>
    </div>
  );
}

export function MobileApp() {
  const { t } = useLandingLocale();
  const cta = t.finalCta;

  return (
    <section id="mobile-app" className="relative py-12 sm:py-16">
      <div className={landingContainer}>
        <LandingReveal>
          <Card className="relative overflow-visible rounded-apple-xl border-0 bg-primary text-primary-foreground shadow-xl">
            <CardContent className="relative px-6 pb-0 pt-10 sm:px-10 sm:pt-12 md:px-14 md:pt-14">
              <div className="grid items-end gap-8 lg:grid-cols-[1.1fr_1fr]">
                <div className="pb-10 sm:pb-12 md:pb-14">
                  <Badge className="mb-4 bg-primary-foreground/15 text-primary-foreground ring-0">
                    Mobile App
                  </Badge>
                  <h2 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
                    {cta.title}
                  </h2>
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-primary-foreground/80 sm:text-base">
                    Manage orders, products, and analytics on the go — iOS and Android apps with full store management.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button
                      type="button"
                      variant="secondary"
                      className="rounded-pill border-0 bg-card text-foreground hover:bg-card/90"
                    >
                      <Smartphone className="h-4 w-4" aria-hidden />
                      Google Play
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-pill border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
                    >
                      <Smartphone className="h-4 w-4" aria-hidden />
                      App Store
                    </Button>
                  </div>
                </div>

                <div className="relative flex justify-center gap-3 pb-0 pt-4 sm:gap-4 lg:justify-end">
                  <TiltedPhone tilt="left" className="relative z-[1] translate-y-4 sm:translate-y-6" />
                  <TiltedPhone tilt="right" className="relative z-[2] -translate-y-2 sm:-translate-y-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        </LandingReveal>
      </div>
    </section>
  );
}
