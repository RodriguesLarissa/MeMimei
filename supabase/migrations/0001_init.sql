-- MeMimei — schema inicial (Etapa 3)
-- Rode este arquivo no SQL Editor do seu projeto Supabase (ou via `supabase db push`
-- depois de linkar o projeto com o Supabase CLI).

-- ============================================================================
-- Extensões
-- ============================================================================
create extension if not exists "pgcrypto";

-- ============================================================================
-- Função utilitária: mantém updated_at em dia
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- profiles — dados públicos do anfitrião
-- ============================================================================
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Cria automaticamente um profile quando um novo usuário se cadastra.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- events — eventos criados pelo anfitrião
-- ============================================================================
create table public.events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  occasion_type text not null check (
    occasion_type in ('cha-de-casa-nova', 'casamento', 'aniversario', 'cha-de-bebe', 'formatura')
  ),
  host_names text not null,
  event_date date,
  welcome_message text not null default '',
  cover_image_url text,
  gallery_image_urls text[] not null default '{}',
  theme_color text,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index events_owner_id_idx on public.events (owner_id);
create index events_slug_idx on public.events (slug);

create trigger events_set_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

alter table public.events enable row level security;

create policy "events_select_own"
  on public.events for select
  using (auth.uid() = owner_id);

create policy "events_select_published"
  on public.events for select
  using (is_published = true);

create policy "events_insert_own"
  on public.events for insert
  with check (auth.uid() = owner_id);

create policy "events_update_own"
  on public.events for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "events_delete_own"
  on public.events for delete
  using (auth.uid() = owner_id);

-- ============================================================================
-- gifts — presentes simbólicos associados a um evento
-- ============================================================================
create table public.gifts (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  name text not null,
  description text not null default '',
  image_url text,
  suggested_amount numeric(10, 2) check (suggested_amount is null or suggested_amount >= 0),
  category text not null check (
    category in ('cozinha', 'moveis', 'decoracao', 'eletrodomesticos', 'livre')
  ),
  is_published boolean not null default true,
  allows_free_contribution boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index gifts_event_id_idx on public.gifts (event_id);

create trigger gifts_set_updated_at
  before update on public.gifts
  for each row execute function public.set_updated_at();

alter table public.gifts enable row level security;

create policy "gifts_select_own"
  on public.gifts for select
  using (exists (
    select 1 from public.events e
    where e.id = gifts.event_id and e.owner_id = auth.uid()
  ));

create policy "gifts_select_published"
  on public.gifts for select
  using (
    is_published = true
    and exists (
      select 1 from public.events e
      where e.id = gifts.event_id and e.is_published = true
    )
  );

create policy "gifts_insert_own"
  on public.gifts for insert
  with check (exists (
    select 1 from public.events e
    where e.id = gifts.event_id and e.owner_id = auth.uid()
  ));

create policy "gifts_update_own"
  on public.gifts for update
  using (exists (
    select 1 from public.events e
    where e.id = gifts.event_id and e.owner_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.events e
    where e.id = gifts.event_id and e.owner_id = auth.uid()
  ));

create policy "gifts_delete_own"
  on public.gifts for delete
  using (exists (
    select 1 from public.events e
    where e.id = gifts.event_id and e.owner_id = auth.uid()
  ));
