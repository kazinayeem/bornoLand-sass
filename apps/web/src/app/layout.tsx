import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { ReduxProvider } from "@/providers/redux-provider";

export const metadata: Metadata = {
  title: "BornoLand",
  description: "AI-powered multi-tenant landing page generator by Bornosoft"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          {children}
          <Toaster richColors position="top-right" />
        </ReduxProvider>
      </body>
    </html>
  );
}