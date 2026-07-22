"use client";

import { createContext, useContext } from "react";
import { StoreLink } from "@/components/storefront/store-link";
import { usePathname, useRouter } from "next/navigation";
import { isInternalHref, resolveStoreHref } from "@/lib/store-href";

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
  target?: string;
  rel?: string;
  [key: string]: unknown;
};

/**
 * Mode-aware link for builder sections.
 * Live/preview without BuilderProvider: normal StoreLink navigation.
 * Builder edit mode: navigates via router while keeping section editable.
 */
export function BuilderLink({
  href,
  children,
  className,
  style,
  onMouseEnter,
  onMouseLeave,
  onClick,
  target,
  rel,
  ...rest
}: BuilderLinkProps) {
  const isBuilder = useIsBuilderContext();
  const router = useRouter();
  const pathname = usePathname() || "";

  if (!isBuilder) {
    return (
      <StoreLink
        href={href}
        className={className}
        style={style}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
        target={target}
        rel={rel}
        {...rest}
      >
        {children}
      </StoreLink>
    );
  }

  const resolvedHref = href && href !== "#" && isInternalHref(href)
    ? resolveStoreHref(href, pathname)
    : href;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement | HTMLSpanElement>) => {
    e.stopPropagation();
    if (!href || href === "#") return;

    if (target === "_blank" || e.metaKey || e.ctrlKey) {
      if (!isInternalHref(href)) {
        window.open(href, "_blank", "noopener,noreferrer");
      } else {
        window.open(resolvedHref, "_blank", "noopener,noreferrer");
      }
      onClick?.(e as React.MouseEvent<HTMLAnchorElement>);
      return;
    }

    if (isInternalHref(href)) {
      router.push(resolvedHref);
    } else {
      window.location.href = href;
    }
    onClick?.(e as React.MouseEvent<HTMLAnchorElement>);
  };

  return (
    <a
      href={resolvedHref || href || "#"}
      className={className}
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={handleClick}
      target={target}
      rel={rel}
      {...(rest as Record<string, unknown>)}
    >
      {children}
    </a>
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
  const pathname = usePathname() || "";

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

  const handleClick = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    e.stopPropagation();
    if (onClick) {
      onClick();
      return;
    }
    if (href && href !== "#") {
      const resolved = isInternalHref(href) ? resolveStoreHref(href, pathname) : href;
      if (isInternalHref(href)) router.push(resolved);
      else window.location.href = href;
    }
  };

  if (href) {
    const resolved = isInternalHref(href) ? resolveStoreHref(href, pathname) : href;
    return (
      <a
        href={resolved}
        className={className}
        style={style}
        onClick={handleClick}
        aria-label={ariaLabel}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      className={className}
      style={style}
      onClick={handleClick}
      aria-label={ariaLabel}
      type="button"
    >
      {children}
    </button>
  );
}
