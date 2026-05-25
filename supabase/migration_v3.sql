-- =====================================================
-- NEXO SUR — Migration v3
-- Reemplaza imágenes Unsplash genéricas por fotos REALES
-- de productos desde el CDN público de Sodimac/Falabella.
--
-- Patrón URL:
--   https://media.falabella.com/sodimacCL/{CODE}{SUFFIX}/w=800,h=800,fit=cover
--
-- Aplicar DESPUÉS de migration_v2.sql.
-- Si ya tienes BD operativa, este script es seguro:
--   solo actualiza imagen_url de productos por slug.
--
-- NOTA SOBRE next.config.js:
--   Antes de aplicar, asegúrate de que tu next.config.js tenga
--   'media.falabella.com' en remotePatterns. Sin eso, next/image
--   bloqueará las imágenes y verás placeholders rotos.
-- =====================================================

-- =====================================================
-- 1) PRODUCTOS CON FOTO EXACTA DE SODIMAC
-- =====================================================

-- CONSTRUCCIÓN
update products set imagen_url = 'https://media.falabella.com/sodimacCL/338845X_001/w=800,h=800,fit=cover' where slug = 'cemento-polpaico-25kg';
update products set imagen_url = 'https://media.falabella.com/sodimacCL/729299_001/w=800,h=800,fit=cover' where slug in ('fierro-estriado-10mm-6m', 'fierro-estriado-12mm-6m');
update products set imagen_url = 'https://media.falabella.com/sodimacCL/199877_001/w=800,h=800,fit=cover' where slug = 'plancha-osb-11mm';

-- ELÉCTRICO
update products set imagen_url = 'https://media.falabella.com/sodimacCL/742961_01/w=800,h=800,fit=cover' where slug = 'enchufe-doble-bticino';
update products set imagen_url = 'https://media.falabella.com/sodimacCL/3554740_01/w=800,h=800,fit=cover' where slug = 'ampolleta-led-9w-e27';

-- GASFITERÍA
update products set imagen_url = 'https://media.falabella.com/sodimacCL/198013_001/w=800,h=800,fit=cover' where slug in ('caneria-pvc-110mm-6m', 'caneria-pvc-50mm-6m');
update products set imagen_url = 'https://media.falabella.com/sodimacCL/122661_01/w=800,h=800,fit=cover' where slug = 'llave-paso-bronce-1-2';

-- HERRAMIENTAS
update products set imagen_url = 'https://media.falabella.com/sodimacCL/2925176_01/w=800,h=800,fit=cover' where slug = 'taladro-percutor-bosch-gsb';
update products set imagen_url = 'https://media.falabella.com/sodimacCL/127264_001/w=800,h=800,fit=cover' where slug = 'martillo-stanley-16oz';
update products set imagen_url = 'https://media.falabella.com/sodimacCL/686042_001/w=800,h=800,fit=cover' where slug = 'huincha-medir-stanley-5m';

-- PINTURAS Y ADHESIVOS
update products set imagen_url = 'https://media.falabella.com/sodimacCL/6016995_01/w=800,h=800,fit=cover' where slug = 'esmalte-sintetico-galon';
update products set imagen_url = 'https://media.falabella.com/sodimacCL/544098X_01/w=800,h=800,fit=cover' where slug = 'silicona-blanca-280ml';
update products set imagen_url = 'https://media.falabella.com/sodimacCL/3332454_001/w=800,h=800,fit=cover' where slug = 'adhesivo-ceramica-25kg';

-- JARDÍN
update products set imagen_url = 'https://media.falabella.com/sodimacCL/3299430_001/w=800,h=800,fit=cover' where slug = 'manguera-jardin-15m';
update products set imagen_url = 'https://media.falabella.com/sodimacCL/3701050_01/w=800,h=800,fit=cover' where slug = 'tijera-podar-fiskars';

-- =====================================================
-- 2) ÁRIDOS — saco real chileno con "ÁRIDOS CAVAL CHILE"
-- =====================================================
update products set imagen_url = 'https://media.falabella.com/sodimacCL/214248_01/w=800,h=800,fit=cover'  where slug in ('arena-gruesa', 'arena-fina');
update products set imagen_url = 'https://media.falabella.com/sodimacCL/3385302_001/w=800,h=800,fit=cover' where slug = 'gravilla';
update products set imagen_url = 'https://media.falabella.com/sodimacCL/214086_01/w=800,h=800,fit=cover'  where slug = 'ripio';
update products set imagen_url = 'https://media.falabella.com/sodimacCL/284408_01/w=800,h=800,fit=cover'  where slug in ('bolon-desplazador', 'maicillo', 'estabilizado');

-- =====================================================
-- 3) MAQUINARIA DE ARRIENDO
-- =====================================================
update maquinaria set imagen_url = 'https://media.falabella.com/sodimacCL/37478_01/w=1200,h=900,fit=cover'    where slug = 'betonera-130l';
update maquinaria set imagen_url = 'https://media.falabella.com/sodimacCL/379850X_01/w=1200,h=900,fit=cover' where slug = 'placa-compactadora';
update maquinaria set imagen_url = 'https://media.falabella.com/sodimacCL/360263X_001/w=1200,h=900,fit=cover' where slug = 'generador-5500w';

-- =====================================================
-- LISTO
-- =====================================================
-- Verifica con:
--   select slug, imagen_url from products
--   where imagen_url like '%falabella%'
--   order by slug;
--
-- Quedaron con Unsplash genérico (siguiente iteración):
--   ladrillo-fiscal-hueco, plancha-pizarreno-fibrocemento,
--   cable-thhn-1-5mm-rollo, cable-thhn-2-5mm-rollo,
--   alargador-3m-3-tomas, codo-pvc-110mm-90,
--   flexible-lavaplatos-40cm, amoladora-makita-115mm,
--   set-llaves-combinadas-12pcs, guantes-cabritilla,
--   pintura-latex-soquina-galon, aspersor-impacto-bronce,
--   cinta-riego-tecnificado-100m
