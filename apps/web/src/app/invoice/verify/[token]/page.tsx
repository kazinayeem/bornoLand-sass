import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InvoiceVerifyClient } from "./client";

type Props = { params: Promise<{ token: string }> };

type ApiResponse = {
  data?: {
    type: "subscription" | "order";
    invoice: Record<string, unknown>;
  };
};

async function fetchInvoice(token: string) {
  const apiBase =
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:4000";

  try {
    const res = await fetch(`${apiBase}/public/invoice/verify/${token}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as ApiResponse;
    return json?.data ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const data = await fetchInvoice(token);
  if (!data) {
    return { title: "Invalid Invoice", robots: { index: false, follow: false } };
  }
  return {
    title: `Invoice ${data.invoice?.invoiceNumber || ""}`,
    description: `Verify invoice from BornoLand`,
    robots: { index: false, follow: false },
  };
}

export default async function InvoiceVerifyPage({ params }: Props) {
  const { token } = await params;
  const data = await fetchInvoice(token);

  return <InvoiceVerifyClient data={data} token={token} />;
}
