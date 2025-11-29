"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import dayGridPlugin from "@fullcalendar/daygrid";
import "@/styles/fullcalendar.css";
import { Button } from "@/components/button";

const FullCalendar = dynamic(() => import("@fullcalendar/react"), { ssr: false });

type Post = {
  id: number | string;
  tenantId: string;
  tenantName?: string | null;
  tenantSiteUrl?: string | null;
  title: string;
  excerpt?: string | null;
  slug: string;
  publishDate: string | null;
  status: string | null;
};

const statusLabel: Record<"ready" | "published" | "draft", string> = {
  ready: "待发布",
  published: "已发布",
  draft: "暂停",
};

const normalizeStatus = (s: string | null | undefined): "ready" | "published" | "draft" => {
  if (s === "published") return "published";
  if (s === "draft") return "draft";
  return "ready";
};

export default function CalendarPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Post | null>(null);
  const [currentTitle, setCurrentTitle] = useState("");
  const fetchKeyRef = useRef<string>("");

  const loadPosts = async (start?: string, end?: string) => {
    const key = `${start || ""}-${end || ""}`;
    if (fetchKeyRef.current === key) return;
    fetchKeyRef.current = key;
    setLoading(true);
    try {
      const params = start && end ? `?start=${start}&end=${end}` : "";
      const res = await fetch(`/api/blog-posts${params}`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error("Failed to load posts", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const events = useMemo(
    () =>
      posts
        .filter((p) => p.publishDate)
        .map((p) => ({
          id: String(p.id),
          title: p.title,
          date: p.publishDate!,
          backgroundColor:
            normalizeStatus(p.status) === "published"
              ? "#ECFDF3"
              : normalizeStatus(p.status) === "draft"
              ? "#F3F4F6"
              : "#FEF3C7",
          borderColor:
            normalizeStatus(p.status) === "published"
              ? "#BBF7D0"
              : normalizeStatus(p.status) === "draft"
              ? "#E5E7EB"
              : "#FDE68A",
          textColor:
            normalizeStatus(p.status) === "published"
              ? "#047857"
              : normalizeStatus(p.status) === "draft"
              ? "#374151"
              : "#92400E",
          extendedProps: {
            id: p.id,
            tenantName: p.tenantName || "站点",
            tenantSiteUrl: p.tenantSiteUrl || "",
            status: normalizeStatus(p.status),
          },
        })),
    [posts]
  );

  const fetchDetail = async (id: string | number) => {
    try {
      const res = await fetch(`/api/blog-posts/${id}`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setSelected({
        id: data.id,
        tenantId: data.tenantId,
        tenantName: data.tenantName,
        tenantSiteUrl: data.tenantSiteUrl,
        title: data.title,
        excerpt: data.excerpt,
        slug: data.slug,
        publishDate: data.publishDate,
        status: data.status,
      });
    } catch (error) {
      console.error("Failed to load post detail", error);
    }
  };

  const publishedCount = posts.filter((p) => normalizeStatus(p.status) === "published").length;
  const scheduledCount = posts.filter((p) => normalizeStatus(p.status) === "ready").length;

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">内容日历</h1>
            <p className="text-sm text-muted-foreground">
              系统自动统计已发布/待发布文章，默认展示本月，可查看合作起始月至当前月的排期。
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              已发布 {publishedCount}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-amber-700">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              待发布 {scheduledCount}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-slate-600">
              <span className="h-2 w-2 rounded-full bg-slate-500" />
              暂停
            </span>
          </div>
        </div>
      </div>

      {loading && <div className="text-sm text-muted-foreground">加载中...</div>}

      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/60">
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev today next",
            center: "title",
            right: "",
          }}
          titleFormat={{ year: "numeric", month: "long" }}
          locale="zh-cn"
          events={events}
          eventClick={(info) => {
            const id = (info.event.extendedProps as any).id;
            if (id) fetchDetail(id);
          }}
          eventContent={(arg) => {
            const { tenantName, tenantSiteUrl, status } = arg.event.extendedProps as any;
            return {
              html: `
                <div style="font-size:12px;font-weight:600;line-height:1.3;color:${arg.event.textColor};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                  ${arg.event.title}
                </div>
                <div style="font-size:11px;color:#6b7280;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                  ${tenantName || "站点"} ${tenantSiteUrl ? "· " + tenantSiteUrl : ""}
                </div>
                <div style="font-size:11px;color:#6b7280;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${statusLabel[status as any]}</div>
              `,
            };
          }}
          datesSet={(info) => {
            const start = info.startStr.slice(0, 10);
            const end = info.endStr.slice(0, 10);
            setCurrentTitle(info.view.title);
            loadPosts(start, end);
          }}
          height="auto"
          dayMaxEvents={3}
          fixedWeekCount={false}
        />
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-background p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold leading-7 text-foreground">{selected.title}</h3>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p className="font-medium text-foreground">
                    {selected.tenantName || "站点"} {selected.tenantSiteUrl ? `· ${selected.tenantSiteUrl}` : ""}
                  </p>
                  <p>发布日期：{selected.publishDate || "未设置"}</p>
                  <p>发布状态：{statusLabel[normalizeStatus(selected.status)]}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                className="h-9 min-w-[72px] shrink-0 rounded-full px-3 text-sm text-muted-foreground hover:bg-muted/50"
                onClick={() => setSelected(null)}
              >
                关闭
              </Button>
            </div>

            {selected.excerpt && (
              <p className="mt-4 rounded-lg bg-muted/50 px-3 py-2 text-sm leading-6 text-foreground">{selected.excerpt}</p>
            )}

            <div className="mt-6">
              <Button
                variant="primary"
                className="px-5"
                onClick={() => window.open(`/dashboard/calendar/${selected.id}`, "_self")}
              >
                查看全文
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-dashed border-border/60 bg-card/40 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">手动触发发布（模拟定时任务）</p>
            <p className="text-xs text-muted-foreground">调用 /api/cron/publish 立即处理当天待发布的文章。</p>
          </div>
          <Button
            variant="primary"
            onClick={async () => {
              try {
                const res = await fetch("/api/cron/publish", { method: "POST" });
                console.log('/api/cron/publish - res', res)
                if (!res.ok) throw new Error(await res.text());
                const data = await res.json();
                alert(`已触发发布：已处理 ${data.processed} 篇，成功 ${data.published?.length || 0}，跳过 ${data.skipped?.length || 0}，失败 ${data.failed?.length || 0}`);
              } catch (err: any) {
                alert(`触发失败：${err?.message || err}`);
              }
            }}
          >
            立即发布今日文章
          </Button>
        </div>
      </div>
    </div>
  );
}
