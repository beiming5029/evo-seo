"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { notify } from "@/lib/notify";

export default function AdminCreateUserPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    imageUrl: "",
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAvatarUpload = async (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("头像仅支持图片文件");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
      setUploading(true);
      setError(null);
      const res = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setForm((prev) => ({ ...prev, imageUrl: data.url || "" }));
      setMessage("头像上传成功");
      notify.success("头像上传成功");
    } catch (err) {
      console.error(err);
      setError("头像上传失败，请重试");
      notify.error("头像上传失败，请重试");
    } finally {
      setUploading(false);
    }
  };

  const submitCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setError("请填写必填项（姓名、邮箱、密码）");
      return;
    }
    if (form.password.length < 8) {
      setError("密码至少 8 位");
      return;
    }
    try {
      setSaving(true);
      setError(null);
      setMessage(null);
      const res = await fetch("/api/admin/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          imageUrl: form.imageUrl || undefined,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        console.error("[admin/users/create] error", text);
        setError("新增用户失败，请检查邮箱是否已存在");
        notify.error("新增用户失败，请检查邮箱是否已存在");
        return;
      }
      setMessage("新增用户成功");
      notify.success("新增用户成功");
      setForm({ name: "", email: "", password: "", imageUrl: "" });
      router.push("/admin/users");
    } catch (err) {
      setError("新增用户失败，请稍后重试");
      notify.error("新增用户失败，请稍后重试");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">管理员 / 新增用户</p>
          <h1 className="text-2xl font-semibold text-foreground">新增用户</h1>
        </div>
        <div className="flex gap-2">
          <Button as={Link} href="/admin/users" variant="outline">
            返回列表
          </Button>
        </div>
      </div>

      {error && <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
      {message && <div className="rounded-md border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">{message}</div>}

      <div className="rounded-xl border border-border/60 bg-card/50 p-5 shadow-sm">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={submitCreateUser}>
          <div className="space-y-1">
            <Label>姓名（必填）</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="用户姓名"
              required
            />
          </div>
          <div className="space-y-1">
            <Label>邮箱（必填）</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="user@example.com"
              required
            />
          </div>
          <div className="space-y-1">
            <Label>密码（至少 8 位）</Label>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              placeholder="********"
              required
            />
          </div>
          <div className="space-y-1">
            <Label>头像（选填）</Label>
            <div className="flex items-center gap-3">
              {form.imageUrl ? (
                <img
                  src={form.imageUrl}
                  alt="avatar preview"
                  className="h-12 w-12 rounded-full border border-border object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-border text-xs text-muted-foreground">
                  无
                </div>
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  handleAvatarUpload(file);
                  e.target.value = "";
                }}
                disabled={uploading || saving}
                className="max-w-xs"
              />
              {form.imageUrl && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setForm((prev) => ({ ...prev, imageUrl: "" }))}
                  disabled={uploading || saving}
                >
                  移除
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">不填则保持空白</p>
          </div>
          <div className="md:col-span-2 flex items-center gap-3">
            <Button type="submit" disabled={saving || uploading}>
              {saving ? "创建中..." : "创建用户"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setForm({ name: "", email: "", password: "", imageUrl: "" })}
              disabled={saving || uploading}
            >
              重置
            </Button>
            {uploading && <span className="text-xs text-muted-foreground">头像正在上传...</span>}
          </div>
        </form>
      </div>
    </div>
  );
}
