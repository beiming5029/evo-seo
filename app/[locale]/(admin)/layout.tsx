"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const navItems = [
  { key: "home", label: "概览", path: "/admin" },
  { key: "users", label: "用户管理", path: "/admin/users" },
  { key: "account", label: "用户信息变更", path: "/admin/account" },
  // { key: "import", label: "数据导入", path: "/admin/import" },
  { key: "adminData", label: "管理员上传", path: "/admin/admin-data" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const session = useSession();
  const user = session.data?.user;
  const [adminChecked, setAdminChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

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
    <div className="flex min-h-screen flex-row bg-background/80">
      <aside className="sticky top-0 hidden h-screen w-56 flex-shrink-0 border-r border-border/60 bg-card/50 p-4 md:flex md:flex-col">
        <Link
          href={`/${locale}/`}
          className="mb-6 flex items-center gap-2 text-base font-semibold text-foreground"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-sm font-bold text-background">
            E
          </div>
          <span className="text-lg font-semibold">evoSEO</span>
        </Link>
        <nav className="space-y-1">
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
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  );
}
