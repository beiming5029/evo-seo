"use client";

import { FormEvent, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/button";
import { notify } from "@/lib/notify";
import { LoadingIndicator } from "@/components/loading-indicator";

type Job = {
  id: string;
  type: string;
  status: string;
  createdAt: string;
  summary: string | null;
};

export default function ImportPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/evo/import");
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setJobs(data.jobs || []);
      setMessage(null);
    } catch (error) {
      setMessage("加载失败");
      notify.error("加载失败");
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
      setMessage("请选择文件");
      notify.error("请选择文件");
      return;
    }
    try {
      setUploading(true);
      const res = await fetch("/api/evo/import", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error(await res.text());
      setMessage("导入任务已创建（pending），稍后处理");
      notify.success("导入任务已创建");
      form.reset();
      await load();
    } catch (error) {
      setMessage("上传失败，请确认文件 ≤10MB");
      notify.error("上传失败，请确认文件 ≤10MB");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">数据导入</h1>
        <p className="text-sm text-muted-foreground">
          支持手动导入询盘/流量/关键词/KPI 的 CSV 或 JSON，创建导入任务后可在下方查看状态。
        </p>
      </div>

      {message && (
        <div className="rounded-md border border-border/50 bg-muted/40 p-3 text-sm text-foreground">{message}</div>
      )}

      <div className="rounded-xl border border-border/60 bg-card/50 p-4">
        <h3 className="text-lg font-semibold text-foreground">上传文件（管理员）</h3>
        <form className="mt-3 grid gap-4 md:grid-cols-2" onSubmit={handleUpload}>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-muted-foreground">类型</label>
            <select name="type" className="rounded-md border border-border bg-background px-3 py-2 text-sm">
              <option value="inquiries">询盘</option>
              <option value="traffic">自然流量</option>
              <option value="keywords">关键词</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-muted-foreground">文件（CSV/JSON，≤10MB）</label>
            <input type="file" name="file" accept=".csv,.json" required />
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={uploading}>
              {uploading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  上传中...
                </span>
              ) : (
                "上传并创建任务"
              )}
            </Button>
          </div>
        </form>
      </div>

      <div className="rounded-xl border border-border/60 bg-card/50 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">导入任务</h3>
          <Button size="sm" variant="outline" onClick={load} disabled={loading}>
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                刷新中...
              </span>
            ) : (
              "刷新"
            )}
          </Button>
        </div>
        {loading ? (
          <div className="mt-4">
            <LoadingIndicator label="加载中..." />
          </div>
        ) : jobs.length ? (
          <div className="mt-3 space-y-2">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="flex flex-col gap-1 rounded-md border border-border/40 bg-background/60 px-3 py-2 text-sm md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-semibold text-foreground">{job.type}</p>
                  <p className="text-xs text-muted-foreground">{job.createdAt}</p>
                </div>
                <div className="text-right text-xs text-muted-foreground md:text-left">
                  <p>状态：{job.status}</p>
                  {job.summary && (
                    <p className="mt-1 max-h-10 overflow-hidden text-[11px] text-foreground/80">摘要：{job.summary}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">暂无导入任务</p>
        )}
      </div>
    </div>
  );
}
