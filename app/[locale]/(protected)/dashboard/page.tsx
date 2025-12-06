import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { CalendarRange, FileText, MessageCircle, TrendingUp } from "lucide-react";
import { auth } from "@/lib/auth";
import { listTenantsForUser } from "@/lib/db/tenant";
import { getCompanyDashboardOverview } from "@/lib/services/dashboard";
import { CopyWechatButton } from "@/components/copy-wechat-button";

function normalizeDate(value?: string | Date | null) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return value.slice(0, 10);
}

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: headers() });
  if (!session?.session?.userId) {
    redirect("/login");
  }

  const tenantIdsPromise = listTenantsForUser(session.session.userId).then((items) => items.map((t) => t.id));
  const overviewPromise = tenantIdsPromise.then((tenantIds) =>
    getCompanyDashboardOverview({
      userId: session.session.userId,
      tenantIds,
      options: {
        includeTraffic: false,
        includeKeywords: false,
        lookbackMonths: 3,
      },
    })
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50/60 px-4 py-6 text-foreground dark:bg-black md:px-8 lg:px-10">
      <div className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-blue-500/15 blur-[120px] dark:opacity-0" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-6%] h-72 w-72 rounded-full bg-indigo-500/15 blur-[140px] dark:opacity-0" />
      <div className="pointer-events-none absolute inset-0 bg-[url('/noise.webp')] opacity-[0.04] dark:opacity-0" />

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent overviewPromise={overviewPromise} />
      </Suspense>
    </div>
  );
}

async function DashboardContent({
  overviewPromise,
}: {
  overviewPromise: ReturnType<typeof getCompanyDashboardOverview>;
}) {
  const [t, overview] = await Promise.all([
    getTranslations("dashboard.home"),
    overviewPromise,
  ]);

  const siteCountText = t("subtitle", { count: overview.tenantIds.length || 1 });
  const monthPrefix = (() => {
    const now = new Date();
    return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  })();

  const currentMonthInquiries = overview.inquiries.reduce((sum, row) => {
    const date = normalizeDate(row.period as unknown as string | Date | null);
    if (date?.startsWith(monthPrefix)) {
      return sum + (Number(row.count) || 0);
    }
    return sum;
  }, 0);
  const currentMonthArticles = overview.posts
    .map((row) => normalizeDate(row.publishDate as unknown as string | Date | null))
    .filter((date) => date?.startsWith(monthPrefix)).length;

  const latestReportDate = normalizeDate(overview.latestReport?.periodEnd || overview.latestReport?.createdAt);

  const cardClass =
    "group relative overflow-hidden rounded-2xl border border-white/60 bg-white/70 p-6 shadow-lg shadow-slate-900/10 backdrop-blur-xl transition-all hover:-translate-y-1 hover:shadow-2xl dark:border-slate-800/70 dark:bg-slate-900/70 dark:shadow-black/40";

  return (
    <>
      <div className="relative mb-6 flex flex-col gap-4 rounded-3xl border border-white/60 bg-white/70 p-6 shadow-xl shadow-slate-900/10 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-900/70 dark:shadow-black/40 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-700 ring-1 ring-white/70 backdrop-blur-sm dark:bg-blue-900/40 dark:text-blue-200 dark:ring-white/10">
            Realtime
          </div>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-slate-900 dark:text-white md:text-4xl">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Dashboard</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("welcome")} · {siteCountText}
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Link href="/dashboard/analytics" className={cardClass}>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/12 via-white/10 to-indigo-500/10" />
          <div className="relative flex h-full flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-lg font-semibold text-foreground">{t("inquiriesTitle")}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t("inquiriesDesc")}</p>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200">
                <TrendingUp className="h-5 w-5" />
              </span>
            </div>
            <div className="text-5xl font-bold text-slate-900 dark:text-white">{currentMonthInquiries}</div>
          </div>
        </Link>

        <Link href="/dashboard/calendar" className={cardClass}>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-500/12 via-white/10 to-blue-500/10" />
          <div className="relative flex h-full flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-lg font-semibold text-foreground">{t("calendarTitle")}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t("calendarDesc")}</p>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200">
                <CalendarRange className="h-5 w-5" />
              </span>
            </div>
            <div className="text-5xl font-bold text-slate-900 dark:text-white">{currentMonthArticles}</div>
          </div>
        </Link>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Link href="/dashboard/reports" className={cardClass}>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/10 via-white/8 to-slate-100/30 dark:from-blue-500/12 dark:via-slate-900/30 dark:to-indigo-500/10" />
          <div className="relative flex h-full flex-col justify-between">
            <div className="flex items-start justify-between">
              <p className="text-lg font-semibold text-foreground">{t("reportsTitle")}</p>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800/80 dark:text-slate-200">
                <FileText className="h-5 w-5" />
              </span>
            </div>
            {overview.latestReport ? (
              <div className="rounded-xl border border-white/60 bg-white/70 p-4 text-sm shadow-sm dark:border-slate-800/70 dark:bg-slate-900/70">
                <p className="font-semibold text-foreground">{overview.latestReport.title}</p>
                {latestReportDate && <p className="mt-1 text-muted-foreground">{latestReportDate}</p>}
                <span className="mt-2 inline-flex text-sm font-semibold text-blue-600 dark:text-blue-300">{t("reportsDesc")}</span>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t("noReport")}</p>
            )}
          </div>
        </Link>

        <div className={cardClass}>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-500/12 via-white/8 to-blue-500/10" />
          <div className="relative flex h-full flex-col justify-between">
            <div className="flex items-start justify-between">
              <p className="text-lg font-semibold text-foreground">{t("expertTitle")}</p>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800/80 dark:text-slate-200">
                <MessageCircle className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{t("expertDesc")}</p>
            <CopyWechatButton
              className="mt-6"
              text="lsiy_lee"
              label={t("copyWechat")}
              successLabel={t("copied")}
              failureLabel={t("copyFailed")}
            />
          </div>
        </div>
      </div>
    </>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-24 w-full animate-pulse rounded-3xl bg-white/60 shadow-inner shadow-slate-900/10 backdrop-blur-md dark:bg-slate-900/60" />
      <div className="grid gap-4 lg:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-56 animate-pulse rounded-2xl border border-white/60 bg-white/60 shadow-inner shadow-slate-900/10 backdrop-blur-md dark:border-slate-800/70 dark:bg-slate-900/60" />
        ))}
      </div>
    </div>
  );
}
