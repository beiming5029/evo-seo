"use client";

import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import dayGridPlugin from "@fullcalendar/daygrid";
import "@/styles/fullcalendar.css";
import { Button } from "@/components/button";
import { useTranslations } from "next-intl";
import { LoadingIndicator } from "@/components/loading-indicator";
import { CalendarClock, CheckCircle2, Clock3, ExternalLink, Loader2, Sparkles, X } from "lucide-react";

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

const normalizeStatus = (s: string | null | undefined): "ready" | "published" => {
  if (s === "published") return "published";
  return "ready";
};

export default function CalendarPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Post | null>(null);
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
    [posts, t]
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
        title: data.post?.title || data.article?.title || t("notFound"),
        excerpt: data.post?.summary || data.article?.excerpt,
        slug: data.article?.slug || data.post?.slug,
        publishDate: data.post?.publishDate,
        status: data.post?.status,
      });
    } catch (error) {
      console.error("Failed to load post detail", error);
    }
  };

  const publishedCount = posts.filter((p) => normalizeStatus(p.status) === "published").length;
  const scheduledCount = posts.filter((p) => normalizeStatus(p.status) === "ready").length;

  const statusLegend = [
    {
      label: t("published"),
      count: publishedCount,
      icon: CheckCircle2,
      className:
        "bg-emerald-50/80 text-emerald-700 ring-1 ring-emerald-200/70 dark:bg-emerald-500/10 dark:text-emerald-200 dark:ring-emerald-500/30",
    },
    {
      label: t("ready"),
      count: scheduledCount,
      icon: Clock3,
      className:
        "bg-amber-50/80 text-amber-700 ring-1 ring-amber-200/70 dark:bg-amber-500/10 dark:text-amber-200 dark:ring-amber-500/30",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50/50 px-4 py-6 text-foreground dark:bg-black md:px-6 lg:px-8">
      <div className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-blue-500/15 blur-[120px] dark:opacity-0" />
      <div className="pointer-events-none absolute bottom-[-8%] right-[-6%] h-72 w-72 rounded-full bg-indigo-500/18 blur-[130px] dark:opacity-0" />
      <div className="pointer-events-none absolute inset-0 bg-[url('/noise.webp')] opacity-[0.04] dark:opacity-0" />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative mb-4 overflow-hidden rounded-3xl border border-white/60 bg-white/70 p-6 shadow-xl shadow-slate-900/10 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-900/70 dark:shadow-black/30"
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/10 via-white/10 to-indigo-500/10 opacity-80 dark:from-blue-500/12 dark:via-slate-900/30 dark:to-indigo-500/12" />
        <div className="pointer-events-none absolute -left-16 top-6 h-24 w-24 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-2 right-6 h-20 w-20 rounded-full bg-indigo-500/20 blur-2xl" />

        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700 ring-1 ring-white/60 backdrop-blur-sm dark:bg-blue-900/40 dark:text-blue-200 dark:ring-white/10">
              <CalendarClock className="h-4 w-4" />
              Content Rhythm
            </div>
            <div>
              <h1 className="text-3xl font-bold leading-tight text-slate-900 dark:text-white md:text-4xl">
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {t("title")}
                </span>
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                {t("subtitle")}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {statusLegend.map((item) => (
              <span
                key={item.label}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold ${item.className}`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
                <span className="rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-bold text-slate-700 shadow-sm ring-1 ring-white/70 dark:bg-white/10 dark:text-white dark:ring-white/10">
                  {item.count}
                </span>
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/70 shadow-2xl shadow-slate-900/10 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-900/70 dark:shadow-black/40"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/20" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-blue-50/40 via-white/10 to-transparent dark:from-slate-900/60 dark:via-slate-900/30" />
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-xl dark:bg-slate-900/60"
          >
            <div className="relative flex items-center gap-3 rounded-2xl border border-white/70 bg-white/90 px-5 py-4 shadow-2xl shadow-slate-900/20 ring-1 ring-blue-500/15 dark:border-slate-800/70 dark:bg-slate-900/85 dark:shadow-black/50 dark:ring-blue-400/20">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700 shadow-inner shadow-blue-200/60 dark:bg-blue-500/15 dark:text-blue-100">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
              <p className="text-sm font-semibold text-foreground">{t("loading")}</p>
            </div>
          </motion.div>
        )}
        <div className="relative">
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
                  <div style="font-size:12px;font-weight:700;line-height:1.3;color:${arg.event.textColor};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                    ${arg.event.title}
                  </div>
                  <div style="font-size:11px;color:#6b7280;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                    ${tenantName || ""} ${tenantSiteUrl ? " \u00b7 " + tenantSiteUrl : ""}
                  </div>
                  <div style="font-size:11px;color:#94a3b8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${
                    normalizedStatus === "published" ? t("statusPublished") : t("statusReady")
                  }</div>
                `,
              };
            }}
            datesSet={(info) => {
              const start = info.startStr.slice(0, 10);
              const end = info.endStr.slice(0, 10);
              loadPosts(start, end);
            }}
            height="auto"
            dayMaxEvents={3}
            fixedWeekCount={false}
          />
        </div>
      </motion.div>

      {selected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/30 bg-white/90 p-6 shadow-2xl shadow-slate-900/30 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/85 dark:shadow-black/50"
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/10 via-white/5 to-indigo-500/10 dark:from-blue-500/14 dark:via-slate-900/30 dark:to-indigo-500/12" />
            <div className="relative z-10">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 rounded-full bg-blue-100/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700 ring-1 ring-white/70 dark:bg-blue-900/40 dark:text-blue-200 dark:ring-white/10">
                    <Sparkles className="h-4 w-4" />
                    {normalizeStatus(selected.status) === "published" ? t("statusPublished") : t("statusReady")}
                  </div>
                  <h3 className="text-xl font-semibold leading-7 text-slate-900 dark:text-white">{selected.title}</h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">
                      {selected.tenantName || t("notFound")}{" "}
                      {selected.tenantSiteUrl ? `· ${selected.tenantSiteUrl}` : ""}
                    </p>
                    <p>
                      {t("publishDate")}: {selected.publishDate || t("notFound")}
                    </p>
                    <p>
                      {t("publishStatus")}{" "}
                      {normalizeStatus(selected.status) === "published" ? t("statusPublished") : t("statusReady")}
                    </p>
                  </div>
                </div>
                <Button
                  variant="simple"
                  className="h-9 min-w-[72px] shrink-0 rounded-full px-3 text-sm text-muted-foreground hover:bg-slate-100/70 dark:hover:bg-slate-800/80"
                  onClick={() => setSelected(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {selected.excerpt && (
                <p className="mt-4 rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-sm leading-6 text-foreground shadow-sm dark:border-slate-800/70 dark:bg-slate-900/70">
                  {selected.excerpt}
                </p>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-3">
                {/* _self */}
                <Button
                  variant="primary"
                  className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-600/35"
                  onClick={() => window.open(`/dashboard/calendar/${selected.id}`, "_blank")}
                >
                  {t("viewFull")}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
                {/* {selected.tenantSiteUrl ? (
                  <Button
                    variant="outline"
                    className="rounded-full border border-slate-200/70 bg-white/60 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:border-blue-500/40"
                    onClick={() => window.open(selected.tenantSiteUrl!, "_blank")}
                  >
                    {selected.tenantSiteUrl}
                  </Button>
                ) : null} */}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
