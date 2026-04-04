-- Run in Supabase SQL Editor (or via migrations).
-- Adjust if these objects already exist.

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

create table if not exists public.gear_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  brand text,
  model text,
  category_id uuid references public.categories (id) on delete set null,
  condition text not null,
  weight numeric,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists gear_items_user_id_idx on public.gear_items (user_id);

alter table public.categories enable row level security;
alter table public.gear_items enable row level security;

create policy "categories_select_authenticated"
  on public.categories for select
  to authenticated
  using (true);

create policy "gear_items_select_own"
  on public.gear_items for select
  to authenticated
  using (auth.uid() = user_id);

create policy "gear_items_insert_own"
  on public.gear_items for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "gear_items_update_own"
  on public.gear_items for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "gear_items_delete_own"
  on public.gear_items for delete
  to authenticated
  using (auth.uid() = user_id);

insert into public.categories (name)
values
  ('Tents & Shelters'),
  ('Sleep Systems'),
  ('Cooking'),
  ('Clothing'),
  ('Navigation'),
  ('Safety'),
  ('Other')
on conflict (name) do nothing;
