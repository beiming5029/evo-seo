"use client";

import { useState } from "react";

import { motion, AnimatePresence, useMotionValueEvent, useScroll } from "framer-motion";
import { useTranslations } from "next-intl";

import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { marketingNavigationKeys } from "@/features/navigation/config";
import { NavBarItem } from "./navbar-item";
import { NavBarItemWithDropdown } from "./navbar-item-with-dropdown";

import {
  UserMenu,
} from "./user-menu";

export const DesktopNavbar = () => {
  const t = useTranslations('navigation.main');
  const { scrollY } = useScroll();

  const [showBackground, setShowBackground] = useState(false);

  useMotionValueEvent(scrollY, "change", (value) => {
    if (value > 50) {
      setShowBackground(true);
    } else {
      setShowBackground(false);
    }
  });
  return (
    <div
      className={cn(
        "w-full flex relative justify-between px-6 py-3 transition-all duration-300 ease-in-out",
        showBackground
          ? "bg-background/70 backdrop-blur-lg shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="flex flex-row gap-2 items-center z-50">
        <Logo />
        <nav className="hidden md:flex items-center gap-1 ml-8">
          {marketingNavigationKeys.map((item) => (
            item.subItems ? (
              <NavBarItemWithDropdown
                key={item.key}
                itemKey={item.key}
                href={item.href}
                subItems={item.subItems}
              >
                {t(item.key)}
              </NavBarItemWithDropdown>
            ) : (
              <NavBarItem key={item.key} href={item.href}>
                {t(item.key)}
              </NavBarItem>
            )
          ))}
        </nav>
      </div>
      <div className="flex space-x-2 items-center z-50">
        <LanguageSwitcher />
        <ModeToggle />
        <UserMenu />
      </div>
    </div>
  );
};
