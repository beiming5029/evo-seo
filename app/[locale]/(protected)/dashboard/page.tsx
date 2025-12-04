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

  const tenants = await listTenantsForUser(session.session.userId);
  const overviewPromise = getCompanyDashboardOverview({
    userId: session.session.userId,
  });

  return (
    <div className="min-h-screen bg-background p-6 text-foreground md:p-8">
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent
          overviewPromise={overviewPromise}
          tenants={tenants}
        />
      </Suspense>
    </div>
  );
}

async function DashboardContent({
  overviewPromise,
  tenants,
}: {
  overviewPromise: ReturnType<typeof getCompanyDashboardOverview>;
  tenants: Awaited<ReturnType<typeof listTenantsForUser>>;
}) {
  const t = await getTranslations("dashboard.home");
  const overview = await overviewPromise;
  const siteCountText = t("subtitle", { count: tenants.length || 1 });
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
    "group relative flex h-56 flex-col justify-between rounded-xl border border-border bg-background p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md";

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold md:text-4xl">Dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("welcome")}，{siteCountText}
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Link href="/dashboard/analytics" className={cardClass}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-lg font-semibold">{t("inquiriesTitle")}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t("inquiriesDesc")}</p>
            </div>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="text-5xl font-bold">{currentMonthInquiries}</div>
        </Link>

        <Link href="/dashboard/calendar" className={cardClass}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-lg font-semibold">{t("calendarTitle")}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t("calendarDesc")}</p>
            </div>
            <CalendarRange className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="text-5xl font-bold">{currentMonthArticles}</div>
        </Link>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Link href="/dashboard/reports" className={cardClass}>
          <div className="flex items-start justify-between">
            <p className="text-lg font-semibold">{t("reportsTitle")}</p>
            <FileText className="h-5 w-5 text-muted-foreground" />
          </div>
          {overview.latestReport ? (
            <div className="rounded-lg border border-border/70 bg-muted/30 p-4 text-sm">
              <p className="font-semibold text-foreground">{overview.latestReport.title}</p>
              {latestReportDate && <p className="mt-1 text-muted-foreground">{latestReportDate}</p>}
              <span className="mt-2 inline-flex text-primary">{t("reportsDesc")}</span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t("noReport")}</p>
          )}
        </Link>

        <div className={cardClass}>
          <div className="flex items-start justify-between">
            <p className="text-lg font-semibold">{t("expertTitle")}</p>
            <MessageCircle className="h-5 w-5 text-muted-foreground" />
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
    </>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-48 animate-pulse rounded-md bg-muted" />
      <div className="grid gap-4 lg:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-56 rounded-xl border border-border bg-muted/40" />
        ))}
      </div>
    </div>
  );
}
