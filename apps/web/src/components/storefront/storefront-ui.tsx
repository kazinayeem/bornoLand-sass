"use client";

import { cn } from "@/lib/utils";
import { useTenant } from "@/providers/tenant-provider";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import Link from "next/link";

/** DESIGN.md surface tokens for customer-facing storefront pages only. */
export function useStorefrontSurface() {
  const { theme } = useTenant();
  const dark = theme.darkMode;

  const classes = {
    page: dark
      ? "min-h-screen bg-apple-surface-black text-apple-body-on-dark"
      : "min-h-screen bg-apple-canvas text-apple-ink",
    pageParchment: dark
      ? "min-h-screen bg-apple-surface-tile-1 text-apple-body-on-dark"
      : "min-h-screen bg-apple-canvas-parchment text-apple-ink",
    heading: dark ? "text-apple-body-on-dark" : "text-apple-ink",
    body: dark ? "text-apple-body-muted" : "text-apple-ink-muted-80",
    muted: dark ? "text-apple-body-muted" : "text-apple-ink-muted-48",
    card: dark
      ? "rounded-apple-lg border border-apple-surface-tile-3 bg-apple-surface-tile-2"
      : "rounded-apple-lg border border-apple-hairline bg-apple-canvas",
    cardPad: "p-apple-lg",
    input: dark
      ? "h-11 w-full rounded-apple-pill border border-apple-surface-tile-3 bg-apple-surface-tile-2 px-5 text-body text-apple-body-on-dark placeholder:text-apple-body-muted focus:outline-none focus:ring-2 focus:ring-apple-primary-focus"
      : "h-11 w-full rounded-apple-pill border border-apple-hairline bg-apple-canvas px-5 text-body text-apple-ink placeholder:text-apple-ink-muted-48 focus:outline-none focus:ring-2 focus:ring-apple-primary-focus",
    inputCompact: dark
      ? "h-10 rounded-apple-pill border border-apple-surface-tile-3 bg-apple-surface-tile-2 text-sm text-apple-body-on-dark placeholder:text-apple-body-muted focus:outline-none focus:ring-2 focus:ring-apple-primary-focus"
      : "h-10 rounded-apple-pill border border-apple-hairline bg-apple-canvas text-sm text-apple-ink placeholder:text-apple-ink-muted-48 focus:outline-none focus:ring-2 focus:ring-apple-primary-focus",
    divider: dark ? "border-apple-surface-tile-3" : "border-apple-hairline",
    imageWell: dark ? "bg-apple-surface-black" : "bg-apple-canvas-parchment",
    chip: dark
      ? "rounded-apple-pill bg-apple-surface-tile-3 text-apple-body-muted"
      : "rounded-apple-pill bg-apple-canvas-parchment text-apple-ink-muted-80",
    iconBtn: dark
      ? "rounded-apple-sm text-apple-body-muted transition-colors hover:bg-apple-surface-tile-3 hover:text-apple-body-on-dark"
      : "rounded-apple-sm text-apple-ink-muted-48 transition-colors hover:bg-apple-canvas-parchment hover:text-apple-ink-muted-80",
    link: "text-apple-primary transition-opacity hover:opacity-80",
    linkOnDark: "text-apple-primary-on-dark transition-opacity hover:opacity-80",
  };

  return {
    dark,
    primaryColor: theme.primaryColor,
    font: theme.font,
    classes,
  };
}

type StorefrontPageProps = {
  children: ReactNode;
  className?: string;
  parchment?: boolean;
  container?: boolean;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
};

const MAX_WIDTH: Record<NonNullable<StorefrontPageProps["maxWidth"]>, string> = {
  sm: "max-w-3xl",
  md: "max-w-4xl",
  lg: "max-w-5xl",
  xl: "max-w-7xl",
  full: "max-w-[1440px]",
};

export function StorefrontPage({
  children,
  className,
  parchment = false,
  container = true,
  maxWidth = "xl",
}: StorefrontPageProps) {
  const { classes, font } = useStorefrontSurface();
  return (
    <div
      data-storefront-page
      className={cn(parchment ? classes.pageParchment : classes.page, className)}
      style={{ fontFamily: font }}
    >
      {container ? (
        <div className={cn("mx-auto px-4 py-apple-xl sm:px-6 lg:px-8", MAX_WIDTH[maxWidth])}>
          {children}
        </div>
      ) : (
        children
      )}
    </div>
  );
}

type StorefrontButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "utility" | "pearl";
  size?: "default" | "large" | "compact";
};

