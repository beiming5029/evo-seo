"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
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

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("subtitle")}
            {latestDate ? ` · ${latestDate}` : ""}
          </p>
        </div>
        <div className="w-72">
          <TenantSwitcher
            tenants={tenants}
            value={selected}
            onChange={(id) => setSelected(id)}
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border/60 bg-card/50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">{t("inquiriesTitle")}</h3>
            <span className="text-xs text-muted-foreground">{t("inquiriesSub")}</span>
          </div>
          {renderChart(last6Inquiries, "#16a34a", t("inquiriesTitle"))}
        </div>

        <div className="rounded-xl border border-border/60 bg-card/50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">{t("trafficTitle")}</h3>
            <span className="text-xs text-muted-foreground">{t("trafficSub")}</span>
          </div>
          {renderChart(last6Traffic, "#2563eb", t("trafficTitle"))}
        </div>
      </div>

      <div className="rounded-xl border border-border/60 bg-card/50 p-4">
        <div className="mb-2 flex items-center justify-between">
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
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-muted-foreground">
                <tr>
                  <th className="px-2 py-2">{t("table.keyword")}</th>
                  <th className="px-2 py-2">{t("table.target")}</th>
                  <th className="px-2 py-2">{t("table.rank")}</th>
                  <th className="px-2 py-2">{t("table.delta")}</th>
                </tr>
              </thead>
              <tbody>
                {keywords.map((kw) => {
                  const trend = kw.rankDelta ?? 0;
                  return (
                    <tr key={`${kw.keyword}-${kw.targetUrl || "none"}`} className="border-t border-border/40">
                      <td className="px-2 py-2">{kw.keyword}</td>
                      <td className="px-2 py-2 text-muted-foreground">{kw.targetUrl || "-"}</td>
                      <td className="px-2 py-2 font-semibold text-foreground">{kw.rank ?? "-"}</td>
                      <td className="px-2 py-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${
                            trend > 0
                              ? "bg-emerald-50 text-emerald-700"
                              : trend < 0
                              ? "bg-rose-50 text-rose-700"
                              : "bg-muted text-muted-foreground"
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
        ) : (
          <p className="text-sm text-muted-foreground">{t("noData")}</p>
        )}
      </div>

      {error && hasLoaded && !skeletoning && (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-700">
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
