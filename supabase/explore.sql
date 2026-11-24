-- ============================================================================
-- EXPLORE EXPANSION — subjects, labs, resources, community and learner state.
-- Run after schema.sql, then run explore_seed.sql for the starter content.
-- All access goes through Next.js API routes using the service-role client,
-- so RLS is enabled with read-only public policies on catalogue tables and
-- no direct client access to learner tables.
-- ============================================================================

-- ── Catalogue ───────────────────────────────────────────────────────────────

create table if not exists public.explore_subjects (
  slug               text primary key,
  title              text not null,
  tagline            text not null default '',
  description        text not null default '',
  discipline         text not null check (discipline in ('Engineering', 'Computing', 'Energy & Environment', 'Physical Sciences', 'Life Sciences')),
  difficulty         text not null check (difficulty in ('beginner', 'intermediate', 'advanced', 'university')),
  motif              text not null,
  theme              jsonb not null,                    -- { base, accent, tint, ink }
  status             text not null default 'available' check (status in ('available', 'coming-soon')),
  tags               text[] not null default '{}',
  featured           boolean not null default false,
  trending           boolean not null default false,
  emerging           boolean not null default false,
  beginner_friendly  boolean not null default false,
  university_level   boolean not null default false,
  added_at           date not null default current_date,
  estimated_hours    int not null default 0,
  learners_exploring int not null default 0,
  -- Nested detail (introduction, applications, whyItMatters, outcomes,
  -- foundationalKnowledge, prerequisites, stages, durationLabel,
  -- relatedCategorySlug, curriculum) — always read together with the subject.
  detail             jsonb not null default '{}',
  sort_order         int not null default 0,
  is_published       boolean not null default true,
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);

