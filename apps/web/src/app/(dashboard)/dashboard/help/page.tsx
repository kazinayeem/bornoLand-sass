import Link from "next/link";
import { BookOpen, MessageCircle, Mail } from "lucide-react";
import { PageHeader } from "@/components/workspace/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const resources = [
  {
    title: "Getting Started Guide",
    description: "Learn how to create your first store and add products.",
    href: "/dashboard/stores/create",
    icon: BookOpen,
  },
  {
    title: "Store Management",
    description: "Manage products, orders, customers, and theme design with ease.",
    href: "/dashboard/stores",
    icon: MessageCircle,
  },
  {
    title: "Direct Support",
    description: "For any questions, email us at: support@bornoland.com",
    href: "mailto:support@bornoland.com",
    icon: Mail,
  },
];

export default function HelpPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Help Center"
        description="Tutorials and support for managing your BornoLand workspace."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {resources.map((item) => (
          <Card key={item.title} className="transition-all hover:shadow-md">
            <CardHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100">
                <item.icon className="h-5 w-5 text-apple-ink-muted-80" />
              </div>
              <CardTitle className="text-lg">{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href={item.href}
                className="text-sm font-medium text-blue-600 underline-offset-4 hover:underline"
              >
                Learn More →
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
