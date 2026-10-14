-- MeMimei — Storage para fotos de eventos e presentes
-- Rode este arquivo no SQL Editor do seu projeto Supabase, depois de já ter
-- rodado 0001_init.sql.

-- ============================================================================
-- Bucket público (leitura livre — as fotos aparecem na página pública do
-- evento, sem necessidade de login)
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('event-images', 'event-images', true)
on conflict (id) do nothing;

-- ============================================================================
-- Políticas: cada usuário só pode gerenciar arquivos dentro da própria pasta
-- (o primeiro segmento do caminho é o seu auth.uid()). Leitura é pública
-- porque o bucket é público.
-- ============================================================================
create policy "event_images_insert_own_folder"
  on storage.objects for insert
  with check (
    bucket_id = 'event-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "event_images_update_own_folder"
  on storage.objects for update
  using (
    bucket_id = 'event-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'event-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "event_images_delete_own_folder"
  on storage.objects for delete
  using (
    bucket_id = 'event-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "event_images_select_own_folder"
  on storage.objects for select
  using (
    bucket_id = 'event-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
