-- MeMimei — Pix direto para a chave do anfitrião (substitui o Mercado Pago)
-- Rode este arquivo no SQL Editor do seu projeto Supabase, depois de já ter
-- rodado as migrações anteriores.

alter table public.profiles
  add column pix_key text,
  add column pix_city text;

alter table public.contributions
  drop column status,
  add column pix_code text not null default '';

drop table public.payment_transactions;
