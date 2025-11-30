"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

type AdminUser = { id: string; name: string | null; email: string; company?: CompanyInfo; tenants?: TenantInfo[] };

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
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError("操作失败，请检查必填项");
    } finally {
      setSaving(false);
    }
  };

  const flatUsers = useMemo(() => users, [users]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">用户管理</h1>
          <p className="text-sm text-muted-foreground">按用户 ID 或邮箱搜索，查看公司与站点，支持新增/更新网站</p>
        </div>
      </div>

      <form className="rounded-xl border border-border/60 bg-card/50 p-4" onSubmit={submitSearch}>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1">
            <Label>用户 ID</Label>
            <Input
              value={query.userId}
              onChange={(e) => setQuery((prev) => ({ ...prev, userId: e.target.value }))}
              placeholder="按 ID 精确查询"
            />
          </div>
          <div className="space-y-1">
            <Label>用户邮箱</Label>
            <Input
              value={query.email}
              onChange={(e) => setQuery((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="支持模糊匹配"
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "查询中..." : "查询"}
            </Button>
          </div>
        </div>
      </form>

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

      <div className="overflow-x-auto rounded-xl border border-border/60 bg-card/50">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/60 text-left text-muted-foreground">
            <tr>
              <th className="px-3 py-2">用户 ID</th>
              <th className="px-3 py-2">姓名</th>
              <th className="px-3 py-2">邮箱</th>
              <th className="px-3 py-2">公司</th>
              <th className="px-3 py-2">关联站点</th>
              <th className="px-3 py-2">操作</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="px-3 py-3 text-center text-muted-foreground">
                  加载中...
                </td>
              </tr>
            )}
            {!loading && flatUsers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-3 text-center text-muted-foreground">
                  暂无数据
                </td>
              </tr>
            )}
            {!loading &&
              flatUsers.map((u) => {
                const tenantList = getTenantList(u);
                return (
                  <tr key={u.id} className="border-t border-border/40 align-top">
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
                                className="rounded-md border border-border/50 bg-background px-2 py-1 text-xs"
                              >
                                <div className="font-semibold text-foreground">{t.name}</div>
                                <div className="text-muted-foreground">{t.siteUrl || "未配置站点 URL"}</div>
                              </div>
                            ))
                          : "未绑定站点"}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex gap-2">
                        {tenantList.length > 0 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setViewUser(u);
                              setViewTenantId(tenantList[0]?.id || null);
                            }}
                          >
                            查看
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
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

      {/* 查看弹窗 */}
      {viewUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-4xl rounded-xl bg-background p-6 shadow-lg">
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
                <p className="text-muted-foreground">已绑定站点</p>
                <div className="rounded-md border border-border/60 bg-muted/40 p-2 space-y-1">
                  {getTenantList(viewUser).map((t) => (
                    <div
                      key={t.id}
                      className={`cursor-pointer rounded px-2 py-1 text-sm ${
                        viewTenantId === t.id ? "bg-background font-semibold" : "hover:bg-background/60"
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
                    <div className="space-y-2 rounded-md border border-border/50 bg-background px-3 py-3">
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

      {/* 绑定/更新弹窗 */}
      {bindUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-3xl rounded-xl bg-background p-6 shadow-lg">
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
                      className="cursor-pointer rounded-md border border-border/50 bg-background px-3 py-2 hover:border-primary/50"
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
                  <div className="rounded-md border border-dashed border-border/70 bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                    正在编辑：{bindForm.siteName || "未命名站点"}（更新后生效，如需新增请点击左侧“重置”）
                  </div>
                )}
                <div className="flex justify-end">
                  <Button type="button" size="sm" variant="outline" onClick={() => resetBindForm()} disabled={saving}>
                    重置为新建
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
                      placeholder="wp-admin"
                      value={bindForm.wpUsername}
                      onChange={(e) => setBindForm((prev) => ({ ...prev, wpUsername: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">WP 应用密码（选填）</Label>
                    <Input
                      name="wpAppPassword"
                      type="password"
                      placeholder="****"
                      value={bindForm.wpAppPassword}
                      onChange={(e) => setBindForm((prev) => ({ ...prev, wpAppPassword: e.target.value }))}
                    />
                  </div>
                </div>
                <Button type="submit" size="sm" disabled={saving}>
                  {saving ? "提交中..." : bindForm.tenantId ? "更新" : "绑定"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
