import type { Metadata, Viewport } from "next";
import { Inter, Hind_Siliguri } from "next/font/google";
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

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-bengali",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getMetadataBaseUrl()),
  title: {
    default: "BornoLand — অল-ইন-ওয়ান ই-কমার্স প্ল্যাটফর্ম",
    template: "%s | BornoLand",
  },
  description: "মাত্র কয়েক মিনিটেই আপনার অনলাইন দোকান চালু করুন। পণ্য, অর্ডার, পেমেন্ট ও ডেলিভারি—সবকিছু এক জায়গা থেকে সহজে পরিচালনা করুন।",
  icons: { icon: "/logo.png", apple: "/logo.png" },
  openGraph: {
    title: "BornoLand — অল-ইন-ওয়ান ই-কমার্স প্ল্যাটফর্ম",
    description: "মাত্র কয়েক মিনিটেই আপনার অনলাইন দোকান চালু করুন। পণ্য, অর্ডার, পেমেন্ট ও ডেলিভারি—সবকিছু এক জায়গা থেকে সহজে পরিচালনা করুন।",
    siteName: "BornoLand",
    type: "website",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "BornoLand" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "BornoLand — অল-ইন-ওয়ান ই-কমার্স প্ল্যাটফর্ম",
    description: "মাত্র কয়েক মিনিটেই আপনার অনলাইন দোকান চালু করুন। পণ্য, অর্ডার, পেমেন্ট ও ডেলিভারি—সবকিছু এক জায়গা থেকে সহজে পরিচালনা করুন।",
    images: ["/logo.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="bn" className={`${inter.variable} ${hindSiliguri.variable} scroll-smooth`}>
      <body className="font-body text-body text-apple-ink antialiased">
        <AppProviders>
          {children}
          <Toaster position="top-right" toastOptions={{ className: "font-body" }} />
        </AppProviders>
      </body>
    </html>
  );
}
