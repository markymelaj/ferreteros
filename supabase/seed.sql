-- =====================================================
-- NEXO SUR — Seed v3 (con fotos reales Sodimac + Unsplash)
-- Aplicar DESPUÉS de schema.sql
--
-- 21 productos usan URLs CDN público de Sodimac/Falabella:
--   https://media.falabella.com/sodimacCL/{CODE}{SUFFIX}/...
--
-- Resto usa Unsplash CDN (fotos por categoría).
--
-- Si tu BD ya está operativa, NO uses este seed.
-- Usa supabase/migration_v3.sql en su lugar.
-- =====================================================

-- =====================================================
-- CATEGORÍAS
-- =====================================================
insert into categories (slug, nombre, icono, orden) values
  ('construccion', 'Construcción',         'HardHat',    1),
  ('electrico',    'Eléctrico',            'Zap',        2),
  ('gasfiteria',   'Gasfitería',           'Droplet',    3),
  ('herramientas', 'Herramientas',         'Wrench',     4),
  ('pinturas',     'Pinturas y Adhesivos', 'Paintbrush', 5),
  ('jardin',       'Jardín y Riego',       'Sprout',     6)
on conflict (slug) do nothing;

-- =====================================================
-- PRODUCTOS (30) — precios mercado chileno IVA incluido
-- Imágenes: Sodimac (foto producto real) o Unsplash (foto categoría)
-- =====================================================
with cat as (select slug, id from categories)
insert into products (sku, slug, nombre, descripcion, categoria_id, precio, precio_oferta, unidad, stock_estado, destacado, tipo, imagen_url) values
-- CONSTRUCCIÓN (6) — 3 con foto Sodimac
('FS-001', 'cemento-polpaico-25kg',         'Cemento Polpaico Especial 25kg',         'Cemento de uso general para hormigón, morteros y estucos. Saco 25 kg.', (select id from cat where slug='construccion'), 7990,  6990, 'saco',    'disponible', true,  'producto', 'https://media.falabella.com/sodimacCL/338845X_001/w=800,h=800,fit=cover'),
('FS-002', 'fierro-estriado-10mm-6m',       'Fierro Estriado 10mm x 6m',              'Barra de acero estriado A630-420H, largo 6 m. Calidad para hormigón armado.', (select id from cat where slug='construccion'), 5490,  null, 'barra',   'disponible', false, 'producto', 'https://media.falabella.com/sodimacCL/729299_001/w=800,h=800,fit=cover'),
('FS-003', 'fierro-estriado-12mm-6m',       'Fierro Estriado 12mm x 6m',              'Barra de acero estriado A630-420H, largo 6 m.', (select id from cat where slug='construccion'), 7890,  null, 'barra',   'disponible', false, 'producto', 'https://media.falabella.com/sodimacCL/729299_001/w=800,h=800,fit=cover'),
('FS-004', 'ladrillo-fiscal-hueco',         'Ladrillo Fiscal Hueco',                  'Ladrillo cerámico hueco para muros perimetrales y divisiones.', (select id from cat where slug='construccion'), 350,   299,  'unidad',  'disponible', true,  'producto', 'https://images.unsplash.com/photo-1604147495798-57beb5d6af73?w=800&h=800&fit=crop&auto=format'),
('FS-005', 'plancha-osb-11mm',              'Plancha OSB 11mm 1,22x2,44m',            'Tablero de virutas orientadas, ideal para entrepisos, muros y techumbres.', (select id from cat where slug='construccion'), 13990, null, 'plancha', 'disponible', false, 'producto', 'https://media.falabella.com/sodimacCL/199877_001/w=800,h=800,fit=cover'),
('FS-006', 'plancha-pizarreno-fibrocemento','Plancha Fibrocemento 6mm 1,2x2,4m',      'Plancha lisa de fibrocemento, resistente al agua. Múltiples usos.', (select id from cat where slug='construccion'), 18990, null, 'plancha', 'consultar',  false, 'producto', 'https://images.unsplash.com/photo-1604147495798-57beb5d6af73?w=800&h=800&fit=crop&auto=format'),

