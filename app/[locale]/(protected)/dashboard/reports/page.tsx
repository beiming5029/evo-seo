"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/button";

type Report = {
  id: string;
  title: string;
  type: string;
  periodStart: string;
  periodEnd: string;
  fileUrl: string;
  createdAt: string;
};

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/evo/reports");
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setReports(data.reports || []);
      setError(null);
    } catch (err: any) {
      setError("加载失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpload = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const file = formData.get("file");
    if (!(file instanceof File)) {
      setError("请选择文件");
      return;
    }
    try {
      setUploading(true);
      setError(null);
      const res = await fetch("/api/evo/reports", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error(await res.text());
      form.reset();
      await load();
    } catch (err: any) {
      setError("上传失败，请确认大小不超过 10MB");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">服务报告</h1>
        <p className="text-sm text-muted-foreground">
          展示策略诊断报告和双月复盘报告，管理员可上传 PDF，时间倒序显示。
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-border/60 bg-card/50 p-4">
        <h3 className="text-lg font-semibold text-foreground">上传报告（管理员）</h3>
        <form className="mt-3 grid gap-3 md:grid-cols-2" onSubmit={handleUpload}>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-muted-foreground">标题</label>
            <input name="title" required className="rounded-md border border-border bg-background px-3 py-2 text-sm" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-muted-foreground">类型</label>
            <select name="type" className="rounded-md border border-border bg-background px-3 py-2 text-sm">
              <option value="diagnosis">策略诊断</option>
              <option value="review">双月复盘</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-muted-foreground">开始日期</label>
            <input type="date" name="periodStart" required className="rounded-md border border-border bg-background px-3 py-2 text-sm" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-muted-foreground">结束日期</label>
            <input type="date" name="periodEnd" required className="rounded-md border border-border bg-background px-3 py-2 text-sm" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-muted-foreground">上传 PDF（≤10MB）</label>
            <input type="file" name="file" accept=".pdf" required />
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={uploading}>
              {uploading ? "上传中…" : "上传并保存"}
            </Button>
          </div>
        </form>
        <p className="mt-2 text-xs text-muted-foreground">仅管理员可上传，其他用户可下载查看。</p>
      </div>

      <div className="rounded-xl border border-border/60 bg-card/50 p-4">
        <h3 className="text-lg font-semibold text-foreground">报告列表</h3>
        {loading ? (
          <p className="text-sm text-muted-foreground">加载中...</p>
        ) : reports.length ? (
          <div className="mt-3 space-y-2">
            {reports.map((r) => (
              <div
                key={r.id}
                className="flex flex-col gap-1 rounded-md border border-border/40 bg-background/60 px-3 py-2 text-sm md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-semibold text-foreground">{r.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.type} | {r.periodStart} - {r.periodEnd}
                  </p>
                </div>
                <a
                  href={r.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline"
                >
                  下载
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">暂无报告</p>
        )}
      </div>
    </div>
  );
}