create table if not exists public.explore_lab_projects (
  id            text primary key,
  subject_slug  text not null references public.explore_subjects(slug) on delete cascade,
  title         text not null,
  type          text not null check (type in ('simulation', 'coding', 'challenge', 'experiment', 'project')),
  difficulty    text not null check (difficulty in ('beginner', 'intermediate', 'advanced', 'university')),
  duration_mins int not null default 0,
  summary       text not null default '',
  objectives    jsonb not null default '[]',   -- string[]
  steps         jsonb not null default '[]',   -- { id, title, detail }[]
  criteria      jsonb not null default '[]',   -- { criterion, weight, description }[]
  deliverable   text not null default '',
  simulation    text,
  sort_order    int not null default 0,
  is_published  boolean not null default true,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create index if not exists idx_explore_lab_projects_subject on public.explore_lab_projects(subject_slug);

create table if not exists public.explore_resources (
  id            text primary key,
  title         text not null,
  author        text not null default '',
  type          text not null check (type in ('unit-outline', 'lecture', 'paper', 'article', 'textbook', 'video', 'oer', 'documentation')),
  year          text,
  description   text not null default '',
  url           text not null,
  licence       text,
  access        text not null default 'external' check (access in ('external', 'edumate')),
  subject_slugs text[] not null default '{}',
  sort_order    int not null default 0,
  is_published  boolean not null default true,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create index if not exists idx_explore_resources_subjects on public.explore_resources using gin(subject_slugs);

-- ── Community ───────────────────────────────────────────────────────────────

create table if not exists public.explore_community_posts (
  id                  text primary key default ('post-' || replace(gen_random_uuid()::text, '-', '')),
  author_id           uuid references public.users(id) on delete cascade,  -- null for seeded demo posts
  kind                text not null check (kind in ('showcase', 'discovery', 'explanation', 'discussion')),
  title               text not null check (char_length(title) between 5 and 120),
  excerpt             text not null check (char_length(excerpt) between 20 and 1000),
  author_display      text not null,          -- first name + initial only (safeguarding)
  author_band         text check (author_band in ('Under 16', '16–18', 'Adult learner')),
  region              text,
  subject_slug        text not null references public.explore_subjects(slug) on delete cascade,
  achievement         text,
  moderation          text not null default 'pending' check (moderation in ('pending', 'reviewed', 'rejected')),
  moderated_by        uuid references public.users(id) on delete set null,
  moderated_at        timestamptz,
  base_appreciations  int not null default 0,  -- carried-over count for seeded posts
  replies             int not null default 0,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

create index if not exists idx_explore_posts_moderation on public.explore_community_posts(moderation, created_at desc);
create index if not exists idx_explore_posts_author on public.explore_community_posts(author_id);

create table if not exists public.explore_post_appreciations (
  user_id    uuid not null references public.users(id) on delete cascade,
  post_id    text not null references public.explore_community_posts(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, post_id)
);

create table if not exists public.explore_post_reports (
  user_id     uuid not null references public.users(id) on delete cascade,
  post_id     text not null references public.explore_community_posts(id) on delete cascade,
  reason      text,
  resolved    boolean not null default false,
  created_at  timestamptz default now(),
  primary key (user_id, post_id)
);

create index if not exists idx_explore_post_reports_open on public.explore_post_reports(resolved, post_id);

-- Feed with live appreciation and open-report counts.
create or replace view public.explore_community_feed as
select
  p.*,
  p.base_appreciations + coalesce(a.cnt, 0) as appreciations,
  coalesce(r.cnt, 0)                         as open_reports
from public.explore_community_posts p
left join (select post_id, count(*)::int cnt from public.explore_post_appreciations group by post_id) a on a.post_id = p.id
left join (select post_id, count(*)::int cnt from public.explore_post_reports where not resolved group by post_id) r on r.post_id = p.id;

-- ── Learner state ───────────────────────────────────────────────────────────

create table if not exists public.explore_saved_interests (
  user_id      uuid not null references public.users(id) on delete cascade,
  subject_slug text not null references public.explore_subjects(slug) on delete cascade,
  created_at   timestamptz default now(),
  primary key (user_id, subject_slug)
);

create table if not exists public.explore_project_progress (
  user_id            uuid not null references public.users(id) on delete cascade,
  project_id         text not null references public.explore_lab_projects(id) on delete cascade,
  started            boolean not null default false,
  completed_steps    text[] not null default '{}',
  submission_summary text,
  submission_link    text,
  submitted_at       timestamptz,
  review_status      text check (review_status in ('pending', 'verified', 'returned')),
  review_feedback    text,
  reviewed_by        uuid references public.users(id) on delete set null,
  reviewed_at        timestamptz,
  created_at         timestamptz default now(),
  updated_at         timestamptz default now(),
  primary key (user_id, project_id)
);

create index if not exists idx_explore_progress_review on public.explore_project_progress(review_status) where review_status is not null;

-- ── Timestamps ──────────────────────────────────────────────────────────────

-- Same helper as schema.sql; defined here too so this file runs on its own.
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_explore_subjects_updated_at on public.explore_subjects;
create trigger update_explore_subjects_updated_at before update on public.explore_subjects
  for each row execute function public.update_updated_at_column();

drop trigger if exists update_explore_lab_projects_updated_at on public.explore_lab_projects;
create trigger update_explore_lab_projects_updated_at before update on public.explore_lab_projects
  for each row execute function public.update_updated_at_column();

drop trigger if exists update_explore_resources_updated_at on public.explore_resources;
create trigger update_explore_resources_updated_at before update on public.explore_resources
  for each row execute function public.update_updated_at_column();

drop trigger if exists update_explore_posts_updated_at on public.explore_community_posts;
create trigger update_explore_posts_updated_at before update on public.explore_community_posts
  for each row execute function public.update_updated_at_column();

drop trigger if exists update_explore_progress_updated_at on public.explore_project_progress;
create trigger update_explore_progress_updated_at before update on public.explore_project_progress
  for each row execute function public.update_updated_at_column();

-- ── RLS ─────────────────────────────────────────────────────────────────────
-- The service-role key used by the API routes bypasses these. They only stop
-- the public anon key from reading or writing learner data directly.

alter table public.explore_subjects          enable row level security;
alter table public.explore_lab_projects      enable row level security;
alter table public.explore_resources         enable row level security;
alter table public.explore_community_posts   enable row level security;
alter table public.explore_post_appreciations enable row level security;
alter table public.explore_post_reports      enable row level security;
alter table public.explore_saved_interests   enable row level security;
alter table public.explore_project_progress  enable row level security;

drop policy if exists "Public read explore subjects" on public.explore_subjects;
create policy "Public read explore subjects" on public.explore_subjects for select using (is_published);

drop policy if exists "Public read explore labs" on public.explore_lab_projects;
create policy "Public read explore labs" on public.explore_lab_projects for select using (is_published);

drop policy if exists "Public read explore resources" on public.explore_resources;
create policy "Public read explore resources" on public.explore_resources for select using (is_published);

drop policy if exists "Public read reviewed posts" on public.explore_community_posts;
create policy "Public read reviewed posts" on public.explore_community_posts for select using (moderation = 'reviewed');

-- The feed view runs with the caller's permissions so it respects the policy above.
alter view public.explore_community_feed set (security_invoker = true);
