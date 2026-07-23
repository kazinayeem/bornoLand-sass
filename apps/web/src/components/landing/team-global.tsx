"use client";

import { Globe2, Store, Package, ShoppingCart, TrendingUp } from "lucide-react";
import { SectionHeading } from "./section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useLandingLocale } from "./landing-locale";
import { landingContainer, landingSection, LandingReveal } from "./landing-ui";
import { cn } from "@/lib/utils";

const team = [
  { name: "Mohammad Ali", role: "Founder & CEO", avatar: "MA" },
  { name: "Sarah Rahman", role: "CTO", avatar: "SR" },
  { name: "Kabir Hossain", role: "Lead Designer", avatar: "KH" },
  { name: "Nadia Islam", role: "Head of Product", avatar: "NI" },
];

const AVATAR_TONES = [
  "bg-primary text-primary-foreground",
  "bg-success text-success-foreground",
  "bg-secondary text-secondary-foreground",
  "bg-muted text-foreground",
] as const;

const gridCells = Array.from({ length: 96 }, (_, i) => i);

export function TeamGlobal() {
  const { t } = useLandingLocale();
  const trust = t.trust;

  const globalStats = [
    { icon: Store, value: "500+", label: trust.stores },
    { icon: Package, value: "10K+", label: trust.products },
    { icon: ShoppingCart, value: "50K+", label: trust.orders },
    { icon: Globe2, value: "12+", label: "Countries" },
    { icon: TrendingUp, value: "4.9★", label: trust.rating },
  ];

  return (
    <>
      {/* Section 13 — Team */}
      <section id="team" className={landingSection}>
        <div className={landingContainer}>
          <SectionHeading
            eyebrow="Our Team"
            title="Built By Experienced Founders"
            description="Meet the team behind BornoLand — passionate about empowering entrepreneurs."
          />

          <LandingReveal className="mt-10 grid grid-cols-2 gap-4 sm:mt-12 sm:grid-cols-4 sm:gap-5">
            {team.map((member, index) => (
              <Card
                key={member.name}
                className="rounded-apple-xl border border-border bg-card p-5 text-center shadow-sm"
              >
                <CardContent className="flex flex-col items-center p-0">
                  <Avatar className="mb-3 h-16 w-16">
                    <AvatarFallback
                      className={cn(
                        "text-lg font-bold",
                        AVATAR_TONES[index % AVATAR_TONES.length],
                      )}
                    >
                      {member.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-sm font-bold text-foreground">{member.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{member.role}</p>
                </CardContent>
              </Card>
            ))}
          </LandingReveal>
        </div>
      </section>

      {/* Section 14 — World map / global stats */}
      <section id="global" className={cn(landingSection, "bg-muted/30")}>
        <div className={landingContainer}>
          <SectionHeading
            eyebrow="Global Reach"
            title="Powering Businesses Worldwide"
            description="BornoLand is trusted by store owners across multiple countries."
          />

          <LandingReveal className="relative mt-10 sm:mt-12">
            <Card className="relative overflow-hidden rounded-apple-xl border border-border bg-card p-6 shadow-sm sm:p-10">
              <CardContent className="relative p-0">
                {/* Decorative dotted map grid */}
                <div className="mx-auto grid max-w-3xl grid-cols-12 gap-1.5 opacity-80 sm:gap-2">
                  {gridCells.map((cell) => {
                    const row = Math.floor(cell / 12);
                    const col = cell % 12;
                    const isLand =
                      (row >= 2 && row <= 5 && col >= 1 && col <= 4) ||
                      (row >= 1 && row <= 4 && col >= 4 && col <= 7) ||
                      (row >= 3 && row <= 6 && col >= 6 && col <= 9) ||
                      (row >= 4 && row <= 6 && col >= 2 && col <= 5) ||
                      (row >= 2 && row <= 3 && col >= 8 && col <= 10);
                    return (
                      <div
                        key={cell}
                        className={cn(
                          "aspect-square rounded-full",
                          isLand ? "bg-primary/70" : "bg-muted-foreground/15",
                        )}
                      />
                    );
                  })}
                </div>

                {/* Floating stats overlaid around the map */}
                <div className="mt-8 grid grid-cols-2 gap-3 sm:absolute sm:inset-x-4 sm:inset-y-4 sm:mt-0 sm:grid-cols-1 sm:content-between md:inset-x-8">
                  <div className="hidden sm:flex sm:justify-between">
                    {globalStats.slice(0, 2).map((stat) => (
                      <Badge
                        key={stat.label}
                        variant="outline"
                        className="h-auto flex-col items-start gap-0 rounded-apple-lg border-border bg-card/95 px-4 py-3 shadow-md backdrop-blur-sm"
                      >
                        <span className="text-2xl font-extrabold text-primary">{stat.value}</span>
                        <span className="text-xs font-medium text-muted-foreground">
                          {stat.label}
                        </span>
                      </Badge>
                    ))}
                  </div>
                  <div className="hidden sm:flex sm:justify-between sm:self-end">
                    {globalStats.slice(2).map((stat) => (
                      <Badge
                        key={stat.label}
                        variant="outline"
                        className="h-auto flex-col items-start gap-0 rounded-apple-lg border-border bg-card/95 px-4 py-3 shadow-md backdrop-blur-sm"
                      >
                        <span className="text-2xl font-extrabold text-primary">{stat.value}</span>
                        <span className="text-xs font-medium text-muted-foreground">
                          {stat.label}
                        </span>
                      </Badge>
                    ))}
                  </div>

                  {/* Mobile stacked stats */}
                  <div className="col-span-2 grid grid-cols-2 gap-3 sm:hidden">
                    {globalStats.map((stat) => (
                      <div
                        key={stat.label}
                        className="rounded-apple-lg border border-border bg-muted/40 p-3 text-center"
                      >
                        <stat.icon className="mx-auto mb-1 h-4 w-4 text-primary" aria-hidden />
                        <p className="text-lg font-bold text-foreground">{stat.value}</p>
                        <p className="text-[11px] text-muted-foreground">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </LandingReveal>
        </div>
      </section>
    </>
  );
}
