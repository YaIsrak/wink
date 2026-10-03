import * as React from "react";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { BentoGrid } from "@/components/landing/bento-grid";
import { LandingFooter } from "@/components/landing/landing-footer";

export function LandingPageView() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary selection:text-primary-foreground antialiased">
      <LandingNavbar />
      <main className="flex-1">
        <HeroSection />
        <BentoGrid />
      </main>
      <LandingFooter />
    </div>
  );
}
