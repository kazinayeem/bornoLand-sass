import { type ReactNode } from "react";

type Props = {
  eyebrow?: string;
  title: string | ReactNode;
  description?: string;
  align?: "center" | "left";
  className?: string;
};

export function SectionHeading({ eyebrow, title, description, align = "center", className = "" }: Props) {
  return (
    <div className={`max-w-3xl ${align === "center" ? "mx-auto text-center" : ""} ${className}`}>
      {eyebrow && (
        <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-700">
          {eyebrow}
        </span>
      )}
      <h2 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base leading-relaxed text-zinc-500 sm:text-lg max-w-2xl mx-auto">
          {description}
        </p>
      )}
    </div>
  );
}
