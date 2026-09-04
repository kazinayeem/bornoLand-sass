import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { AppProviders } from "@/providers/app-providers";
import { getMetadataBaseUrl } from "@/lib/urls";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getMetadataBaseUrl()),
  title: {
    default: "BornoLand — All-in-One E-Commerce Platform",
    template: "%s | BornoLand",
  },
  description: "Launch your online store in minutes. Manage products, orders, payments, and delivery — everything in one place.",
  icons: { icon: "/logo.png", apple: "/logo.png" },
  openGraph: {
    title: "BornoLand — All-in-One E-Commerce Platform",
    description: "Launch your online store in minutes. Manage products, orders, payments, and delivery — everything in one place.",
    siteName: "BornoLand",
    type: "website",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "BornoLand" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "BornoLand — All-in-One E-Commerce Platform",
    description: "Launch your online store in minutes. Manage products, orders, payments, and delivery — everything in one place.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} scroll-smooth`}>
      <body className="font-body text-body text-apple-ink antialiased">
        <AppProviders>
          {children}
          <Toaster position="top-right" toastOptions={{ className: "font-body" }} />
        </AppProviders>
      </body>
    </html>
  );
}
