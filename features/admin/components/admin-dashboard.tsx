"use client";

import { useTranslations } from "next-intl";
import {
  Users,
  CreditCard,
  TrendingUp,
  MessageSquare,
  Database,
  Activity
} from "lucide-react";
import Link from "next/link";
import { useLocale } from "next-intl";

interface AdminDashboardProps {
  stats: {
    totalUsers: number;
    activeUsers: number;
    totalPayments: number;
    totalRevenue: number;
    totalChats: number;
    totalCreditsUsed: number;
  };
  recentUsers: any[];
  recentPayments: any[];
}

export function AdminDashboard({ stats, recentUsers, recentPayments }: AdminDashboardProps) {
  const t = useTranslations("Admin.dashboard");
  const locale = useLocale();

  const statCards = [
    {
      title: t("totalUsers"),
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: "bg-gray-700 dark:bg-gray-600",
      link: `/admin/users`
    },
    {
      title: t("activeUsers"),
      value: stats.activeUsers.toLocaleString(),
      icon: Activity,
      color: "bg-gray-600 dark:bg-gray-700",
      link: `/admin/users`
    },
    {
      title: t("totalRevenue"),
      value: `¥${stats.totalRevenue.toFixed(2)}`,
      icon: CreditCard,
      color: "bg-gray-700 dark:bg-gray-600",
      link: `/admin/credits`
    },
    {
      title: t("totalPayments"),
      value: stats.totalPayments.toLocaleString(),
      icon: TrendingUp,
      color: "bg-gray-600 dark:bg-gray-700",
      link: `/admin/subscriptions`
    },
    {
      title: t("totalChats"),
      value: stats.totalChats.toLocaleString(),
      icon: MessageSquare,
      color: "bg-gray-700 dark:bg-gray-600",
      link: `/admin/credits`
    },
    {
      title: t("creditsUsed"),
      value: stats.totalCreditsUsed.toLocaleString(),
      icon: Database,
      color: "bg-gray-600 dark:bg-gray-700",
      link: `/admin/credits`
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t("title")}
        </h1>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {new Date().toLocaleDateString(locale, { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </span>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.title}
              href={`/${locale}${stat.link}`}
              className="bg-white dark:bg-neutral-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 最近的用户和支付 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 最近注册的用户 */}
        <div className="bg-white dark:bg-black rounded-lg border border-neutral-200 dark:border-neutral-800">
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
            <h3 className="font-semibold text-black dark:text-white">
              {t("recentUsers")}
            </h3>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-black dark:text-white">
                      {user.name}
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {user.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs rounded ${
                      user.role === 'admin' 
                        ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-medium'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}>
                      {user.role}
                    </span>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      {t("credits")}: {user.credits}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href={`/${locale}/admin/users`}
              className="block mt-4 text-center text-sm text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:underline"
            >
              {t("viewAllUsers")}
            </Link>
          </div>
        </div>

        {/* 最近的支付 */}
        <div className="bg-white dark:bg-black rounded-lg border border-neutral-200 dark:border-neutral-800">
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
            <h3 className="font-semibold text-black dark:text-white">
              {t("recentPayments")}
            </h3>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {recentPayments.map((payment: any) => (
                <div key={payment.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-black dark:text-white">
                      {payment.userName || t("unknownUser")}
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {payment.type}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-black dark:text-white">
                      ¥{(payment.amountCents / 100).toFixed(2)}
                    </p>
                    <span className={`text-xs ${
                      payment.status === 'succeeded'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-neutral-500 dark:text-neutral-400'
                    }`}>
                      {payment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href={`/${locale}/admin/subscriptions`}
              className="block mt-4 text-center text-sm text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:underline"
            >
              {t("viewAllPayments")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}