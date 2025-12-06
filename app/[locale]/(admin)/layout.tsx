"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const navItems = [
  { key: "home", path: "/admin" },
  { key: "users", path: "/admin/users" },
  { key: "account", path: "/admin/account" },
  { key: "adminData", path: "/admin/admin-data" },
  { key: "serviceReports", path: "/admin/service-reports" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const session = useSession();
  const user = session.data?.user;
  const [adminChecked, setAdminChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const tNav = useTranslations("adminPortal.nav");

  useEffect(() => {
    const check = async () => {
      if (session.isPending) return;
      if (!user) {
        setAdminChecked(true);
        setIsAdmin(false);
        return;
      }
      try {
        const res = await fetch("/api/user/admin-status", { cache: "no-store" });
        const data = await res.json();
        setIsAdmin(Boolean(data?.isAdmin));
      } catch (err) {
        setIsAdmin(false);
      } finally {
        setAdminChecked(true);
      }
    };
    check();
  }, [session.isPending, user]);

  useEffect(() => {
    if (adminChecked && !isAdmin) {
      router.replace(`/${locale}/dashboard`);
    }
  }, [adminChecked, isAdmin, router, locale]);

  if (session.isPending || !adminChecked) return null;
  if (!user || !isAdmin) return null;

  return (
    <div className="relative flex min-h-screen flex-row bg-slate-50/60 text-foreground dark:bg-black">
      <div className="pointer-events-none absolute -left-24 top-16 h-64 w-64 rounded-full bg-blue-500/15 blur-[120px] dark:opacity-0" />
      <div className="pointer-events-none absolute bottom-[-12%] right-[-10%] h-72 w-72 rounded-full bg-indigo-500/18 blur-[140px] dark:opacity-0" />
      <div className="pointer-events-none absolute inset-0 bg-[url('/noise.webp')] opacity-[0.04] dark:opacity-0" />

      <aside className="sticky top-0 hidden h-screen w-60 flex-shrink-0 border-r border-white/10 bg-white/70 p-5 backdrop-blur-xl shadow-[10px_0_40px_-24px_rgba(15,23,42,0.25)] dark:border-slate-800/60 dark:bg-black md:flex md:flex-col">
        <Link
          href={`/${locale}/`}
          className="mb-8 flex items-center gap-3 text-base font-semibold text-foreground"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-lg shadow-indigo-500/25">
            E
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-lg font-bold text-slate-900 dark:text-white">evoSEO Admin</span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-300">
              Control
            </span>
          </div>
        </Link>
        <nav className="space-y-2">
          {navItems.map((item) => {
            const href = `/${locale}${item.path}`;
            const active =
              pathname === href ||
              (item.path !== "/admin" && pathname.startsWith(`${href}/`));
            return (
              <Link
                key={item.key}
                href={href}
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
                  {item.key === "home" ? "🏠" : item.key === "users" ? "👥" : item.key === "account" ? "🧾" : "📁"}
                </span>
                <span>{tNav(item.key as any)}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="relative flex-1">{children}</main>
    </div>
  );
}
