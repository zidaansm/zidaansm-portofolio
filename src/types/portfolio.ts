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
