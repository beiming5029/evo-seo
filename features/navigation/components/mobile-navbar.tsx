"use client";

import { useState } from "react";

import { useMotionValueEvent, useScroll } from "framer-motion";
import { IoIosClose, IoIosMenu } from "react-icons/io";
import { Link } from "next-view-transitions";
import { ChevronRight, MessageSquare, Image as ImageIcon, Video } from "lucide-react";

import { Button } from "@/components/button";
import { Logo } from "@/components/Logo";
import { ModeToggle } from "@/components/mode-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from 'next-intl';
import { cn } from "@/lib/utils";
import type { NavigationItem } from "@/features/navigation/types";
import { marketingNavigationKeys, appNavigationKeys } from "@/features/navigation/config";

const iconMap = {
  MessageSquare: MessageSquare,
  Image: ImageIcon,
  Video: Video,
};

export const MobileNavbar = () => {
  const [open, setOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const session = useSession();
  const router = useRouter();
  const locale = useLocale();
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
        "flex justify-between bg-white dark:bg-neutral-900 items-center w-full rounded-full px-2.5 py-1.5 transition duration-200",
        showBackground &&
          "bg-neutral-50 dark:bg-neutral-900 shadow-[0px_-2px_0px_0px_var(--neutral-100),0px_2px_0px_0px_var(--neutral-100)] dark:shadow-[0px_-2px_0px_0px_var(--neutral-800),0px_2px_0px_0px_var(--neutral-800)]"
      )}
    >
      <Logo />
      <IoIosMenu
        className="text-black dark:text-white h-6 w-6"
        onClick={() => setOpen(!open)}
      />
      {open && (
        <div className="fixed inset-0 bg-white dark:bg-black z-50 flex flex-col items-start justify-start space-y-10  pt-5  text-xl text-zinc-600  transition duration-200 hover:text-zinc-800">
          <div className="flex items-center justify-between w-full px-5">
            <Logo />
            <div className="flex items-center space-x-2">
              <ModeToggle />
              <IoIosClose
                className="h-8 w-8 text-black dark:text-white"
                onClick={() => setOpen(!open)}
              />
            </div>
          </div>
          <div className="flex flex-col items-start justify-start gap-[14px] px-8">
            {marketingNavigationKeys.map((navItem) => (
              <div key={navItem.key}>
                {navItem.subItems ? (
                  <>
                    <button
                      onClick={() => {
                        setExpandedItems(prev => 
                          prev.includes(navItem.key) 
                            ? prev.filter(item => item !== navItem.key)
                            : [...prev, navItem.key]
                        );
                      }}
                      className="flex items-center gap-2 text-[26px] text-black dark:text-white"
                    >
                      {t(navItem.key)}
                      <ChevronRight 
                        className={cn(
                          "w-5 h-5 transition-transform",
                          expandedItems.includes(navItem.key) && "rotate-90"
                        )}
                      />
                    </button>
                    {expandedItems.includes(navItem.key) && (
                      <div className="ml-4 mt-2 space-y-2">
                        {navItem.subItems.map((subItem) => {
                          const IconComponent = subItem.icon ? iconMap[subItem.icon as keyof typeof iconMap] : null;
                          return (
                            <Link
                              key={subItem.key}
                              href={`/${locale}${subItem.href}`}
                              onClick={() => setOpen(false)}
                              className="flex items-center gap-3 py-1"
                            >
                              {IconComponent && (
                                <IconComponent className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                              )}
                              <span className="text-lg text-gray-700 dark:text-gray-300">
                                {t(subItem.key)}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={`/${locale}${navItem.href}`}
                    onClick={() => setOpen(false)}
                    className="relative"
                  >
                    <span className="block text-[26px] text-black dark:text-white">
                      {t(navItem.key)}
                    </span>
                  </Link>
                )}
              </div>
            ))}
          </div>
          <div className="flex flex-col w-full items-start gap-2.5 px-8 py-4">
            <div className="w-full mb-4">
              <LanguageSwitcher />
            </div>
            {session.data?.user ? (
              <>
                <div className="flex flex-col gap-3 w-full">
                  <div className="pb-3 border-b border-gray-200 dark:border-gray-800">
                    <p className="text-base font-medium text-gray-900 dark:text-white">
                      {session.data.user.name || session.data.user.email}
                    </p>
                    {session.data.user.name && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {session.data.user.email}
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/${locale}/dashboard`}
                    onClick={() => setOpen(false)}
                    className="text-base text-gray-700 dark:text-gray-300"
                  >
                    {t('dashboard')}
                  </Link>
                  <Link
                    href={`/${locale}/profile`}
                    onClick={() => setOpen(false)}
                    className="text-base text-gray-700 dark:text-gray-300"
                  >
                    {t('profile')}
                  </Link>
                  <button
                    onClick={async () => {
                      await signOut();
                      setOpen(false);
                      router.push("/");
                      router.refresh();
                    }}
                    className="text-base text-gray-700 dark:text-gray-300 text-left"
                  >
                    {t('common.actions.signOut', {ns: 'common'})}
                  </button>
                </div>
              </>
            ) : (
              <>
                <Button as={Link} href={`/${locale}/signup`} onClick={() => setOpen(false)}>
                  {t('common.actions.signUp', {ns: 'common'})}
                </Button>
                <Button variant="simple" as={Link} href={`/${locale}/login`} onClick={() => setOpen(false)}>
                  {t('common.actions.signIn', {ns: 'common'})}
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
