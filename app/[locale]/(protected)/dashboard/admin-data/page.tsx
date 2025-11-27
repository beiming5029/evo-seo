"use client";

import { useState } from "react";
import { Button } from "@/components/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ApiResult = { message?: string; error?: string };

export default function AdminDataPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(endpoint: string, payload: any) {
    try {
      setLoading(true);
      setMessage(null);
      setError(null);
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data: ApiResult = await res.json();
      if (!res.ok) throw new Error(data.error || "提交失败");
      setMessage("提交成功");
    } catch (err: any) {
      setError(err.message || "提交失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-6 text-foreground">
      <div>
        <h1 className="text-2xl font-semibold">数据录入（管理员）</h1>
        <p className="text-sm text-muted-foreground mt-1">为指定用户/租户录入仪表盘数据</p>
      </div>

      {message && (
        <div className="rounded-md border border-green-500/60 bg-green-50 px-3 py-2 text-sm text-green-700">
          {message}
        </div>
      )}
      {error && (
        <div className="rounded-md border border-destructive/60 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <form
          className="space-y-3 rounded-xl border border-border bg-white p-4 shadow-sm"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget as HTMLFormElement;
            const payload = {
              userEmail: (form.elements.namedItem("kpiEmail") as HTMLInputElement).value || undefined,
              periodStart: (form.elements.namedItem("kpiPeriod") as HTMLInputElement).value,
              periodEnd: (form.elements.namedItem("kpiPeriod") as HTMLInputElement).value,
              value: Number((form.elements.namedItem("kpiValue") as HTMLInputElement).value),
              delta: Number((form.elements.namedItem("kpiDelta") as HTMLInputElement).value || 0),
            };
            await handleSubmit("/api/admin/dashboard/inquiries", payload);
          }}
        >
          <h2 className="text-lg font-semibold">录入询盘指标（本月）</h2>
          <div className="space-y-1">
            <Label>目标用户邮箱（可选，不填默认当前租户）</Label>
            <Input name="kpiEmail" placeholder="user@example.com" />
          </div>
          <div className="space-y-1">
            <Label>周期（YYYY-MM-01）</Label>
            <Input name="kpiPeriod" type="date" required />
          </div>
          <div className="space-y-1">
            <Label>本月询盘数</Label>
            <Input name="kpiValue" type="number" required />
          </div>
          <div className="space-y-1">
            <Label>环比增长 %</Label>
            <Input name="kpiDelta" type="number" step="0.1" />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            保存询盘数据
          </Button>
        </form>

        <form
          className="space-y-3 rounded-xl border border-border bg-white p-4 shadow-sm"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget as HTMLFormElement;
            const payload = {
              userEmail: (form.elements.namedItem("postEmail") as HTMLInputElement).value || undefined,
              title: (form.elements.namedItem("postTitle") as HTMLInputElement).value,
              summary: (form.elements.namedItem("postSummary") as HTMLInputElement).value,
              contentUrl: (form.elements.namedItem("postContentUrl") as HTMLInputElement).value,
              publishDate: (form.elements.namedItem("postDate") as HTMLInputElement).value,
              status: (form.elements.namedItem("postStatus") as HTMLSelectElement).value,
            };
            await handleSubmit("/api/admin/dashboard/posts", payload);
          }}
        >
          <h2 className="text-lg font-semibold">录入文章日历</h2>
          <div className="space-y-1">
            <Label>目标用户邮箱（可选，不填默认当前租户）</Label>
            <Input name="postEmail" placeholder="user@example.com" />
          </div>
          <div className="space-y-1">
            <Label>标题</Label>
            <Input name="postTitle" required />
          </div>
          <div className="space-y-1">
            <Label>摘要</Label>
            <Input name="postSummary" />
          </div>
          <div className="space-y-1">
            <Label>内容链接</Label>
            <Input name="postContentUrl" required />
          </div>
          <div className="space-y-1">
            <Label>发布日期</Label>
            <Input name="postDate" type="date" required />
          </div>
          <div className="space-y-1">
            <Label>状态</Label>
            <select
              name="postStatus"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              defaultValue="scheduled"
            >
              <option value="scheduled">待发布</option>
              <option value="published">已发布</option>
              <option value="paused">已暂停</option>
            </select>
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            保存文章
          </Button>
        </form>
      </div>

      <div className="text-xs text-muted-foreground">
        说明：需管理员角色。若填写邮箱，则为该用户创建/绑定租户后写入数据；不填写则写入当前登录用户的租户。
      </div>
    </div>
  );
}
