import { LandingLocaleProvider } from "@/components/landing/landing-locale";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LandingLocaleProvider>
      <Header />
      <main className="min-h-screen overflow-x-hidden scroll-smooth [scroll-padding-top:4.5rem] sm:[scroll-padding-top:5rem]">
        {children}
      </main>
      <Footer />
    </LandingLocaleProvider>
  );
}
