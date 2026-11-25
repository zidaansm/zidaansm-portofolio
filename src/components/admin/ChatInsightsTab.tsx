"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Bot,
  ChevronDown,
  ChevronUp,
  Clock,
  MessageSquare,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { BrutalButton } from "@/components/ui/BrutalButton";
import { BrutalCard } from "@/components/ui/BrutalCard";
import type { ChatInsightsSummary } from "@/types/portfolio";

interface ChatInsightsTabProps {
  chatInsights: ChatInsightsSummary;
  busy: boolean;
  onRefresh: () => void;
  onResetAll: () => void;
  onDeleteOne: (id: string) => void;
}

const TOPIC_LABEL_MAP: Record<string, string> = {
  projects: "Projects",
  tech_stack: "Tech Stack",
  contact_cv: "CV & Hiring",
  experience: "Experience",
  profile: "Profile",
  salary_private: "Salary / Private",
  other: "Other",
};

function formatTopicBadge(topic: string): string {
  return TOPIC_LABEL_MAP[topic] ?? topic;
}

function formatLatency(ms: number): string {
  if (!ms || ms <= 0) return "—";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatShortTimestamp(iso: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 16).replace("T", " ");
  }
}

export function ChatInsightsTab({
  chatInsights,
  busy,
  onRefresh,
  onResetAll,
  onDeleteOne,
}: ChatInsightsTabProps) {
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const filteredLogs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return chatInsights.recentLogs.filter((log) => {
      if (selectedTopic !== "all" && log.topic !== selectedTopic) {
        return false;
      }
      if (!query) return true;
      return (
        log.question.toLowerCase().includes(query) ||
        log.reply_preview.toLowerCase().includes(query) ||
        log.model_used.toLowerCase().includes(query) ||
        log.current_page.toLowerCase().includes(query)
      );
    });
  }, [chatInsights.recentLogs, searchQuery, selectedTopic]);

  function toggleReply(id: string) {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Section Header */}
      <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        <div className="min-w-0">
          <h2 className="font-display text-lg font-bold sm:text-xl">
            AI Chat Insights
          </h2>
          <p className="font-mono text-xs text-muted">
            Anonymous visitor questions asked to your Gemini chatbot (no IPs or personal data stored).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <BrutalButton
            variant="secondary"
            size="sm"
            disabled={busy}
            onClick={onRefresh}
            className="flex-1 sm:flex-none"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </BrutalButton>
          {chatInsights.tableReady && chatInsights.totalChats > 0 && (
            <BrutalButton
              variant="ghost"
              size="sm"
              disabled={busy}
              onClick={onResetAll}
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Reset</span>
            </BrutalButton>
          )}
        </div>
      </div>

      {!chatInsights.tableReady ? (
        <BrutalCard className="w-full min-w-0 p-4 font-mono text-xs sm:p-6">
          <div className="flex items-center gap-2 font-bold uppercase text-ink">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>Chat Insights Table Setup Needed</span>
          </div>
          <p className="mt-2 break-words leading-relaxed text-muted">
            Run section <code>7. chat_logs</code> from{" "}
            <code>supabase/schema.sql</code> in your Supabase SQL Editor, then
            click <strong>Refresh</strong> above to start logging anonymous
            visitor questions, topics, and model usage.
          </p>
        </BrutalCard>
      ) : (
        <>
          {/* 4 KPI Cards (2x2 Grid on Mobile) */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {[
              {
                label: "TOTAL QUESTIONS",
                value: String(chatInsights.totalChats),
                note: "All logged chatbot queries",
                icon: MessageSquare,
              },
              {
                label: "LAST 7 DAYS",
                value: String(chatInsights.chatsLast7Days),
                note: "Recent weekly chats",
                icon: Sparkles,
              },
              {
                label: "GEMINI AI RATE",
                value: `${chatInsights.aiSuccessRate}%`,
                note: "Live Gemini vs Smart Mode",
                icon: Bot,
              },
              {
                label: "AVG LATENCY",
                value: formatLatency(chatInsights.avgResponseMs),
                note: "Average reply speed",
                icon: Clock,
              },
            ].map((kpi) => {
              const Icon = kpi.icon;
              return (
                <BrutalCard
                  key={kpi.label}
                  className="w-full min-w-0 p-3.5 sm:p-5"
                >
                  <div className="mb-2 flex items-start justify-between gap-1">
                    <span className="font-mono text-[10px] font-bold uppercase leading-tight tracking-wider text-muted sm:text-[11px]">
                      {kpi.label}
                    </span>
                    <Icon className="h-3.5 w-3.5 shrink-0 text-muted sm:h-4 sm:w-4" />
                  </div>
                  <p className="font-display text-2xl font-bold text-ink sm:text-3xl">
                    {kpi.value}
                  </p>
                  <p className="mt-1 font-mono text-[10px] leading-snug text-muted sm:text-[11px]">
                    {kpi.note}
                  </p>
                </BrutalCard>
              );
            })}
          </div>

          {/* 14-Day Chat Activity Bar Chart */}
          <BrutalCard className="w-full min-w-0 max-w-full p-4 sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b-2 border-borderline pb-3 sm:mb-5">
              <h3 className="font-display text-base font-bold text-ink sm:text-lg">
                14-Day Chatbot Activity
              </h3>
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase text-muted sm:text-[11px]">
                <span className="inline-block h-2.5 w-2.5 bg-ink" />
                Questions / Day
              </span>
            </div>

            {(() => {
              const maxDaily = Math.max(
                1,
                ...chatInsights.dailyTrend.map((d) => d.chats)
              );
              return (
                <div className="w-full max-w-full overflow-x-auto pb-1">
                  <div className="grid min-w-[520px] grid-cols-[repeat(14,minmax(0,1fr))] gap-2">
                    {chatInsights.dailyTrend.map((day) => {
                      const heightPct = Math.max(
                        day.chats > 0 ? 14 : 4,
                        Math.round((day.chats / maxDaily) * 100)
                      );
                      return (
                        <div
                          key={day.date}
                          title={`${day.date}: ${day.chats} questions`}
                          className="flex flex-col items-center gap-1.5"
                        >
                          <span className="font-mono text-[10px] font-bold text-muted">
                            {day.chats > 0 ? day.chats : "·"}
                          </span>
                          <div className="flex h-24 w-full items-end border border-borderline/30 bg-canvas p-1">
                            <div
                              style={{ height: `${heightPct}%` }}
                              className={`w-full transition-all ${
                                day.chats > 0 ? "bg-ink" : "bg-borderline/20"
                              }`}
                            />
                          </div>
                          <span className="font-mono text-[9px] text-muted">
                            {day.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
            <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-muted sm:hidden">
              ← Swipe chart →
            </p>
          </BrutalCard>

          {/* Breakdowns Grid */}
          <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2">
            {/* Top Asked Topics */}
            <BrutalCard className="w-full min-w-0 p-4 sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-2 border-b-2 border-borderline pb-3">
                <h3 className="font-display text-base font-bold sm:text-lg">
                  Top Asked Topics
                </h3>
                {selectedTopic !== "all" && (
                  <button
                    type="button"
                    onClick={() => setSelectedTopic("all")}
                    className="font-mono text-[10px] font-bold uppercase underline underline-offset-2 text-muted hover:text-ink"
                  >
                    Clear filter
                  </button>
                )}
              </div>

              {chatInsights.topicBreakdown.length === 0 ? (
                <p className="font-mono text-xs text-muted">
                  No questions recorded yet. Try asking your chatbot on the
                  homepage!
                </p>
              ) : (
                <div className="space-y-3">
                  {(() => {
                    const maxTopic = Math.max(
                      1,
                      chatInsights.topicBreakdown[0]?.count ?? 1
                    );
                    return chatInsights.topicBreakdown.map((item) => {
                      const isSelected = selectedTopic === item.topic;
                      return (
                        <button
                          key={item.topic}
                          type="button"
                          onClick={() =>
                            setSelectedTopic((prev) =>
                              prev === item.topic ? "all" : item.topic
                            )
                          }
                          className={`block w-full space-y-1 text-left transition-opacity ${
                            selectedTopic !== "all" && !isSelected
                              ? "opacity-45 hover:opacity-80"
                              : "opacity-100"
                          }`}
                        >
                          <div className="flex min-w-0 items-center justify-between gap-2 font-mono text-xs">
                            <span className="truncate font-bold text-ink">
                              {item.label}
                            </span>
                            <span className="shrink-0 text-muted">
                              {item.count}
                            </span>
                          </div>
                          <div className="h-2.5 w-full border border-borderline bg-canvas">
                            <div
                              style={{
                                width: `${Math.round(
                                  (item.count / maxTopic) * 100
                                )}%`,
                              }}
                              className="h-full bg-ink"
                            />
                          </div>
                        </button>
                      );
                    });
                  })()}
                </div>
              )}
            </BrutalCard>

            {/* Models, Languages & Top Pages */}
            <BrutalCard className="w-full min-w-0 p-4 sm:p-6">
              <h3 className="mb-4 border-b-2 border-borderline pb-3 font-display text-base font-bold sm:text-lg">
                Models, Language &amp; Pages
              </h3>

              {/* Language Split */}
              <div className="mb-5 grid grid-cols-2 gap-2.5">
                {(
                  [
                    ["Bahasa ID", chatInsights.localeBreakdown.id],
                    ["English EN", chatInsights.localeBreakdown.en],
                  ] as const
                ).map(([label, count]) => (
                  <div
                    key={label}
                    className="min-w-0 border-2 border-borderline bg-canvas p-2.5 text-center sm:p-3"
                  >
                    <p className="truncate font-mono text-[10px] uppercase tracking-wider text-muted">
                      {label}
                    </p>
                    <p className="mt-1 font-display text-lg font-bold text-ink sm:text-xl">
                      {count}
                    </p>
                  </div>
                ))}
              </div>

              {/* Model Failover Usage */}
              <p className="mb-2 font-mono text-[11px] font-bold uppercase tracking-wider text-muted">
                MODEL USAGE (FAILOVER TELEMETRY)
              </p>
              {chatInsights.modelBreakdown.length === 0 ? (
                <p className="mb-4 font-mono text-xs text-muted">
                  No model telemetry yet.
                </p>
              ) : (
                <ul className="mb-5 space-y-1.5 font-mono text-xs">
                  {chatInsights.modelBreakdown.map((entry) => (
                    <li
                      key={entry.model}
                      className="flex min-w-0 items-center justify-between gap-2 border-b border-borderline/20 pb-1"
                    >
                      <span className="truncate text-ink">{entry.model}</span>
                      <span className="shrink-0 font-bold text-muted">
                        {entry.count}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Top Pages */}
              <p className="mb-2 font-mono text-[11px] font-bold uppercase tracking-wider text-muted">
                TOP PAGES STARTING CHAT
              </p>
              {chatInsights.topPages.length === 0 ? (
                <p className="font-mono text-xs text-muted">
                  No page context recorded yet.
                </p>
              ) : (
                <ul className="space-y-1.5 font-mono text-xs">
                  {chatInsights.topPages.map((entry) => (
                    <li
                      key={entry.page}
                      className="flex min-w-0 items-center justify-between gap-2 border-b border-borderline/20 pb-1"
                    >
                      <span className="truncate text-ink">{entry.page}</span>
                      <span className="shrink-0 font-bold text-muted">
                        {entry.count}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </BrutalCard>
          </div>

          {/* Recent Recruiter Questions Feed */}
          <BrutalCard className="w-full min-w-0 p-4 sm:p-6">
            <div className="mb-4 flex flex-col gap-3 border-b-2 border-borderline pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <h3 className="font-display text-base font-bold sm:text-lg">
                  Recent Visitor Questions ({filteredLogs.length})
                </h3>
                <p className="font-mono text-[11px] text-muted">
                  Use these insights to prep for interviews and improve missing portfolio details.
                </p>
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search questions or models..."
                  aria-label="Search chatbot questions"
                  className="w-full border-2 border-borderline bg-canvas py-1.5 pl-8 pr-3 text-base text-ink placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-ink sm:text-xs"
                />
              </div>
            </div>

            {/* Topic Filter Rail */}
            {chatInsights.topicBreakdown.length > 0 && (
              <div className="no-scrollbar mb-4 flex gap-1.5 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setSelectedTopic("all")}
                  className={`shrink-0 border-2 border-borderline px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-wider transition-colors ${
                    selectedTopic === "all"
                      ? "bg-ink text-canvas"
                      : "bg-canvas text-ink hover:bg-ink/5"
                  }`}
                >
                  All ({chatInsights.recentLogs.length})
                </button>
                {chatInsights.topicBreakdown.map((item) => (
                  <button
                    key={item.topic}
                    type="button"
                    onClick={() => setSelectedTopic(item.topic)}
                    className={`shrink-0 border-2 border-borderline px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-wider transition-colors ${
                      selectedTopic === item.topic
                        ? "bg-ink text-canvas"
                        : "bg-canvas text-ink hover:bg-ink/5"
                    }`}
                  >
                    {formatTopicBadge(item.topic)} ({item.count})
                  </button>
                ))}
              </div>
            )}

            {filteredLogs.length === 0 ? (
              <p className="py-6 text-center font-mono text-xs text-muted">
                {chatInsights.recentLogs.length === 0
                  ? "No chatbot conversations logged yet. Ask a question in the widget on your live site to see it appear here."
                  : "No logged questions match your current filter."}
              </p>
            ) : (
              <div className="space-y-3">
                {filteredLogs.map((log) => {
                  const isExpanded = Boolean(expandedIds[log.id]);
                  return (
                    <div
                      key={log.id}
                      className="border-2 border-borderline bg-canvas p-3.5 sm:p-4"
                    >
                      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                        <p className="min-w-0 flex-1 break-words text-sm font-semibold leading-snug text-ink">
                          “{log.question}”
                        </p>
                        <div className="flex shrink-0 items-center gap-2 font-mono text-[10px] text-muted">
                          <span>{formatShortTimestamp(log.created_at)}</span>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => onDeleteOne(log.id)}
                            aria-label="Delete log entry"
                            title="Delete log entry"
                            className="inline-flex h-7 w-7 items-center justify-center border border-borderline/40 text-muted transition-colors hover:border-borderline hover:bg-ink hover:text-canvas disabled:opacity-40"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                        <Badge variant="solid">
                          {formatTopicBadge(log.topic)}
                        </Badge>
                        <Badge>{log.locale.toUpperCase()}</Badge>
                        <Badge>
                          {log.response_mode === "gemini"
                            ? log.model_used
                            : "SMART MODE"}
                        </Badge>
                        <Badge>{log.current_page || "/"}</Badge>
                        {log.response_ms > 0 && (
                          <span className="font-mono text-[10px] text-muted">
                            {formatLatency(log.response_ms)}
                          </span>
                        )}
                      </div>

                      {/* Expandable AI Reply Audit */}
                      <div className="mt-2.5 border-t border-borderline/20 pt-2">
                        <button
                          type="button"
                          onClick={() => toggleReply(log.id)}
                          className="inline-flex items-center gap-1 font-mono text-[11px] font-bold uppercase tracking-wider text-muted transition-colors hover:text-ink"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="h-3.5 w-3.5" />
                              <span>Hide AI Reply</span>
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-3.5 w-3.5" />
                              <span>Inspect AI Reply</span>
                            </>
                          )}
                        </button>

                        {isExpanded && (
                          <div className="mt-2 border-l-2 border-borderline bg-surface p-3 text-xs leading-relaxed text-ink whitespace-pre-wrap break-words">
                            {log.reply_preview}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </BrutalCard>
        </>
      )}
    </div>
  );
}
