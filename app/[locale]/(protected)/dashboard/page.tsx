"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/button";
import { TenantSwitcher } from "@/components/tenant-switcher";
import { CalendarRange, FileText, MessageCircle, TrendingUp } from "lucide-react";

type OverviewResponse = {
  siteCount: number;
  currentMonthInquiries: number;
  currentMonthArticles: number;
  latestReport: { id: string; title: string; date?: string; fileUrl: string } | null;
};

export default function DashboardPage() {
  const [tenantId, setTenantId] = useState("");
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  const cardClass =
    "group relative flex h-56 flex-col justify-between rounded-xl border border-border bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md";

  useEffect(() => {
    if (!tenantId) return;
    const load = async () => {
      try {
        setLoading(true);
        const qs = tenantId ? `?tenantId=${tenantId}` : "";
        const res = await fetch(`/api/evo/dashboard/overview${qs}`);
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
  }, [tenantId]);

  const siteCountText = useMemo(() => {
    const count = overview?.siteCount ?? 1;
    return `当前有 ${count} 个站点正在持续获客`;
  }, [overview]);

  const latestReportDate = overview?.latestReport?.date
    ? new Date(overview.latestReport.date).toISOString().slice(0, 10)
    : null;

  const handleCopyWechat = async () => {
    try {
      await navigator.clipboard.writeText("lsiy_lee");
      setCopyMessage("已复制微信号");
    } catch (error) {
      setCopyMessage("复制失败，请手动添加微信：lsiy_lee");
    } finally {
      setTimeout(() => setCopyMessage(null), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6 text-foreground md:p-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold md:text-4xl">Dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            欢迎回来，查看您的流量增长大盘。{siteCountText}
          </p>
        </div>
        <div className="w-72">
          <TenantSwitcher value={tenantId} onChange={setTenantId} />
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
              <p className="text-lg font-semibold">本月新增询盘</p>
              <p className="mt-1 text-sm text-muted-foreground">总览当月询盘表现</p>
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
              <p className="text-lg font-semibold">文章日历（本月）</p>
              <p className="mt-1 text-sm text-muted-foreground">排期与发布数量</p>
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
            <p className="text-lg font-semibold">最新服务报告</p>
            <FileText className="h-5 w-5 text-muted-foreground" />
          </div>
          {overview?.latestReport ? (
            <div className="rounded-lg border border-border/70 bg-muted/30 p-4 text-sm">
              <p className="font-semibold text-foreground">{overview.latestReport.title}</p>
              {latestReportDate && <p className="mt-1 text-muted-foreground">{latestReportDate}</p>}
              <span className="mt-2 inline-flex text-primary">点击卡片查看全部报告</span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">暂无报告</p>
          )}
        </Link>

        <div className={cardClass}>
          <div className="flex items-start justify-between">
            <p className="text-lg font-semibold">24/7 专家客服</p>
            <MessageCircle className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            遇到问题？我们的 SEO 专家团队随时为您提供服务。微信号：lsiy_lee
          </p>
          <Button
            className="mt-6 w-full justify-center rounded-full bg-foreground text-background hover:bg-foreground/90"
            onClick={handleCopyWechat}
          >
            复制微信号并添加
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
