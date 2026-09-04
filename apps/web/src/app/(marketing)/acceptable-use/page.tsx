import React from "react";
import { createSiteMetadata } from "@/components/site/create-site-metadata";
import UserRulesPage from "../user-rules/page";

export const metadata = createSiteMetadata({
  title: "Acceptable Use Policy — BornoLand",
  description: "Platform guidelines and acceptable use rules for BornoLand users and merchants.",
  path: "/acceptable-use",
});

export default function AcceptableUsePage() {
  return <UserRulesPage />;
}
