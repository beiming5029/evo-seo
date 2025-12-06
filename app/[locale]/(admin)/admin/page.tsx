"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { IconDatabaseImport, IconUpload, IconUsers } from "@tabler/icons-react";

export default function AdminHomePage() {
  const t = useTranslations("adminPortal.home");

  const cards = [
    {
      key: "users",
      href: "/admin/users",
      icon: <IconUsers className="h-5 w-5" />,
      gradient: "from-blue-500/14 via-white/10 to-indigo-500/12",
    },
    {
      key: "account",
      href: "/admin/account",
      icon: <IconDatabaseImport className="h-5 w-5" />,
      gradient: "from-emerald-500/14 via-white/10 to-blue-500/12",
    },
    {
      key: "adminData",
      href: "/admin/admin-data",
      icon: <IconUpload className="h-5 w-5" />,
      gradient: "from-indigo-500/14 via-white/10 to-blue-500/12",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50/60 px-4 py-6 text-foreground dark:bg-black md:px-8 lg:px-10">
      <div className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-blue-500/15 blur-[120px] dark:opacity-0" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-6%] h-72 w-72 rounded-full bg-indigo-500/15 blur-[140px] dark:opacity-0" />
      <div className="pointer-events-none absolute inset-0 bg-[url('/noise.webp')] opacity-[0.04] dark:opacity-0" />

      <div className="relative mb-6 overflow-hidden rounded-3xl border border-white/60 bg-white/70 p-6 shadow-xl shadow-slate-900/10 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-900/70 dark:shadow-black/40">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/12 via-white/10 to-indigo-500/10" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-700 ring-1 ring-white/70 backdrop-blur-sm dark:bg-blue-900/40 dark:text-blue-200 dark:ring-white/10">
            {t("badge")}
          </div>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-slate-900 dark:text-white">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{t("title")}</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("desc")}</p>
        </div>
      </div>

      <div className="relative grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group relative flex h-full flex-col gap-3 overflow-hidden rounded-2xl border border-white/60 bg-white/70 p-5 shadow-lg shadow-slate-900/10 backdrop-blur-xl transition-all hover:-translate-y-1 hover:shadow-2xl dark:border-slate-800/70 dark:bg-slate-900/70 dark:shadow-black/40"
          >
            <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${item.gradient}`} />
            <div className="relative flex items-start justify-between gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/70 text-blue-700 ring-1 ring-white/70 shadow-sm dark:bg-slate-800/80 dark:text-blue-200 dark:ring-white/10">
                {item.icon}
              </div>
            </div>
            <div className="relative">
              <p className="text-lg font-semibold text-foreground">{t(`cards.${item.key}.title`)}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t(`cards.${item.key}.desc`)}</p>
            </div>
            <span className="relative inline-flex w-fit items-center gap-1 rounded-full bg-slate-900/5 px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-white/70 transition group-hover:translate-x-0.5 group-hover:text-slate-900 dark:bg-white/10 dark:text-slate-200 dark:ring-white/10">
              {t("enter")}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
