"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { notify } from "@/lib/notify";
import { Button } from "@/components/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

type AdminUser = { id: string; name: string | null; email: string; image?: string | null; company?: CompanyInfo; tenants?: TenantInfo[] };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [query, setQuery] = useState({ userId: "", email: "" });
  const fetchedOnce = useRef(false);
  const [viewUser, setViewUser] = useState<AdminUser | null>(null);
  const [viewTenantId, setViewTenantId] = useState<string | null>(null);

  const [bindUser, setBindUser] = useState<AdminUser | null>(null);
  const [bindForm, setBindForm] = useState({
    tenantId: "",
    siteName: "",
    siteUrl: "",
    wpUsername: "",
    wpAppPassword: "",
  });

  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    imageUrl: "",
    password: "",
  });
  const [editUploading, setEditUploading] = useState(false);
  const [editSaving, setEditSaving] = useState(false);

  const getTenantList = (u: AdminUser | null) =>
    u?.company?.tenants?.length ? u.company.tenants : u?.tenants || [];

  const fetchUsers = async (params?: { userId?: string; email?: string }) => {
    try {
      setLoading(true);
      const qs = new URLSearchParams();
      if (params?.userId) qs.set("userId", params.userId);
      if (params?.email) qs.set("email", params.email);
      const res = await fetch(`/api/admin/users-with-tenants?${qs.toString()}`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setUsers(data.users || []);
      setError(null);
    } catch (err) {
      setError("加载失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fetchedOnce.current) return;
    fetchedOnce.current = true;
    fetchUsers();
  }, []);

  const submitSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await fetchUsers({
      userId: query.userId.trim() || undefined,
      email: query.email.trim() || undefined,
    });
  };

  const openEditUser = (u: AdminUser) => {
    setEditUser(u);
    setEditForm({
      name: u.name || "",
      imageUrl: u.image || "",
      password: "",
    });
  };

  const handleEditAvatarUpload = async (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("头像仅支持图片文件");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
      setEditUploading(true);
      setError(null);
      const res = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setEditForm((prev) => ({ ...prev, imageUrl: data.url || "" }));
      setMessage("头像上传成功");
      notify.success("头像上传成功");
    } catch (err) {
      console.error(err);
      setError("头像上传失败，请重试");
      notify.error("头像上传失败，请重试");
    } finally {
      setEditUploading(false);
    }
  };

  const submitEditUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editUser) return;
    if (!editForm.name.trim()) {
      setError("请填写姓名");
      return;
    }
    if (editForm.password && editForm.password.length < 8) {
      setError("密码至少 8 位");
      return;
    }
    try {
      setEditSaving(true);
      setError(null);
      setMessage(null);
      const res = await fetch("/api/admin/users/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: editUser.id,
          name: editForm.name.trim(),
          imageUrl: editForm.imageUrl || undefined,
          password: editForm.password || undefined,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setEditUser(null);
      setEditForm({ name: "", imageUrl: "", password: "" });
      await fetchUsers({ userId: editUser.id });
      setMessage("用户信息已更新");
      notify.success("用户信息已更新");
    } catch (err) {
      setError("更新失败，请稍后重试");
      notify.error("更新失败，请稍后重试");
    } finally {
      setEditSaving(false);
    }
  };

  const resetBindForm = () =>
    setBindForm({
      tenantId: "",
      siteName: "",
      siteUrl: "",
      wpUsername: "",
      wpAppPassword: "",
    });

  const submitBind = async (e: React.FormEvent<HTMLFormElement>, userId: string) => {
    e.preventDefault();
    if (!bindForm.siteName.trim()) {
      setError("请填写站点名称");
      return;
    }
    const payload = {
      userId,
      tenantId: bindForm.tenantId || undefined,
      siteName: bindForm.siteName.trim(),
      siteUrl: bindForm.siteUrl.trim() || undefined,
      wpUsername: bindForm.wpUsername.trim() || undefined,
      wpAppPassword: bindForm.wpAppPassword.trim() || undefined,
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
      setBindUser(null);
      resetBindForm();
      await fetchUsers({ userId });
      setMessage("操作成功");
      notify.success("操作成功");
    } catch (err) {
      setError("操作失败，请检查必填项");
      notify.error("操作失败，请检查必填项");
    } finally {
      setSaving(false);
    }
  };

  const flatUsers = useMemo(() => users, [users]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50/60 px-4 py-6 text-foreground dark:bg-black md:px-8 lg:px-10">
      <div className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-blue-500/15 blur-[120px] dark:opacity-0" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-6%] h-72 w-72 rounded-full bg-indigo-500/15 blur-[140px] dark:opacity-0" />
      <div className="pointer-events-none absolute inset-0 bg-[url('/noise.webp')] opacity-[0.04] dark:opacity-0" />

      <div className="relative mb-6 overflow-hidden rounded-3xl border border-white/60 bg-white/70 p-6 shadow-xl shadow-slate-900/10 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-900/70 dark:shadow-black/40">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/12 via-white/10 to-indigo-500/10" />
        <div className="relative flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-700 ring-1 ring-white/70 backdrop-blur-sm dark:bg-blue-900/40 dark:text-blue-200 dark:ring-white/10">
              Directory
            </div>
            <h1 className="mt-3 text-3xl font-bold leading-tight text-slate-900 dark:text-white">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">用户管理</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">按用户 ID 或邮箱搜索，查看公司与站点，支持新增/更新网站。</p>
          </div>
          <Button
            as={Link}
            href="/admin/users/create"
            className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-600/35"
            variant="primary"
          >
            新增用户
          </Button>
        </div>
      </div>

      <form
        className="relative rounded-2xl border border-white/60 bg-white/70 p-5 shadow-lg shadow-slate-900/10 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-900/70 dark:shadow-black/40"
        onSubmit={submitSearch}
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-blue-500/10 via-white/8 to-indigo-500/10" />
        <div className="relative grid gap-4 md:grid-cols-3">
          <div className="space-y-1">
            <Label className="text-xs">用户 ID</Label>
            <Input
              value={query.userId}
              onChange={(e) => setQuery((prev) => ({ ...prev, userId: e.target.value }))}
              placeholder="用 ID 精确查询"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">用户邮箱</Label>
            <Input
              value={query.email}
              onChange={(e) => setQuery((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="支持模糊匹配"
            />
          </div>
          <div className="flex items-end">
            <Button
              type="submit"
              className="w-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/25 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-600/35"
              disabled={loading}
            >
              {loading ? "查询中..." : "查询"}
            </Button>
          </div>
        </div>
      </form>

      <div className="relative overflow-x-auto rounded-2xl border border-white/60 bg-white/70 shadow-lg shadow-slate-900/10 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-900/70 dark:shadow-black/40">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/30 via-white/5 to-transparent dark:from-slate-900/50" />
        <table className="relative min-w-full text-sm">
          <thead className="bg-white/70 text-left text-muted-foreground dark:bg-slate-900/60">
            <tr>
              <th className="px-3 py-3 font-semibold">用户 ID</th>
              <th className="px-3 py-3 font-semibold">姓名</th>
              <th className="px-3 py-3 font-semibold">邮箱</th>
              <th className="px-3 py-3 font-semibold">公司</th>
              <th className="px-3 py-3 font-semibold">关联站点</th>
              <th className="px-3 py-3 font-semibold">操作</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="px-3 py-3 text-center text-muted-foreground">
                  <div className="flex justify-center">
                    <LoadingIndicator label="加载中..." className="border-0 bg-transparent px-0 shadow-none" rounded={false} />
                  </div>
                </td>
              </tr>
            )}
            {!loading && flatUsers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-5 text-center text-muted-foreground">
                  暂无数据
                </td>
              </tr>
            )}
            {!loading &&
              flatUsers.map((u) => {
                const tenantList = getTenantList(u);
                return (
                  <tr key={u.id} className="border-t border-white/60 align-top dark:border-slate-800/60">
                    <td className="px-3 py-3 font-mono text-xs text-muted-foreground break-all">{u.id}</td>
                    <td className="px-3 py-3 text-foreground">{u.name || "-"}</td>
                    <td className="px-3 py-3 text-foreground break-all">{u.email}</td>
                    <td className="px-3 py-3">
                      <div className="text-foreground">{u.company?.name || "未配置公司"}</div>
                      <div className="text-xs text-muted-foreground">
                        {u.company?.contactEmail || "无联系邮箱"}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        合作 {u.company?.cooperationStartDate || "-"} 至 {u.company?.validUntil || "-"}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="space-y-1">
                        {tenantList.length
                          ? tenantList.map((t) => (
                              <div
                                key={t.id}
                                className="rounded-md border border-white/60 bg-white/80 px-2 py-1 text-xs shadow-sm dark:border-slate-800/60 dark:bg-slate-900/70"
                              >
                                <div className="font-semibold text-foreground">{t.name}</div>
                                <div className="text-muted-foreground">{t.siteUrl || "未配置站点 URL"}</div>
                              </div>
                            ))
                          : "未绑定站点"}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          as={Link}
                          href={`/admin/users/${u.id}`}
                          size="sm"
                          variant="outline"
                          className="rounded-full"
                        >
                          详情
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full"
                          onClick={() => openEditUser(u)}
                        >
                          编辑
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full"
                          onClick={() => {
                            setBindUser(u);
                            resetBindForm();
                          }}
                        >
                          关联站点
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {viewUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-4xl overflow-hidden rounded-2xl border border-white/40 bg-white/90 p-6 shadow-2xl backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/85 dark:shadow-black/50">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">用户详情</h3>
                <p className="text-sm text-muted-foreground">
                  {viewUser.name || "未设置姓名"} · {viewUser.email}
                </p>
              </div>
              <Button variant="simple" onClick={() => setViewUser(null)}>
                关闭
              </Button>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-muted-foreground">已关联站点</p>
                <div className="rounded-md border border-white/60 bg-white/70 p-2 space-y-1 dark:border-slate-800/60 dark:bg-slate-900/70">
                  {getTenantList(viewUser).map((t) => (
                    <div
                      key={t.id}
                      className={`cursor-pointer rounded px-2 py-1 text-sm ${
                        viewTenantId === t.id ? "bg-white/90 font-semibold dark:bg-slate-800" : "hover:bg-white/70 dark:hover:bg-slate-800/70"
                      }`}
                      onClick={() => setViewTenantId(t.id)}
                    >
                      <div>{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.siteUrl || "未配置站点 URL"}</div>
                    </div>
                  ))}
                  {!getTenantList(viewUser).length && (
                    <p className="text-xs text-muted-foreground">暂无站点</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground">站点详情</p>
                {(() => {
                  const list = getTenantList(viewUser);
                  const t = list.find((item) => item.id === viewTenantId);
                  if (!t) return <p className="text-muted-foreground">未选择站点</p>;
                  return (
                    <div className="space-y-2 rounded-md border border-white/60 bg-white/80 px-3 py-3 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/70">
                      <div>
                        <p className="text-xs text-muted-foreground">站点名称</p>
                        <p className="text-base font-semibold text-foreground">{t.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">站点 URL</p>
                        <p className="text-sm text-foreground break-all">{t.siteUrl || "未配置"}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-muted-foreground">WP 用户名</p>
                          <p className="text-sm text-foreground">{t.wpUsername || "未配置"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">WP 应用密码</p>
                          <p className="text-sm text-foreground">{t.wpAppPassword ? "******" : "未配置"}</p>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {bindUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-white/40 bg-white/90 p-6 shadow-2xl backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/85 dark:shadow-black/50">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">绑定/更新网站</h3>
                <p className="text-sm text-muted-foreground">
                  {bindUser.name || "未设置姓名"} · {bindUser.email}
                </p>
              </div>
              <Button variant="simple" onClick={() => setBindUser(null)}>
                关闭
              </Button>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">当前关联站点</p>
                {getTenantList(bindUser).length ? (
                  getTenantList(bindUser).map((t) => (
                    <div
                      key={t.id}
                      className="cursor-pointer rounded-md border border-white/60 bg-white/70 px-3 py-2 hover:border-blue-200/70 dark:border-slate-800/60 dark:bg-slate-900/70 dark:hover:border-blue-500/40"
                      onClick={() =>
                        setBindForm({
                          tenantId: t.id,
                          siteName: t.name,
                          siteUrl: t.siteUrl || "",
                          wpUsername: t.wpUsername || "",
                          wpAppPassword: t.wpAppPassword || "",
                        })
                      }
                    >
                      <p className="font-semibold text-foreground">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.siteUrl || "未配置站点 URL"}</p>
                      <p className="text-[11px] text-primary mt-1">点击编辑</p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">暂无关联站点，右侧可绑定</p>
                )}
              </div>

              <form className="space-y-2 text-sm" onSubmit={(e) => submitBind(e, bindUser.id)}>
                <p className="text-muted-foreground">绑定/更新网站</p>
                {bindForm.tenantId && (
                  <div className="rounded-md border border-dashed border-white/60 bg-white/60 px-3 py-2 text-xs text-muted-foreground dark:border-slate-800/60 dark:bg-slate-900/70">
                    正在编辑：{bindForm.siteName || "未命名站点"}（更新后生效，如需新增请点击左侧“重置”）
                  </div>
                )}
                <div className="flex justify-end">
                  <Button type="button" size="sm" variant="outline" onClick={() => resetBindForm()} disabled={saving}>
                    重置为新增
                  </Button>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">站点名称（必填）</Label>
                  <Input
                    name="siteName"
                    placeholder="示例科技官网"
                    required
                    value={bindForm.siteName}
                    onChange={(e) => setBindForm((prev) => ({ ...prev, siteName: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">站点 URL（选填）</Label>
                  <Input
                    name="siteUrl"
                    placeholder="https://example.com"
                    value={bindForm.siteUrl}
                    onChange={(e) => setBindForm((prev) => ({ ...prev, siteUrl: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">WP 用户名（选填）</Label>
                    <Input
                      name="wpUsername"
                      value={bindForm.wpUsername}
                      onChange={(e) => setBindForm((prev) => ({ ...prev, wpUsername: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">WP 应用密码（选填）</Label>
                    <Input
                      name="wpAppPassword"
                      type="password"
                      value={bindForm.wpAppPassword}
                      onChange={(e) => setBindForm((prev) => ({ ...prev, wpAppPassword: e.target.value }))}
                    />
                  </div>
                </div>
                <Button type="submit" size="sm" disabled={saving} className="rounded-full">
                  {saving ? "提交中..." : bindForm.tenantId ? "更新" : "绑定"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}

      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-white/40 bg-white/90 p-6 shadow-2xl backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/85 dark:shadow-black/50">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">编辑用户信息</h3>
                <p className="text-sm text-muted-foreground">
                  邮箱不可修改，如需变更请新建账户再迁移数据 · {editUser.email}
                </p>
              </div>
              <Button variant="simple" onClick={() => setEditUser(null)}>
                关闭
              </Button>
            </div>

            <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={submitEditUser}>
              <div className="space-y-1">
                <Label className="text-xs">姓名</Label>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="用户姓名"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">密码（选填，至少 8 位）</Label>
                <Input
                  type="password"
                  value={editForm.password}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="********"
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <Label className="text-xs">头像（选填）</Label>
                <div className="flex items-center gap-3">
                  {editForm.imageUrl ? (
                    <img
                      src={editForm.imageUrl}
                      alt="avatar preview"
                      className="h-12 w-12 rounded-full border border-white/60 object-cover shadow-sm dark:border-slate-800/60"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-white/60 text-xs text-muted-foreground dark:border-slate-800/60">
                      无
                    </div>
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      handleEditAvatarUpload(file);
                      e.target.value = "";
                    }}
                    disabled={editUploading || editSaving}
                    className="max-w-xs"
                  />
                  {editForm.imageUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setEditForm((prev) => ({ ...prev, imageUrl: "" }))}
                      disabled={editUploading || editSaving}
                      className="rounded-full"
                    >
                      移除
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">如需改邮箱，请新建账户再迁移数据</p>
              </div>
              <div className="md:col-span-2 flex items-center gap-3">
                <Button type="submit" size="sm" disabled={editSaving || editUploading} className="rounded-full">
                  {editSaving ? "保存中..." : "保存修改"}
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setEditUser(null)} disabled={editSaving} className="rounded-full">
                  取消
                </Button>
                {editUploading && <span className="text-xs text-muted-foreground">头像正在上传...</span>}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
