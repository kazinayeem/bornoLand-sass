import { createSiteMetadata } from "@/components/site/create-site-metadata";
import { HowToUseClient } from "@/components/how-to-use/how-to-use-client";

export const metadata = createSiteMetadata({
  title: "BornoLand কীভাবে ব্যবহার করবেন — ভিজ্যুয়াল ইউজার গাইড ও টিউটোরিয়াল",
  description:
    "BornoLand SaaS প্ল্যাটফর্মের প্রতিটি ফিচার বাস্তব অ্যাপ্লিকেশনের স্ক্রিনশট সহ সহজে ব্যবহার করার পূর্ণাঙ্গ নির্দেশিকা। কমার্স, ইনভেন্টরি, পিওএস, এইচআরএম, পেরোল ও সেটিংস।",
  path: "/how-to-use",
  keywords: [
    "BornoLand user guide",
    "BornoLand কীভাবে ব্যবহার করবেন",
    "BornoLand tutorial Bangla",
    "SaaS POS guide",
    "inventory management guide",
    "payroll onboarding Bangla",
    "ecommerce ERP guide",
  ],
});

export default function HowToUsePage() {
  return <HowToUseClient />;
}
