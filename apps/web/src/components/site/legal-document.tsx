import { type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SitePageHero } from "@/components/site/site-page-hero";
import { SiteCtaBanner } from "@/components/site/site-cta-banner";
import { landingContainer } from "@/components/landing/landing-ui";
import { cn } from "@/lib/utils";

export type LegalSection = {
  id: string;
  title: string;
  content: ReactNode;
};

type LegalDocumentProps = {
  title: string;
  description: string;
  lastUpdated: string;
  sections: LegalSection[];
  eyebrow?: string;
};

export function LegalDocument({
  title,
  description,
  lastUpdated,
  sections,
  eyebrow = "Legal",
}: LegalDocumentProps) {
  return (
    <>
      <SitePageHero
        eyebrow={eyebrow}
        title={title}
        description={description}
        align="left"
      >
        <Badge
          variant="outline"
          className="rounded-pill px-3 py-1 text-xs font-medium text-muted-foreground"
        >
          Last updated: {lastUpdated}
        </Badge>
      </SitePageHero>

      <section
        className="relative pb-8 pt-10 sm:pb-10 sm:pt-12 lg:pb-12 lg:pt-14"
        aria-label={`${title} document`}
      >
        <div className={landingContainer}>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] xl:gap-12">
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <Card className="border-border/80 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold tracking-tight">
                    On this page
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <nav aria-label="Table of contents">
                    <ol className="space-y-1">
                      {sections.map((section, index) => (
                        <li key={section.id}>
                          <a
                            href={`#${section.id}`}
                            className={cn(
                              "flex min-h-10 items-start gap-2 rounded-lg px-2.5 py-2 text-sm leading-snug text-muted-foreground transition-colors",
                              "hover:bg-muted hover:text-foreground",
                              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            )}
                          >
                            <span
                              className="mt-0.5 w-5 shrink-0 text-xs font-medium tabular-nums text-muted-foreground/70"
                              aria-hidden
                            >
                              {String(index + 1).padStart(2, "0")}
                            </span>
                            <span>{section.title}</span>
                          </a>
                        </li>
                      ))}
                    </ol>
                  </nav>
                </CardContent>
              </Card>
            </aside>

            <article className="min-w-0">
              <div className="space-y-10 sm:space-y-12">
                {sections.map((section, index) => (
                  <section
                    key={section.id}
                    id={section.id}
                    className="scroll-mt-28 sm:scroll-mt-32"
                    aria-labelledby={`${section.id}-heading`}
                  >
                    {index > 0 ? (
                      <Separator className="mb-10 sm:mb-12" />
                    ) : null}

                    <h2
                      id={`${section.id}-heading`}
                      className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-[1.65rem]"
                    >
                      {section.title}
                    </h2>

                    <div
                      className={cn(
                        "mt-4 space-y-4 text-[15px] leading-relaxed text-muted-foreground sm:mt-5 sm:text-base sm:leading-relaxed",
                        "[&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:tracking-tight [&_h3]:text-foreground sm:[&_h3]:text-lg",
                        "[&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5",
                        "[&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5",
                        "[&_strong]:font-semibold [&_strong]:text-foreground",
                        "[&_a]:font-medium [&_a]:text-primary [&_a]:underline-offset-4 hover:[&_a]:underline",
                        "[&_a]:focus-visible:outline-none [&_a]:focus-visible:ring-2 [&_a]:focus-visible:ring-ring",
                      )}
                    >
                      {section.content}
                    </div>
                  </section>
                ))}
              </div>
            </article>
          </div>
        </div>
      </section>

      <SiteCtaBanner
        title="Need help with a legal question?"
        description="Our support team can clarify billing, account access, or policy questions. We typically reply within one business day."
        primaryLabel="Contact support"
        primaryHref="/support"
        secondaryLabel="Email us"
        secondaryHref="mailto:support@bornoland.com"
      />
    </>
  );
}
