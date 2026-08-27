import Link from "next/link";
import { BookOpen, MessageCircle, Mail } from "lucide-react";
import { PageHeader } from "@/components/workspace/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const resources = [
  {
    title: "শুরু করার নির্দেশিকা",
    description: "কীভাবে আপনার প্রথম দোকান তৈরি করবেন এবং পণ্য যোগ করবেন তা শিখুন।",
    href: "/dashboard/stores/create",
    icon: BookOpen,
  },
  {
    title: "দোকান পরিচালনা",
    description: "পণ্য, অর্ডার, কাস্টমার এবং থিম ডিজাইন খুব সহজে ম্যানেজ করুন।",
    href: "/dashboard/stores",
    icon: MessageCircle,
  },
  {
    title: "সরাসরি সহায়তা প্রাপ্তি",
    description: "যেকোনো প্রশ্নের জন্য আমাদের ইমেইল করুন: support@bornoland.com।",
    href: "mailto:support@bornoland.com",
    icon: Mail,
  },
];

export default function HelpPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="সহায়তা কেন্দ্র"
        description="আপনার বর্ণল্যান্ড ওয়ার্কস্পেস পরিচালনার প্রয়োজনীয় টিউটোরিয়াল ও সাপোর্ট।"
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
                বিস্তারিত দেখুন →
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
