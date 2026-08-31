-- =========================================================
-- MoneyFlow — Supabase schema
-- Run this in Supabase SQL Editor (or `supabase db push`)
-- =========================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------
-- profiles  (mirrors "users" table from the spec; auth.users
-- already stores the login identity, this stores app profile)
-- ---------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: read own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles: update own" on public.profiles
  for update using (auth.uid() = id);

-- auto-create a profile row whenever someone signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', ''), new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------
-- transactions
-- ---------------------------------------------------------
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('income', 'expense')),
  amount numeric(12, 2) not null check (amount > 0),
  category text not null default 'other',
  description text not null,
  date date not null default current_date,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists transactions_user_date_idx
  on public.transactions (user_id, date desc);

alter table public.transactions enable row level security;

create policy "transactions: select own" on public.transactions
  for select using (auth.uid() = user_id);
create policy "transactions: insert own" on public.transactions
  for insert with check (auth.uid() = user_id);
create policy "transactions: update own" on public.transactions
  for update using (auth.uid() = user_id);
create policy "transactions: delete own" on public.transactions
  for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------
-- debts
-- ---------------------------------------------------------
create table if not exists public.debts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null default 'other',
  icon text not null default '💳',
  original_amount numeric(12, 2) not null check (original_amount > 0),
  remaining_amount numeric(12, 2) not null check (remaining_amount >= 0),
  monthly_payment numeric(12, 2) not null default 0,
  interest_rate numeric(5, 2) not null default 0,
  due_day int not null check (due_day between 1 and 31),
  note text,
  created_at timestamptz not null default now()
);

create index if not exists debts_user_idx on public.debts (user_id);

alter table public.debts enable row level security;

create policy "debts: select own" on public.debts
  for select using (auth.uid() = user_id);
create policy "debts: insert own" on public.debts
  for insert with check (auth.uid() = user_id);
create policy "debts: update own" on public.debts
  for update using (auth.uid() = user_id);
create policy "debts: delete own" on public.debts
  for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------
-- reminders  (one row per debt storing which lead-times are on)
-- ---------------------------------------------------------
create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  debt_id uuid references public.debts(id) on delete cascade,
  reminder_days int not null check (reminder_days in (7, 3, 1, 0)),
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  unique (user_id, debt_id, reminder_days)
);

alter table public.reminders enable row level security;

create policy "reminders: select own" on public.reminders
  for select using (auth.uid() = user_id);
create policy "reminders: insert own" on public.reminders
  for insert with check (auth.uid() = user_id);
create policy "reminders: update own" on public.reminders
  for update using (auth.uid() = user_id);
create policy "reminders: delete own" on public.reminders
  for delete using (auth.uid() = user_id);

-- seed the 4 default reminder levels (7/3/1/0 days, all enabled)
-- for every new debt a user creates
create or replace function public.seed_default_reminders()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.reminders (user_id, debt_id, reminder_days, enabled)
  values
    (new.user_id, new.id, 7, true),
    (new.user_id, new.id, 3, true),
    (new.user_id, new.id, 1, true),
    (new.user_id, new.id, 0, true);
  return new;
end;
$$;

drop trigger if exists on_debt_created on public.debts;
create trigger on_debt_created
  after insert on public.debts
  for each row execute procedure public.seed_default_reminders();

-- ---------------------------------------------------------
-- line_links  (pairs a LINE user with an app user, so the
-- LINE webhook knows whose transactions table to write to)
-- ---------------------------------------------------------
create table if not exists public.line_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  line_user_id text unique,
  link_code text,
  link_code_expires_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.line_links enable row level security;

-- the app (logged-in user) can see/create/refresh its own link row
create policy "line_links: select own" on public.line_links
  for select using (auth.uid() = user_id);
create policy "line_links: insert own" on public.line_links
  for insert with check (auth.uid() = user_id);
create policy "line_links: update own" on public.line_links
  for update using (auth.uid() = user_id);

-- NOTE: the LINE webhook itself is not an authenticated app user (LINE's
-- servers call it), so it reads/writes line_links and transactions using
-- the Supabase *service role* key from the server only (see lib/supabase/admin.ts).
-- That key bypasses RLS — never expose it to the browser.

-- ---------------------------------------------------------
-- LINE integration
-- ---------------------------------------------------------

-- one LINE account can link to exactly one MoneyFlow user
create table if not exists public.line_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  line_user_id text not null unique,
  linked_at timestamptz not null default now()
);

alter table public.line_accounts enable row level security;

create policy "line_accounts: select own" on public.line_accounts
  for select using (auth.uid() = user_id);
create policy "line_accounts: delete own" on public.line_accounts
  for delete using (auth.uid() = user_id);
-- no insert/update policy for normal users — only the webhook (service role,
-- which bypasses RLS) is allowed to create the link, after verifying a code.

-- short-lived one-time codes a user generates in Settings and pastes into LINE
create table if not exists public.line_link_codes (
  code text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  used_at timestamptz
);

alter table public.line_link_codes enable row level security;

create policy "line_link_codes: select own" on public.line_link_codes
  for select using (auth.uid() = user_id);
create policy "line_link_codes: insert own" on public.line_link_codes
  for insert with check (auth.uid() = user_id);
-- marking a code as used is done by the webhook via the service role key.
