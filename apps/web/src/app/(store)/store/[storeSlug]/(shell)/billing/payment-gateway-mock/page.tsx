import type { Metadata } from "next";
import { Suspense } from "react";
import { PaymentGatewayMock } from "@/components/store-dashboard/billing/payment-gateway-mock";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Payment Gateway — BornoLand",
  robots: { index: false, follow: false },
};

export default function PaymentGatewayMockPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
        </div>
      }
    >
      <PaymentGatewayMock />
    </Suspense>
  );
}
