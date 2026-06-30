import Link from "next/link";
import { BookOpen, MessageCircle, Mail } from "lucide-react";
import { PageHeader } from "@/components/workspace/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const resources = [
  {
    title: "Getting Started",
    description: "Learn how to create your first store and configure products.",
    href: "/dashboard/stores/create",
    icon: BookOpen,
  },
  {
    title: "Store Management",
    description: "Manage products, orders, customers, and your storefront.",
    href: "/dashboard/stores",
    icon: MessageCircle,
  },
  {
    title: "Contact Support",
    description: "Reach our team at support@bornoland.com for assistance.",
    href: "mailto:support@bornoland.com",
    icon: Mail,
  },
];

export default function HelpPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Help & Support"
        description="Resources and support for your BornoLand workspace."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {resources.map((item) => (
          <Card key={item.title} className="transition-all hover:shadow-md">
            <CardHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100">
                <item.icon className="h-5 w-5 text-zinc-600" />
              </div>
              <CardTitle className="text-lg">{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href={item.href}
                className="text-sm font-medium text-zinc-900 underline-offset-4 hover:underline"
              >
                Learn more
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
