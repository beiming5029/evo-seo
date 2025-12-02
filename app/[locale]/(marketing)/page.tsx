import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n.config";
import { generatePageMetadata } from "@/lib/metadata";
import { Container } from "@/components/container";
import { Button } from "@/components/button";
import { Badge } from "@/components/badge";
import { Sparkles, CalendarRange, BarChart3, FileText, Send, Target, ArrowRight } from "lucide-react";
import { HeroSection } from "@/components/ui/hero-section";
import { HoverEffect } from "@/components/ui/card-hover-effect";
import { MagicButton } from "@/components/ui/magic-button";
import { BackgroundBeams } from "@/components/ui/background-beams";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "landing" });

  return generatePageMetadata({
    locale,
    path: "",
    title: t("meta.title"),
    description: t("meta.description"),
  });
}

const featureIcons = {
  f1: Sparkles,
  f2: CalendarRange,
  f3: BarChart3,
  f4: FileText,
  f5: Send,
  f6: Target,
};

export default async function Home({ params: { locale } }: { params: { locale: Locale } }) {
  const t = await getTranslations({ locale, namespace: "landing" });

  const features = Object.keys(featureIcons).map((key) => {
    const Icon = featureIcons[key as keyof typeof featureIcons];
    return {
      title: t(`features.${key}.title`),
      description: t(`features.${key}.desc`),
      icon: <Icon className="h-6 w-6" />,
    };
  });

  return (
    <div className="bg-background text-foreground overflow-hidden">
      <main>
        {/* Hero Section with Aurora Background */}
        <HeroSection
          badge={
            <Badge className="text-xs tracking-tight px-4 py-2 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-sm">
              {t("hero.badge")}
            </Badge>
          }
          title={
            <>
              {t("hero.title1")} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500">
                {t("hero.title2")}
              </span>
            </>
          }
          subtitle={
            <>
              <span className="block mb-2">{t("hero.desc1")}</span>
              <span className="block">{t("hero.desc2")}</span>
            </>
          }
          cta={
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center w-full">
              <a href="/dashboard" className="w-full sm:w-auto">
                <MagicButton
                  title={t("hero.ctaStart")}
                  icon={<ArrowRight className="w-4 h-4" />}
                  position="right"
                />
              </a>
              <Button
                variant="outline"
                className="w-full sm:w-60 h-12 rounded-lg px-8 text-base bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white hover:scale-105 hover:shadow-lg transition-all duration-300"
                as="a"
                href="/contact"
              >
                {t("hero.ctaDemo")}
              </Button>
            </div>
          }
        />

        {/* Stats Section - Glassmorphism */}
        <section className="bg-background relative z-20 -mt-20 pb-20">
          <Container className="grid gap-6 py-10 sm:grid-cols-3 text-center">
            {["stat1", "stat2", "stat3"].map((key) => (
              <div key={key} className="rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-xl p-6 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <div className="text-4xl font-bold text-foreground bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                  {t(`stats.${key}.value`)}
                </div>
                <div className="mt-2 text-sm text-muted-foreground font-medium">{t(`stats.${key}.label`)}</div>
              </div>
            ))}
          </Container>
        </section>

        {/* Features Section - Hover Effect */}
        <section id="why" className="bg-background py-20 relative">
          <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] -z-10" />
          <Container className="flex flex-col items-center text-center gap-10">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
                {t("why.title")}
              </h2>
              <p className="text-muted-foreground text-lg">{t("why.desc")}</p>
            </div>

            <HoverEffect items={features} />
          </Container>
        </section>

        {/* Busy Section */}
        <section className="bg-muted/30 py-24 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />

          <Container className="grid gap-16 lg:grid-cols-2 items-center relative z-10">
            <div>
              <Badge className="mb-4 border-primary/20 text-primary bg-primary/5">Efficiency</Badge>
              <h3 className="text-3xl md:text-4xl font-black leading-tight mb-6">{t("busy.title")}</h3>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">{t("busy.desc")}</p>
              <ul className="space-y-4">
                {["b1", "b2", "b3", "b4", "b5", "b6"].map((key) => (
                  <li key={key} className="flex items-center gap-3 p-3 rounded-lg hover:bg-background/50 transition-colors">
                    <div className="h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                    </div>
                    <span className="font-medium">{t(`bullets.${key}`)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-border/50 bg-background/50 backdrop-blur-xl p-8 shadow-2xl relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-3xl -z-10" />
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-8">
                <span className="font-semibold uppercase tracking-wider text-xs">{t("case.title")}</span>
                <span className="flex items-center gap-2 text-primary font-bold bg-primary/10 px-3 py-1 rounded-full text-xs">
                  <BarChart3 className="h-3 w-3" /> {t("case.indicator")}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-6">
                {["m1", "m2", "m3", "m4"].map((key) => (
                  <div key={key} className="rounded-2xl border border-border/40 bg-white/50 dark:bg-black/20 p-5 hover:border-primary/30 transition-colors group">
                    <div className="text-muted-foreground text-sm mb-2">{t(`case.metrics.${key}.label`)}</div>
                    <div className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {t(`case.metrics.${key}.value`)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* CTA Section with Background Beams */}
        <section id="cta" className="relative w-full py-32 overflow-hidden">
          <div className="absolute inset-0 w-full h-full bg-neutral-950 z-0">
             <BackgroundBeams />
          </div>

          <Container className="relative z-10">
            <div className="max-w-2xl mx-auto text-center">
              <h3 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight">
                {t("cta.title")}
              </h3>
              <p className="text-neutral-300 text-lg mb-10 leading-relaxed">
                {t("cta.desc")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <a href="/dashboard">
                  <MagicButton
                    title={t("hero.ctaStart")}
                    icon={<ArrowRight className="w-4 h-4" />}
                    position="right"
                  />
                </a>
              </div>
              <p className="mt-8 text-sm text-neutral-400 font-medium">{t("cta.tip")}</p>
            </div>
          </Container>
        </section>
      </main>
    </div>
  );
}
