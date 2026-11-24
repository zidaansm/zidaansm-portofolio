import type {
  AnalyticsDailyPoint,
  AnalyticsEventRow,
  AnalyticsSummary,
  Project,
} from "@/types/portfolio";

export function createEmptyAnalyticsSummary(tableReady: boolean): AnalyticsSummary {
  return {
    tableReady,
    totalPageViews: 0,
    totalProjectViews: 0,
    totalCvDownloads: 0,
    viewsLast7Days: 0,
    dailyTrend: buildLast14DaysSkeleton(),
    topProjects: [],
    topReferrers: [],
    deviceBreakdown: { desktop: 0, mobile: 0, tablet: 0 },
  };
}

function buildLast14DaysSkeleton(): AnalyticsDailyPoint[] {
  const days: AnalyticsDailyPoint[] = [];
  const now = new Date();
  for (let offset = 13; offset >= 0; offset -= 1) {
    const d = new Date(now);
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCDate(d.getUTCDate() - offset);
    const isoDate = d.toISOString().slice(0, 10);
    const label = isoDate.slice(5); // MM-DD
    days.push({ date: isoDate, label, views: 0, cvDownloads: 0 });
  }
  return days;
}

export function summarizeAnalyticsEvents(
  events: AnalyticsEventRow[],
  projects: Pick<Project, "slug" | "title_en">[],
  tableReady = true
): AnalyticsSummary {
  const summary = createEmptyAnalyticsSummary(tableReady);
  if (events.length === 0) {
    return summary;
  }

  const projectTitleBySlug = new Map(
    projects.map((project) => [project.slug, project.title_en])
  );
  const dailyMap = new Map<string, AnalyticsDailyPoint>(
    summary.dailyTrend.map((point) => [point.date, point])
  );
  const projectCounts = new Map<string, number>();
  const referrerCounts = new Map<string, number>();

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  for (const row of events) {
    const createdMs = Date.parse(row.created_at);
    const dayKey = row.created_at.slice(0, 10);
    const bucket = dailyMap.get(dayKey);

    if (row.event_type === "page_view") {
      summary.totalPageViews += 1;
      if (bucket) bucket.views += 1;
      if (!Number.isNaN(createdMs) && createdMs >= sevenDaysAgo) {
        summary.viewsLast7Days += 1;
      }
    } else if (row.event_type === "project_view") {
      summary.totalProjectViews += 1;
      if (bucket) bucket.views += 1;
      if (!Number.isNaN(createdMs) && createdMs >= sevenDaysAgo) {
        summary.viewsLast7Days += 1;
      }
      if (row.project_slug) {
        projectCounts.set(
          row.project_slug,
          (projectCounts.get(row.project_slug) ?? 0) + 1
        );
      }
    } else if (row.event_type === "cv_download") {
      summary.totalCvDownloads += 1;
      if (bucket) bucket.cvDownloads += 1;
    }

    const host = (row.referrer_host || "direct").trim() || "direct";
    referrerCounts.set(host, (referrerCounts.get(host) ?? 0) + 1);

    if (row.device_type === "mobile") {
      summary.deviceBreakdown.mobile += 1;
    } else if (row.device_type === "tablet") {
      summary.deviceBreakdown.tablet += 1;
    } else {
      summary.deviceBreakdown.desktop += 1;
    }
  }

  summary.topProjects = Array.from(projectCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([slug, views]) => ({
      slug,
      title: projectTitleBySlug.get(slug) || slug,
      views,
    }));

  summary.topReferrers = Array.from(referrerCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([host, count]) => ({ host, count }));

  return summary;
}
