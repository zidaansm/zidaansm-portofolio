export type Locale = "en" | "id";

export interface Profile {
  id: string;
  full_name: string;
  brand_name: string;
  role_en: string;
  role_id: string;
  location: string;
  timezone: string;
  availability_status_en: string;
  availability_status_id: string;
  is_available: boolean;
  headline_en: string;
  headline_id: string;
  bio_en: string;
  bio_id: string;
  email: string;
  github_url: string;
  linkedin_url: string;
  cv_url: string;
  avatar_url: string | null;
  featured_github_repos?: string[];
  updated_at?: string;
}

export interface ProjectGalleryImage {
  url: string;
  caption_en: string;
  caption_id: string;
}

export interface Project {
  id: string;
  slug: string;
  title_en: string;
  title_id: string;
  summary_en: string;
  summary_id: string;
  category: string;
  year: string;
  role_en: string;
  role_id: string;
  tech_stack: string[];
  problem_en: string;
  problem_id: string;
  architecture_en: string;
  architecture_id: string;
  challenges_en: string;
  challenges_id: string;
  impact_en: string;
  impact_id: string;
  live_url: string | null;
  repo_url: string | null;
  cover_image_url: string | null;
  gallery_images?: ProjectGalleryImage[];
  featured: boolean;
  published: boolean;
  sort_order: number;
  updated_at?: string;
}

export interface TechCapability {
  id: string;
  category_key: string;
  title_en: string;
  title_id: string;
  description_en: string;
  description_id: string;
  items: string[];
  sort_order: number;
  updated_at?: string;
}

export interface Experience {
  id: string;
  organization: string;
  role_en: string;
  role_id: string;
  period: string;
  location: string;
  summary_en: string;
  summary_id: string;
  highlights_en: string[];
  highlights_id: string[];
  published: boolean;
  sort_order: number;
  updated_at?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface PortfolioData {
  profile: Profile;
  projects: Project[];
  capabilities: TechCapability[];
  experiences: Experience[];
  source: "supabase" | "fallback";
}

export type AnalyticsEventType = "page_view" | "project_view" | "cv_download";

export interface AnalyticsEventRow {
  id: string;
  event_type: AnalyticsEventType;
  path: string;
  project_slug: string | null;
  referrer_host: string;
  device_type: string;
  created_at: string;
}

export interface AnalyticsDailyPoint {
  date: string;
  label: string;
  views: number;
  cvDownloads: number;
}

export interface AnalyticsSummary {
  tableReady: boolean;
  totalPageViews: number;
  totalProjectViews: number;
  totalCvDownloads: number;
  viewsLast7Days: number;
  dailyTrend: AnalyticsDailyPoint[];
  topProjects: { slug: string; title: string; views: number }[];
  topReferrers: { host: string; count: number }[];
  deviceBreakdown: { desktop: number; mobile: number; tablet: number };
}

export interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  htmlUrl: string;
  homepage: string | null;
  language: string | null;
  stars: number;
  forks: number;
  pushedAt: string;
}

export interface GitHubContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface GitHubContributionCalendar {
  totalContributions: number;
  weeks: { days: GitHubContributionDay[] }[];
}

export interface GitHubShowcaseData {
  username: string;
  profileUrl: string;
  publicRepos: number;
  followers: number;
  totalStars: number;
  topLanguages: { name: string; count: number }[];
  repos: GitHubRepo[];
  contributions: GitHubContributionCalendar | null;
}

export type ChatTopic =
  | "projects"
  | "tech_stack"
  | "experience"
  | "contact_cv"
  | "profile"
  | "salary_private"
  | "other";

export interface ChatLogRow {
  id: string;
  question: string;
  reply_preview: string;
  topic: string;
  locale: Locale;
  current_page: string;
  response_mode: "gemini" | "fallback";
  model_used: string;
  response_ms: number;
  created_at: string;
}

export interface ChatInsightsDailyPoint {
  date: string;
  label: string;
  chats: number;
}

export interface ChatInsightsSummary {
  tableReady: boolean;
  totalChats: number;
  chatsLast7Days: number;
  aiSuccessRate: number;
  avgResponseMs: number;
  dailyTrend: ChatInsightsDailyPoint[];
  topicBreakdown: { topic: string; label: string; count: number }[];
  modelBreakdown: { model: string; count: number }[];
  localeBreakdown: { id: number; en: number };
  topPages: { page: string; count: number }[];
  recentLogs: ChatLogRow[];
}
