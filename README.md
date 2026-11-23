# Zidan Seftino Mutaqin — Personal Portfolio

A production-ready, Editorial Swiss-Brutalist Minimalist Monochrome portfolio website built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, **Framer Motion**, **Supabase (PostgreSQL & Auth)**, and **Resend**.

---

## Features

- **Editorial Swiss-Brutalist Monochrome UI:** Crisp `2px` borders, tactile offset shadows, high-contrast Light & Dark mode (`next-themes`).
- **Bilingual (EN / ID):** Instant language switch persisted via cookie for zero SSR/client hydration mismatch.
- **Case Studies (`/projects/[slug]`):** Structured engineering storytelling (*Problem -> System Architecture -> Challenges -> Measurable Impact*) with stack filtering on the homepage.
- **Built-in Printable CV (`/cv`) & PDF Ready:** Works immediately with an ATS-friendly monochrome CV page, and seamlessly switches to your PDF file once uploaded.
- **Supabase PostgreSQL + Admin CMS (`/admin`):** Full CRUD for Profile, Projects, Tech Matrix, Experience, and Contact Inbox protected by Supabase Auth + `ADMIN_EMAIL` check + PostgreSQL RLS.
- **Graceful Fallback Mode:** Runs 100% smoothly locally or on preview deployments even before Supabase/Resend env vars are set (`src/data/seed-data.ts`).

---

## 1. Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 2. Adding Your CV PDF File

Currently, the **Download CV** button points to `/cv` (the built-in printable CV page).  
When your PDF CV file is ready:

1. Place your PDF file inside `public/cv.pdf` (e.g., `c:\my-project\zidanportofolio\public\cv.pdf`).
2. Update `cv_url` to `/cv.pdf` in **Admin Dashboard → Profile & CV** (or in `src/data/seed-data.ts` and `supabase/seed.sql`).

---

## 3. Supabase Database & Admin Auth Setup

1. Create a free project at [supabase.com](https://supabase.com).
2. In **Supabase → SQL Editor**, run the contents of:
   - `supabase/schema.sql` (creates tables, triggers, indexes, and RLS policies)
   - `supabase/seed.sql` (inserts your initial bilingual profile, projects, capabilities, and experience)
3. In **Supabase → Authentication → Users**, click **Add user → Create new user** with your email (`zidanseftino18@gmail.com`) and a strong password.
4. Copy `.env.example` to `.env.local` and fill in your Supabase URL & Anon Key:
   ```env
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ADMIN_EMAIL=zidanseftino18@gmail.com
   ```
5. Sign in at `/admin/login`.

---

## 4. Resend Email Notifications (Optional)

1. Create an API key at [resend.com](https://resend.com).
2. Add to `.env.local` (and Vercel Environment Variables):
   ```env
   RESEND_API_KEY=re_xxxxxxxxx
   CONTACT_FROM_EMAIL=Portfolio Contact <onboarding@resend.dev>
   CONTACT_TO_EMAIL=zidanseftino18@gmail.com
   ```
   *(Every contact message is also stored in Supabase `contact_messages` and viewable in `/admin` → Inbox.)*

---

## 5. Deploy to Vercel

1. Push this repository to GitHub (`github.com/zidaansm/...`).
2. Import the repository in [vercel.com/new](https://vercel.com/new).
3. Add the environment variables from `.env.example` in **Vercel Project Settings → Environment Variables** (set `NEXT_PUBLIC_SITE_URL` to your production `https://...vercel.app` or custom domain).
4. Click **Deploy**.
