import { Container } from "@/components/container";
import { Background } from "@/components/background";
import { Heading } from "@/components/heading";
import { Subheading } from "@/components/subheading";
import { Pricing } from "@/components/pricing";
import { PricingTable } from "./pricing-table";
import { Companies } from "@/components/companies";
import { Metadata } from "next";
import { getTranslations } from 'next-intl/server';
import type { Locale } from "@/i18n.config";

export const metadata: Metadata = {
  title: "Pricing - Sistine AI SaaS Starter",
  description:
    "Choose the perfect plan for your AI SaaS. This pricing section is built with Sistine Starter - fully integrated with Creem for recurring payments.",
  openGraph: {
    images: ["https://ai-saas-template-aceternity.vercel.app/banner.png"],
  },
};

export default async function PricingPage({
  params: { locale },
}: {
  params: { locale: Locale };
}) {
  const t = await getTranslations({ locale, namespace: 'pricing' });

  return (
    <div className="relative overflow-hidden py-20 md:py-0">
      <Background />
      <Container className="flex flex-col items-center justify-between  pb-20">
        <div className="relative z-20 py-10 md:pt-40">
          <Heading as="h1">{t('title')}</Heading>
          <Subheading className="text-center">
            {t('description')}
          </Subheading>
        </div>
        <Pricing />
        <PricingTable />
        <Companies />
      </Container>
    </div>
  );
}
