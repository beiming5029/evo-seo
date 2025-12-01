"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { IconLayoutDashboard, IconLogout, IconSettings } from "@tabler/icons-react";

export function UserMenu() {
  const session = useSession();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const user = session.data?.user;

  // 补充 role 缺失的情况
  useEffect(() => {
    let mounted = true;
    const mark = (val: boolean) => {
      if (mounted) setIsAdmin(val);
    };
    if (!user) {
      mark(false);
      return () => {
        mounted = false;
      };
    }
    const role = (user as { role?: string } | undefined)?.role;
    if (role) {
      mark(role === "admin");
      return () => {
        mounted = false;
      };
    }
    const check = async () => {
      try {
        const res = await fetch("/api/user/admin-status");
        if (!res.ok) return;
        const data = await res.json();
        mark(Boolean(data.isAdmin));
      } catch (error) {
        console.error("Failed to fetch admin status", error);
      }
    };
    check();
    return () => {
      mounted = false;
    };
  }, [user]);

  if (session.isPending) {
    return <div className="h-6 w-6 rounded-full bg-muted animate-pulse" />;
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href={`/${locale}/login`}
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {t("common.actions.signIn")}
        </Link>
        <Link
          href={`/${locale}/signup`}
          className="rounded-full bg-primary px-4 py-1.5 text-sm text-primary-foreground transition-opacity hover:opacity-90"
        >
          {t("common.actions.signUp")}
        </Link>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  const initial = user.name
    ? user.name.charAt(0).toUpperCase()
    : user.email.charAt(0).toUpperCase();

  const entryPath = isAdmin ? "/admin" : "/dashboard";
  const entryLabel = isAdmin ? "管理后台" : t("navigation.main.dashboard");

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-xs ring-1 ring-transparent transition-all hover:ring-blue-500/50"
      >
        {user.image ? (
          <img
            src={user.image}
            alt={user.name || "User"}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          initial
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 min-w-[12rem] max-w-[18rem] rounded-lg border border-border bg-popover py-1 shadow-navbar">
            <div className="border-border px-4 py-2">
              <p className="break-words text-sm font-medium text-foreground">
                {user.name || user.email}
              </p>
              {user.name && (
                <p className="mt-0.5 break-words text-xs text-muted-foreground">
                  {user.email}
                </p>
              )}
            </div>

            <Link
              href={`/${locale}${entryPath}`}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-hover"
            >
              <IconLayoutDashboard className="h-4 w-4" />
              {entryLabel}
            </Link>
            {isAdmin && (
              <Link
                href={`/${locale}/dashboard`}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-hover"
              >
                <IconSettings className="h-4 w-4" />
                仪表盘
              </Link>
            )}

            <div className="border-t border-border pt-1">
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-hover"
              >
                <IconLogout className="h-4 w-4" />
                {t("common.actions.signOut")}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
