-- ╔══════════════════════════════════════════════════════╗
-- ║  Wedding Invitation App — Database Schema           ║
-- ╚══════════════════════════════════════════════════════╝

-- Enable UUID generation + pgcrypto for gen_random_bytes / digest
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ─── Events ─────────────────────────────────────────

create table public.events (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  title_ru text not null default '',
  title_it text not null default '',
  date timestamptz not null,
  couple_name_1 text not null default '',
  couple_name_2 text not null default '',
  venue_name_ru text not null default '',
  venue_name_it text not null default '',
  venue_address text not null default '',
  venue_lat double precision,
  venue_lng double precision,
  created_at timestamptz not null default now()
);

-- ─── Guests ─────────────────────────────────────────

create type public.rsvp_status as enum ('pending', 'accepted', 'declined');
create type public.user_role as enum ('guest', 'admin');

create table public.guests (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text not null,
  invite_token text unique not null default encode(gen_random_bytes(16), 'hex'),
  rsvp_status public.rsvp_status not null default 'pending',
  guest_count integer not null default 1,
  comment text,
  role public.user_role not null default 'guest',
  created_at timestamptz not null default now()
);

create index idx_guests_event on public.guests(event_id);
create index idx_guests_user on public.guests(user_id);
create index idx_guests_token on public.guests(invite_token);

-- ─── Personal Invitation Fields (extends guests) ──────

alter table public.guests
  add column if not exists greeting         text,
  add column if not exists display_names    text,
  add column if not exists first_name       text,
  add column if not exists last_name        text,
  add column if not exists partner_first_name text,
  add column if not exists partner_last_name  text,
  add column if not exists locale           text not null default 'ru',
  add column if not exists max_guests       int  not null default 1,
  add column if not exists token_hash       text unique,
  add column if not exists frozen_snapshot  jsonb,
  add column if not exists opened_at        timestamptz,
  add column if not exists last_seen_at     timestamptz;

create index if not exists idx_guests_token_hash on public.guests(token_hash);

-- ─── Invite Sessions (per-device cookies) ──────────────

create table if not exists public.invite_sessions (
  id            uuid primary key default uuid_generate_v4(),
  guest_id      uuid not null references public.guests(id) on delete cascade,
  session_hash  text unique not null,
  user_agent    text,
  created_at    timestamptz not null default now(),
  last_seen_at  timestamptz not null default now()
);

create index if not exists idx_invite_sessions_guest on public.invite_sessions(guest_id);
create index if not exists idx_invite_sessions_hash  on public.invite_sessions(session_hash);

-- ─── Invite Access Logs (audit trail) ─────────────────

create table if not exists public.invite_access_logs (
  id          uuid primary key default uuid_generate_v4(),
  guest_id    uuid not null references public.guests(id) on delete cascade,
  event       text not null,
  user_agent  text,
  ip          text,
  created_at  timestamptz not null default now()
);

create index if not exists idx_invite_access_logs_guest on public.invite_access_logs(guest_id);
create index if not exists idx_invite_access_logs_created on public.invite_access_logs(created_at desc);

alter table public.invite_sessions    enable row level security;
alter table public.invite_access_logs enable row level security;

-- Sessions / access logs: only admins can read directly
create policy "Admins can read sessions"
  on public.invite_sessions for select
  using (
    exists (
      select 1 from public.guests g
      where g.user_id = auth.uid() and g.role = 'admin'
    )
  );

create policy "Admins can read access logs"
  on public.invite_access_logs for select
  using (
    exists (
      select 1 from public.guests g
      where g.user_id = auth.uid() and g.role = 'admin'
    )
  );

-- ─── Content Blocks ─────────────────────────────────

