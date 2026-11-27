# Zidan Seftino Mutaqin — Fullstack Portfolio & Admin CMS

A production-ready personal portfolio website built with an **Editorial Swiss-Brutalist Minimalist Monochrome** aesthetic, backed by **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, **Supabase (PostgreSQL, Auth & Storage)**, **Resend**, and a live **Gemini AI Portfolio Assistant**.

**Live Production:** [zidaansm-portofolio.vercel.app](https://zidaansm-portofolio.vercel.app)

---

## Key Features

### Public Portfolio Experience
- **Editorial Swiss-Brutalist Monochrome UI:** High-contrast Light & Dark mode (`next-themes`), crisp `2px` borders, tactile offset shadows, and responsive mobile-first layouts (`Space Grotesk`, `Plus Jakarta Sans`, `JetBrains Mono`).
- **Bilingual Support (EN / ID):** Seamless English & Bahasa Indonesia toggle persisted via HTTP cookie (`portfolio-locale`) with zero SSR hydration mismatch.
- **Structured Case Studies (`/projects/[slug]`):** Four-part technical storytelling (*Problem -> Architecture -> Challenges -> Impact*), tech stack filtering, multi-image **Documentation & Screenshot Gallery**, and touch-swipe monochrome lightbox viewer.
- **Live GitHub Showcase & 12-Month Contribution Heatmap:** Fetches real-time repositories (auto top-3 scored or admin-picked) and a 5-step calibrated monochrome contribution calendar via GitHub GraphQL API.
- **Built-in Printable CV (`/cv`) & Direct PDF CV:** ATS-friendly monochrome printable CV page plus seamless support for an uploaded PDF CV managed directly from `/admin`.
- **Dynamic OG / Social Cards & SEO:** Auto-generated OpenGraph/Twitter images for the homepage and every project slug, dynamic `sitemap.xml` & `robots.txt`, JSON-LD `Person`/`WebSite` structured data, HTTP security headers, top route progress bar, and brutalist loading skeletons + custom `404` & `Error Boundary` pages.

### AI Portfolio Chatbot (Gemini 4 Hydrogen + Multi-Model Failover)
- **Live Supabase Grounding:** Automatically reads real-time `profile`, `projects`, `tech_capabilities`, and `experiences` data so CMS updates immediately reflect in AI answers — strictly guarded against hallucinations.
- **5-Tier Model Failover + Smart Cooldown (`POST /api/chat`):**
  `gemini-4-hydrogen` -> `gemini-3.8-flash` -> `gemini-3.5-flash-lite` -> `gemini-3.1-flash-lite` -> `gemini-2.5-flash` -> **Smart Local Mode** (guaranteed zero-error fallback).
- **Recruiter-Friendly UX:** Non-intrusive floating trigger (no auto-popup), contextual Quick Prompts on project pages, 1-click copy answer, clickable internal/external links, and IP rate limiting.

### Professional Left-Sidebar Admin CMS (`/admin`)
Protected by **Supabase Auth**, server-side middleware, strict `ADMIN_EMAIL` enforcement, and PostgreSQL **Row Level Security (RLS)**:
- **Overview Dashboard:** Executive KPI snapshot, quick shortcuts, CMS & database health checks, and recent inbox/chatbot activity.
- **Projects Manager:** Full CRUD, draft/publish toggles, thumbnail upload, and multi-photo gallery uploader with captions & drag-free reorder controls (Supabase Storage).
- **Profile, Photo & CV Manager:** Edit bilingual bio/status/location, upload/delete portrait photo, **upload CV PDF directly to Storage** (up to 10MB) or reset to `/cv`, and pick up to 3 featured GitHub repositories.
- **Tech Matrix & Experience Editors:** Full CRUD for capability quadrants and education/experience entries.
- **Contact Inbox + Monochrome HTML Email Alerts:** Messages stored in Supabase `contact_messages` and delivered via Resend with a formatted monochrome HTML template.
- **First-Party Analytics:** Privacy-friendly visitor metrics (page views, case study views, CV downloads, 14-day trend, top projects, referrers, device breakdown) — zero third-party cookies.
- **Anonymous AI Chat Insights:** Non-blocking (`after()`) anonymous logging of visitor questions (`chat_logs`) with auto-topic classification, model failover telemetry, latency tracking, search/topic filters, and AI reply inspection.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 15 (App Router, React 19, TypeScript) |
| Styling & Motion | Tailwind CSS 3, Framer Motion, Lucide React, `next-themes` |
| Database, Auth & Storage | Supabase (`@supabase/supabase-js`, `@supabase/ssr`, PostgreSQL RLS) |
| AI Chatbot | Google Gemini REST API (`gemini-4-hydrogen` + multi-model failover) |
| Validation & Email | Zod, Resend |
| Deployment | Vercel |

---

## Architecture Overview

```text
src/
├── app/
│   ├── page.tsx                         # Public landing page (SSR + Supabase)
│   ├── cv/                              # ATS-ready monochrome printable CV
│   ├── projects/[slug]/                 # Dynamic project case study + OG card
│   ├── admin/                           # Left-sidebar Admin CMS & Login
│   ├── not-found.tsx & error.tsx        # Custom brutalist 404 & Error Boundary
│   └── api/
│       ├── chat/                        # Gemini 4 failover chatbot + after() logger
│       ├── contact/                     # Rate-limited contact form + HTML email
│       ├── analytics/                   # First-party event ingestion
│       └── admin/                       # Auth-guarded CRUD, upload, analytics & chat-insights
├── components/
│   ├── admin/                           # AdminSidebarShell, AdminOverviewTab, ChatInsightsTab, AdminDashboard
│   ├── chat/                            # PortfolioChatbot floating widget
│   ├── projects/                        # Case study view & lightbox gallery
│   ├── sections/                        # Hero, Projects, Capabilities, Experience, GitHub, Contact
│   └── ui/                              # BrutalCard, BrutalButton, Badge, NavigationProgressBar
├── lib/
│   ├── data/portfolio.ts                # Cached Supabase repository + seed fallback
│   ├── chat.ts & chat-insights-server.ts# System prompt builder, fallback engine & topic classifier
│   ├── github.ts                        # GitHub REST + GraphQL Contribution Calendar
│   ├── analytics-server.ts              # 14-day metrics aggregator
│   ├── supabase/                        # SSR client, browser client, admin auth guard
│   ├── i18n.ts                          # Bilingual EN/ID dictionary
│   └── validators.ts                    # Shared Zod schemas
└── supabase/
    ├── schema.sql                       # All 7 tables, triggers, RLS, GRANTs & Storage policies
    └── seed.sql                         # Initial portfolio seed data
```

---

## Setup & Deployment Guide

### 1. Local Development
```bash
npm install
cp .env.example .env.local
npm run dev
```
Open [http://localhost:3000](http://localhost:3000). The app runs cleanly even without external API keys using built-in seed data and Smart Local Chatbot fallback.

### 2. Supabase Database, Auth & Storage
1. Create a project at [supabase.com](https://supabase.com).
2. In **Supabase -> SQL Editor**, run `supabase/schema.sql` (creates all 7 tables including `analytics_events` and `chat_logs`, RLS policies, table `GRANT`s, and the `portfolio-media` storage bucket).
3. Optionally run `supabase/seed.sql` (or click **Import Initial Data** inside `/admin`).
4. In **Supabase -> Authentication -> Users**, create your admin user matching `ADMIN_EMAIL`.

### 3. Environment Variables (`.env.local` & Vercel)
See [.env.example](.env.example) for the complete list:
```env
NEXT_PUBLIC_SITE_URL=https://zidaansm-portofolio.vercel.app

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-or-publishable-key
ADMIN_EMAIL=zidanseftino18@gmail.com

RESEND_API_KEY=re_xxxxxxxxx
CONTACT_FROM_EMAIL=Portfolio Contact <onboarding@resend.dev>
CONTACT_TO_EMAIL=zidanseftino18@gmail.com

GITHUB_TOKEN=ghp_xxxxxxxxx

GEMINI_API_KEY=your-google-ai-studio-key
GEMINI_MODEL=gemini-4-hydrogen
GEMINI_FALLBACK_MODELS=gemini-3.8-flash,gemini-3.5-flash-lite,gemini-3.1-flash-lite,gemini-2.5-flash
```

### 4. Deploy to Vercel
1. Push your branch to GitHub.
2. Import the repository on [vercel.com/new](https://vercel.com/new).
3. Add the environment variables above in **Project Settings -> Environment Variables**.
4. Deploy — `/sitemap.xml`, `/robots.txt`, dynamic OG cards, security headers, and serverless API routes work out of the box.
