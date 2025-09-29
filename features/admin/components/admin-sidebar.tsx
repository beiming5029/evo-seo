"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  Users,
  Home,
  ShoppingCart,
  Database
} from "lucide-react";
import { cn } from "@/lib/utils";

const adminNavItems = [
  {
    title: "dashboard",
    href: "/admin",
    icon: Home,
  },
  {
    title: "users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "subscriptions",
    href: "/admin/subscriptions",
    icon: ShoppingCart,
  },
  {
    title: "credits",
    href: "/admin/credits",
    icon: Database,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("Admin.sidebar");

  return (
    <div className="w-64 bg-white dark:bg-black border-r border-neutral-200 dark:border-neutral-800 sticky top-0">
      <div className="flex h-screen flex-col">
        <div className="px-6 pt-16 pb-8 border-b border-neutral-200 dark:border-neutral-800">
          <Link
            href={`/${locale}/dashboard`}
            className="flex items-center gap-2 justify-center w-full rounded-lg border border-neutral-200 dark:border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 hover:text-black dark:hover:text-white transition-colors"
          >
            <Home className="h-4 w-4" />
            {t("backToDashboard")}
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const href = `/${locale}${item.href}`;
            const isActive = pathname === href || pathname.startsWith(href + "/");

            return (
              <Link
                key={item.href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white"
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900 hover:text-black dark:hover:text-white"
                )}
              >
                <Icon className="h-5 w-5" />
                {t(item.title)}
              </Link>
            );
          })}
        </nav>

      </div>
    </div>
  );
}