export function StorefrontButton({
  variant = "primary",
  size = "default",
  className,
  style,
  children,
  ...props
}: StorefrontButtonProps) {
  const { primaryColor } = useStorefrontSurface();
  const base = "btn-press inline-flex items-center justify-center gap-2 font-body transition-opacity disabled:cursor-not-allowed disabled:opacity-50";

  if (variant === "primary") {
    return (
      <button
        className={cn(
          base,
          size === "large" ? "rounded-apple-pill px-7 py-3.5 text-[18px] font-light" : "rounded-apple-pill px-[22px] py-[11px] text-body",
          "text-apple-on-primary",
          className
        )}
        style={{ backgroundColor: primaryColor, ...style }}
        {...props}
      >
        {children}
      </button>
    );
  }

  if (variant === "secondary") {
    return (
      <button
        className={cn(
          base,
          "rounded-apple-pill border border-apple-primary bg-transparent px-[22px] py-[11px] text-body text-apple-primary",
          className
        )}
        style={style}
        {...props}
      >
        {children}
      </button>
    );
  }

  if (variant === "utility") {
    return (
      <button
        className={cn(
          base,
          "rounded-apple-sm bg-apple-ink px-[15px] py-2 text-caption text-apple-on-dark",
          className
        )}
        style={style}
        {...props}
      >
        {children}
      </button>
    );
  }

  return (
    <button
      className={cn(
        base,
        "rounded-apple-md border-[3px] border-apple-divider-soft bg-apple-surface-pearl px-[14px] py-2 text-caption text-apple-ink-muted-80",
        className
      )}
      style={style}
      {...props}
    >
      {children}
    </button>
  );
}

type StorefrontButtonLinkProps = {
  href: string;
  variant?: "primary" | "secondary" | "utility";
  className?: string;
  children: ReactNode;
};

export function StorefrontButtonLink({
  href,
  variant = "primary",
  className,
  children,
}: StorefrontButtonLinkProps) {
  const { primaryColor } = useStorefrontSurface();
  const base = "btn-press inline-flex items-center justify-center gap-2 font-body transition-opacity";

  if (variant === "primary") {
    return (
      <Link
        href={href}
        className={cn(base, "rounded-apple-pill px-[22px] py-[11px] text-body text-apple-on-primary", className)}
        style={{ backgroundColor: primaryColor }}
      >
        {children}
      </Link>
    );
  }

  if (variant === "secondary") {
    return (
      <Link
        href={href}
        className={cn(
          base,
          "rounded-apple-pill border border-apple-primary bg-transparent px-[22px] py-[11px] text-body text-apple-primary",
          className
        )}
      >
        {children}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        base,
        "rounded-apple-sm bg-apple-ink px-[15px] py-2 text-caption text-apple-on-dark",
        className
      )}
    >
      {children}
    </Link>
  );
}

type StorefrontCardProps = {
  children: ReactNode;
  className?: string;
  padding?: boolean;
};

export function StorefrontCard({ children, className, padding = true }: StorefrontCardProps) {
  const { classes } = useStorefrontSurface();
  return (
    <div className={cn(classes.card, padding && classes.cardPad, className)}>
      {children}
    </div>
  );
}

type StorefrontPageHeaderProps = {
  title: string;
  description?: string;
  className?: string;
};

export function StorefrontPageHeader({ title, description, className }: StorefrontPageHeaderProps) {
  const { classes } = useStorefrontSurface();
  return (
    <header className={cn("mb-apple-xl", className)}>
      <h1 className={cn("text-display-md", classes.heading)}>{title}</h1>
      {description ? <p className={cn("mt-2 text-body", classes.muted)}>{description}</p> : null}
    </header>
  );
}

type StorefrontEmptyStateProps = {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function StorefrontEmptyState({
  icon,
  title,
  description,
  action,
  className,
}: StorefrontEmptyStateProps) {
  const { classes } = useStorefrontSurface();
  return (
    <div
      className={cn(
        "flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center gap-4 px-4 text-center",
        className
      )}
    >
      <div className={cn("opacity-40", classes.muted)}>{icon}</div>
      <h2 className={cn("text-tagline", classes.heading)}>{title}</h2>
      {description ? <p className={cn("max-w-md text-caption", classes.muted)}>{description}</p> : null}
      {action}
    </div>
  );
}

export function StorefrontInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  const { classes } = useStorefrontSurface();
  return <input className={cn(classes.input, className)} {...props} />;
}
