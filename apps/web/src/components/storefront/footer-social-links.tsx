"use client";

import { Facebook, Instagram, Linkedin, Youtube, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FooterSocialLink } from "@/lib/storefront/use-footer-data";

type FooterSocialLinksProps = {
  links: FooterSocialLink[];
  style?: "filled" | "outline" | "minimal";
  className?: string;
  iconClassName?: string;
};

function SocialIcon({ name }: { name: string }) {
  switch (name) {
    case "facebook":
      return <Facebook className="h-4 w-4" />;
    case "instagram":
      return <Instagram className="h-4 w-4" />;
    case "linkedin":
      return <Linkedin className="h-4 w-4" />;
    case "youtube":
      return <Youtube className="h-4 w-4" />;
    case "telegram":
      return <Send className="h-4 w-4" />;
    case "x":
      return <span className="text-xs font-semibold">X</span>;
    default:
      return null;
  }
}

export function FooterSocialLinks({ links, style = "filled", className, iconClassName }: FooterSocialLinksProps) {
  if (links.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {links.map((link) => (
        <a
          key={link.key}
          href={link.url}
          target="_blank"
          rel="noreferrer"
          aria-label={link.label}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-apple-sm transition-colors",
            style === "filled" && "bg-apple-canvas text-apple-ink-muted-48 hover:bg-apple-primary hover:text-apple-on-primary",
            style === "outline" && "border border-apple-hairline text-apple-ink-muted-48 hover:border-apple-primary hover:text-apple-primary",
            style === "minimal" && "text-apple-ink-muted-48 hover:text-apple-primary",
            iconClassName,
          )}
        >
          <SocialIcon name={link.key} />
        </a>
      ))}
    </div>
  );
}
