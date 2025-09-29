"use client";

import { useState } from "react";

import { motion, AnimatePresence, useMotionValueEvent, useScroll } from "framer-motion";
import { useTranslations } from "next-intl";

import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import type { NavigationItem } from "@/features/navigation/types";
import { marketingNavigationKeys } from "@/features/navigation/config";

import { NavBarItem } from "./navbar-item";
import { NavBarItemWithDropdown } from "./navbar-item-with-dropdown";
import {
  UserMenu,
} from "./user-menu";

type Props = {
  navItems?: NavigationItem[];
};

export const DesktopNavbar = ({ navItems }: Props) => {
  const t = useTranslations('navigation.main');
  const { scrollY } = useScroll();

  const [showBackground, setShowBackground] = useState(false);

  useMotionValueEvent(scrollY, "change", (value) => {
    if (value > 100) {
      setShowBackground(true);
    } else {
      setShowBackground(false);
    }
  });
  return (
    <div
      className={cn(
        "w-full flex relative justify-between px-4 py-2 rounded-full bg-transparent transition duration-200",
        showBackground &&
          "bg-neutral-50 dark:bg-neutral-900 shadow-[0px_-2px_0px_0px_var(--neutral-100),0px_2px_0px_0px_var(--neutral-100)] dark:shadow-[0px_-2px_0px_0px_var(--neutral-800),0px_2px_0px_0px_var(--neutral-800)]"
      )}
    >
      <AnimatePresence>
        {showBackground && (
          <motion.div
            key={String(showBackground)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 1,
            }}
            className="absolute inset-0 h-full w-full bg-neutral-100 dark:bg-neutral-800 pointer-events-none [mask-image:linear-gradient(to_bottom,white,transparent,white)] rounded-full"
          />
        )}
      </AnimatePresence>
      <div className="flex flex-row gap-2 items-center">
        <Logo />
        <div className="flex items-center gap-1.5">
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
              <NavBarItem href={item.href} key={item.key}>
                {t(item.key)}
              </NavBarItem>
            )
          ))}
        </div>
      </div>
      <div className="flex space-x-2 items-center">
        <LanguageSwitcher />
        <ModeToggle />
        <UserMenu />
      </div>
    </div>
  );
};
