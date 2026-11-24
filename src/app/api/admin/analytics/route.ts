import { NextResponse } from "next/server";
import {
  createEmptyAnalyticsSummary,
  summarizeAnalyticsEvents,
} from "@/lib/analytics-server";
import { requireAdmin } from "@/lib/supabase/admin-auth";
import type { AnalyticsEventRow, Project } from "@/types/portfolio";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  const [eventsRes, projectsRes] = await Promise.all([
    auth.supabase
      .from("analytics_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5000),
    auth.supabase.from("projects").select("slug, title_en"),
  ]);

  if (eventsRes.error) {
    return NextResponse.json({
      analytics: createEmptyAnalyticsSummary(false),
    });
  }

  const analytics = summarizeAnalyticsEvents(
    (eventsRes.data as AnalyticsEventRow[] | null) ?? [],
    (projectsRes.data as Pick<Project, "slug" | "title_en">[] | null) ?? [],
    true
  );

  return NextResponse.json({ analytics });
}

export async function DELETE() {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  const { error } = await auth.supabase
    .from("analytics_events")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    analytics: createEmptyAnalyticsSummary(true),
  });
}
