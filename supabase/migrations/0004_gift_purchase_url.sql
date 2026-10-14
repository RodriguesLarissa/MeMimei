-- MeMimei — link de compra opcional em cada presente
-- Rode este arquivo no SQL Editor do seu projeto Supabase, depois de já ter
-- rodado 0001_init.sql, 0002_storage.sql e 0003_contributions.sql.

alter table public.gifts
  add column purchase_url text;
