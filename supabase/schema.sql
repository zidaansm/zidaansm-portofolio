-- ============================================================================
-- Zidan Seftino Mutaqin Portfolio — Supabase PostgreSQL Schema & RLS
-- Run this script in Supabase Dashboard -> SQL Editor
-- ============================================================================

create extension if not exists "pgcrypto";

-- Automatic updated_at timestamp trigger
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- 1. Profile (single-row configuration for hero, bio, links, CV)
-- ----------------------------------------------------------------------------
create table if not exists public.profile (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  brand_name text not null default 'ZIDAN.',
  role_en text not null,
  role_id text not null,
  location text not null,
  timezone text not null default 'WIB (UTC+7)',
  availability_status_en text not null,
  availability_status_id text not null,
  is_available boolean not null default true,
  headline_en text not null,
  headline_id text not null,
  bio_en text not null,
  bio_id text not null,
  email text not null,
  github_url text not null,
  linkedin_url text not null,
  cv_url text not null default '/cv',
  avatar_url text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

drop trigger if exists set_profile_updated_at on public.profile;
create trigger set_profile_updated_at
  before update on public.profile
  for each row execute function public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 2. Projects & Case Studies
-- ----------------------------------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_en text not null,
  title_id text not null,
  summary_en text not null,
  summary_id text not null,
  category text not null,
  year text not null,
  role_en text not null,
  role_id text not null,
  tech_stack text[] not null default '{}',
  problem_en text not null,
  problem_id text not null,
  architecture_en text not null,
  architecture_id text not null,
  challenges_en text not null,
  challenges_id text not null,
  impact_en text not null,
  impact_id text not null,
  live_url text,
  repo_url text,
  cover_image_url text,
  gallery_images jsonb not null default '[]'::jsonb,
  featured boolean not null default false,
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_projects_slug on public.projects (slug);
create index if not exists idx_projects_published_sort on public.projects (published, sort_order);

drop trigger if exists set_projects_updated_at on public.projects;
create trigger set_projects_updated_at
  before update on public.projects
  for each row execute function public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 3. Tech Capabilities Matrix (4 Quadrants)
-- ----------------------------------------------------------------------------
create table if not exists public.tech_capabilities (
  id uuid primary key default gen_random_uuid(),
  category_key text not null unique,
  title_en text not null,
  title_id text not null,
  description_en text not null,
  description_id text not null,
  items text[] not null default '{}',
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

drop trigger if exists set_capabilities_updated_at on public.tech_capabilities;
create trigger set_capabilities_updated_at
  before update on public.tech_capabilities
  for each row execute function public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 4. Experiences & Education
-- ----------------------------------------------------------------------------
create table if not exists public.experiences (
  id uuid primary key default gen_random_uuid(),
  organization text not null,
  role_en text not null,
  role_id text not null,
  period text not null,
  location text not null,
  summary_en text not null,
  summary_id text not null,
  highlights_en text[] not null default '{}',
  highlights_id text[] not null default '{}',
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

drop trigger if exists set_experiences_updated_at on public.experiences;
create trigger set_experiences_updated_at
  before update on public.experiences
  for each row execute function public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 5. Contact Messages Inbox
-- ----------------------------------------------------------------------------
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_contact_messages_created on public.contact_messages (created_at desc);

-- ============================================================================
-- Row Level Security (RLS)
-- Note: For single-owner hardening, you can replace `(auth.role() = 'authenticated')`
-- with `(auth.jwt() ->> 'email' = 'zidanseftino18@gmail.com')`.
-- ============================================================================

alter table public.profile enable row level security;
alter table public.projects enable row level security;
alter table public.tech_capabilities enable row level security;
alter table public.experiences enable row level security;
alter table public.contact_messages enable row level security;

-- Profile policies
drop policy if exists "Public can read profile" on public.profile;
create policy "Public can read profile"
  on public.profile for select
  using (true);

drop policy if exists "Admin can manage profile" on public.profile;
create policy "Admin can manage profile"
  on public.profile for all
  using (auth.jwt() ->> 'email' = 'zidanseftino18@gmail.com')
  with check (auth.jwt() ->> 'email' = 'zidanseftino18@gmail.com');

-- Projects policies
drop policy if exists "Public can read published projects" on public.projects;
create policy "Public can read published projects"
  on public.projects for select
  using (published = true or auth.jwt() ->> 'email' = 'zidanseftino18@gmail.com');

drop policy if exists "Admin can manage projects" on public.projects;
create policy "Admin can manage projects"
  on public.projects for all
  using (auth.jwt() ->> 'email' = 'zidanseftino18@gmail.com')
  with check (auth.jwt() ->> 'email' = 'zidanseftino18@gmail.com');

-- Tech capabilities policies
drop policy if exists "Public can read capabilities" on public.tech_capabilities;
create policy "Public can read capabilities"
  on public.tech_capabilities for select
  using (true);

drop policy if exists "Admin can manage capabilities" on public.tech_capabilities;
create policy "Admin can manage capabilities"
  on public.tech_capabilities for all
  using (auth.jwt() ->> 'email' = 'zidanseftino18@gmail.com')
  with check (auth.jwt() ->> 'email' = 'zidanseftino18@gmail.com');

-- Experiences policies
drop policy if exists "Public can read published experiences" on public.experiences;
create policy "Public can read published experiences"
  on public.experiences for select
  using (published = true or auth.jwt() ->> 'email' = 'zidanseftino18@gmail.com');

drop policy if exists "Admin can manage experiences" on public.experiences;
create policy "Admin can manage experiences"
  on public.experiences for all
  using (auth.jwt() ->> 'email' = 'zidanseftino18@gmail.com')
  with check (auth.jwt() ->> 'email' = 'zidanseftino18@gmail.com');

-- Contact messages policies
drop policy if exists "Anyone can insert contact message" on public.contact_messages;
create policy "Anyone can insert contact message"
  on public.contact_messages for insert
  with check (true);

drop policy if exists "Admin can read and manage contact messages" on public.contact_messages;
create policy "Admin can read and manage contact messages"
  on public.contact_messages for select
  using (auth.jwt() ->> 'email' = 'zidanseftino18@gmail.com');

drop policy if exists "Admin can update contact messages" on public.contact_messages;
create policy "Admin can update contact messages"
  on public.contact_messages for update
  using (auth.jwt() ->> 'email' = 'zidanseftino18@gmail.com')
  with check (auth.jwt() ->> 'email' = 'zidanseftino18@gmail.com');

drop policy if exists "Admin can delete contact messages" on public.contact_messages;
create policy "Admin can delete contact messages"
  on public.contact_messages for delete
  using (auth.jwt() ->> 'email' = 'zidanseftino18@gmail.com');

-- ============================================================================
-- Table-level Grants (required alongside RLS policies)
-- ============================================================================
grant usage on schema public to anon, authenticated;

grant select on public.profile to anon, authenticated;
grant insert, update, delete on public.profile to authenticated;

grant select on public.projects to anon, authenticated;
grant insert, update, delete on public.projects to authenticated;

grant select on public.tech_capabilities to anon, authenticated;
grant insert, update, delete on public.tech_capabilities to authenticated;

grant select on public.experiences to anon, authenticated;
grant insert, update, delete on public.experiences to authenticated;

grant insert on public.contact_messages to anon, authenticated;
grant select, update, delete on public.contact_messages to authenticated;

-- Idempotent column upgrade for existing databases
alter table public.profile add column if not exists avatar_url text;
alter table public.projects add column if not exists gallery_images jsonb not null default '[]'::jsonb;
notify pgrst, 'reload schema';

-- ============================================================================
-- Supabase Storage Bucket for Profile Photo & Project Thumbnails
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('portfolio-media', 'portfolio-media', true)
on conflict (id) do nothing;

drop policy if exists "Public can view portfolio media" on storage.objects;
create policy "Public can view portfolio media"
  on storage.objects for select
  using (bucket_id = 'portfolio-media');

drop policy if exists "Admin can upload portfolio media" on storage.objects;
create policy "Admin can upload portfolio media"
  on storage.objects for insert
  with check (
    bucket_id = 'portfolio-media'
    and auth.jwt() ->> 'email' = 'zidanseftino18@gmail.com'
  );

drop policy if exists "Admin can update portfolio media" on storage.objects;
create policy "Admin can update portfolio media"
  on storage.objects for update
  using (
    bucket_id = 'portfolio-media'
    and auth.jwt() ->> 'email' = 'zidanseftino18@gmail.com'
  );

drop policy if exists "Admin can delete portfolio media" on storage.objects;
create policy "Admin can delete portfolio media"
  on storage.objects for delete
  using (
    bucket_id = 'portfolio-media'
    and auth.jwt() ->> 'email' = 'zidanseftino18@gmail.com'
  );

-- ============================================================================
-- 6. Lightweight First-Party Portfolio Analytics
-- ============================================================================
create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (event_type in ('page_view', 'project_view', 'cv_download')),
  path text not null,
  project_slug text,
  referrer_host text not null default 'direct',
  device_type text not null default 'desktop',
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_analytics_events_created
  on public.analytics_events (created_at desc);

create index if not exists idx_analytics_events_type_slug
  on public.analytics_events (event_type, project_slug);

alter table public.analytics_events enable row level security;

drop policy if exists "Anyone can insert analytics event" on public.analytics_events;
create policy "Anyone can insert analytics event"
  on public.analytics_events for insert
  with check (event_type in ('page_view', 'project_view', 'cv_download'));

drop policy if exists "Admin can read analytics events" on public.analytics_events;
create policy "Admin can read analytics events"
  on public.analytics_events for select
  using (auth.jwt() ->> 'email' = 'zidanseftino18@gmail.com');

drop policy if exists "Admin can delete analytics events" on public.analytics_events;
create policy "Admin can delete analytics events"
  on public.analytics_events for delete
  using (auth.jwt() ->> 'email' = 'zidanseftino18@gmail.com');

grant insert on public.analytics_events to anon, authenticated;
grant select, delete on public.analytics_events to authenticated;

notify pgrst, 'reload schema';
