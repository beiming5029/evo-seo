"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MessageCircle } from "lucide-react";

const baseNavItems = [
  { key: "home", label: "主页", path: "" },
  { key: "analytics", label: "效果看板", path: "/analytics" },
  { key: "calendar", label: "内容日历", path: "/calendar" },
  { key: "reports", label: "服务报告", path: "/reports" },
  { key: "settings", label: "设置", path: "/settings" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  const pathname = usePathname();
  const navItems = baseNavItems;

  return (
    <div className="flex min-h-screen flex-row bg-background/80">
      <aside className="sticky top-0 hidden h-screen w-56 flex-shrink-0 border-r border-border/60 bg-card/50 p-4 md:flex md:flex-col">
        <div className="mb-6 flex items-center gap-2 text-base font-semibold text-foreground">
          <div className="h-8 w-8 rounded-lg bg-foreground flex items-center justify-center text-sm font-bold text-background">E</div>
          <span className="text-lg font-semibold">evoSEO</span>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const href = `/${locale}/dashboard${item.path}`;
            const active =
              pathname === href ||
              (item.path !== "" && pathname.startsWith(`/${locale}/dashboard${item.path}`));
            return (
              <Link
                key={item.key}
                href={href}
                className={cn(
                  "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        {/* <div className="mt-auto">
          <div className="rounded-xl border border-border bg-white p-3 text-left shadow-sm">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-foreground" />
              <p className="text-sm font-semibold text-foreground">24/7 专家客服</p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">随时为您提供专业支持</p>
            <Link
              href="/contact"
              className="mt-3 inline-flex w-full justify-center rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background"
            >
              开始咨询
            </Link>
          </div>
        </div> */}
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  );
}
