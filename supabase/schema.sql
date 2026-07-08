-- Edu Platform Supabase Schema
-- Global roles: admins and moderators are platform-wide (not per-school)
-- Students belong to a school; admin and moderator users are global and do not have school-specific student fields

create extension if not exists "uuid-ossp";

-- ============================================
-- USERS
-- ============================================
create table public.users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  password_hash text,
  role text not null check (role in ('moderator', 'admin')),
  name text not null,
  is_super_admin boolean default false, 
  last_login timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
);

create index idx_users_role on public.users(role);

-- ============================================
-- SCHOOLS
-- ============================================
create table public.schools (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null default 'SCH-' || lpad((floor(random() * 9000) + 1000)::text, 4, '0'),
  name text not null,
  tier text not null check (tier in ('Small', 'Medium', 'Large')),
  total_points int default 0,
  is_active boolean default true,
  location text not null,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_schools_tier on public.schools(tier);

-- ============================================
-- STUDENTS
-- ============================================
create table public.students (
  id uuid primary key references public.users(id) on delete cascade,
  student_id text unique not null,
  school_id uuid not null references public.schools(id) on delete cascade,
  total_credits int default 0,
  available_credits int default 0,
  withheld_credits int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_students_school_id on public.students(school_id);

-- ============================================
-- CATEGORIES
-- ============================================
create table public.categories (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  icon text not null,
  code TEXT UNIQUE NOT NULL,
  status text not null default 'Active' check (status in ('Active', 'Inactive')),
);

-- ============================================
-- CONTENT (reading material by category)
-- ============================================
create table public.content (
  id uuid primary key default uuid_generate_v4(),
  category_id uuid not null references public.categories(id) on delete cascade,
  level text not null check (level in ('Essential', 'Intermediate', 'Advanced')),
  title text not null,
  description text default '',
  content text not null,
  page_count int default 0,
  is_published boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_content_category_id on public.content(category_id);


-- ============================================
-- READING PROGRESS
-- ============================================
create table public.reading_progress (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  content_id uuid not null references public.content(id) on delete cascade,
  pages_read int default 0,
  is_completed boolean default false,
  started_at timestamptz default now(),
  completed_at timestamptz,
  unique(user_id, content_id)
);

create index idx_reading_progress_user_id on public.reading_progress(user_id);


-- ============================================
-- SUPPORT TICKETS
-- ============================================
create table public.tickets (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null default 'TKT-' || lpad((floor(random() * 900) + 100)::text, 3, '0'),
  type text not null check (type in ('Dispute', 'Technical', 'Support')),
  title text not null,
  description text default '',
  status text not null default 'Open' check (status in ('Open', 'In Progress', 'Resolved')),
  priority text default 'Medium' check (priority in ('Low', 'Medium', 'High')),
  submitted_by uuid not null references public.users(id) on delete cascade,
  school_id uuid references public.schools(id) on delete set null,
  assigned_to uuid references public.users(id) on delete set null,
  resolution text default '',
  resolved_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_tickets_status on public.tickets(status);
create index idx_tickets_type on public.tickets(type);
create index idx_tickets_submitted_by on public.tickets(submitted_by);

-- ============================================
-- TRIGGER: update timestamps
-- ============================================
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language 'plpgsql';

create trigger update_users_updated_at before update on public.users
  for each row execute function public.update_updated_at_column();

create trigger update_schools_updated_at before update on public.schools
  for each row execute function public.update_updated_at_column();

create trigger update_categories_updated_at before update on public.categories
  for each row execute function public.update_updated_at_column();

create trigger update_content_updated_at before update on public.content
  for each row execute function public.update_updated_at_column();

create trigger update_tickets_updated_at before update on public.tickets
  for each row execute function public.update_updated_at_column();

create trigger update_students_updated_at before update on public.students
  for each row execute function public.update_updated_at_column();

create or replace function public.ensure_student_role()
returns trigger as $$
begin
  if not exists (
    select 1 from public.users where id = new.id and role = 'student'
  ) then
    raise exception 'student row must reference a user with role=student';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger ensure_student_role before insert or update on public.students
  for each row execute function public.ensure_student_role();

-- ============================================
-- RLS POLICIES
-- ============================================
alter table public.users enable row level security;
alter table public.students enable row level security;
alter table public.schools enable row level security;
alter table public.categories enable row level security;
alter table public.content enable row level security;
alter table public.credit_transactions enable row level security;
alter table public.approval_requests enable row level security;
alter table public.reading_progress enable row level security;
alter table public.boosts enable row level security;
alter table public.user_boosts enable row level security;
alter table public.ranks enable row level security;
alter table public.tickets enable row level security;
alter table public.content_levels enable row level security;

-- Students: read own user data only
create policy "Students read own user data" on public.users for select
  using (auth.uid() = id);

create policy "Students update own user data" on public.users for update
  using (auth.uid() = id);

create policy "Global moderators/admins read users" on public.users for select
  using (
    exists (
      select 1 from public.users where id = auth.uid() and role in ('moderator', 'admin')
    )
  );

create policy "Global moderators/admins write users" on public.users for update
  using (
    exists (
      select 1 from public.users where id = auth.uid() and role in ('moderator', 'admin')
    )
  );

-- Students: read own student profile rows
create policy "Students read own student row" on public.students for select
  using (auth.uid() = id);

create policy "Students update own student row" on public.students for update
  using (auth.uid() = id);

create policy "Students insert own student row" on public.students for insert
  with check (auth.uid() = id);

create policy "Global moderators/admins read student rows" on public.students for select
  using (
    exists (
      select 1 from public.users where id = auth.uid() and role in ('moderator', 'admin')
    )
  );

create policy "Global moderators/admins write student rows" on public.students for all
  using (
    exists (
      select 1 from public.users where id = auth.uid() and role in ('moderator', 'admin')
    )
  );

-- Global read for schools; global write for admins/moderators
create policy "Public read schools" on public.schools for select using (true);
create policy "Global admins write schools" on public.schools for all
  using (
    exists (
      select 1 from public.users where id = auth.uid()
      and role in ('admin')
    )
  );
create policy "Global moderators read schools" on public.schools for select
  using (
    exists (
      select 1 from public.users where id = auth.uid()
      and role in ('moderator', 'admin')
    )
  );

-- Public read categories
create policy "Public read categories" on public.categories for select using (true);
create policy "Global moderators write categories" on public.categories for all
  using (
    exists (
      select 1 from public.users where id = auth.uid()
      and role in ('moderator', 'admin')
    )
  );

-- Public read content
create policy "Public read content" on public.content for select using (true);
create policy "Global moderators write content" on public.content for all
  using (
    exists (
      select 1 from public.users where id = auth.uid()
      and role in ('moderator', 'admin')
    )
  );

-- Students read own transactions
create policy "Students read own transactions" on public.credit_transactions for select
  using (auth.uid() = user_id);

-- Students read own reading progress
create policy "Students read own progress" on public.reading_progress for select
  using (auth.uid() = user_id);

create policy "Students upsert own progress" on public.reading_progress for insert
  with check (auth.uid() = user_id);

create policy "Students update own progress" on public.reading_progress for update
  using (auth.uid() = user_id);

-- Public read boosts, students buy boosts
create policy "Public read boosts" on public.boosts for select using (true);
create policy "Global moderators write boosts" on public.boosts for all
  using (
    exists (
      select 1 from public.users where id = auth.uid()
      and role in ('moderator', 'admin')
    )
  );

-- Students read/write own boosts
create policy "Students read own boosts" on public.user_boosts for select
  using (auth.uid() = user_id);

create policy "Students buy boosts" on public.user_boosts for insert
  with check (auth.uid() = user_id);

-- Public read ranks; global moderators/admins write
create policy "Public read ranks" on public.ranks for select using (true);
create policy "Global moderators write ranks" on public.ranks for all
  using (
    exists (
      select 1 from public.users where id = auth.uid()
      and role in ('moderator', 'admin')
    )
  );

-- Students read own tickets
create policy "Students read own tickets" on public.tickets for select
  using (auth.uid() = submitted_by);

-- Global moderators/admins manage all tickets
create policy "Global moderators read all tickets" on public.tickets for select
  using (
    exists (
      select 1 from public.users where id = auth.uid()
      and role in ('moderator', 'admin')
    )
  );

create policy "Global moderators write tickets" on public.tickets for update
  using (
    exists (
      select 1 from public.users where id = auth.uid()
      and role in ('moderator', 'admin')
    )
  );

-- Users read own approval
create policy "Users read own approval" on public.approval_requests for select
  using (auth.uid() = user_id);

-- Global moderators/admins manage all approvals
create policy "Global moderators read all approvals" on public.approval_requests for select
  using (
    exists (
      select 1 from public.users where id = auth.uid()
      and role in ('moderator', 'admin')
    )
  );

create policy "Global moderators write approvals" on public.approval_requests for all
  using (
    exists (
      select 1 from public.users where id = auth.uid()
      and role in ('moderator', 'admin')
    )
  );
create policy "Students insert own approval" on public.approval_requests for insert
  with check (auth.uid() = user_id);

-- Students read own profile fields
create policy "Students read own content levels" on public.content_levels for select
  using (true);
create policy "Global moderators write content levels" on public.content_levels for all
  using (
    exists (
      select 1 from public.users where id = auth.uid()
      and role in ('moderator', 'admin')
    )
  );