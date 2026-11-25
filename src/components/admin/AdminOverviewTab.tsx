"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  CheckCircle2,
  Cpu,
  ExternalLink,
  FolderKanban,
  Mail,
  Plus,
  Sparkles,
  UserCircle2,
  AlertTriangle,
} from "lucide-react";
import type { AdminTabKey } from "@/components/admin/AdminSidebarShell";
import { Badge } from "@/components/ui/Badge";
import { BrutalButton } from "@/components/ui/BrutalButton";
import { BrutalCard } from "@/components/ui/BrutalCard";
import type {
  AnalyticsSummary,
  ChatInsightsSummary,
  ContactMessage,
  Experience,
  Profile,
  Project,
  TechCapability,
} from "@/types/portfolio";

interface AdminOverviewTabProps {
  profile: Profile;
  projects: Project[];
  capabilities: TechCapability[];
  experiences: Experience[];
  messages: ContactMessage[];
  analytics: AnalyticsSummary;
  chatInsights: ChatInsightsSummary;
  schemaReady: boolean;
  onNavigate: (tab: AdminTabKey) => void;
  onCreateNewProject: () => void;
}

function formatShortTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}

export function AdminOverviewTab({
  profile,
  projects,
  capabilities,
  experiences,
  messages,
  analytics,
  chatInsights,
  schemaReady,
  onNavigate,
  onCreateNewProject,
}: AdminOverviewTabProps) {
  const publishedProjects = projects.filter((p) => p.published).length;
  const unreadMessages = messages.filter((m) => !m.is_read).length;
  const combinedViews = analytics.totalPageViews + analytics.totalProjectViews;
  const latestMessages = messages.slice(0, 3);
  const latestChats = chatInsights.recentLogs.slice(0, 3);

  const firstName = profile.full_name.split(" ")[0] || "Admin";

  return (
    <div className="space-y-6">
      {/* Executive Welcome Banner */}
      <BrutalCard className="w-full min-w-0 p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge variant={profile.is_available ? "solid" : "outline"}>
                {profile.is_available
                  ? profile.availability_status_en
                  : "NOT AVAILABLE"}
              </Badge>
              <span className="font-mono text-[11px] uppercase tracking-wider text-muted">
                {profile.location}
              </span>
            </div>
            <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
              Welcome back, {firstName}.
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-muted">
              Manage your live portfolio projects, track recruiter traffic, audit
              AI chatbot conversations, and respond to inquiries from one control
              center.
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2.5">
            <BrutalButton
              size="sm"
              onClick={onCreateNewProject}
              className="flex-1 sm:flex-none"
            >
              <Plus className="h-4 w-4" />
              <span>New Project</span>
            </BrutalButton>
            <Link
              href="/cv"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[38px] flex-1 items-center justify-center gap-1.5 border-2 border-borderline bg-canvas px-3.5 py-2 font-mono text-xs font-bold uppercase tracking-wider text-ink transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-sm sm:flex-none"
            >
              <span>Preview CV</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </BrutalCard>

      {/* 4 Interactive KPI Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {[
          {
            label: "COMBINED VIEWS",
            value: String(combinedViews),
            sub: `${analytics.viewsLast7Days} in last 7 days`,
            icon: BarChart3,
            tab: "analytics" as AdminTabKey,
          },
          {
            label: "PROJECTS",
            value: `${publishedProjects}/${projects.length}`,
            sub: `${analytics.totalCvDownloads} CV downloads`,
            icon: FolderKanban,
            tab: "projects" as AdminTabKey,
          },
          {
            label: "AI CHAT QUESTIONS",
            value: String(chatInsights.totalChats),
            sub: chatInsights.tableReady
              ? `${chatInsights.aiSuccessRate}% Gemini live`
              : "Setup chat_logs SQL",
            icon: Sparkles,
            tab: "chat" as AdminTabKey,
          },
          {
            label: "INBOX MESSAGES",
            value: String(messages.length),
            sub:
              unreadMessages > 0
                ? `${unreadMessages} unread waiting`
                : "All messages read",
            icon: Mail,
            tab: "messages" as AdminTabKey,
          },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <button
              key={kpi.label}
              type="button"
              onClick={() => onNavigate(kpi.tab)}
              className="group w-full min-w-0 border-2 border-borderline bg-surface p-4 text-left shadow-brutal transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 sm:p-5"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <span className="font-mono text-[10px] font-bold uppercase leading-tight tracking-wider text-muted sm:text-[11px]">
                  {kpi.label}
                </span>
                <Icon className="h-4 w-4 shrink-0 text-muted transition-colors group-hover:text-ink" />
              </div>
              <p className="font-display text-2xl font-bold text-ink sm:text-3xl">
                {kpi.value}
              </p>
              <div className="mt-2 flex items-center justify-between gap-1 font-mono text-[10px] text-muted sm:text-[11px]">
                <span className="truncate">{kpi.sub}</span>
                <ArrowRight className="h-3 w-3 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:text-ink" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Middle Row: Quick Actions + System Health */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Quick CMS Shortcuts */}
        <BrutalCard className="w-full min-w-0 p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-2 border-b-2 border-borderline pb-3">
            <h3 className="font-display text-base font-bold text-ink sm:text-lg">
              Quick Management
            </h3>
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted">
              CMS SHORTCUTS
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              {
                title: "Manage Projects & Galleries",
                desc: `${publishedProjects} published case studies live`,
                icon: FolderKanban,
                action: () => onNavigate("projects"),
              },
              {
                title: "Edit Profile, Photo & CV",
                desc: "Update bio, status & GitHub top-3 picks",
                icon: UserCircle2,
                action: () => onNavigate("profile"),
              },
              {
                title: "Update Tech Stack Matrix",
                desc: `${capabilities.length} capability quadrants active`,
                icon: Cpu,
                action: () => onNavigate("capabilities"),
              },
              {
                title: "Experience & Education",
                desc: `${experiences.length} timeline entries listed`,
                icon: Briefcase,
                action: () => onNavigate("experience"),
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.title}
                  type="button"
                  onClick={item.action}
                  className="group flex min-w-0 items-start gap-3 border-2 border-borderline bg-canvas p-3.5 text-left transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-surface hover:shadow-brutal-sm"
                >
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center border-2 border-borderline bg-surface text-ink group-hover:bg-ink group-hover:text-canvas">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-sm font-bold text-ink">
                      {item.title}
                    </p>
                    <p className="mt-0.5 truncate font-mono text-[11px] text-muted">
                      {item.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </BrutalCard>

        {/* System & Integration Health */}
        <BrutalCard className="w-full min-w-0 p-5">
          <div className="mb-4 flex items-center justify-between gap-2 border-b-2 border-borderline pb-3">
            <h3 className="font-display text-base font-bold text-ink sm:text-lg">
              System Status
            </h3>
            <Badge variant={schemaReady ? "solid" : "outline"}>
              {schemaReady ? "ONLINE" : "CHECK"}
            </Badge>
          </div>

          <ul className="space-y-2.5 font-mono text-xs">
            {[
              {
                label: "Core CMS Tables",
                ok: schemaReady,
                statusText: schemaReady ? "Connected" : "Setup Needed",
                tab: "projects" as AdminTabKey,
              },
              {
                label: "Visitor Analytics",
                ok: analytics.tableReady,
                statusText: analytics.tableReady ? "Tracking" : "SQL Pending",
                tab: "analytics" as AdminTabKey,
              },
              {
                label: "AI Chat Insights",
                ok: chatInsights.tableReady,
                statusText: chatInsights.tableReady ? "Logging" : "SQL Pending",
                tab: "chat" as AdminTabKey,
              },
              {
                label: "Hire Availability",
                ok: profile.is_available,
                statusText: profile.is_available ? "Open" : "Closed",
                tab: "profile" as AdminTabKey,
              },
            ].map((row) => (
              <li key={row.label}>
                <button
                  type="button"
                  onClick={() => onNavigate(row.tab)}
                  className="flex w-full items-center justify-between gap-2 border border-borderline/25 bg-canvas px-3 py-2 text-left transition-colors hover:border-borderline"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    {row.ok ? (
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-ink" />
                    ) : (
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-muted" />
                    )}
                    <span className="truncate font-semibold text-ink">
                      {row.label}
                    </span>
                  </span>
                  <span className="shrink-0 text-[10px] font-bold uppercase text-muted">
                    {row.statusText}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </BrutalCard>
      </div>

      {/* Bottom Row: Recent Inbox + Recent AI Chatbot Questions */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Recent Inbox */}
        <BrutalCard className="w-full min-w-0 p-5">
          <div className="mb-4 flex items-center justify-between gap-2 border-b-2 border-borderline pb-3">
            <h3 className="font-display text-base font-bold text-ink sm:text-lg">
              Latest Inbox Messages
            </h3>
            <button
              type="button"
              onClick={() => onNavigate("messages")}
              className="inline-flex items-center gap-1 font-mono text-[11px] font-bold uppercase tracking-wider text-muted hover:text-ink"
            >
              <span>View All</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {latestMessages.length === 0 ? (
            <p className="py-4 font-mono text-xs text-muted">
              No contact messages received yet.
            </p>
          ) : (
            <div className="space-y-2.5">
              {latestMessages.map((msg) => (
                <button
                  key={msg.id}
                  type="button"
                  onClick={() => onNavigate("messages")}
                  className="block w-full border-2 border-borderline bg-canvas p-3 text-left transition-colors hover:bg-surface"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-display text-sm font-bold text-ink">
                      {msg.subject}
                    </span>
                    {!msg.is_read && <Badge variant="solid">NEW</Badge>}
                  </div>
                  <p className="mt-0.5 truncate font-mono text-[11px] text-muted">
                    {msg.name} · {formatShortTime(msg.created_at)}
                  </p>
                </button>
              ))}
            </div>
          )}
        </BrutalCard>

        {/* Recent AI Chatbot Questions */}
        <BrutalCard className="w-full min-w-0 p-5">
          <div className="mb-4 flex items-center justify-between gap-2 border-b-2 border-borderline pb-3">
            <h3 className="font-display text-base font-bold text-ink sm:text-lg">
              Latest AI Chat Questions
            </h3>
            <button
              type="button"
              onClick={() => onNavigate("chat")}
              className="inline-flex items-center gap-1 font-mono text-[11px] font-bold uppercase tracking-wider text-muted hover:text-ink"
            >
              <span>View All</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {!chatInsights.tableReady ? (
            <p className="py-4 font-mono text-xs text-muted">
              Run the <code>chat_logs</code> SQL in Supabase to start recording
              visitor questions here.
            </p>
          ) : latestChats.length === 0 ? (
            <p className="py-4 font-mono text-xs text-muted">
              No chatbot questions recorded yet.
            </p>
          ) : (
            <div className="space-y-2.5">
              {latestChats.map((log) => (
                <button
                  key={log.id}
                  type="button"
                  onClick={() => onNavigate("chat")}
                  className="block w-full border-2 border-borderline bg-canvas p-3 text-left transition-colors hover:bg-surface"
                >
                  <p className="line-clamp-2 text-xs font-semibold text-ink">
                    “{log.question}”
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5 font-mono text-[10px] text-muted">
                    <span className="border border-borderline/40 px-1.5 py-0.5 uppercase">
                      {log.topic}
                    </span>
                    <span>{log.model_used}</span>
                    <span>· {formatShortTime(log.created_at)}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </BrutalCard>
      </div>
    </div>
  );
}
