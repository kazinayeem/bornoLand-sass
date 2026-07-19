import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InvoiceVerifyClient } from "./client";

type Props = { params: Promise<{ token: string }> };

async function fetchInvoice(token: string) {
  const apiBase =
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:4000";

  try {
    const res = await fetch(`${apiBase}/invoices/verify/${token}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data?.invoice ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const invoice = await fetchInvoice(token);
  if (!invoice) {
    return { title: "Invalid Invoice" };
  }
  return {
    title: `Invoice ${invoice.invoiceNumber}`,
    description: `Verify invoice ${invoice.invoiceNumber} from BornoLand`,
    robots: { index: false, follow: false },
  };
}

export default async function InvoiceVerifyPage({ params }: Props) {
  const { token } = await params;
  const invoice = await fetchInvoice(token);

  return <InvoiceVerifyClient invoice={invoice} token={token} />;
}
