import type { NavigationItem } from "./types";

// These are the navigation keys for translation
export const marketingNavigationKeys = [
  {
    key: "pricing",
    href: "/pricing",
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

export const appNavigationKeys = [
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
