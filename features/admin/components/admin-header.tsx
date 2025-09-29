"use client";

import { ModeToggle } from "@/components/mode-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useTranslations } from "next-intl";
import { UserMenu } from "@/features/navigation/components/user-menu";
import { Shield } from "lucide-react";

export function AdminHeader() {
  const tSidebar = useTranslations("Admin.sidebar");

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black">
      <div className="flex items-center justify-between px-8 py-4 gap-6">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-black dark:text-white">
            {tSidebar("title")}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <Shield className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
          <LanguageSwitcher />
          <ModeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
