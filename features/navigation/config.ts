import type { NavigationItem } from "./types";

type NavigationKeyItem = {
  key: string;
  href: string;
  subItems?: Array<{ key: string; href: string; icon?: string }>;
};

// These are the navigation keys for translation
export const marketingNavigationKeys: NavigationKeyItem[] = [
  {
    key: "features",
    href: "/#features",
  },
  {
    key: "services",
    href: "/#services",
  },
  {
    key: "results",
    href: "/#results",
  },
  {
    key: "contact",
    href: "/#contact",
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
    title: "Features",
    href: "/#features",
  },
  {
    title: "Services",
    href: "/#services",
  },
  {
    title: "Results",
    href: "/#results",
  },
  {
    title: "Contact",
    href: "/#contact",
  },
];

export const appNavigation: NavigationItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
  },
];
