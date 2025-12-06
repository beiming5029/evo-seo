"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Activity, Brain, Sparkles, ShieldCheck, Rocket } from "lucide-react";
import { FeaturedTestimonials } from "@/components/featured-testimonials";

const floatTransition = {
  repeat: Infinity,
  repeatType: "mirror" as const,
  duration: 6,
  ease: "easeInOut",
};

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations("contact");

  const highlightTiles = [
    {
      icon: Sparkles,
      title: "Guided onboarding",
      desc: "Real-time cues keep every SEO action aligned.",
      delay: 0,
      float: -10,
    },
    {
      icon: ShieldCheck,
      title: "Secure by design",
      desc: "Enterprise-ready auth and data isolation baked in.",
      delay: 0.15,
      float: 12,
    },
    {
      icon: Activity,
      title: "Live insights",
      desc: "Traffic, keywords, and content health in one glance.",
      delay: 0.3,
      float: -14,
    },
    {
      icon: Rocket,
      title: "AI acceleration",
      desc: "Automations ship faster campaigns with less toil.",
      delay: 0.45,
      float: 10,
    },
  ];

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-slate-50/50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-950/70 dark:to-indigo-950/60" />
      <div className="pointer-events-none absolute -left-24 top-6 h-72 w-72 rounded-full bg-blue-500/12 blur-[110px]" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-6%] h-80 w-80 rounded-full bg-indigo-500/16 blur-[140px]" />
      <div className="pointer-events-none absolute inset-0 bg-[url('/noise.webp')] opacity-[0.04]" />

      <div className="relative grid min-h-screen grid-cols-1 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative flex items-center justify-center px-6 py-10 sm:px-10 lg:px-14">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-xl"
          >
            <div className="pointer-events-none absolute -left-10 -top-10 h-24 w-24 rounded-full bg-blue-500/15 blur-3xl" />
            <div className="pointer-events-none absolute -right-8 bottom-4 h-16 w-16 rounded-full bg-indigo-500/20 blur-2xl" />
            <div className="pointer-events-none absolute inset-0 rounded-3xl border border-white/40 bg-white/40 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur-3xl dark:border-slate-800/60 dark:bg-slate-900/50" />

            <div className="relative z-10">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-100/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-blue-700 shadow-sm ring-1 ring-white/60 dark:bg-blue-900/40 dark:text-blue-200">
                <Brain className="h-4 w-4" />
                Vibrant Intelligence
              </div>
              <main>{children}</main>
            </div>
          </motion.div>
        </div>

        <div className="relative hidden overflow-hidden rounded-l-[28px] border-l border-white/30 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 lg:flex">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.24),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(99,102,241,0.18),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(14,165,233,0.25),transparent_35%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[url('/noise.webp')] opacity-[0.06]" />

          <div className="relative z-10 flex w-full flex-col justify-between px-14 py-12">
            <div className="flex items-center gap-3 text-slate-200">
              <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]">
                AI-first
              </div>
              <span className="text-sm text-slate-400">{t("subtitle")}</span>
            </div>

            <div className="space-y-5">
              <h2 className="text-4xl font-bold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-200">
                Build momentum with{" "}
                <span className="whitespace-nowrap">Vibrant Intelligence.</span>
              </h2>
              <p className="max-w-2xl text-lg text-slate-300">
                {t("testimonial.description")}
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              {highlightTiles.map(({ icon: Icon, title, desc, delay, float }) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-white/20 hover:shadow-xl"
                >
                  <motion.div
                    animate={{ y: float }}
                    transition={{ ...floatTransition, delay }}
                    className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-cyan-500/5 opacity-60"
                  />
                  <div className="relative z-10 flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-200 ring-1 ring-white/10">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-white">{title}</p>
                      <p className="text-xs text-slate-300 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg backdrop-blur-xl">
              <p className="text-sm font-semibold text-slate-200">
                {t("testimonial.title")}
              </p>
              <div className="mt-4 flex items-center justify-between gap-4">
                <FeaturedTestimonials />
                <div className="rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-slate-200 shadow-inner ring-1 ring-white/10">
                  Human + AI collaboration
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