-- ELÉCTRICO (5) — 2 con foto Sodimac
('FS-007', 'cable-thhn-1-5mm-rollo',        'Cable THHN 1,5mm² Rollo 100m',           'Cable monoconductor para circuitos de iluminación. Rollo 100 m.', (select id from cat where slug='electrico'), 38990, 34990, 'rollo',  'disponible', true,  'producto', 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&h=800&fit=crop&auto=format'),
('FS-008', 'cable-thhn-2-5mm-rollo',        'Cable THHN 2,5mm² Rollo 100m',           'Cable monoconductor para enchufes. Rollo 100 m.', (select id from cat where slug='electrico'), 49990, null, 'rollo',  'disponible', false, 'producto', 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&h=800&fit=crop&auto=format'),
('FS-009', 'enchufe-doble-bticino',         'Enchufe Doble Embutido Bticino Lifestyle','Enchufe macho doble con tierra, línea Lifestyle blanco.', (select id from cat where slug='electrico'), 4990,  null, 'unidad', 'disponible', false, 'producto', 'https://media.falabella.com/sodimacCL/742961_01/w=800,h=800,fit=cover'),
('FS-010', 'ampolleta-led-9w-e27',          'Ampolleta LED 9W E27 Luz Fría',          'Bajo consumo, 800 lúmenes, equivalente a 60W incandescente.', (select id from cat where slug='electrico'), 1990,  1490, 'unidad', 'disponible', true,  'producto', 'https://media.falabella.com/sodimacCL/3554740_01/w=800,h=800,fit=cover'),
('FS-011', 'alargador-3m-3-tomas',          'Alargador Eléctrico 3m 3 Tomas',         'Alargador con protector y 3 enchufes. Cable 3 m.', (select id from cat where slug='electrico'), 6990,  null, 'unidad', 'disponible', false, 'producto', 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&h=800&fit=crop&auto=format'),

-- GASFITERÍA (5) — 3 con foto Sodimac
('FS-012', 'caneria-pvc-110mm-6m',          'Cañería PVC Sanitario 110mm x 6m',       'Tubería PVC para alcantarillado y desagüe.', (select id from cat where slug='gasfiteria'), 12990, null, 'unidad',  'disponible', false, 'producto', 'https://media.falabella.com/sodimacCL/198013_001/w=800,h=800,fit=cover'),
('FS-013', 'caneria-pvc-50mm-6m',           'Cañería PVC Sanitario 50mm x 6m',        'Tubería PVC para desagües secundarios.', (select id from cat where slug='gasfiteria'), 5990,  null, 'unidad',  'disponible', false, 'producto', 'https://media.falabella.com/sodimacCL/198013_001/w=800,h=800,fit=cover'),
('FS-014', 'llave-paso-bronce-1-2',         'Llave de Paso Bronce 1/2"',              'Llave esférica de bronce con palanca, sello cerámico.', (select id from cat where slug='gasfiteria'), 3490,  2990, 'unidad',  'disponible', true,  'producto', 'https://media.falabella.com/sodimacCL/122661_01/w=800,h=800,fit=cover'),
('FS-015', 'flexible-lavaplatos-40cm',      'Flexible Lavaplatos 40cm 1/2x1/2',       'Conector flexible inoxidable para lavaplatos y baños.', (select id from cat where slug='gasfiteria'), 2490,  null, 'unidad',  'disponible', false, 'producto', 'https://images.unsplash.com/photo-1542013936693-884638332954?w=800&h=800&fit=crop&auto=format'),
('FS-016', 'codo-pvc-110mm-90',             'Codo PVC 110mm 90°',                     'Codo sanitario para cañerías de desagüe.', (select id from cat where slug='gasfiteria'), 1890,  null, 'unidad',  'disponible', false, 'producto', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=800&fit=crop&auto=format'),

-- HERRAMIENTAS (6) — 3 con foto Sodimac
('FS-017', 'taladro-percutor-bosch-gsb',    'Taladro Percutor Bosch GSB 550W',        'Taladro con percutor, 550W, mandril 13mm, maletín incluido.', (select id from cat where slug='herramientas'), 64990, 54990, 'unidad', 'disponible', true,  'producto', 'https://media.falabella.com/sodimacCL/2925176_01/w=800,h=800,fit=cover'),
('FS-018', 'amoladora-makita-115mm',        'Amoladora Angular Makita 115mm 720W',    'Amoladora compacta para corte y desbaste. 720W.', (select id from cat where slug='herramientas'), 49990, null, 'unidad', 'disponible', false, 'producto', 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&h=800&fit=crop&auto=format'),
('FS-019', 'martillo-stanley-16oz',         'Martillo Stanley Antivibración 16oz',    'Martillo de uña con mango ergonómico antivibración.', (select id from cat where slug='herramientas'), 8990,  null, 'unidad', 'disponible', false, 'producto', 'https://media.falabella.com/sodimacCL/127264_001/w=800,h=800,fit=cover'),
('FS-020', 'huincha-medir-stanley-5m',      'Huincha de Medir Stanley PowerLock 5m',  'Huincha métrica con freno y clip. 5 metros.', (select id from cat where slug='herramientas'), 5490,  null, 'unidad', 'disponible', false, 'producto', 'https://media.falabella.com/sodimacCL/686042_001/w=800,h=800,fit=cover'),
('FS-021', 'set-llaves-combinadas-12pcs',   'Set de Llaves Combinadas 12 piezas',     'Llaves combinadas Cr-V 8mm a 22mm en estuche.', (select id from cat where slug='herramientas'), 19990, 16990,'set',    'disponible', true,  'producto', 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=800&h=800&fit=crop&auto=format'),
('FS-022', 'guantes-cabritilla',            'Guantes de Cabritilla Reforzados',       'Guantes de seguridad para trabajos pesados.', (select id from cat where slug='herramientas'), 3990,  null, 'par',    'disponible', false, 'producto', 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&h=800&fit=crop&auto=format'),

-- PINTURAS Y ADHESIVOS (4) — 3 con foto Sodimac
('FS-023', 'pintura-latex-soquina-galon',   'Pintura Látex Sherwin-Williams Galón',   'Látex Premium interior/exterior. Rinde 35–40 m² por galón.', (select id from cat where slug='pinturas'), 22990, 18990,'galón',  'disponible', true,  'producto', 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&h=800&fit=crop&auto=format'),
('FS-024', 'esmalte-sintetico-galon',       'Esmalte Sintético Brillante Galón',      'Esmalte para metal y madera. Acabado brillante. Galón.', (select id from cat where slug='pinturas'), 19990, null, 'galón',  'disponible', false, 'producto', 'https://media.falabella.com/sodimacCL/6016995_01/w=800,h=800,fit=cover'),
('FS-025', 'silicona-blanca-280ml',         'Silicona Acética Blanca 280ml',          'Sellador acético para baños, cocinas y ventanas.', (select id from cat where slug='pinturas'), 2990,  null, 'unidad', 'disponible', false, 'producto', 'https://media.falabella.com/sodimacCL/544098X_01/w=800,h=800,fit=cover'),
('FS-026', 'adhesivo-ceramica-25kg',        'Adhesivo Cerámica Bekron Saco 25kg',     'Adhesivo en polvo para cerámicas en muros y pisos.', (select id from cat where slug='pinturas'), 9990,  7990, 'saco',   'disponible', true,  'producto', 'https://media.falabella.com/sodimacCL/3332454_001/w=800,h=800,fit=cover'),

-- JARDÍN Y RIEGO (4) — 2 con foto Sodimac
('FS-027', 'manguera-jardin-15m',           'Manguera de Jardín 15m con Pistola',     'Manguera reforzada de PVC con pistola multifunción.', (select id from cat where slug='jardin'), 14990, null, 'unidad', 'disponible', false, 'producto', 'https://media.falabella.com/sodimacCL/3299430_001/w=800,h=800,fit=cover'),
('FS-028', 'aspersor-impacto-bronce',       'Aspersor de Impacto Bronce',             'Aspersor regulable para riego de áreas grandes.', (select id from cat where slug='jardin'), 7990,  null, 'unidad', 'disponible', false, 'producto', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=800&fit=crop&auto=format'),
('FS-029', 'tijera-podar-fiskars',          'Tijera de Podar Fiskars 20mm',           'Tijera de podar profesional para ramas hasta 20mm.', (select id from cat where slug='jardin'), 16990, 13990,'unidad', 'disponible', true,  'producto', 'https://media.falabella.com/sodimacCL/3701050_01/w=800,h=800,fit=cover'),
('FS-030', 'cinta-riego-tecnificado-100m',  'Cinta de Riego por Goteo 100m 16mm',     'Cinta de riego tecnificado para huertos y cultivos.', (select id from cat where slug='jardin'), 24990, null, 'rollo',  'disponible', false, 'producto', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=800&fit=crop&auto=format')
on conflict (slug) do nothing;

-- =====================================================
-- ÁRIDOS (7) — todos con foto Sodimac (saco real chileno)
-- =====================================================
with cat as (select id from categories where slug = 'construccion')
insert into products (sku, slug, nombre, descripcion, categoria_id, precio, precio_oferta, unidad, stock_estado, destacado, tipo, imagen_url) values
('AR-001', 'arena-gruesa',      'Arena Gruesa',     'Para hormigón estructural. Granulometría 0–5 mm.',       (select id from cat), 22000, null, 'm³', 'disponible', false, 'arido', 'https://media.falabella.com/sodimacCL/214248_01/w=800,h=800,fit=cover'),
('AR-002', 'arena-fina',        'Arena Fina',       'Para estucos y morteros finos. Tamizada.',               (select id from cat), 25000, 22000,'m³', 'disponible', true,  'arido', 'https://media.falabella.com/sodimacCL/214248_01/w=800,h=800,fit=cover'),
('AR-003', 'gravilla',          'Gravilla 1/2"',    'Para hormigón armado y radieres.',                       (select id from cat), 24000, null, 'm³', 'disponible', false, 'arido', 'https://media.falabella.com/sodimacCL/3385302_001/w=800,h=800,fit=cover'),
('AR-004', 'ripio',             'Ripio Camino',     'Ripio para caminos, sub-bases y rellenos.',              (select id from cat), 18000, null, 'm³', 'disponible', false, 'arido', 'https://media.falabella.com/sodimacCL/214086_01/w=800,h=800,fit=cover'),
('AR-005', 'bolon-desplazador', 'Bolón Desplazador','Para fundaciones, sobrecimientos y muros de contención.',(select id from cat), 26000, null, 'm³', 'disponible', false, 'arido', 'https://media.falabella.com/sodimacCL/284408_01/w=800,h=800,fit=cover'),
('AR-006', 'maicillo',          'Maicillo',         'Para terminaciones de pisos exteriores y caminos.',      (select id from cat), 19000, null, 'm³', 'disponible', false, 'arido', 'https://media.falabella.com/sodimacCL/284408_01/w=800,h=800,fit=cover'),
('AR-007', 'estabilizado',      'Estabilizado',     'Mezcla compactable para sub-bases y patios.',            (select id from cat), 21000, null, 'm³', 'disponible', true,  'arido', 'https://media.falabella.com/sodimacCL/284408_01/w=800,h=800,fit=cover')
on conflict (slug) do nothing;

-- =====================================================
-- MAQUINARIA DE ARRIENDO (3) — todas con foto Sodimac real
-- =====================================================
insert into maquinaria (slug, nombre, descripcion, tarifa_dia, tarifa_semana, tarifa_mes, garantia, requisitos, imagen_url) values
('betonera-130l',
 'Betonera 130 litros',
 'Betonera eléctrica 220V de 130 L de capacidad. Ideal para faenas pequeñas y medianas. Tambor con sistema de volcado por palanca.',
 18000, 95000, 320000, 100000,
 'Cédula de identidad vigente. Comprobante de domicilio. Cheque o efectivo en garantía.',
 'https://media.falabella.com/sodimacCL/37478_01/w=1200,h=900,fit=cover'),
('placa-compactadora',
 'Placa Compactadora Vibratoria',
 'Placa compactadora a bencina, motor 5.5 HP. Para compactación de sub-bases, estabilizados y adoquines.',
 32000, 170000, 580000, 150000,
 'Cédula de identidad vigente. Comprobante de domicilio. Cheque o efectivo en garantía.',
 'https://media.falabella.com/sodimacCL/379850X_01/w=1200,h=900,fit=cover'),
('generador-5500w',
 'Generador Eléctrico 5.500W',
 'Generador a bencina de 5.500W partida manual. Para obras sin acceso a red eléctrica o cortes prolongados.',
 28000, 145000, 490000, 120000,
 'Cédula de identidad vigente. Comprobante de domicilio. Cheque o efectivo en garantía.',
 'https://media.falabella.com/sodimacCL/360263X_001/w=1200,h=900,fit=cover')
on conflict (slug) do nothing;

-- =====================================================
-- ADMINS (descomenta y reemplaza con tu email real)
-- =====================================================
-- insert into admins (email) values ('marky@ejemplo.cl') on conflict do nothing;
