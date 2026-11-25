import { cache } from "react";
import {
  FALLBACK_CAPABILITIES,
  FALLBACK_EXPERIENCES,
  FALLBACK_PORTFOLIO_DATA,
  FALLBACK_PROFILE,
  FALLBACK_PROJECTS,
} from "@/data/seed-data";
import {
  createEmptyAnalyticsSummary,
  summarizeAnalyticsEvents,
} from "@/lib/analytics-server";
import {
  createEmptyChatInsightsSummary,
  summarizeChatLogs,
} from "@/lib/chat-insights-server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  AnalyticsEventRow,
  AnalyticsSummary,
  ChatInsightsSummary,
  ChatLogRow,
  ContactMessage,
  Experience,
  PortfolioData,
  Profile,
  Project,
  TechCapability,
} from "@/types/portfolio";

export const getPortfolioData = cache(async (): Promise<PortfolioData> => {
  if (!isSupabaseConfigured()) {
    return FALLBACK_PORTFOLIO_DATA;
  }

  try {
    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      return FALLBACK_PORTFOLIO_DATA;
    }

    const [profileRes, projectsRes, capabilitiesRes, experiencesRes] =
      await Promise.all([
        supabase.from("profile").select("*").limit(1).maybeSingle(),
        supabase
          .from("projects")
          .select("*")
          .eq("published", true)
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: false }),
        supabase
          .from("tech_capabilities")
          .select("*")
          .order("sort_order", { ascending: true }),
        supabase
          .from("experiences")
          .select("*")
          .eq("published", true)
          .order("sort_order", { ascending: true }),
      ]);

    const anyFatalError =
      profileRes.error && projectsRes.error && capabilitiesRes.error;

    if (anyFatalError) {
      return FALLBACK_PORTFOLIO_DATA;
    }

    return {
      profile: (profileRes.data as Profile | null) ?? FALLBACK_PROFILE,
      projects:
        projectsRes.data && projectsRes.data.length > 0
          ? (projectsRes.data as Project[])
          : projectsRes.error
            ? FALLBACK_PROJECTS
            : [],
      capabilities: capabilitiesRes.error
        ? FALLBACK_CAPABILITIES
        : ((capabilitiesRes.data as TechCapability[]) ?? []),
      experiences: experiencesRes.error
        ? FALLBACK_EXPERIENCES
        : ((experiencesRes.data as Experience[]) ?? []),
      source: "supabase",
    };
  } catch {
    return FALLBACK_PORTFOLIO_DATA;
  }
});

export async function getPublishedProjectBySlug(slug: string): Promise<{
  project: Project | null;
  prevProject: Project | null;
  nextProject: Project | null;
  profile: Profile;
  hasExperiences: boolean;
}> {
  const data = await getPortfolioData();
  const index = data.projects.findIndex((p) => p.slug === slug);

  if (index === -1) {
    return {
      project: null,
      prevProject: null,
      nextProject: null,
      profile: data.profile,
      hasExperiences: data.experiences.length > 0,
    };
  }

  return {
    project: data.projects[index],
    prevProject: index > 0 ? data.projects[index - 1] : null,
    nextProject: index < data.projects.length - 1 ? data.projects[index + 1] : null,
    profile: data.profile,
    hasExperiences: data.experiences.length > 0,
  };
}

export async function getAdminPortfolioData(): Promise<{
  profile: Profile;
  projects: Project[];
  capabilities: TechCapability[];
  experiences: Experience[];
  messages: ContactMessage[];
  analytics: AnalyticsSummary;
  chatInsights: ChatInsightsSummary;
  schemaReady: boolean;
}> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return {
      profile: FALLBACK_PROFILE,
      projects: FALLBACK_PROJECTS,
      capabilities: FALLBACK_CAPABILITIES,
      experiences: FALLBACK_EXPERIENCES,
      messages: [],
      analytics: createEmptyAnalyticsSummary(false),
      chatInsights: createEmptyChatInsightsSummary(false),
      schemaReady: false,
    };
  }

  const [
    profileRes,
    projectsRes,
    capabilitiesRes,
    experiencesRes,
    messagesRes,
    analyticsRes,
    chatLogsRes,
  ] = await Promise.all([
    supabase.from("profile").select("*").limit(1).maybeSingle(),
    supabase
      .from("projects")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false }),
    supabase
      .from("tech_capabilities")
      .select("*")
      .order("sort_order", { ascending: true }),
    supabase
      .from("experiences")
      .select("*")
      .order("sort_order", { ascending: true }),
    supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("analytics_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5000),
    supabase
      .from("chat_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(2000),
  ]);

  const schemaReady =
    !profileRes.error &&
    !projectsRes.error &&
    !capabilitiesRes.error &&
    !experiencesRes.error &&
    !messagesRes.error;

  const projects = (projectsRes.data as Project[] | null) ?? [];
  const analytics = analyticsRes.error
    ? createEmptyAnalyticsSummary(false)
    : summarizeAnalyticsEvents(
        (analyticsRes.data as AnalyticsEventRow[] | null) ?? [],
        projects,
        true
      );
  const chatInsights = chatLogsRes.error
    ? createEmptyChatInsightsSummary(false)
    : summarizeChatLogs(
        (chatLogsRes.data as ChatLogRow[] | null) ?? [],
        true
      );

  return {
    profile: (profileRes.data as Profile | null) ?? FALLBACK_PROFILE,
    projects,
    capabilities: (capabilitiesRes.data as TechCapability[] | null) ?? [],
    experiences: (experiencesRes.data as Experience[] | null) ?? [],
    messages: (messagesRes.data as ContactMessage[] | null) ?? [],
    analytics,
    chatInsights,
    schemaReady,
  };
}
