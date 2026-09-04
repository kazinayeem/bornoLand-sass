import { createSiteMetadata } from "@/components/site/create-site-metadata";
import { CareersClient } from "@/components/site/careers-client";

export const metadata = createSiteMetadata({
  title: "Careers & Open Positions — BornoLand & BornoSoft",
  description:
    "Join the engineering and product team building the all-in-one Business Operating System for modern commerce in Bangladesh and worldwide.",
  path: "/careers",
  keywords: ["BornoLand careers", "BornoSoft jobs", "software engineer jobs Dhaka", "tech careers"],
});

export default function CareersPage() {
  return <CareersClient />;
}
