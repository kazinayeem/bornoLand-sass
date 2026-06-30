import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { AppProviders } from "@/providers/app-providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter"
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk"
});

export const metadata: Metadata = {
  title: {
    default: "BornoLand",
    template: "%s | BornoLand",
  },
  description: "Build premium ecommerce storefronts, multi-tenant SaaS experiences, and AI-powered store builders with BornoLand.",
  openGraph: {
    title: "BornoLand",
    description: "Build premium ecommerce storefronts, multi-tenant SaaS experiences, and AI-powered store builders with BornoLand.",
    siteName: "BornoLand",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BornoLand",
    description: "Build premium ecommerce storefronts, multi-tenant SaaS experiences, and AI-powered store builders with BornoLand.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} scroll-smooth`}>
      <body className="bg-white text-zinc-950 antialiased">
        <AppProviders>
          {children}
          <Toaster richColors position="top-right" />
        </AppProviders>
      </body>
    </html>
  );
}