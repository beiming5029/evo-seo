"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/button";

type Integration = {
  siteUrl: string;
  wpUsername: string;
  wpAppPassword: string;
  timezone: string;
  publishTimeLocal: string;
  status: string;
};

export default function SettingsPage() {
  const [integration, setIntegration] = useState<Integration | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/evo/wp");
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setIntegration(data.integration);
    } catch (error) {
      setMessage("加载失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const payload = {
      siteUrl: (form.elements.namedItem("siteUrl") as HTMLInputElement).value,
      wpUsername: (form.elements.namedItem("wpUsername") as HTMLInputElement).value,
      wpAppPassword: (form.elements.namedItem("wpAppPassword") as HTMLInputElement).value,
      timezone: (form.elements.namedItem("timezone") as HTMLSelectElement).value,
      publishTimeLocal: (form.elements.namedItem("publishTimeLocal") as HTMLInputElement).value,
    };
    try {
      setSaving(true);
      const res = await fetch("/api/evo/wp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      setMessage("保存成功");
      await load();
    } catch (error) {
      setMessage("保存失败，请检查必填项");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">设置</h1>
        <p className="text-sm text-muted-foreground">
          WordPress 集成（应用密码），每天中午 12:00（可配置）自动发布；支持设置时区。
        </p>
      </div>

      {message && (
        <div className="rounded-md border border-border/60 bg-muted/40 p-3 text-sm text-foreground">
          {message}
        </div>
      )}

      <div className="rounded-xl border border-border/60 bg-card/50 p-4">
        <h3 className="text-lg font-semibold text-foreground">WordPress 集成</h3>
        {loading ? (
          <p className="text-sm text-muted-foreground">加载中...</p>
        ) : (
          <form className="mt-3 grid gap-4 md:grid-cols-2" onSubmit={handleSave}>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-muted-foreground">站点 URL</label>
              <input
                name="siteUrl"
                defaultValue={integration?.siteUrl}
                required
                className="rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-muted-foreground">用户名</label>
              <input
                name="wpUsername"
                defaultValue={integration?.wpUsername}
                required
                className="rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-muted-foreground">应用密码</label>
              <input
                name="wpAppPassword"
                type="password"
                defaultValue={integration?.wpAppPassword}
                required
                className="rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-muted-foreground">时区</label>
              <select
                name="timezone"
                defaultValue={integration?.timezone || "Asia/Shanghai"}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="Asia/Shanghai">Asia/Shanghai (UTC+8)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-muted-foreground">每日发布时间（本地时区）</label>
              <input
                name="publishTimeLocal"
                type="time"
                defaultValue={integration?.publishTimeLocal || "12:00"}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={saving}>
                {saving ? "保存中..." : "保存"}
              </Button>
            </div>
          </form>
        )}
      </div>

      <div className="rounded-xl border border-border/60 bg-card/50 p-4">
        <h3 className="text-lg font-semibold text-foreground">24/7 专家客户</h3>
        <p className="text-sm text-muted-foreground">
          添加微信获取专家支持。可在此放置微信二维码图片（例如 public/wechat.png），或填写微信号。
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-foreground">
          <span>微信号：evoSEO-support</span>
        </div>
      </div>
    </div>
  );
}
