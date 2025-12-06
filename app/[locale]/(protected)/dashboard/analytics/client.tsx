"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TenantSwitcher } from "@/components/tenant-switcher";

type InquiryStat = { period: string; count: number };
type TrafficStat = { period: string; clicks: number; impressions: number; ctr: string; position?: string | null };
type KeywordRanking = { keyword: string; targetUrl: string | null; rank: number | null; rankDelta: number | null };
type Tenant = { id: string; name: string | null; siteUrl?: string | null; role?: string };

type Props = {
  tenants: Tenant[];
  selectedTenantId?: string;
};

type OverviewData = {
  inquiries: InquiryStat[];
  traffic: TrafficStat[];
  keywords: KeywordRanking[];
};

export default function AnalyticsClient({ tenants, selectedTenantId }: Props) {
  const t = useTranslations("dashboard.analytics");
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showSkeleton, setShowSkeleton] = useState<boolean>(true);
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | undefined>(selectedTenantId);

  useEffect(() => {
    if (selectedTenantId) {
      setSelected(selectedTenantId);
    } else if (tenants[0]?.id) {
      setSelected((prev) => prev || tenants[0].id);
    }
  }, [selectedTenantId, tenants]);

  useEffect(() => {
    const targetId = selected || tenants[0]?.id;
    if (!targetId) {
      setLoading(false);
      setHasLoaded(false);
      setShowSkeleton(false);
      return;
    }
    let cancelled = false;
    const startedAt = Date.now();
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setHasLoaded(false);
      setShowSkeleton(true);
      setError(null);
      try {
        const res = await fetch(`/api/dashboard/analytics?tenantId=${targetId}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!res.ok) {
          throw new Error(`请求失败: ${res.status}`);
        }
        const json = await res.json();
        if (!cancelled) {
          setData({
            inquiries: json.inquiries || [],
            traffic: json.traffic || [],
            keywords: json.keywords || [],
          });
        }
      } catch (err: any) {
        if (err.name === "AbortError" || cancelled) return;
        setError(err.message || "加载失败");
        setData(null);
      } finally {
        if (cancelled) return;
        setLoading(false);
        setHasLoaded(true);
        const elapsed = Date.now() - startedAt;
        const remaining = Math.max(0, 300 - elapsed); // 至少展示 300ms 骨架
        setTimeout(() => {
          if (!cancelled) setShowSkeleton(false);
        }, remaining);
      }
    };
    load();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [selected, tenants]);

  const inquiries = data?.inquiries || [];
  const traffic = data?.traffic || [];
  const keywords = data?.keywords || [];

  const latestDate = useMemo(() => {
    const dates: string[] = [];
    inquiries?.forEach((i) => i.period && dates.push(i.period));
    traffic?.forEach((i) => i.period && dates.push(i.period));
    return dates.length ? dates.sort().at(-1) || null : null;
  }, [inquiries, traffic]);

  const last6Inquiries = useMemo(
    () => inquiries.map((i) => ({ period: i.period, value: Number(i.count) || 0 })).slice(-6),
    [inquiries]
  );
  const last6Traffic = useMemo(
    () => traffic.map((t) => ({ period: t.period, value: Number(t.clicks) || 0 })).slice(-6),
    [traffic]
  );

  const skeletoning = showSkeleton || loading || !hasLoaded;

  const renderChart = (data: { period: string; value: number }[], color: string, label: string) => {
    if (skeletoning) return <ChartSkeleton />;
    if (error) return <p className="text-sm text-amber-700">{error}</p>;
    if (!data.length) return <p className="text-sm text-muted-foreground">{t("noData")}</p>;
    return (
      <div className="space-y-3">
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="period" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} width={32} />
            <Tooltip contentStyle={{ fontSize: 12 }} formatter={(v) => [v, label]} labelFormatter={(l) => l} />
            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const shellCard =
    "relative overflow-hidden rounded-2xl border border-white/60 bg-white/70 p-5 shadow-lg shadow-slate-900/10 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-900/70 dark:shadow-black/40 mt-6";

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50/60 px-4 py-6 text-foreground dark:bg-black md:px-8 lg:px-10">
      <div className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-blue-500/15 blur-[120px] dark:opacity-0" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-6%] h-72 w-72 rounded-full bg-indigo-500/15 blur-[140px] dark:opacity-0" />
      <div className="pointer-events-none absolute inset-0 bg-[url('/noise.webp')] opacity-[0.04] dark:opacity-0" />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className={`${shellCard} mb-6`}
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/12 via-white/10 to-indigo-500/10" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-700 ring-1 ring-white/70 backdrop-blur-sm dark:bg-blue-900/40 dark:text-blue-200 dark:ring-white/10">
              Insights
            </div>
            <h1 className="mt-3 text-3xl font-bold leading-tight text-slate-900 dark:text-white">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {t("title")}
              </span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("subtitle")}
              {latestDate ? ` · ${latestDate}` : ""}
            </p>
          </div>
          <div className="w-full md:w-72">
            <TenantSwitcher
              tenants={tenants}
              value={selected}
              onChange={(id) => setSelected(id)}
            />
          </div>
        </div>
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className={shellCard}
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-white/8 to-blue-500/8" />
          <div className="relative mb-2 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">{t("inquiriesTitle")}</h3>
            <span className="text-xs text-muted-foreground">{t("inquiriesSub")}</span>
          </div>
          {renderChart(last6Inquiries, "#16a34a", t("inquiriesTitle"))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className={shellCard}
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/12 via-white/8 to-indigo-500/10" />
          <div className="relative mb-2 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">{t("trafficTitle")}</h3>
            <span className="text-xs text-muted-foreground">{t("trafficSub")}</span>
          </div>
          {renderChart(last6Traffic, "#2563eb", t("trafficTitle"))}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={shellCard}
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-white/8 to-blue-500/8" />
        <div className="relative mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{t("keywordsTitle")}</h3>
            <p className="text-xs text-muted-foreground">{t("keywordsSub")}</p>
          </div>
        </div>
        {skeletoning ? (
          <TableSkeleton />
        ) : error ? (
          <p className="text-sm text-amber-700">{error}</p>
        ) : keywords.length ? (
          <div className="relative overflow-hidden rounded-xl border border-white/50 bg-white/70 shadow-inner shadow-slate-900/5 dark:border-slate-800/60 dark:bg-slate-900/70">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/40 to-transparent dark:from-slate-900/50" />
            <div className="relative overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-muted-foreground">
                  <tr className="border-b border-white/60 dark:border-slate-800/60">
                    <th className="px-3 py-3 font-semibold">{t("table.keyword")}</th>
                    <th className="px-3 py-3 font-semibold">{t("table.target")}</th>
                    <th className="px-3 py-3 font-semibold">{t("table.rank")}</th>
                    <th className="px-3 py-3 font-semibold">{t("table.delta")}</th>
                  </tr>
                </thead>
                <tbody>
                  {keywords.map((kw) => {
                    const trend = kw.rankDelta ?? 0;
                    return (
                      <tr key={`${kw.keyword}-${kw.targetUrl || "none"}`} className="border-b border-white/50 last:border-0 dark:border-slate-800/60">
                        <td className="px-3 py-3 font-medium text-foreground">{kw.keyword}</td>
                        <td className="px-3 py-3 text-muted-foreground">{kw.targetUrl || "-"}</td>
                        <td className="px-3 py-3 font-semibold text-foreground">{kw.rank ?? "-"}</td>
                        <td className="px-3 py-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                              trend > 0
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200"
                                : trend < 0
                                ? "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-200"
                                : "bg-muted text-muted-foreground dark:bg-slate-800/80"
                            }`}
                          >
                            {trend > 0 ? (
                              <>
                                <ArrowUpRight className="h-3 w-3" /> {t("trend.up")}
                              </>
                            ) : trend < 0 ? (
                              <>
                                <ArrowDownRight className="h-3 w-3" /> {t("trend.down")}
                              </>
                            ) : (
                              <>
                                <Minus className="h-3 w-3" /> {t("trend.flat")}
                              </>
                            )}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t("noData")}</p>
        )}
      </motion.div>

      {error && hasLoaded && !skeletoning && (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
          {error}
        </div>
      )}
    </div>
  );
}

function ChartSkeleton() {
  return <div className="h-64 w-full animate-pulse rounded-xl bg-muted/60" />;
}

function TableSkeleton() {
  return (
    <div className="space-y-2">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-10 w-full animate-pulse rounded-md bg-muted/60" />
      ))}
    </div>
  );
}
