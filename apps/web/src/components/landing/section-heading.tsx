import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { landingProse } from "./landing-ui";

type Props = {
  eyebrow?: string;
  title: string | ReactNode;
  description?: string;
  align?: "center" | "left";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className = "",
}: Props) {
  return (
    <header
      className={cn(
        "max-w-3xl",
        align === "center" ? "mx-auto text-center" : "text-left",
        className,
      )}
    >
      {eyebrow ? (
        <span className="mb-3 inline-flex max-w-full items-center gap-1.5 rounded-pill border border-apple-hairline bg-apple-canvas px-3.5 py-1.5 text-fine-print font-semibold uppercase tracking-[0.18em] text-apple-primary sm:mb-4">
          {eyebrow}
        </span>
      ) : null}
      <h2 className="text-display-lg text-balance text-apple-ink">{title}</h2>
      {description ? (
        <p className={cn("mt-3 sm:mt-4", landingProse, align === "center" && "mx-auto")}>{description}</p>
      ) : null}
    </header>
  );
}
