"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import dayGridPlugin from "@fullcalendar/daygrid";
import "@/styles/fullcalendar.css";
import { Button } from "@/components/button";
import { useTranslations } from "next-intl";

const FullCalendar = dynamic(() => import("@fullcalendar/react"), { ssr: false });

type Post = {
  id: string;
  tenantId: string;
  tenantName?: string | null;
  tenantSiteUrl?: string | null;
  title: string;
  excerpt?: string | null;
  slug?: string | null;
  publishDate: string | null;
  status: string | null;
  articleTitle?: string | null;
  articleExcerpt?: string | null;
  articleSlug?: string | null;
};

const statusLabel: Record<"ready" | "published", string> = {
  ready: "待发布",
  published: "已发布",
};

const normalizeStatus = (s: string | null | undefined): "ready" | "published" => {
  if (s === "published") return "published";
  return "ready";
};

export default function CalendarPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Post | null>(null);
  const [currentTitle, setCurrentTitle] = useState("");
  const fetchKeyRef = useRef<string>("");
  const t = useTranslations("dashboard.calendar");

  const loadPosts = async (start?: string, end?: string) => {
    const key = `${start || ""}-${end || ""}`;
    if (fetchKeyRef.current === key) return;
    fetchKeyRef.current = key;
    setLoading(true);
    try {
      const params = start && end ? `?start=${start}&end=${end}` : "";
      const res = await fetch(`/api/evo/posts${params}`);
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
          title: p.title || p.articleTitle || t("notFound"),
          date: p.publishDate!,
          backgroundColor:
            normalizeStatus(p.status) === "published"
              ? "#ECFDF3"
              : "#FEF3C7",
          borderColor:
            normalizeStatus(p.status) === "published"
              ? "#BBF7D0"
              : "#FDE68A",
          textColor:
            normalizeStatus(p.status) === "published"
              ? "#047857"
              : "#92400E",
          extendedProps: {
            id: p.id,
            tenantName: p.tenantName || t("notFound"),
            tenantSiteUrl: p.tenantSiteUrl || "",
            status: normalizeStatus(p.status),
            articleTitle: p.articleTitle,
          },
        })),
    [posts]
  );

  const fetchDetail = async (id: string | number) => {
    try {
      const res = await fetch(`/api/evo/posts/${id}`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setSelected({
        id: data.post?.id,
        tenantId: data.post?.tenantId,
        tenantName: data.post?.tenantName,
        tenantSiteUrl: data.post?.tenantSiteUrl,
        title: data.post?.title || data.article?.title || "未命名文章",
        excerpt: data.post?.summary || data.article?.excerpt,
        slug: data.article?.slug || data.post?.contentUrl,
        publishDate: data.post?.publishDate,
        status: data.post?.status,
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
            <h1 className="text-2xl font-semibold text-foreground">{t("title")}</h1>
            <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {t("published")} {publishedCount}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-amber-700">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              {t("ready")} {scheduledCount}
            </span>
            {/* <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-slate-600">
              <span className="h-2 w-2 rounded-full bg-slate-500" />
              暂停
            </span> */}
          </div>
        </div>
      </div>

      {loading && <div className="text-sm text-muted-foreground">{t("loading")}</div>}

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
            const { tenantName, tenantSiteUrl, status } = arg.event.extendedProps as {
              tenantName?: string;
              tenantSiteUrl?: string;
              status?: string | null;
            };
            const normalizedStatus = normalizeStatus(status);
            return {
              html: `
                <div style="font-size:12px;font-weight:600;line-height:1.3;color:${arg.event.textColor};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                  ${arg.event.title}
                </div>
                <div style="font-size:11px;color:#6b7280;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                  ${tenantName || ""} ${tenantSiteUrl ? "· " + tenantSiteUrl : ""}
                </div>
                <div style="font-size:11px;color:#6b7280;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${
                  normalizedStatus === "published" ? t("statusPublished") : t("statusReady")
                }</div>
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
                    {selected.tenantName || t("notFound")} {selected.tenantSiteUrl ? `· ${selected.tenantSiteUrl}` : ""}
                  </p>
                  <p>
                    {t("statusPublished")}：{selected.publishDate || t("notFound")}
                  </p>
                  <p>
                    {t("statusPublished")}：
                    {normalizeStatus(selected.status) === "published" ? t("statusPublished") : t("statusReady")}
                  </p>
                </div>
              </div>
              <Button
                variant="simple"
                className="h-9 min-w-[72px] shrink-0 rounded-full px-3 text-sm text-muted-foreground hover:bg-muted/50"
                onClick={() => setSelected(null)}
              >
                {t("close")}
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
                {t("viewFull")}
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
                if (!res.ok) throw new Error(await res.text());
                const data = await res.json();
                alert(
                  `Trigger publish: processed ${data.processed}, success ${data.published?.length || 0}, skipped ${data.skipped?.length || 0}, failed ${data.failed?.length || 0}`
                );
              } catch (err: any) {
                alert(`Trigger failed: ${err?.message || err}`);
              }
            }}
          >
            {t("viewFull")}
          </Button>
        </div>
      </div>
    </div>
  );
}
