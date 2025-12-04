import { db } from "@/lib/db";
import { contentSchedule, inquiryStat, keywordRanking, report, trafficStat } from "@/lib/db/schema";
import { ensureTenantForUser, listTenantsForUser } from "@/lib/db/tenant";
import { and, asc, desc, eq, gte, inArray } from "drizzle-orm";

type DashboardOverviewParams = {
  userId: string;
  tenantId?: string;
};

export async function getDashboardOverview({ userId, tenantId }: DashboardOverviewParams) {
  const { tenantId: resolvedTenantId } = await ensureTenantForUser(userId, tenantId);
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 6, now.getUTCDate()));
  const startStr = start.toISOString().slice(0, 10);

  const [inquiries, traffic, keywords, posts, latestReport] = await Promise.all([
    db
      .select({
        id: inquiryStat.id,
        tenantId: inquiryStat.tenantId,
        period: inquiryStat.period,
        count: inquiryStat.count,
      })
      .from(inquiryStat)
      .where(and(eq(inquiryStat.tenantId, resolvedTenantId), gte(inquiryStat.period, startStr)))
      .orderBy(asc(inquiryStat.period))
      .limit(120),
    db
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
      .limit(120),
    db
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
      .limit(20),
    db
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
      .limit(20),
    db
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
      .limit(1),
  ]);

  return { tenantId: resolvedTenantId, inquiries, traffic, keywords, posts, latestReport: latestReport[0] || null };
}

type CompanyDashboardParams = {
  userId: string;
  tenantIds?: string[];
};

export async function getCompanyDashboardOverview({ userId, tenantIds }: CompanyDashboardParams) {
  await ensureTenantForUser(userId);
  const tenantList = tenantIds ?? (await listTenantsForUser(userId)).map((t) => t.id);
  if (!tenantList.length) {
    return { tenantIds: [], inquiries: [], traffic: [], keywords: [], posts: [], latestReport: null };
  }

  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 6, now.getUTCDate()));
  const startStr = start.toISOString().slice(0, 10);

  const [inquiries, traffic, keywords, posts, latestReport] = await Promise.all([
    db
      .select({
        id: inquiryStat.id,
        tenantId: inquiryStat.tenantId,
        period: inquiryStat.period,
        count: inquiryStat.count,
      })
      .from(inquiryStat)
      .where(and(inArray(inquiryStat.tenantId, tenantList), gte(inquiryStat.period, startStr)))
      .orderBy(asc(inquiryStat.period))
      .limit(120),
    db
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
      .limit(120),
    db
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
      .limit(30),
    db
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
      .limit(30),
    db
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
      .limit(1),
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
