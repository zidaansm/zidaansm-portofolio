"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  BarChart3,
  Briefcase,
  Cpu,
  ExternalLink,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Moon,
  Sparkles,
  Sun,
  UserCircle2,
  X,
} from "lucide-react";

export type AdminTabKey =
  | "overview"
  | "projects"
  | "profile"
  | "capabilities"
  | "experience"
  | "messages"
  | "analytics"
  | "chat";

interface AdminNavItem {
  key: AdminTabKey;
  label: string;
  section: string;
  description: string;
  icon: typeof LayoutDashboard;
  badge?: string | number;
  highlightBadge?: boolean;
}

interface AdminSidebarShellProps {
  activeTab: AdminTabKey;
  onSelectTab: (tab: AdminTabKey) => void;
  userEmail: string;
  brandName: string;
  fullName: string;
  avatarUrl: string | null;
  counts: {
    projects: number;
    capabilities: number;
    experiences: number;
    messagesTotal: number;
    messagesUnread: number;
    analyticsViews: number;
    chatTotal: number;
  };
  onSignOut: () => void;
  children: ReactNode;
}

export function AdminSidebarShell({
  activeTab,
  onSelectTab,
  userEmail,
  brandName,
  fullName,
  avatarUrl,
  counts,
  onSignOut,
  children,
}: AdminSidebarShellProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileMenuOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileMenuOpen]);

  const navGroups: { title: string; items: AdminNavItem[] }[] = [
    {
      title: "Dashboard",
      items: [
        {
          key: "overview",
          label: "Overview",
          section: "Dashboard",
          description: "Executive snapshot of traffic, AI chats, inbox, and CMS health.",
          icon: LayoutDashboard,
        },
        {
          key: "analytics",
          label: "Analytics",
          section: "Dashboard",
          description: "First-party visitor traffic, case study opens, and CV downloads.",
          icon: BarChart3,
          badge: counts.analyticsViews,
        },
        {
          key: "chat",
          label: "Chat Insights",
          section: "Dashboard",
          description: "Anonymous recruiter questions, topics, and Gemini failover telemetry.",
          icon: Sparkles,
          badge: counts.chatTotal,
        },
      ],
    },
    {
      title: "Content CMS",
      items: [
        {
          key: "projects",
          label: "Projects",
          section: "Content CMS",
          description: "Manage case studies, thumbnails, galleries, and publication order.",
          icon: FolderKanban,
          badge: counts.projects,
        },
        {
          key: "profile",
          label: "Profile & CV",
          section: "Content CMS",
          description: "Update hero bio, availability status, avatar, CV link, and GitHub picks.",
          icon: UserCircle2,
        },
        {
          key: "capabilities",
          label: "Tech Matrix",
          section: "Content CMS",
          description: "Configure your 4 technical capability quadrants and skill items.",
          icon: Cpu,
          badge: counts.capabilities,
        },
        {
          key: "experience",
          label: "Experience",
          section: "Content CMS",
          description: "Edit education, MSIB Bangkit Academy, and career timeline entries.",
          icon: Briefcase,
          badge: counts.experiences,
        },
      ],
    },
    {
      title: "Communication",
      items: [
        {
          key: "messages",
          label: "Inbox",
          section: "Communication",
          description: "Read and manage incoming contact form submissions from visitors.",
          icon: Mail,
          badge:
            counts.messagesUnread > 0
              ? `${counts.messagesUnread} new`
              : counts.messagesTotal,
          highlightBadge: counts.messagesUnread > 0,
        },
      ],
    },
  ];

  const allItems = navGroups.flatMap((group) => group.items);
  const currentItem =
    allItems.find((item) => item.key === activeTab) ?? allItems[0];

  const isDark = mounted && resolvedTheme === "dark";

  function handleNavClick(tab: AdminTabKey) {
    onSelectTab(tab);
    setMobileMenuOpen(false);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function renderSidebarContent(isMobileDrawer: boolean) {
    return (
      <div className="flex h-full flex-col bg-surface text-ink">
        {/* Sidebar Brand Header */}
        <div className="flex h-16 shrink-0 items-center justify-between gap-2 border-b-2 border-borderline px-4">
          <button
            type="button"
            onClick={() => handleNavClick("overview")}
            className="flex min-w-0 items-center gap-2.5 text-left transition-opacity hover:opacity-80"
          >
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center border-2 border-borderline bg-ink font-mono text-sm font-bold text-canvas shadow-brutal-sm">
              Z
            </span>
            <div className="min-w-0">
              <p className="truncate font-display text-base font-bold leading-none text-ink">
                {brandName || "ZIDAN."}
              </p>
              <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-widest text-muted">
                ADMIN CMS
              </p>
            </div>
          </button>

          {isMobileDrawer && (
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close sidebar menu"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center border-2 border-borderline bg-canvas text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Grouped Navigation Menu */}
        <nav
          aria-label="Admin sidebar navigation"
          className="flex-1 space-y-6 overflow-y-auto px-3 py-5"
        >
          {navGroups.map((group) => (
            <div key={group.title}>
              <p className="mb-2 px-2.5 font-mono text-[10px] font-bold uppercase tracking-widest text-muted">
                {group.title}
              </p>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.key;

                  return (
                    <li key={item.key}>
                      <button
                        type="button"
                        onClick={() => handleNavClick(item.key)}
                        aria-current={isActive ? "page" : undefined}
                        className={`group flex min-h-[42px] w-full items-center justify-between gap-2 border-2 px-3 py-2 text-left transition-all ${
                          isActive
                            ? "border-borderline bg-ink text-canvas shadow-brutal-sm"
                            : "border-transparent bg-transparent text-ink hover:border-borderline/40 hover:bg-canvas"
                        }`}
                      >
                        <span className="flex min-w-0 items-center gap-2.5">
                          <Icon
                            className={`h-4 w-4 shrink-0 ${
                              isActive
                                ? "text-canvas"
                                : "text-muted group-hover:text-ink"
                            }`}
                          />
                          <span className="truncate font-mono text-xs font-bold uppercase tracking-wider">
                            {item.label}
                          </span>
                        </span>

                        {item.badge !== undefined && (
                          <span
                            className={`shrink-0 border px-1.5 py-0.5 font-mono text-[10px] font-bold leading-none ${
                              isActive
                                ? "border-canvas/50 bg-canvas/15 text-canvas"
                                : item.highlightBadge
                                  ? "border-borderline bg-ink text-canvas"
                                  : "border-borderline/30 bg-canvas text-muted"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer (Account + Live Link + Sign Out) */}
        <div className="shrink-0 space-y-2.5 border-t-2 border-borderline bg-canvas/70 p-3.5">
          {/* Admin Identity Card */}
          <div className="flex items-center gap-2.5 border-2 border-borderline bg-surface p-2.5">
            {avatarUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={avatarUrl}
                alt={fullName}
                className="h-8 w-8 shrink-0 border border-borderline object-cover"
              />
            ) : (
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center border border-borderline bg-ink font-mono text-xs font-bold text-canvas">
                {fullName.slice(0, 1).toUpperCase() || "Z"}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-xs font-bold text-ink">
                {fullName}
              </p>
              <p className="truncate font-mono text-[10px] text-muted">
                {userEmail}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[36px] items-center justify-center gap-1.5 border-2 border-borderline bg-surface px-2.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-ink transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-sm"
            >
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Live Site</span>
            </Link>
            <button
              type="button"
              onClick={onSignOut}
              className="inline-flex min-h-[36px] items-center justify-center gap-1.5 border-2 border-borderline bg-surface px-2.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-ink transition-all hover:bg-ink hover:text-canvas"
            >
              <LogOut className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-canvas text-ink">
      {/* Desktop Fixed Left Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r-2 border-borderline lg:block xl:w-[272px]">
        {renderSidebarContent(false)}
      </aside>

      {/* Mobile Slide-Over Sidebar Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 flex lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Admin navigation menu"
        >
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/55 backdrop-blur-[1px]"
            aria-hidden="true"
          />
          <aside className="relative z-10 h-full w-72 max-w-[85vw] border-r-2 border-borderline shadow-brutal">
            {renderSidebarContent(true)}
          </aside>
        </div>
      )}

      {/* Right Main Column (Sticky Top Header + Content Workspace) */}
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-3 border-b-2 border-borderline bg-surface/95 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            {/* Mobile Drawer Trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open sidebar navigation"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center border-2 border-borderline bg-canvas text-ink transition-transform active:scale-95 lg:hidden"
            >
              <Menu className="h-4 w-4" />
            </button>

            {/* Breadcrumb & Active Section Title */}
            <div className="min-w-0">
              <p className="truncate font-mono text-[10px] font-bold uppercase tracking-widest text-muted">
                CMS / {currentItem.section}
              </p>
              <h1 className="truncate font-display text-lg font-bold leading-tight text-ink sm:text-xl">
                {currentItem.label}
              </h1>
            </div>
          </div>

          {/* Right Topbar Utilities */}
          <div className="flex shrink-0 items-center gap-2">
            {counts.messagesUnread > 0 && activeTab !== "messages" && (
              <button
                type="button"
                onClick={() => handleNavClick("messages")}
                className="inline-flex min-h-[36px] items-center gap-1.5 border-2 border-borderline bg-ink px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-canvas shadow-brutal-sm transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5"
              >
                <Mail className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">
                  {counts.messagesUnread} Unread
                </span>
                <span className="sm:hidden">{counts.messagesUnread}</span>
              </button>
            )}

            {/* Theme Switcher */}
            <button
              type="button"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              aria-label="Toggle color theme"
              title="Toggle theme"
              className="inline-flex h-9 w-9 items-center justify-center border-2 border-borderline bg-canvas text-ink transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-sm"
            >
              {mounted ? (
                isDark ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )
              ) : (
                <span className="h-4 w-4" />
              )}
            </button>

            {/* Quick Open Live Site */}
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden h-9 items-center gap-1.5 border-2 border-borderline bg-canvas px-3 font-mono text-xs font-bold uppercase tracking-wider text-ink transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-sm sm:inline-flex"
            >
              <span>View Portfolio</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </header>

        {/* Main Workspace Canvas */}
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
