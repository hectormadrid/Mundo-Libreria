-- =====================================================================
-- Configuración específica de Supabase (aplicar después de schema.sql).
-- =====================================================================

-- La API pública de Supabase (roles anon y authenticated) no debe tocar las
-- tablas de la tienda: todo pasa por el servidor Node, que valida cada operación.
revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke all on all functions in schema public from anon, authenticated;
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;
alter default privileges in schema public revoke all on functions from anon, authenticated;

-- Bucket público para las imágenes de productos: cualquiera puede verlas por su URL,
-- pero solo el servidor (con la clave secreta) puede subirlas o borrarlas.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('productos', 'productos', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
