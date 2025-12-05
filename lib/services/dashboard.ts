import { db } from "@/lib/db";
import { contentSchedule, inquiryStat, keywordRanking, report, trafficStat } from "@/lib/db/schema";
import { ensureTenantForUser, listTenantsForUser } from "@/lib/db/tenant";
import { and, asc, desc, eq, gte, inArray } from "drizzle-orm";

type DashboardOverviewParams = {
  userId: string;
  tenantId?: string;
  options?: {
    lookbackMonths?: number;
    keywordLimit?: number;
    includePosts?: boolean;
    includeLatestReport?: boolean;
  };
};

export async function getDashboardOverview({ userId, tenantId, options }: DashboardOverviewParams) {
  const { tenantId: resolvedTenantId } = await ensureTenantForUser(userId, tenantId);
  const lookbackMonths = options?.lookbackMonths ?? 6;
  const keywordLimit = options?.keywordLimit ?? 20;
  const includePosts = options?.includePosts ?? false;
  const includeLatestReport = options?.includeLatestReport ?? false;

  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - lookbackMonths, now.getUTCDate()));
  const startStr = start.toISOString().slice(0, 10);

  const inquiriesPromise = db
    .select({
      id: inquiryStat.id,
      tenantId: inquiryStat.tenantId,
      period: inquiryStat.period,
      count: inquiryStat.count,
    })
    .from(inquiryStat)
    .where(and(eq(inquiryStat.tenantId, resolvedTenantId), gte(inquiryStat.period, startStr)))
    .orderBy(asc(inquiryStat.period))
    .limit(120);

  const trafficPromise = db
    .select({
      id: trafficStat.id,
      tenantId: trafficStat.tenantId,
      period: trafficStat.period,
      clicks: trafficStat.clicks,
      impressions: trafficStat.impressions,
      ctr: trafficStat.ctr,
      position: trafficStat.position,
    })
    .from(trafficStat)
    .where(and(eq(trafficStat.tenantId, resolvedTenantId), gte(trafficStat.period, startStr)))
    .orderBy(asc(trafficStat.period))
    .limit(120);

  const keywordsPromise = db
    .select({
      id: keywordRanking.id,
      tenantId: keywordRanking.tenantId,
      keyword: keywordRanking.keyword,
      targetUrl: keywordRanking.targetUrl,
      rank: keywordRanking.rank,
      rankDelta: keywordRanking.rankDelta,
      capturedAt: keywordRanking.capturedAt,
    })
    .from(keywordRanking)
    .where(eq(keywordRanking.tenantId, resolvedTenantId))
    .orderBy(asc(keywordRanking.rank))
    .limit(keywordLimit);

  const postsPromise = includePosts
    ? db
        .select({
          id: contentSchedule.id,
          title: contentSchedule.title,
          slug: contentSchedule.slug,
          publishDate: contentSchedule.publishDate,
          status: contentSchedule.status,
          platform: contentSchedule.platform,
          fileUrl: contentSchedule.fileUrl,
        })
        .from(contentSchedule)
        .where(
          and(
            eq(contentSchedule.tenantId, resolvedTenantId),
            inArray(contentSchedule.status, ["ready", "published", "draft"]),
            gte(contentSchedule.publishDate, startStr)
          )
        )
        .orderBy(desc(contentSchedule.publishDate))
        .limit(20)
    : Promise.resolve([] as any[]);

  const latestReportPromise = includeLatestReport
    ? db
        .select({
          id: report.id,
          title: report.title,
          periodEnd: report.periodEnd,
          createdAt: report.createdAt,
          fileUrl: report.fileUrl,
        })
        .from(report)
        .where(eq(report.tenantId, resolvedTenantId))
        .orderBy(desc(report.createdAt))
        .limit(1)
    : Promise.resolve([] as any[]);

  const [inquiries, traffic, keywords, posts, latestReport] = await Promise.all([
    inquiriesPromise,
    trafficPromise,
    keywordsPromise,
    postsPromise,
    latestReportPromise,
  ]);

  return { tenantId: resolvedTenantId, inquiries, traffic, keywords, posts, latestReport: latestReport[0] || null };
}

