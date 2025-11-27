"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { Button } from "@/components/button";
import { TrendingUp, CalendarRange, FileText, MessageCircle } from "lucide-react";

type InquiryStat = { period: string; count: number };
type KpiSnapshot = { type: string; valueNumeric: string; deltaNumeric: string };
type OverviewResponse = {
  inquiries: InquiryStat[];
  kpis: KpiSnapshot[];
};
type Post = { id: string; status: string; publishDate: string };
type Report = { id: string; title: string; fileUrl: string; createdAt?: string; periodEnd?: string };

export default function DashboardPage() {
  const locale = useLocale();
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [kpiRes, postRes, reportRes] = await Promise.all([
          fetch("/api/evo/kpi/overview"),
          fetch("/api/evo/posts"),
          fetch("/api/evo/reports"),
        ]);
        if (kpiRes.ok) setOverview(await kpiRes.json());
        if (postRes.ok) setPosts((await postRes.json()).posts || []);
        if (reportRes.ok) setReports((await reportRes.json()).reports || []);
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

  const inquiryTotal = overview?.inquiries?.[0]?.count ?? 0;
  const inquiryDelta = useMemo(() => {
    const delta = overview?.kpis?.find((k) => k.type === "inquiries")?.deltaNumeric;
    if (!delta) return "—";
    const num = Number(delta);
    if (Number.isNaN(num)) return "—";
    return num >= 0 ? `比上月增长 ${num}%` : `比上月下降 ${Math.abs(num)}%`;
  }, [overview]);

  const publishedCount = posts.filter((p) => p.status === "published").length;
  const scheduledCount = posts.filter((p) => p.status === "scheduled").length;
  const latestReport = reports[0];
  const latestReportDate = latestReport?.periodEnd || latestReport?.createdAt;

  const cardClass = "rounded-xl border border-border bg-white p-6 shadow-sm h-56 flex flex-col justify-between";

  return (
    <div className="p-6 md:p-8 bg-white min-h-screen text-foreground">
      <div className="mb-4">
        <h1 className="text-3xl md:text-4xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">欢迎回来，查看您的 SEO 服务概况</p>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className={cardClass}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-lg font-semibold">本月新增询盘</p>
              <p className="text-sm text-muted-foreground mt-1">{inquiryDelta}</p>
            </div>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="text-5xl font-bold">{loading ? "—" : inquiryTotal}</div>
        </div>

        <div className={cardClass}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-lg font-semibold">文章日历（本月）</p>
              <p className="text-sm text-muted-foreground mt-1">发布进度</p>
            </div>
            <CalendarRange className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-10 text-3xl font-bold">
            <div className="flex flex-col">
              <span>{loading ? "—" : publishedCount}</span>
              <span className="text-xs text-muted-foreground mt-1">已发布文章</span>
            </div>
            <div className="flex flex-col">
              <span>{loading ? "—" : scheduledCount}</span>
              <span className="text-xs text-muted-foreground mt-1">待发布文章</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 mt-4">
        <div className={cardClass}>
          <div className="flex items-start justify-between">
            <p className="text-lg font-semibold">最新服务报告</p>
            <FileText className="h-5 w-5 text-muted-foreground" />
          </div>
          {latestReport ? (
            <div className="rounded-md border border-border/60 bg-muted/30 p-4 text-sm">
              <p className="font-semibold">{latestReport.title}</p>
              {latestReportDate && (
                <p className="text-muted-foreground mt-1">
                  {new Date(latestReportDate).toISOString().slice(0, 10)}
                </p>
              )}
              <Link
                href={latestReport.fileUrl}
                target="_blank"
                className="mt-2 inline-flex text-primary hover:underline"
              >
                下载报告
              </Link>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">暂无报告</p>
          )}
        </div>

        <div className={cardClass}>
          <div className="flex items-start justify-between">
            <p className="text-lg font-semibold">24/7 专家客服</p>
            <MessageCircle className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            遇到问题？我们的 SEO 专家团队随时为您提供帮助
          </p>
          <Button className="mt-6 w-full justify-center rounded-full bg-foreground text-background hover:bg-foreground/90">
            开始在线咨询
          </Button>
        </div>
      </div>

    </div>
  );
}
