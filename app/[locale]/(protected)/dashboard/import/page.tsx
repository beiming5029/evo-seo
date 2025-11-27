"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/button";

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
      form.reset();
      await load();
    } catch (error) {
      setMessage("上传失败，确认大小 ≤10MB");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">数据导入</h1>
        <p className="text-sm text-muted-foreground">
          支持手动导入询盘/流量/关键词/KPI 的 CSV 或 JSON，创建导入任务后可在此查看状态。
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
              <option value="kpi">KPI 汇总</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-muted-foreground">文件（CSV/JSON，≤10MB）</label>
            <input type="file" name="file" accept=".csv,.json" required />
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={uploading}>
              {uploading ? "上传中..." : "上传并创建任务"}
            </Button>
          </div>
        </form>
      </div>

      <div className="rounded-xl border border-border/60 bg-card/50 p-4">
        <h3 className="text-lg font-semibold text-foreground">导入任务</h3>
        {loading ? (
          <p className="text-sm text-muted-foreground">加载中...</p>
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
                <span className="text-xs text-muted-foreground">状态：{job.status}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">暂无导入任务</p>
        )}
      </div>
    </div>
  );
}
