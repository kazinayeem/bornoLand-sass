import { type ReactNode } from "react";

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
    <div className={`max-w-3xl ${align === "center" ? "mx-auto text-center" : ""} ${className}`}>
      {eyebrow && (
        <span className="mb-4 inline-flex items-center gap-1.5 rounded-pill border border-apple-hairline bg-apple-canvas px-3.5 py-1.5 text-fine-print font-semibold uppercase tracking-[0.2em] text-apple-primary">
          {eyebrow}
        </span>
      )}
      <h2 className="text-display-lg text-apple-ink">{title}</h2>
      {description && (
        <p className="mx-auto mt-4 max-w-2xl text-lead text-apple-ink-muted-80">{description}</p>
      )}
    </div>
  );
}
