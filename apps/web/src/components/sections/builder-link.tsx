"use client";

import { createContext, useContext } from "react";
import { StoreLink } from "@/components/storefront/store-link";
import { useRouter } from "next/navigation";

type BuilderContextValue = {
  isBuilder: boolean;
};

const BuilderContext = createContext<BuilderContextValue>({ isBuilder: false });

export function BuilderProvider({ children }: { children: React.ReactNode }) {
  return (
    <BuilderContext.Provider value={{ isBuilder: true }}>
      {children}
    </BuilderContext.Provider>
  );
}

export function useIsBuilderContext(): boolean {
  return useContext(BuilderContext).isBuilder;
}

type BuilderLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onMouseEnter?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  onMouseLeave?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  [key: string]: unknown;
};

/**
 * Mode-aware link component for builder sections.
 *
 * Builder mode: renders as <span> (selectable for editing).
 *   - Ctrl/Cmd + Click navigates via router.push()
 *   - Normal click does nothing (section selection handled by canvas)
 *
 * Preview/Live mode: renders as StoreLink (normal navigation).
 */
export function BuilderLink({
  href,
  children,
  className,
  style,
  onMouseEnter,
  onMouseLeave,
  onClick,
  ...rest
}: BuilderLinkProps) {
  const isBuilder = useIsBuilderContext();
  const router = useRouter();

  if (!isBuilder) {
    return (
      <StoreLink
        href={href}
        className={className}
        style={style}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
        {...rest}
      >
        {children}
      </StoreLink>
    );
  }

  // Builder mode: render as span, allow Ctrl/Cmd+Click to navigate
  const handleClick = (e: React.MouseEvent<HTMLSpanElement>) => {
    if (e.metaKey || e.ctrlKey) {
      e.preventDefault();
      router.push(href);
    }
    onClick?.(e as unknown as React.MouseEvent<HTMLAnchorElement>);
  };

  return (
    <span
      className={className}
      style={{ ...style, cursor: "default" }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={handleClick}
      {...rest as Record<string, unknown>}
    >
      {children}
    </span>
  );
}

type BuilderIconButtonProps = {
  href?: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  "aria-label"?: string;
};

/**
 * Mode-aware icon button for builder sections (search, wishlist, cart, account).
 *
 * Builder mode: renders as <span> (selectable for editing).
 * Preview/Live mode: renders as clickable link or button.
 */
export function BuilderIconButton({
  href,
  children,
  className,
  style,
  onClick,
  "aria-label": ariaLabel,
}: BuilderIconButtonProps) {
  const isBuilder = useIsBuilderContext();
  const router = useRouter();

  if (!isBuilder) {
    if (href) {
      return (
        <StoreLink
          href={href}
          className={className}
          style={style}
          aria-label={ariaLabel}
        >
          {children}
        </StoreLink>
      );
    }
    return (
      <button
        className={className}
        style={style}
        onClick={onClick}
        aria-label={ariaLabel}
        type="button"
      >
        {children}
      </button>
    );
  }

  // Builder mode: render as span
  const handleClick = (e: React.MouseEvent<HTMLSpanElement>) => {
    if ((e.metaKey || e.ctrlKey) && href) {
      e.preventDefault();
      router.push(href);
    }
  };

  return (
    <span
      className={className}
      style={{ ...style, cursor: "default" }}
      onClick={handleClick}
      role="button"
      aria-label={ariaLabel}
    >
      {children}
    </span>
  );
}