type CompanyDashboardParams = {
  userId: string;
  tenantIds?: string[];
  options?: {
    includeTraffic?: boolean;
    includeKeywords?: boolean;
    lookbackMonths?: number;
  };
};

export async function getCompanyDashboardOverview({ userId, tenantIds, options }: CompanyDashboardParams) {
  const includeTraffic = options?.includeTraffic ?? false;
  const includeKeywords = options?.includeKeywords ?? false;
  const lookbackMonths = options?.lookbackMonths ?? 6;

  // If caller already resolved tenantIds, skip extra ensure/list to reduce DB churn.
  const tenantList =
    tenantIds && tenantIds.length
      ? tenantIds
      : (await (async () => {
          await ensureTenantForUser(userId);
          return (await listTenantsForUser(userId)).map((t) => t.id);
        })());
  if (!tenantList.length) {
    return { tenantIds: [], inquiries: [], traffic, keywords: [], posts: [], latestReport: null };
  }

  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - lookbackMonths, now.getUTCDate()));
  const startStr = start.toISOString().slice(0, 10);

  const inquiriesPromise = db
    .select({
      id: inquiryStat.id,
      tenantId: inquiryStat.tenantId,
      period: inquiryStat.period,
      count: inquiryStat.count,
    })
    .from(inquiryStat)
    .where(and(inArray(inquiryStat.tenantId, tenantList), gte(inquiryStat.period, startStr)))
    .orderBy(asc(inquiryStat.period))
    .limit(120);

  const trafficPromise = includeTraffic
    ? db
        .select({
          id: trafficStat.id,
          tenantId: trafficStat.tenantId,
          period: trafficStat.period,
          clicks: trafficStat.clicks,
          impressions: trafficStat.impressions,
          ctr: trafficStat.ctr,
          position: trafficStat.position,
        })
        .from(trafficStat)
        .where(and(inArray(trafficStat.tenantId, tenantList), gte(trafficStat.period, startStr)))
        .orderBy(asc(trafficStat.period))
        .limit(120)
    : Promise.resolve([] as any[]);

  const keywordsPromise = includeKeywords
    ? db
        .select({
          id: keywordRanking.id,
          tenantId: keywordRanking.tenantId,
          keyword: keywordRanking.keyword,
          targetUrl: keywordRanking.targetUrl,
          rank: keywordRanking.rank,
          rankDelta: keywordRanking.rankDelta,
          capturedAt: keywordRanking.capturedAt,
        })
        .from(keywordRanking)
        .where(inArray(keywordRanking.tenantId, tenantList))
        .orderBy(asc(keywordRanking.rank))
        .limit(30)
    : Promise.resolve([] as any[]);

  const postsPromise = db
    .select({
      id: contentSchedule.id,
      title: contentSchedule.title,
      slug: contentSchedule.slug,
      publishDate: contentSchedule.publishDate,
      status: contentSchedule.status,
      platform: contentSchedule.platform,
      fileUrl: contentSchedule.fileUrl,
      tenantId: contentSchedule.tenantId,
    })
    .from(contentSchedule)
    .where(
      and(
        inArray(contentSchedule.tenantId, tenantList),
        inArray(contentSchedule.status, ["ready", "published", "draft"]),
        gte(contentSchedule.publishDate, startStr)
      )
    )
    .orderBy(desc(contentSchedule.publishDate))
    .limit(30);

  const latestReportPromise = db
    .select({
      id: report.id,
      title: report.title,
      periodEnd: report.periodEnd,
      createdAt: report.createdAt,
      fileUrl: report.fileUrl,
    })
    .from(report)
    .where(inArray(report.tenantId, tenantList))
    .orderBy(desc(report.createdAt))
    .limit(1);

  const [inquiries, traffic, keywords, posts, latestReport] = await Promise.all([
    inquiriesPromise,
    trafficPromise,
    keywordsPromise,
    postsPromise,
    latestReportPromise,
  ]);

  return {
    tenantIds: tenantList,
    inquiries,
    traffic,
    keywords,
    posts,
    latestReport: latestReport[0] || null,
  };
}
