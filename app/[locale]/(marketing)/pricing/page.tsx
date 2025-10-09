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

export async function generateMetadata({
  params
}: {
  params: { locale: Locale }
}): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'seo' });

  return {
    title: t('pricing.title'),
    description: t('pricing.description'),
    openGraph: {
      images: [t('pricing.ogImage')],
    },
  };
}

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
