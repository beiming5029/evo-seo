"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { LoadingIndicator } from "@/components/loading-indicator";

type BrandConfig = {
  brandVoice?: string | null;
  productDesc?: string | null;
  targetAudience?: string | null;
};

type AccountInfo = {
  companyName?: string | null;
  contactEmail?: string | null;
  siteUrl?: string | null;
  validUntil?: string | null;
};

export default function SettingsPage() {
  const t = useTranslations("dashboard.settingsPage");
  const [brand, setBrand] = useState<BrandConfig | null>(null);
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchedOnce = useRef(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/evo/settings`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setBrand(data.brand || null);
      setAccount(data.account || null);
      setError(null);
    } catch (err) {
      setError(t("error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fetchedOnce.current) return;
    fetchedOnce.current = true;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formattedDate = (date?: string | null) => {
    if (!date) return t("notSet");
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return date;
    return d.toISOString().slice(0, 10);
  };

  const brandVoice = brand?.brandVoice || t("notSet");
  const productDesc = brand?.productDesc || t("notSet");
  const targetAudience = brand?.targetAudience || t("notSet");

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50/60 px-4 py-6 text-foreground dark:bg-black md:px-8 lg:px-10">
      <div className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-blue-500/15 blur-[120px] dark:opacity-0" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-6%] h-72 w-72 rounded-full bg-indigo-500/15 blur-[140px] dark:opacity-0" />
      <div className="pointer-events-none absolute inset-0 bg-[url('/noise.webp')] opacity-[0.04] dark:opacity-0" />

      <div className="relative mb-6 overflow-hidden rounded-3xl border border-white/60 bg-white/70 p-6 shadow-xl shadow-slate-900/10 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-900/70 dark:shadow-black/40">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/12 via-white/10 to-indigo-500/10" />
        <div className="relative flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-700 ring-1 ring-white/70 backdrop-blur-sm dark:bg-blue-900/40 dark:text-blue-200 dark:ring-white/10">
              Settings
            </div>
            <h1 className="mt-3 text-3xl font-bold leading-tight text-slate-900 dark:text-white">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {t("title")}
              </span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{t("brandDesc")}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="relative mb-4 overflow-hidden rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive shadow-sm dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-100">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/70 p-6 shadow-lg shadow-slate-900/10 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-900/70 dark:shadow-black/40">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-blue-500/10 via-white/8 to-indigo-500/10" />
          <div className="relative space-y-1">
            <h2 className="text-xl font-semibold text-foreground">{t("brandTitle")}</h2>
            <p className="text-sm text-muted-foreground">{t("brandDesc")}</p>
          </div>
          {loading ? (
            <div className="py-2">
              <LoadingIndicator label={t("loading")} className="border-0 bg-transparent px-0 shadow-none" rounded={false} />
            </div>
          ) : (
            <div className="relative mt-4 grid gap-4 text-sm text-foreground md:grid-cols-3">
              <InfoBlock label={t("brandVoice")} value={brandVoice} />
              <InfoBlock label={t("productDesc")} value={productDesc} />
              <InfoBlock label={t("targetAudience")} value={targetAudience} />
            </div>
          )}
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/70 p-6 shadow-lg shadow-slate-900/10 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-900/70 dark:shadow-black/40">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-white/8 to-blue-500/10" />
          <div className="relative space-y-1">
            <h2 className="text-xl font-semibold text-foreground">{t("accountTitle")}</h2>
            <p className="text-sm text-muted-foreground">{t("accountDesc")}</p>
          </div>
          {loading ? (
            <div className="py-2">
              <LoadingIndicator label={t("loading")} className="border-0 bg-transparent px-0 shadow-none" rounded={false} />
            </div>
          ) : (
            <div className="relative mt-4 grid gap-4 text-sm text-foreground md:grid-cols-2">
              <InfoBlock label={t("email")} value={account?.contactEmail || t("notSet")} />
              <InfoBlock label={t("company")} value={account?.companyName || t("notSet")} />
              <InfoBlock label={t("site")} value={account?.siteUrl || t("notSet")} />
              <InfoBlock label={t("validUntil")} value={formattedDate(account?.validUntil)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/50 bg-white/70 px-4 py-3 shadow-inner shadow-slate-900/5 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/70">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-base font-medium text-foreground">{value}</p>
    </div>
  );
}
