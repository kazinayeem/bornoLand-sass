"use client";

import { Badge } from "@/components/ui/badge";

export function ComingSoonBadge({ className }: { className?: string }) {
  return (
    <Badge variant="slate" className={className}>
      Coming Soon
    </Badge>
  );
}
