-- MeMimei — contribuições e transações de pagamento (Etapa 4)
-- Rode este arquivo no SQL Editor do seu projeto Supabase, depois de já ter
-- rodado 0001_init.sql e 0002_storage.sql.

-- ============================================================================
-- contributions — um convidado contribuindo pra um presente (ou valor livre)
-- ============================================================================
create table public.contributions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  gift_id uuid references public.gifts (id) on delete set null,
  guest_name text,
  guest_message text,
  amount numeric(10, 2) not null check (amount > 0),
  status text not null default 'pending' check (
    status in ('pending', 'confirmed', 'cancelled', 'expired')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index contributions_event_id_idx on public.contributions (event_id);
create index contributions_gift_id_idx on public.contributions (gift_id);

create trigger contributions_set_updated_at
  before update on public.contributions
  for each row execute function public.set_updated_at();

alter table public.contributions enable row level security;

-- Só o dono do evento pode ler as contribuições — toda escrita é feita pelo
-- backend com a service role (bypassa RLS), não há política de insert/update.
create policy "contributions_select_own"
  on public.contributions for select
  using (exists (
    select 1 from public.events e
    where e.id = contributions.event_id and e.owner_id = auth.uid()
  ));

-- ============================================================================
-- payment_transactions — retorno do provedor de pagamento (Mercado Pago)
-- ============================================================================
create table public.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  contribution_id uuid not null references public.contributions (id) on delete cascade,
  provider text not null default 'mercadopago',
  provider_payment_id text not null unique,
  status text not null default 'pending',
  amount numeric(10, 2) not null,
  fee numeric(10, 2),
  raw_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index payment_transactions_contribution_id_idx on public.payment_transactions (contribution_id);

create trigger payment_transactions_set_updated_at
  before update on public.payment_transactions
  for each row execute function public.set_updated_at();

alter table public.payment_transactions enable row level security;

create policy "payment_transactions_select_own"
  on public.payment_transactions for select
  using (exists (
    select 1 from public.contributions c
    join public.events e on e.id = c.event_id
    where c.id = payment_transactions.contribution_id and e.owner_id = auth.uid()
  ));
