import React from "react";
import { createSiteMetadata } from "@/components/site/create-site-metadata";
import RefundPage from "../refund/page";

export const metadata = createSiteMetadata({
  title: "Refund Policy — BornoLand",
  description: "BornoLand subscription cancellation and refund guidelines.",
  path: "/refund-policy",
});

export default function RefundPolicyAliasPage() {
  return <RefundPage />;
}
