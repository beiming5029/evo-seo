import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n.config";
import { generatePageMetadata } from "@/lib/metadata";
import { Container } from "@/components/container";
import { Button } from "@/components/button";
import { Badge } from "@/components/badge";
import { Sparkles, CalendarRange, BarChart3, FileText, Send, Target } from "lucide-react";

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

  return (
    <div className="bg-background text-foreground">
      <main>
        <section className="bg-background">
          <Container className="flex flex-col items-center py-16 md:py-20 text-center">
            <Badge className="text-xs tracking-tight px-4 py-2">{t("hero.badge")}</Badge>
            <div className="mt-6 space-y-2">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black leading-tight text-foreground">
                {t("hero.title1")}
              </h1>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black leading-tight text-foreground">
                {t("hero.title2")}
              </h1>
            </div>
            <div className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed space-y-1">
              <p>{t("hero.desc1")}</p>
              <p>{t("hero.desc2")}</p>
            </div>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button as="a" href="/dashboard" className="rounded-full px-6">
                {t("hero.ctaStart")}
              </Button>
              <Button variant="outline" className="rounded-full px-6" as="a" href="/contact">
                {t("hero.ctaDemo")}
              </Button>
            </div>
          </Container>
        </section>

        <section className="border-t border-border/60 bg-muted">
          <Container className="grid gap-6 py-10 sm:grid-cols-3 text-center">
            {["stat1", "stat2", "stat3"].map((key) => (
              <div key={key} className="rounded-xl border border-border bg-background p-6 shadow-sm">
                <div className="text-4xl font-bold text-foreground">{t(`stats.${key}.value`)}</div>
                <div className="mt-2 text-sm text-muted-foreground">{t(`stats.${key}.label`)}</div>
              </div>
            ))}
          </Container>
        </section>

        <section id="why" className="bg-background py-14">
          <Container className="flex flex-col items-center text-center gap-4">
            <h2 className="text-3xl md:text-4xl font-black">{t("why.title")}</h2>
            <p className="text-muted-foreground max-w-3xl">{t("why.desc")}</p>
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3 w-full">
              {Object.keys(featureIcons).map((key) => {
                const Icon = featureIcons[key as keyof typeof featureIcons];
                return (
                  <div
                    key={key}
                    className="rounded-xl border border-border bg-background p-6 text-left shadow-sm hover:shadow-md transition-shadow"
                  >
                    <Icon className="h-8 w-8 text-foreground" />
                    <h3 className="mt-4 text-lg font-semibold text-foreground">
                      {t(`features.${key}.title`)}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      {t(`features.${key}.desc`)}
                    </p>
                  </div>
                );
              })}
            </div>
          </Container>
        </section>

        <section className="bg-muted py-14">
          <Container className="grid gap-10 lg:grid-cols-2 items-start">
            <div>
              <h3 className="text-2xl md:text-3xl font-black">{t("busy.title")}</h3>
              <p className="mt-3 text-muted-foreground">{t("busy.desc")}</p>
              <ul className="mt-6 space-y-3 text-sm text-foreground">
                {["b1", "b2", "b3", "b4", "b5", "b6"].map((key) => (
                  <li key={key} className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-foreground" />
                    <span>{t(`bullets.${key}`)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-border bg-background p-6 shadow-sm">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{t("case.title")}</span>
                <span className="flex items-center gap-1 text-foreground">
                  <BarChart3 className="h-4 w-4" /> {t("case.indicator")}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                {["m1", "m2", "m3", "m4"].map((key) => (
                  <div key={key} className="rounded-lg border border-border/60 bg-muted/40 p-3">
                    <div className="text-muted-foreground">{t(`case.metrics.${key}.label`)}</div>
                    <div className="text-xl font-semibold text-foreground mt-1">
                      {t(`case.metrics.${key}.value`)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </section>

        <section id="cta" className="bg-background py-16">
          <Container className="rounded-2xl border border-border bg-muted p-8 text-center shadow-sm">
            <h3 className="text-2xl md:text-3xl font-black">{t("cta.title")}</h3>
            <p className="mt-3 text-muted-foreground">{t("cta.desc")}</p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Button as="a" href="/dashboard" className="px-6 rounded-full">
                {t("hero.ctaStart")}
              </Button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{t("cta.tip")}</p>
          </Container>
        </section>
      </main>
    </div>
  );
}