create table public.content_blocks (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references public.events(id) on delete cascade,
  section text not null,
  content_ru jsonb not null default '{}',
  content_it jsonb not null default '{}',
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create index idx_content_event on public.content_blocks(event_id);

-- ─── Timeline Items ─────────────────────────────────

create table public.timeline_items (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references public.events(id) on delete cascade,
  time text not null,
  title_ru text not null default '',
  title_it text not null default '',
  description_ru text not null default '',
  description_it text not null default '',
  icon text,
  sort_order integer not null default 0
);

create index idx_timeline_event on public.timeline_items(event_id);

-- ─── Menu Items ─────────────────────────────────────

create table public.menu_items (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references public.events(id) on delete cascade,
  category_ru text not null default '',
  category_it text not null default '',
  name_ru text not null default '',
  name_it text not null default '',
  description_ru text,
  description_it text,
  sort_order integer not null default 0
);

create index idx_menu_event on public.menu_items(event_id);

-- ─── Messages (Chat) ────────────────────────────────

create type public.sender_role as enum ('guest', 'admin');

create table public.messages (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references public.events(id) on delete cascade,
  guest_id uuid not null references public.guests(id) on delete cascade,
  sender_role public.sender_role not null,
  content text not null,
  created_at timestamptz not null default now()
);

create index idx_messages_guest on public.messages(guest_id);
create index idx_messages_event on public.messages(event_id);

-- ─── Row Level Security ─────────────────────────────

alter table public.events enable row level security;
alter table public.guests enable row level security;
alter table public.content_blocks enable row level security;
alter table public.timeline_items enable row level security;
alter table public.menu_items enable row level security;
alter table public.messages enable row level security;

-- Events: readable by all authenticated users
create policy "Events are publicly readable"
  on public.events for select
  using (true);

-- Guests: users can read their own record, admins can read all
create policy "Guests can read own record"
  on public.guests for select
  using (auth.uid() = user_id);

create policy "Admins can read all guests"
  on public.guests for select
  using (
    exists (
      select 1 from public.guests g
      where g.user_id = auth.uid() and g.role = 'admin'
    )
  );

create policy "Admins can update guests"
  on public.guests for update
  using (
    exists (
      select 1 from public.guests g
      where g.user_id = auth.uid() and g.role = 'admin'
    )
  );

create policy "Guests can update own RSVP"
  on public.guests for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Content: readable by all, writable by admins
create policy "Content is publicly readable"
  on public.content_blocks for select
  using (true);

create policy "Admins can manage content"
  on public.content_blocks for all
  using (
    exists (
      select 1 from public.guests g
      where g.user_id = auth.uid() and g.role = 'admin'
    )
  );

-- Timeline: readable by all, writable by admins
create policy "Timeline is publicly readable"
  on public.timeline_items for select
  using (true);

create policy "Admins can manage timeline"
  on public.timeline_items for all
  using (
    exists (
      select 1 from public.guests g
      where g.user_id = auth.uid() and g.role = 'admin'
    )
  );

-- Menu: readable by all, writable by admins
create policy "Menu is publicly readable"
  on public.menu_items for select
  using (true);

create policy "Admins can manage menu"
  on public.menu_items for all
  using (
    exists (
      select 1 from public.guests g
      where g.user_id = auth.uid() and g.role = 'admin'
    )
  );

-- Messages: guests see own messages, admins see all
create policy "Guests can read own messages"
  on public.messages for select
  using (
    guest_id in (
      select id from public.guests where user_id = auth.uid()
    )
  );

create policy "Admins can read all messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.guests g
      where g.user_id = auth.uid() and g.role = 'admin'
    )
  );

create policy "Guests can insert own messages"
  on public.messages for insert
  with check (
    guest_id in (
      select id from public.guests where user_id = auth.uid()
    )
    and sender_role = 'guest'
  );

create policy "Admins can insert messages"
  on public.messages for insert
  with check (
    exists (
      select 1 from public.guests g
      where g.user_id = auth.uid() and g.role = 'admin'
    )
  );

-- ─── Enable Realtime ────────────────────────────────

alter publication supabase_realtime add table public.messages;

-- ─── Seed Data ──────────────────────────────────────

insert into public.events (slug, title_ru, title_it, date, couple_name_1, couple_name_2, venue_name_ru, venue_name_it, venue_address)
values (
  'wedding',
  'Свадьба Алессандро и Владиславы',
  'Matrimonio di Alessandro e Vladislava',
  '2026-04-11T15:00:00+02:00',
  'Alessandro',
  'Vladislava',
  'Усадьба Богдановичей',
  'Villa Bogdanovich',
  'Адрес: д. Стайки, 20, Minsk Belarus'
);
