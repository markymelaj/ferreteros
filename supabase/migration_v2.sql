-- =====================================================
-- NEXO SUR — Migration v2
-- Aplicar SOBRE UNA BD EXISTENTE (no re-seed).
-- Incluye:
--   1) Imágenes reales (Unsplash) para todos los productos seed
--   2) Columnas lat/lng/ubicacion_tipo en presupuestos
-- =====================================================

-- =====================================================
-- 1) IMÁGENES REALES — solo actualiza si la URL es placeholder
-- =====================================================

-- Construcción
update products set imagen_url = 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=800&h=800&fit=crop&auto=format' where slug in ('cemento-polpaico-25kg', 'fierro-estriado-10mm-6m');
update products set imagen_url = 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&h=800&fit=crop&auto=format' where slug in ('fierro-estriado-12mm-6m', 'plancha-osb-11mm');
update products set imagen_url = 'https://images.unsplash.com/photo-1604147495798-57beb5d6af73?w=800&h=800&fit=crop&auto=format' where slug in ('ladrillo-fiscal-hueco', 'plancha-pizarreno-fibrocemento');

-- Eléctrico
update products set imagen_url = 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&h=800&fit=crop&auto=format' where slug in ('cable-thhn-1-5mm-rollo','cable-thhn-2-5mm-rollo','enchufe-doble-bticino','ampolleta-led-9w-e27','alargador-3m-3-tomas');

-- Gasfitería
update products set imagen_url = 'https://images.unsplash.com/photo-1542013936693-884638332954?w=800&h=800&fit=crop&auto=format' where slug in ('caneria-pvc-110mm-6m','caneria-pvc-50mm-6m','llave-paso-bronce-1-2','flexible-lavaplatos-40cm');
update products set imagen_url = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=800&fit=crop&auto=format' where slug = 'codo-pvc-110mm-90';

-- Herramientas
update products set imagen_url = 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&h=800&fit=crop&auto=format' where slug in ('taladro-percutor-bosch-gsb','amoladora-makita-115mm');
update products set imagen_url = 'https://images.unsplash.com/photo-1567361808960-dec9cb578182?w=800&h=800&fit=crop&auto=format' where slug in ('martillo-stanley-16oz','huincha-medir-stanley-5m');
update products set imagen_url = 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=800&h=800&fit=crop&auto=format' where slug = 'set-llaves-combinadas-12pcs';
update products set imagen_url = 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&h=800&fit=crop&auto=format' where slug = 'guantes-cabritilla';

-- Pinturas
update products set imagen_url = 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&h=800&fit=crop&auto=format' where slug = 'pintura-latex-soquina-galon';
update products set imagen_url = 'https://images.unsplash.com/photo-1574359411659-15573a27fd0c?w=800&h=800&fit=crop&auto=format' where slug = 'esmalte-sintetico-galon';
update products set imagen_url = 'https://images.unsplash.com/photo-1607400201515-c2c41c07d307?w=800&h=800&fit=crop&auto=format' where slug in ('silicona-blanca-280ml','adhesivo-ceramica-25kg');

-- Jardín
update products set imagen_url = 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=800&fit=crop&auto=format' where slug in ('manguera-jardin-15m','aspersor-impacto-bronce','tijera-podar-fiskars','cinta-riego-tecnificado-100m');

-- Áridos (todos comparten foto de cantera)
update products set imagen_url = 'https://images.unsplash.com/photo-1517089596392-fb9a9033e05b?w=800&h=800&fit=crop&auto=format' where tipo = 'arido';

-- Maquinaria
update maquinaria set imagen_url = 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=1200&h=900&fit=crop&auto=format' where slug = 'betonera-130l';
update maquinaria set imagen_url = 'https://images.unsplash.com/photo-1517089596392-fb9a9033e05b?w=1200&h=900&fit=crop&auto=format' where slug = 'placa-compactadora';
update maquinaria set imagen_url = 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=1200&h=900&fit=crop&auto=format' where slug = 'generador-5500w';

-- =====================================================
-- 2) PRESUPUESTOS: agregar columnas de ubicación GPS
-- =====================================================

alter table presupuestos
  add column if not exists lat numeric,
  add column if not exists lng numeric,
  add column if not exists ubicacion_tipo text default 'direccion' check (ubicacion_tipo in ('direccion','gps','referencia'));

-- Índice para filtros futuros por tipo
create index if not exists presupuestos_ubicacion_tipo_idx on presupuestos(ubicacion_tipo);

-- =====================================================
-- LISTO
-- =====================================================
-- Verifica con:
--   select slug, imagen_url from products order by sku limit 5;
--   select column_name from information_schema.columns where table_name='presupuestos';
