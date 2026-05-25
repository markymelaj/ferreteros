-- =====================================================
-- NEXO SUR — Migration v4
-- Agrega columna 'imagenes_galeria' a products para soportar
-- una galería de imágenes adicionales (además de la portada).
--
-- Modelo:
--   imagen_url        → foto principal / portada (existe desde v1)
--   imagenes_galeria  → array de URLs adicionales (nuevo)
--
-- En la ficha pública se muestran todas, con la portada como
-- imagen principal y las adicionales como miniaturas clickeables.
-- =====================================================

alter table products
  add column if not exists imagenes_galeria text[] default '{}'::text[];

-- Verifica:
--   \d products
--   o:
--   select column_name, data_type from information_schema.columns
--   where table_name='products' and column_name='imagenes_galeria';
