import type { ReactNode } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function AuthCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Card className="w-full rounded-2xl border border-border bg-card p-6 shadow-xl sm:p-8">
      <CardHeader className="p-0 mb-6 space-y-2.5">
        <Badge variant="outline" className="w-fit rounded-full px-3 py-1 text-xs font-semibold text-primary border-primary/30 uppercase tracking-widest bg-primary/5">
          BornoLand
        </Badge>
        <CardTitle className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {title}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  );
}
