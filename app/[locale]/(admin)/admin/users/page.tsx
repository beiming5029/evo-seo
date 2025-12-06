"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("adminPortal.users");
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
      setError(t("errors.load"));
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
      setError(t("errors.avatarType"));
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
      setMessage(t("messages.avatarUploaded"));
      notify.success(t("messages.avatarUploaded"));
    } catch (err) {
      console.error(err);
      setError(t("errors.avatarUpload"));
      notify.error(t("errors.avatarUpload"));
    } finally {
      setEditUploading(false);
    }
  };

  const submitEditUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editUser) return;
    if (!editForm.name.trim()) {
      setError(t("errors.nameRequired"));
      return;
    }
    if (editForm.password && editForm.password.length < 8) {
      setError(t("errors.passwordLength"));
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
      setMessage(t("messages.updated"));
      notify.success(t("messages.updated"));
    } catch (err) {
      setError(t("errors.updateFailed"));
      notify.error(t("errors.updateFailed"));
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
      setError(t("errors.siteNameRequired"));
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
      setMessage(t("messages.success"));
      notify.success(t("messages.success"));
    } catch (err) {
      setError(t("errors.bindFailed"));
      notify.error(t("errors.bindFailed"));
    } finally {
      setSaving(false);
    }
  };

  const flatUsers = useMemo(() => users, [users]);

  const commonNotSet = t("common.notSet");

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
              {t("badge")}
            </div>
            <h1 className="mt-3 text-3xl font-bold leading-tight text-slate-900 dark:text-white">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{t("title")}</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{t("desc")}</p>
          </div>
          <Button
            as={Link}
            href="/admin/users/create"
            className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-600/35"
            variant="primary"
          >
            {t("cta")}
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
            <Label className="text-xs">{t("form.userId")}</Label>
            <Input
              value={query.userId}
              onChange={(e) => setQuery((prev) => ({ ...prev, userId: e.target.value }))}
              placeholder={t("form.userIdPlaceholder")}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{t("form.email")}</Label>
            <Input
              value={query.email}
              onChange={(e) => setQuery((prev) => ({ ...prev, email: e.target.value }))}
              placeholder={t("form.emailPlaceholder")}
            />
          </div>
          <div className="flex items-end">
            <Button
              type="submit"
              className="w-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/25 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-600/35"
              disabled={loading}
            >
              {loading ? t("form.searching") : t("form.search")}
            </Button>
          </div>
        </div>
      </form>

      <div className="relative overflow-x-auto rounded-2xl border border-white/60 bg-white/70 shadow-lg shadow-slate-900/10 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-900/70 dark:shadow-black/40">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/30 via-white/5 to-transparent dark:from-slate-900/50" />
        <table className="relative min-w-full text-sm">
          <thead className="bg-white/70 text-left text-muted-foreground dark:bg-slate-900/60">
            <tr>
              <th className="px-3 py-3 font-semibold">{t("table.headers.userId")}</th>
              <th className="px-3 py-3 font-semibold">{t("table.headers.name")}</th>
              <th className="px-3 py-3 font-semibold">{t("table.headers.email")}</th>
              <th className="px-3 py-3 font-semibold">{t("table.headers.company")}</th>
              <th className="px-3 py-3 font-semibold">{t("table.headers.sites")}</th>
              <th className="px-3 py-3 font-semibold">{t("table.headers.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="px-3 py-3 text-center text-muted-foreground">
                  <div className="flex justify-center">
                    <LoadingIndicator label={t("form.searching")} className="border-0 bg-transparent px-0 shadow-none" rounded={false} />
                  </div>
                </td>
              </tr>
            )}
            {!loading && flatUsers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-5 text-center text-muted-foreground">
                  {t("table.noData")}
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
                      <div className="text-foreground">{u.company?.name || t("company.none")}</div>
                      <div className="text-xs text-muted-foreground">
                        {u.company?.contactEmail || t("company.contactMissing")}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {t("company.cooperationPrefix")} {u.company?.cooperationStartDate || "-"} {t("company.to")} {u.company?.validUntil || "-"}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="space-y-1">
                        {tenantList.length
                          ? tenantList.map((tSite) => (
                              <div
                                key={tSite.id}
                                className="rounded-md border border-white/60 bg-white/80 px-2 py-1 text-xs shadow-sm dark:border-slate-800/60 dark:bg-slate-900/70"
                              >
                                <div className="font-semibold text-foreground">{tSite.name}</div>
                                <div className="text-muted-foreground">{tSite.siteUrl || t("sites.urlMissing")}</div>
                              </div>
                            ))
                          : t("sites.none")}
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
                          {t("actions.detail")}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full"
                          onClick={() => openEditUser(u)}
                        >
                          {t("actions.edit")}
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
                          {t("actions.bind")}
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
                <h3 className="text-lg font-semibold text-foreground">{t("view.title")}</h3>
                <p className="text-sm text-muted-foreground">
                  {viewUser.name || t("common.noName")} · {viewUser.email}
                </p>
              </div>
              <Button variant="simple" onClick={() => setViewUser(null)}>
                {t("common.close")}
              </Button>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-muted-foreground">{t("view.linkedSites")}</p>
                <div className="rounded-md border border-white/60 bg-white/70 p-2 space-y-1 dark:border-slate-800/60 dark:bg-slate-900/70">
                  {getTenantList(viewUser).map((tSite) => (
                    <div
                      key={tSite.id}
                      className={`cursor-pointer rounded px-2 py-1 text-sm ${
                        viewTenantId === tSite.id ? "bg-white/90 font-semibold dark:bg-slate-800" : "hover:bg-white/70 dark:hover:bg-slate-800/70"
                      }`}
                      onClick={() => setViewTenantId(tSite.id)}
                    >
                      <div>{tSite.name}</div>
                      <div className="text-xs text-muted-foreground">{tSite.siteUrl || t("sites.urlMissing")}</div>
                    </div>
                  ))}
                  {!getTenantList(viewUser).length && (
                    <p className="text-xs text-muted-foreground">{t("sites.none")}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground">{t("view.siteDetails")}</p>
                {(() => {
                  const list = getTenantList(viewUser);
                  const tSite = list.find((item) => item.id === viewTenantId);
                  if (!tSite) return <p className="text-muted-foreground">{t("view.noSiteSelected")}</p>;
                  return (
                    <div className="space-y-2 rounded-md border border-white/60 bg-white/80 px-3 py-3 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/70">
                      <div>
                        <p className="text-xs text-muted-foreground">{t("fields.siteName")}</p>
                        <p className="text-base font-semibold text-foreground">{tSite.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{t("fields.siteUrl")}</p>
                        <p className="text-sm text-foreground break-all">{tSite.siteUrl || t("sites.urlMissing")}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-muted-foreground">{t("fields.wpUser")}</p>
                          <p className="text-sm text-foreground">{tSite.wpUsername || commonNotSet}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">{t("fields.wpPassword")}</p>
                          <p className="text-sm text-foreground">{tSite.wpAppPassword ? "******" : commonNotSet}</p>
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
                <h3 className="text-lg font-semibold text-foreground">{t("bind.title")}</h3>
                <p className="text-sm text-muted-foreground">
                  {bindUser.name || t("common.noName")} · {bindUser.email}
                </p>
              </div>
              <Button variant="simple" onClick={() => setBindUser(null)}>
                {t("common.close")}
              </Button>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">{t("bind.currentSites")}</p>
                {getTenantList(bindUser).length ? (
                  getTenantList(bindUser).map((tSite) => (
                    <div
                      key={tSite.id}
                      className="cursor-pointer rounded-md border border-white/60 bg-white/70 px-3 py-2 hover:border-blue-200/70 dark:border-slate-800/60 dark:bg-slate-900/70 dark:hover:border-blue-500/40"
                      onClick={() =>
                        setBindForm({
                          tenantId: tSite.id,
                          siteName: tSite.name,
                          siteUrl: tSite.siteUrl || "",
                          wpUsername: tSite.wpUsername || "",
                          wpAppPassword: tSite.wpAppPassword || "",
                        })
                      }
                    >
                      <p className="font-semibold text-foreground">{tSite.name}</p>
                      <p className="text-xs text-muted-foreground">{tSite.siteUrl || t("sites.urlMissing")}</p>
                      <p className="text-[11px] text-primary mt-1">{t("bind.clickToEdit")}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">{t("bind.noSites")}</p>
                )}
              </div>

              <form className="space-y-2 text-sm" onSubmit={(e) => submitBind(e, bindUser.id)}>
                <p className="text-muted-foreground">{t("bind.formTitle")}</p>
                {bindForm.tenantId && (
                  <div className="rounded-md border border-dashed border-white/60 bg-white/60 px-3 py-2 text-xs text-muted-foreground dark:border-slate-800/60 dark:bg-slate-900/70">
                    {t("bind.editingHint", { siteName: bindForm.siteName || t("common.unnamedSite") })}
                  </div>
                )}
                <div className="flex justify-end">
                  <Button type="button" size="sm" variant="outline" onClick={() => resetBindForm()} disabled={saving}>
                    {t("bind.reset")}
                  </Button>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t("fields.siteNameRequired")}</Label>
                  <Input
                    name="siteName"
                    placeholder={t("fields.siteNamePlaceholder")}
                    required
                    value={bindForm.siteName}
                    onChange={(e) => setBindForm((prev) => ({ ...prev, siteName: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t("fields.siteUrlOptional")}</Label>
                  <Input
                    name="siteUrl"
                    placeholder="https://example.com"
                    value={bindForm.siteUrl}
                    onChange={(e) => setBindForm((prev) => ({ ...prev, siteUrl: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">{t("fields.wpUserOptional")}</Label>
                    <Input
                      name="wpUsername"
                      value={bindForm.wpUsername}
                      onChange={(e) => setBindForm((prev) => ({ ...prev, wpUsername: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{t("fields.wpPasswordOptional")}</Label>
                    <Input
                      name="wpAppPassword"
                      type="password"
                      value={bindForm.wpAppPassword}
                      onChange={(e) => setBindForm((prev) => ({ ...prev, wpAppPassword: e.target.value }))}
                    />
                  </div>
                </div>
                <Button type="submit" size="sm" disabled={saving} className="rounded-full">
                  {saving ? t("bind.saving") : bindForm.tenantId ? t("bind.update") : t("bind.submit")}
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
                <h3 className="text-lg font-semibold text-foreground">{t("edit.title")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("edit.tip")} · {editUser.email}
                </p>
              </div>
              <Button variant="simple" onClick={() => setEditUser(null)}>
                {t("common.close")}
              </Button>
            </div>

            <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={submitEditUser}>
              <div className="space-y-1">
                <Label className="text-xs">{t("edit.nameLabel")}</Label>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder={t("edit.namePlaceholder")}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t("edit.passwordLabel")}</Label>
                <Input
                  type="password"
                  value={editForm.password}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="********"
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <Label className="text-xs">{t("edit.avatarLabel")}</Label>
                <div className="flex items-center gap-3">
                  {editForm.imageUrl ? (
                    <img
                      src={editForm.imageUrl}
                      alt="avatar preview"
                      className="h-12 w-12 rounded-full border border-white/60 object-cover shadow-sm dark:border-slate-800/60"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-white/60 text-xs text-muted-foreground dark:border-slate-800/60">
                      {t("edit.avatarNone")}
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
                      {t("edit.removeAvatar")}
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{t("edit.emailNote")}</p>
              </div>
              <div className="md:col-span-2 flex items-center gap-3">
                <Button type="submit" size="sm" disabled={editSaving || editUploading} className="rounded-full">
                  {editSaving ? t("edit.saving") : t("edit.save")}
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setEditUser(null)} disabled={editSaving} className="rounded-full">
                  {t("edit.cancel")}
                </Button>
                {editUploading && <span className="text-xs text-muted-foreground">{t("edit.uploading")}</span>}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
