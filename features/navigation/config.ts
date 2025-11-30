import type { NavigationItem } from "./types";

type NavigationKeyItem = {
  key: string;
  href: string;
  subItems?: Array<{ key: string; href: string; icon?: string }>;
};

// These are the navigation keys for translation
export const marketingNavigationKeys: NavigationKeyItem[] = [
  // {
  //   key: "pricing",
  //   href: "/pricing",
  // },
  {
    key: "dashboard",
    href: "/dashboard",
  },
  {
    key: "blog",
    href: "/blog",
  },
  {
    key: "contact",
    href: "/contact",
  },
];

export const appNavigationKeys: NavigationKeyItem[] = [
  {
    key: "dashboard",
    href: "/dashboard",
  },
];

// Legacy exports for compatibility
export const marketingNavigation: NavigationItem[] = [
  {
    title: "Pricing",
    href: "/pricing",
  },
  {
    title: "Blog",
    href: "/blog",
  },
  {
    title: "Contact",
    href: "/contact",
  },
];

export const appNavigation: NavigationItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
  },
];
