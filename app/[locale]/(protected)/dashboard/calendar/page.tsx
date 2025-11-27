"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/button";

type Post = {
  id: string;
  title: string;
  summary: string | null;
  contentUrl: string;
  publishDate: string;
  status: "scheduled" | "published" | "paused";
};

type Upload = {
  id: string;
  previewUrl: string | null;
  storageUrl: string;
};

type PostDetail = {
  post: Post;
  uploads: Upload[];
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function getWeekday(year: number, month: number, day: number) {
  return new Date(year, month - 1, day).getDay(); // 0 Sunday
}

export default function CalendarPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1); // 1-12
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<PostDetail | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadPosts = async (y: number, m: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/evo/posts?year=${y}&month=${m}`);
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
    loadPosts(year, month);
  }, [year, month]);

  const groupedByDay = useMemo(() => {
    const map: Record<string, Post[]> = {};
    posts.forEach((p) => {
      map[p.publishDate] = map[p.publishDate] ? [...map[p.publishDate], p] : [p];
    });
    return map;
  }, [posts]);

  const days = getDaysInMonth(year, month);
  const firstWeekday = getWeekday(year, month, 1);
  const weeks: Array<Array<{ day: number | null; dateKey: string | null }>> = [];
  let currentWeek: Array<{ day: number | null; dateKey: string | null }> = [];

  for (let i = 0; i < firstWeekday; i++) {
    currentWeek.push({ day: null, dateKey: null });
  }
  for (let d = 1; d <= days; d++) {
    const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    currentWeek.push({ day: d, dateKey });
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length) {
    while (currentWeek.length < 7) {
      currentWeek.push({ day: null, dateKey: null });
    }
    weeks.push(currentWeek);
  }

  const fetchDetail = async (postId: string) => {
    try {
      const res = await fetch(`/api/evo/posts/${postId}`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setSelected(data as PostDetail);
    } catch (error) {
      console.error("Failed to load post detail", error);
    }
  };

  const patchStatus = async (postId: string, status: Post["status"]) => {
    try {
      const res = await fetch(`/api/evo/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error(await res.text());
      setActionMessage(status === "paused" ? "已暂停当日推送" : "已标记为已发布");
      await loadPosts(year, month);
      const refreshed = await fetch(`/api/evo/posts/${postId}`);
      if (refreshed.ok) setSelected(await refreshed.json());
    } catch (error) {
      console.error("Failed to update status", error);
      setActionMessage("操作失败，请稍后重试");
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">内容日历</h1>
          <p className="text-sm text-muted-foreground">按月查看排期，点击日期查看详情与暂停推送。</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setMonth((m) => (m === 1 ? 12 : m - 1))}>
            上一月
          </Button>
          <Button variant="outline" onClick={() => setMonth((m) => (m === 12 ? 1 : m + 1))}>
            下一月
          </Button>
          <input
            type="number"
            className="w-24 rounded-md border border-border bg-background px-2 py-1 text-sm"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          />
        </div>
      </div>

      {loading && <div className="text-sm text-muted-foreground">加载中...</div>}

      <div className="overflow-x-auto rounded-lg border border-border/60 bg-card/40">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/60 text-muted-foreground">
            <tr>
              {["日", "一", "二", "三", "四", "五", "六"].map((d) => (
                <th key={d} className="px-3 py-2 text-left font-medium">
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, idx) => (
              <tr key={idx} className="align-top">
                {week.map((cell, i) => (
                  <td key={i} className="h-32 min-w-[140px] border-t border-border/40 px-2 py-2 align-top">
                    {cell.day && (
                      <div className="mb-1 text-xs font-semibold text-muted-foreground">{cell.day}</div>
                    )}
                    {cell.dateKey &&
                      (groupedByDay[cell.dateKey] || []).map((p) => (
                        <button
                          key={p.id}
                          onClick={() => fetchDetail(p.id)}
                          className="mb-1 flex w-full flex-col rounded-md border border-border/70 bg-background/60 px-2 py-1 text-left text-xs hover:border-primary/40"
                        >
                          <span className="font-semibold text-foreground">{p.title}</span>
                          <span className="text-[11px] text-muted-foreground">
                            状态：{p.status === "scheduled" ? "待发布" : p.status === "published" ? "已发布" : "已暂停"}
                          </span>
                        </button>
                      ))}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-background p-6 shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-foreground">{selected.post.title}</h3>
                <p className="text-sm text-muted-foreground">发布日期：{selected.post.publishDate}</p>
              </div>
              <Button variant="ghost" onClick={() => setSelected(null)}>
                关闭
              </Button>
            </div>

            <div className="mt-4 space-y-2 text-sm text-foreground">
              {selected.post.summary && <p>{selected.post.summary}</p>}
              <p>状态：{selected.post.status === "scheduled" ? "待发布" : selected.post.status === "published" ? "已发布" : "已暂停"}</p>
              <a
                className="text-primary hover:underline"
                href={selected.post.contentUrl}
                target="_blank"
                rel="noreferrer"
              >
                原文链接
              </a>
              {selected.uploads?.length ? (
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">上传内容预览</p>
                  {selected.uploads.map((u) => (
                    <a
                      key={u.id}
                      className="text-primary hover:underline text-sm"
                      href={u.previewUrl || u.storageUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {u.previewUrl || u.storageUrl}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => patchStatus(selected.post.id, "paused")}>
                暂停当日推送
              </Button>
              <Button variant="primary" onClick={() => patchStatus(selected.post.id, "published")}>
                标记为已发布
              </Button>
              <Button variant="outline" onClick={() => window.open(selected.post.contentUrl, "_blank")}>
                查看全文
              </Button>
            </div>

            {actionMessage && (
              <div className="mt-3 rounded-md border border-border/60 bg-muted/50 px-3 py-2 text-sm text-foreground">
                {actionMessage}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
