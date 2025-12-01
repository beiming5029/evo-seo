"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/button";
import { CalendarRange, FileText, MessageCircle, TrendingUp } from "lucide-react";

type OverviewResponse = {
  siteCount: number;
  currentMonthInquiries: number;
  currentMonthArticles: number;
  latestReport: { id: string; title: string; date?: string; fileUrl: string } | null;
};

export default function DashboardPage() {
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const t = useTranslations("dashboard.home");

  const cardClass =
    "group relative flex h-56 flex-col justify-between rounded-xl border border-border bg-background p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md";

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/evo/dashboard/overview`);
        if (!res.ok) throw new Error(await res.text());
        setOverview(await res.json());
        setError(null);
      } catch (err) {
        console.error("Failed to load dashboard", err);
        setError("加载数据失败，请稍后重试");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const siteCountText = useMemo(() => {
    const count = overview?.siteCount ?? 1;
    return t("subtitle", { count });
  }, [overview, t]);

  const latestReportDate = overview?.latestReport?.date
    ? new Date(overview.latestReport.date).toISOString().slice(0, 10)
    : null;

  const handleCopyWechat = async () => {
    try {
      await navigator.clipboard.writeText("lsiy_lee");
      setCopyMessage(t("copied"));
    } catch (error) {
      setCopyMessage(t("copyFailed"));
    } finally {
      setTimeout(() => setCopyMessage(null), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 text-foreground md:p-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold md:text-4xl">Dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("welcome")}，{siteCountText}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Link href="/dashboard/analytics" className={cardClass}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-lg font-semibold">{t("inquiriesTitle")}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t("inquiriesDesc")}</p>
            </div>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="text-5xl font-bold">
            {loading ? "..." : overview?.currentMonthInquiries ?? 0}
          </div>
        </Link>

        <Link href="/dashboard/calendar" className={cardClass}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-lg font-semibold">{t("calendarTitle")}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t("calendarDesc")}</p>
            </div>
            <CalendarRange className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="text-5xl font-bold">
            {loading ? "..." : overview?.currentMonthArticles ?? 0}
          </div>
        </Link>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Link href="/dashboard/reports" className={cardClass}>
          <div className="flex items-start justify-between">
            <p className="text-lg font-semibold">{t("reportsTitle")}</p>
            <FileText className="h-5 w-5 text-muted-foreground" />
          </div>
          {overview?.latestReport ? (
            <div className="rounded-lg border border-border/70 bg-muted/30 p-4 text-sm">
              <p className="font-semibold text-foreground">{overview.latestReport.title}</p>
              {latestReportDate && <p className="mt-1 text-muted-foreground">{latestReportDate}</p>}
              <span className="mt-2 inline-flex text-primary">{t("reportsDesc")}</span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t("noReport")}</p>
          )}
        </Link>

        <div className={cardClass}>
          <div className="flex items-start justify-between">
            <p className="text-lg font-semibold">{t("expertTitle")}</p>
            <MessageCircle className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{t("expertDesc")}</p>
          <Button
            className="mt-6 w-full justify-center rounded-full bg-foreground text-background hover:bg-foreground/90"
            onClick={handleCopyWechat}
          >
            {t("copyWechat")}
          </Button>
          {copyMessage && (
            <div className="mt-3 rounded-md border border-border/60 bg-muted/40 px-3 py-2 text-xs text-foreground">
              {copyMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
