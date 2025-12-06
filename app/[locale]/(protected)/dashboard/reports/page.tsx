"use client";

import { useMemo, useState, useEffect } from "react";
import { FileDown, FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import { LoadingIndicator } from "@/components/loading-indicator";

type Report = {
  id: string;
  title: string;
  type: string;
  periodStart: string;
  periodEnd: string;
  fileUrl: string;
  createdAt: string;
};

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations("dashboard.reportsPage");

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/evo/reports`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setReports(data.reports || []);
      setError(null);
    } catch (err: any) {
      setError(t("loading"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const grouped = useMemo(() => {
    return {
      diagnosis: reports.filter((r) => r.type === "diagnosis"),
      review: reports.filter((r) => r.type === "review"),
    };
  }, [reports]);

  const renderList = (items: Report[]) => {
    if (loading) return (
      <div className="py-1">
        <LoadingIndicator label={t("loading")} className="border-0 bg-transparent px-0 shadow-none" rounded={false} />
      </div>
    );
    if (!items.length)
      return (
        <div className="flex min-h-[80px] items-center justify-between rounded-2xl border border-dashed border-slate-200/80 bg-white/60 px-4 py-3 text-sm text-muted-foreground shadow-inner shadow-slate-900/5 dark:border-slate-800/60 dark:bg-slate-900/50">
          <span>{t("empty")}</span>
          <FileText className="h-5 w-5 text-slate-300 dark:text-slate-600" />
        </div>
      );
    return (
      <div className="mt-3 space-y-3">
        {items.map((r) => (
          <div
            key={r.id}
            className="group relative flex min-h-[94px] items-center justify-between overflow-hidden rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-sm shadow-lg shadow-slate-900/10 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:shadow-2xl dark:border-slate-800/70 dark:bg-slate-900/70 dark:shadow-black/40"
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-blue-500/10 via-white/8 to-indigo-500/10 opacity-80" />
            <div className="relative flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700 shadow-sm ring-1 ring-white/60 dark:bg-blue-500/20 dark:text-blue-200 dark:ring-white/10">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{r.title}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(r.createdAt).toISOString().slice(0, 10)}
                </p>
              </div>
            </div>
            <a
              href={r.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="relative inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-2 text-xs font-semibold text-blue-700 shadow-sm ring-1 ring-white/70 transition hover:-translate-y-0.5 hover:shadow-md dark:bg-blue-500/20 dark:text-blue-100 dark:ring-white/10"
            >
              <FileDown className="h-5 w-5" />
              <span>{t("download")}</span>
            </a>
          </div>
        ))}
      </div>
    );
  };

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
              Reports
            </div>
            <h1 className="mt-3 text-3xl font-bold leading-tight text-slate-900 dark:text-white">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {t("title")}
              </span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{t("subtitle")}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="relative mb-4 overflow-hidden rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive shadow-sm dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-100">
          {error}
        </div>
      )}

      <div className="relative space-y-6">
        <section className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/70 p-5 shadow-lg shadow-slate-900/10 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-900/70 dark:shadow-black/40">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-blue-500/10 via-white/8 to-indigo-500/10" />
          <div className="relative">
            <h3 className="text-lg font-semibold text-foreground">{t("diagnosis")}</h3>
            <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
            <div className="mt-4">{renderList(grouped.diagnosis)}</div>
          </div>
        </section>

        <section className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/70 p-5 shadow-lg shadow-slate-900/10 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-900/70 dark:shadow-black/40">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-white/8 to-blue-500/10" />
          <div className="relative">
            <h3 className="text-lg font-semibold text-foreground">{t("review")}</h3>
            <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
            <div className="mt-4">{renderList(grouped.review)}</div>
          </div>
        </section>
      </div>
    </div>
  );
}
