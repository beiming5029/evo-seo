"use client";

import { useEffect, useState } from "react";

type InquiryStat = { period: string; count: number };
type TrafficStat = { period: string; clicks: number; impressions: number; ctr: string; position: string };
type KeywordRanking = { keyword: string; targetUrl: string | null; rank: number | null; rankDelta: number | null };

export default function AnalyticsPage() {
  const [inquiries, setInquiries] = useState<InquiryStat[]>([]);
  const [traffic, setTraffic] = useState<TrafficStat[]>([]);
  const [keywords, setKeywords] = useState<KeywordRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/evo/kpi/overview");
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setInquiries(data.inquiries || []);
        setTraffic(data.traffic || []);
        setKeywords(data.keywords || []);
        setError(null);
      } catch (err: any) {
        setError("加载失败，请稍后重试");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">效果看板</h1>
        <p className="text-sm text-muted-foreground">
          询盘趋势（近6-12个月）、自然流量、核心关键词 Top10。
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border/60 bg-card/50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">询盘趋势</h3>
            <span className="text-xs text-muted-foreground">近 12 期</span>
          </div>
          {loading ? (
            <p className="text-sm text-muted-foreground">加载中...</p>
          ) : (
            <div className="space-y-2">
              {inquiries.map((item) => (
                <div key={item.period} className="flex items-center justify-between rounded-md bg-background/60 px-3 py-2 text-sm">
                  <span>{item.period}</span>
                  <span className="font-semibold">{item.count}</span>
                </div>
              ))}
              {!inquiries.length && <p className="text-sm text-muted-foreground">暂无数据</p>}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border/60 bg-card/50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">自然流量趋势（GSC）</h3>
            <span className="text-xs text-muted-foreground">近 12 期</span>
          </div>
          {loading ? (
            <p className="text-sm text-muted-foreground">加载中...</p>
          ) : (
            <div className="space-y-2">
              {traffic.map((item) => (
                <div key={item.period} className="flex items-center justify-between rounded-md bg-background/60 px-3 py-2 text-sm">
                  <span>{item.period}</span>
                  <span className="text-muted-foreground">点击 {item.clicks} / 展现 {item.impressions}</span>
                  <span className="text-xs text-muted-foreground">
                    CTR {item.ctr ?? "-"} | 排名 {item.position ?? "-"}
                  </span>
                </div>
              ))}
              {!traffic.length && <p className="text-sm text-muted-foreground">暂无数据</p>}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border/60 bg-card/50 p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">核心关键词排名 Top10</h3>
          <span className="text-xs text-muted-foreground">展示关键词、目标网址、排名和变化</span>
        </div>
        {loading ? (
          <p className="text-sm text-muted-foreground">加载中...</p>
        ) : keywords.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-muted-foreground">
                <tr>
                  <th className="px-2 py-2">关键词</th>
                  <th className="px-2 py-2">目标网址</th>
                  <th className="px-2 py-2">排名</th>
                  <th className="px-2 py-2">变化</th>
                </tr>
              </thead>
              <tbody>
                {keywords.map((kw) => (
                  <tr key={kw.keyword} className="border-t border-border/40">
                    <td className="px-2 py-2">{kw.keyword}</td>
                    <td className="px-2 py-2">
                      {kw.targetUrl ? (
                        <a href={kw.targetUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                          {kw.targetUrl}
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-2 py-2">{kw.rank ?? "-"}</td>
                    <td className="px-2 py-2">{kw.rankDelta ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">暂无关键词数据</p>
        )}
      </div>
    </div>
  );
}
