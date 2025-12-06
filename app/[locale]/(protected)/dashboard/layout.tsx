"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  LineChart,
  CalendarDays,
  FileText,
  Settings,
} from "lucide-react";

const baseNavKeys = ["home", "analytics", "calendar", "reports", "settings"] as const;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("dashboard.nav");
  const navItems = baseNavKeys.map((key) => ({
    key,
    label: t(key),
    path: key === "home" ? "" : `/${key}`,
  }));

  const navIcons: Record<(typeof baseNavKeys)[number], React.ReactNode> = {
    home: <LayoutDashboard className="h-4 w-4" />,
    analytics: <LineChart className="h-4 w-4" />,
    calendar: <CalendarDays className="h-4 w-4" />,
    reports: <FileText className="h-4 w-4" />,
    settings: <Settings className="h-4 w-4" />,
  };

  // 兼容场景：usePathname 可能返回不含 locale 的路径
  const normalizedPath = (() => {
    const match = pathname.match(/^\/[^/]+(\/.*)$/);
    return match ? match[1] : pathname;
  })();

  return (
    <div className="relative flex min-h-screen flex-row bg-slate-50/60 text-foreground dark:bg-black">
      <div className="pointer-events-none absolute -left-20 top-16 h-64 w-64 rounded-full bg-blue-500/15 blur-[120px] dark:opacity-0" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-8%] h-72 w-72 rounded-full bg-indigo-500/18 blur-[140px] dark:opacity-0" />
      <div className="pointer-events-none absolute inset-0 bg-[url('/noise.webp')] opacity-[0.04] dark:opacity-0" />

      <aside className="sticky top-0 hidden h-screen w-60 flex-shrink-0 border-r border-white/40 bg-white/70 p-5 backdrop-blur-xl shadow-[10px_0_40px_-24px_rgba(15,23,42,0.25)] dark:border-slate-800/60 dark:bg-slate-900/70 md:flex md:flex-col">
        <Link
          href={`/${locale}/`}
          className="mb-8 flex items-center gap-3 text-base font-semibold text-foreground"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-lg shadow-indigo-500/25">
            E
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-lg font-bold text-slate-900 dark:text-white">evoSEO</span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-300">
              Vibrant
            </span>
          </div>
        </Link>
        <nav className="space-y-2">
          {navItems.map((item) => {
            const href = `/${locale}/dashboard${item.path}`;
            const active =
              normalizedPath === `/dashboard${item.path}` ||
              (item.path !== "" && normalizedPath.startsWith(`/dashboard${item.path}`));
            return (
              <Link
                key={item.key}
                href={href}
                prefetch
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200",
                  active
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/30"
                    : "text-slate-500 hover:bg-white/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg border border-transparent",
                    active
                      ? "bg-white/10 text-white"
                      : "bg-slate-100 text-slate-700 dark:bg-slate-800/80 dark:text-slate-200"
                  )}
                >
                  {navIcons[item.key]}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="relative flex-1">{children}</main>
    </div>
  );
}
