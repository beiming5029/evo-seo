"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { notify } from "@/lib/notify";

type UserOption = { id: string; name?: string | null; email?: string | null };

export default function ServiceReportUploadPage() {
  const t = useTranslations("adminPortal.serviceReports");
  const [users, setUsers] = useState<UserOption[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await fetch("/api/admin/users-with-tenants");
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        const list =
          data.users?.map((u: any) => ({
            id: u.id,
            name: u.name,
            email: u.email,
          })) || [];
        setUsers(list);
        if (list[0]) setSelectedUserId(list[0].id);
      } catch {
        setError(t("errors.loadUsers"));
      }
    };
    loadUsers();
  }, [t]);

  const handleSubmit = async (form: HTMLFormElement) => {
    if (!selectedUserId) {
      setError(t("errors.noUser"));
      return;
    }
    const formData = new FormData(form);
    formData.append("userId", selectedUserId);
    try {
      setSaving(true);
      setMessage(null);
      setError(null);
      const res = await fetch("/api/admin/reports", { method: "POST", body: formData });
      if (!res.ok) throw new Error(await res.text());
      notify.success(t("messages.success"));
      setMessage(t("messages.success"));
      form.reset();
    } catch (err) {
      notify.error(t("messages.failure"));
      setError(t("messages.failure"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50/60 px-4 py-6 text-foreground dark:bg-black md:px-8 lg:px-10">
      <div className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-blue-500/15 blur-[120px] dark:opacity-0" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-6%] h-72 w-72 rounded-full bg-indigo-500/15 blur-[140px] dark:opacity-0" />
      <div className="pointer-events-none absolute inset-0 bg-[url('/noise.webp')] opacity-[0.04] dark:opacity-0" />

      <div className="relative mb-6 overflow-hidden rounded-3xl border border-white/60 bg-white/70 p-6 shadow-xl shadow-slate-900/10 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-900/70 dark:shadow-black/40">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/12 via-white/10 to-indigo-500/10" />
        <div className="relative flex flex-col gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-700 ring-1 ring-white/70 backdrop-blur-sm dark:bg-blue-900/40 dark:text-blue-200 dark:ring-white/10">
            {t("badge")}
          </div>
          <h1 className="text-3xl font-bold leading-tight text-slate-900 dark:text-white">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{t("title")}</span>
          </h1>
          <p className="text-sm text-muted-foreground">{t("desc")}</p>
          {error && (
            <div className="mt-1 rounded-xl border border-red-200/70 bg-red-50/80 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
              {error}
            </div>
          )}
          {message && (
            <div className="mt-1 rounded-xl border border-emerald-200/70 bg-emerald-50/80 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
              {message}
            </div>
          )}
        </div>
      </div>

      <form
        className="relative space-y-4 overflow-hidden rounded-2xl border border-white/60 bg-white/70 p-6 shadow-lg shadow-slate-900/10 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-900/70 dark:shadow-black/40"
        onSubmit={async (e) => {
          e.preventDefault();
          await handleSubmit(e.currentTarget);
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/10 via-white/8 to-indigo-500/10" />
        <div className="relative grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-xs">{t("fields.targetUser")}</Label>
            <select
              className="w-full rounded-xl border border-white/60 bg-white/80 px-3 py-2 text-sm shadow-inner shadow-slate-900/5 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/70"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name || u.email || t("common.unnamed")}
                </option>
              ))}
            </select>
          </div>
          <div />
          <div className="space-y-1">
            <Label className="text-xs">{t("fields.title")}</Label>
            <Input name="title" required className="rounded-xl" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{t("fields.type")}</Label>
            <select
              name="type"
              className="w-full rounded-xl border border-white/60 bg-white/80 px-3 py-2 text-sm shadow-inner shadow-slate-900/5 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/70"
            >
              <option value="diagnosis">{t("fields.types.diagnosis")}</option>
              <option value="review">{t("fields.types.review")}</option>
            </select>
          </div>
          <div className="md:col-span-2 space-y-1">
            <Label className="text-xs">{t("fields.upload")}</Label>
            <Input type="file" name="file" accept=".pdf" required className="rounded-xl" />
          </div>
        </div>

        <Button
          type="submit"
          disabled={saving}
          className="w-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-600/35"
        >
          {saving ? t("cta.submitting") : t("cta.submit")}
        </Button>
      </form>
    </div>
  );
}
