"use client";

import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { ServicesSection } from "@/components/landing/services-section";
import { CaseStudySection } from "@/components/landing/case-study-section";
import { CTASection } from "@/components/landing/cta-section";
import { ContactSection } from "@/components/landing/contact-section";

export function HomePageContent() {
  return (
    <div className="bg-white text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      <HeroSection />
      <FeaturesSection />
      <ServicesSection />
      <CaseStudySection />
      <CTASection />
      <ContactSection />
    </div>
  );
}
