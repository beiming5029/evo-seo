"use client";

import { useEffect, useMemo, useState } from "react";
import { TenantSwitcher } from "@/components/tenant-switcher";
import { useTranslations } from "next-intl";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type InquiryStat = { period: string; count: number };
type TrafficStat = { period: string; clicks: number; impressions: number; ctr: string; position: string };
type KeywordRanking = { keyword: string; targetUrl: string | null; rank: number | null; rankDelta: number | null };

export default function AnalyticsPage() {
  const t = useTranslations("dashboard.analytics");
  const [tenantId, setTenantId] = useState("");
  const [inquiries, setInquiries] = useState<InquiryStat[]>([]);
  const [traffic, setTraffic] = useState<TrafficStat[]>([]);
  const [keywords, setKeywords] = useState<KeywordRanking[]>([]);
  const [latestDate, setLatestDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tenantId) return;
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/evo/kpi/overview?tenantId=${tenantId}`);
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setInquiries(data.inquiries || []);
        setTraffic(data.traffic || []);
        setKeywords(data.keywords || []);
        const dates: string[] = [];
        data.inquiries?.forEach((i: InquiryStat) => i.period && dates.push(i.period));
        data.traffic?.forEach((t: TrafficStat) => t.period && dates.push(t.period));
        setLatestDate(dates.length ? dates.sort().at(-1) || null : null);
        setError(null);
      } catch (err) {
        setError(t("error"));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [tenantId, t]);

  const last6Inquiries = useMemo(
    () => inquiries.map((i) => ({ period: i.period, value: Number(i.count) || 0 })).slice(-6),
    [inquiries]
  );
  const last6Traffic = useMemo(
    () => traffic.map((t) => ({ period: t.period, value: Number(t.clicks) || 0 })).slice(-6),
    [traffic]
  );

  const renderChart = (data: { period: string; value: number }[], color: string, label: string) => {
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
          <TenantSwitcher value={tenantId} onChange={setTenantId} />
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border/60 bg-card/50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">{t("inquiriesTitle")}</h3>
            <span className="text-xs text-muted-foreground">{t("inquiriesSub")}</span>
          </div>
          {loading ? (
            <p className="text-sm text-muted-foreground">{t("loading")}</p>
          ) : (
            renderChart(last6Inquiries, "#16a34a", t("inquiriesTitle"))
          )}
        </div>

        <div className="rounded-xl border border-border/60 bg-card/50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">{t("trafficTitle")}</h3>
            <span className="text-xs text-muted-foreground">{t("trafficSub")}</span>
          </div>
          {loading ? (
            <p className="text-sm text-muted-foreground">{t("loading")}</p>
          ) : (
            renderChart(last6Traffic, "#2563eb", t("trafficTitle"))
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border/60 bg-card/50 p-4">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{t("keywordsTitle")}</h3>
            <p className="text-xs text-muted-foreground">{t("keywordsSub")}</p>
          </div>
        </div>
        {loading ? (
          <p className="text-sm text-muted-foreground">{t("loading")}</p>
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
                    <tr key={kw.keyword} className="border-t border-border/40">
                      <td className="px-2 py-2">{kw.keyword}</td>
                      <td className="px-2 py-2">
                        {kw.targetUrl ? (
                          <a
                            href={kw.targetUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary hover:underline"
                          >
                            {kw.targetUrl}
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
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
    </div>
  );
}
