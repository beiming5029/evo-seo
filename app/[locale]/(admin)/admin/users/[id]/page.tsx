"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { notify } from "@/lib/notify";
import { LoadingIndicator } from "@/components/loading-indicator";

type TenantInfo = {
  id: string;
  name: string;
  siteUrl?: string | null;
  wpUsername?: string | null;
  wpAppPassword?: string | null;
};

type CompanyInfo = {
  id?: string | null;
  name?: string | null;
  contactEmail?: string | null;
  validUntil?: string | null;
  cooperationStartDate?: string | null;
  tenants?: TenantInfo[];
};

type AdminUser = {
  id: string;
  name: string | null;
  email: string;
  image?: string | null;
  company?: CompanyInfo;
  tenants?: TenantInfo[];
};

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string; locale: string }>();
  const userId = params?.id;

  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [addSiteForm, setAddSiteForm] = useState({
    siteName: "",
    siteUrl: "",
    wpUsername: "",
    wpAppPassword: "",
  });

  const [editSiteForm, setEditSiteForm] = useState({
    tenantId: "",
    siteName: "",
    siteUrl: "",
    wpUsername: "",
    wpAppPassword: "",
  });

  const [basicForm, setBasicForm] = useState({
    name: "",
    imageUrl: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    password: "",
  });

  const tenantList = useMemo(() => user?.company?.tenants?.length ? user.company.tenants : user?.tenants || [], [user]);

  const fetchUser = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/users-with-tenants?userId=${userId}`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const target = (data.users || [])[0] as AdminUser | undefined;
      setUser(target || null);
      if (!target) {
        setError("未找到用户");
      } else {
        setError(null);
        setBasicForm({
          name: target.name || "",
          imageUrl: target.image || "",
        });
      }
    } catch (err) {
      setError("加载失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [userId]);

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
      setBasicForm((prev) => ({ ...prev, imageUrl: data.url || "" }));
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

  const submitBasic = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) return;
    if (!basicForm.name.trim()) {
      setError("请填写姓名");
      return;
    }
    try {
      setSaving(true);
      setError(null);
      setMessage(null);
      const res = await fetch("/api/admin/users/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          name: basicForm.name.trim(),
          imageUrl: basicForm.imageUrl || undefined,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchUser();
      setMessage("基本信息已更新");
      notify.success("基本信息已更新");
    } catch (err) {
      setError("保存失败，请稍后重试");
      notify.error("保存失败，请稍后重试");
    } finally {
      setSaving(false);
    }
  };

  const submitPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) return;
    if (passwordForm.password.length < 8) {
      setError("密码至少 8 位");
      return;
    }
    try {
      setSavingPassword(true);
      setError(null);
      setMessage(null);
      const res = await fetch("/api/admin/users/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          password: passwordForm.password,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setPasswordForm({ password: "" });
      setMessage("密码已更新");
      notify.success("密码已更新");
    } catch (err) {
      setError("更新密码失败，请稍后重试");
      notify.error("更新密码失败，请稍后重试");
    } finally {
      setSavingPassword(false);
    }
  };

  const submitAddSite = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) return;
    if (!addSiteForm.siteName.trim()) {
      setError("请填写站点名称");
      return;
    }
    const payload = {
      userId,
      tenantId: undefined,
      siteName: addSiteForm.siteName.trim(),
      siteUrl: addSiteForm.siteUrl.trim() || undefined,
      wpUsername: addSiteForm.wpUsername.trim() || undefined,
      wpAppPassword: addSiteForm.wpAppPassword.trim() || undefined,
    };
    try {
      setSaving(true);
      setError(null);
      setMessage(null);
      const res = await fetch("/api/admin/users/bind-tenant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      setAddSiteForm({ siteName: "", siteUrl: "", wpUsername: "", wpAppPassword: "" });
      await fetchUser();
      setMessage("保存成功");
      notify.success("保存成功");
    } catch (err) {
      setError("新增站点失败，请检查必填项");
      notify.error("新增站点失败，请检查必填项");
    } finally {
      setSaving(false);
    }
  };

  const selectTenantToEdit = (t: TenantInfo) => {
    setEditSiteForm({
      tenantId: t.id,
      siteName: t.name,
      siteUrl: t.siteUrl || "",
      wpUsername: t.wpUsername || "",
      wpAppPassword: t.wpAppPassword || "",
    });
  };

  const resetEditSiteForm = () =>
    setEditSiteForm({
      tenantId: "",
      siteName: "",
      siteUrl: "",
      wpUsername: "",
      wpAppPassword: "",
    });

  const submitEditSite = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId || !editSiteForm.tenantId) {
      setError("请选择要编辑的站点");
      return;
    }
    if (!editSiteForm.siteName.trim()) {
      setError("请填写站点名称");
      return;
    }
    const payload = {
      userId,
      tenantId: editSiteForm.tenantId,
      siteName: editSiteForm.siteName.trim(),
      siteUrl: editSiteForm.siteUrl.trim() || undefined,
      wpUsername: editSiteForm.wpUsername.trim() || undefined,
      wpAppPassword: editSiteForm.wpAppPassword.trim() || undefined,
    };
    try {
      setSaving(true);
      setError(null);
      setMessage(null);
      const res = await fetch("/api/admin/users/bind-tenant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      resetEditSiteForm();
      await fetchUser();
      setMessage("站点已更新");
      notify.success("站点已更新");
    } catch (err) {
      setError("更新站点失败，请检查必填项");
      notify.error("更新站点失败，请检查必填项");
    } finally {
      setSaving(false);
    }
  };

  if (!userId) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">缺少用户 ID</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">管理员 / 用户详情</p>
          <h1 className="text-2xl font-semibold text-foreground">用户详情</h1>
        </div>
        <div className="flex gap-3">
          <Button as={Link} href="/admin/users" variant="outline">
            返回列表
          </Button>
          <Button variant="simple" onClick={fetchUser}>
            刷新
          </Button>
        </div>
      </div>

      {error && <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
      {message && <div className="rounded-md border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">{message}</div>}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border/60 bg-card/50 p-4 shadow-sm md:col-span-2">
          <h2 className="text-lg font-semibold text-foreground mb-3">用户详情（只读）</h2>
          {loading ? (
            <div className="py-1">
              <LoadingIndicator label="加载中..." className="border-0 bg-transparent px-0 shadow-none" rounded={false} />
            </div>
          ) : user ? (
            <div className="space-y-3 text-sm">
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">用户 ID</span>
                <span className="font-mono text-xs text-muted-foreground break-all">{user.id}</span>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-muted-foreground text-xs">姓名</p>
                  <p className="text-foreground">{user.name || "未设置"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">邮箱（不可变更）</p>
                  <p className="text-foreground break-all">{user.email}</p>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-muted-foreground text-xs">头像</p>
                  {user.image ? (
                    <img src={user.image} alt="avatar" className="h-16 w-16 rounded-full border border-border object-cover" />
                  ) : (
                    <span className="text-xs text-muted-foreground">未设置</span>
                  )}
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">公司</p>
                  <p className="text-foreground">{user.company?.name || "未绑定公司"}</p>
                  <p className="text-xs text-muted-foreground">
                    {user.company?.contactEmail || "无联系邮箱"} · 合作 {user.company?.cooperationStartDate || "-"} 至 {user.company?.validUntil || "-"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">未找到用户</p>
          )}
        </div>

        <div className="rounded-xl border border-border/60 bg-card/50 p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-3">站点列表</h2>
          {loading ? (
            <div className="py-1">
              <LoadingIndicator label="加载中..." className="border-0 bg-transparent px-0 shadow-none" rounded={false} />
            </div>
          ) : tenantList.length ? (
            <div className="space-y-2">
              {tenantList.map((t) => (
                <div
                  key={t.id}
                  className="rounded-lg border border-border/50 bg-background px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground break-all">{t.siteUrl || "未配置站点 URL"}</p>
                  </div>
                  <div className="mt-1 text-[11px] text-muted-foreground">
                    WP 账号：{t.wpUsername || "未配置"} · 密码：{t.wpAppPassword ? "******" : "未配置"}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">尚未绑定站点</p>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border/60 bg-card/50 p-4 shadow-sm">
        <p className="text-sm text-muted-foreground">
          该页面仅供查看。如需修改用户信息或站点，请回到列表页在“操作”中使用编辑/关联按钮。
        </p>
      </div>
    </div>
  );
}
