"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { IconLayoutDashboard, IconLogout } from "@tabler/icons-react";

export function UserMenu() {
  const session = useSession();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);

  if (session.isPending) {
    return <div className="h-6 w-6 rounded-full bg-muted animate-pulse" />;
  }

  if (!session.data?.user) {
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

  const user = session.data.user;
  const initial = user.name
    ? user.name.charAt(0).toUpperCase()
    : user.email.charAt(0).toUpperCase();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-xs text-white ring-1 ring-transparent transition-all hover:ring-blue-500/50"
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
              href={`/${locale}/dashboard`}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-hover"
            >
              <IconLayoutDashboard className="h-4 w-4" />
              {t("navigation.main.dashboard")}
            </Link>

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
