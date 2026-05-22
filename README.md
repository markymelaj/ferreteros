# Nexo Sur — Ferretería Piloto

Plataforma piloto de ferretería para Chile: catálogo, áridos, arriendo de maquinaria y cotización vía WhatsApp + PDF descargable. Hecha para clonar y vender a otras ferreterías regionales.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind · Supabase · jsPDF · Vercel
**Demo:** `https://ferreteria-piloto.vercel.app`

---

## Características

- 🧱 **Catálogo** con categorías, filtros, ficha individual y productos relacionados
- 🪨 **Áridos por m³** con calculadora de volumen integrada
- ⛏️ **Arriendo de maquinaria** con tarifas día/semana/mes
- 🛒 **Carrito** persistente en localStorage (sin login para clientes)
- 📲 **Cotización WhatsApp**: el botón "Enviar cotización" registra el presupuesto, descarga el PDF y abre WhatsApp con el mensaje pre-armado
- 🔐 **Panel admin** con magic link (Supabase Auth) y whitelist de emails:
  - Dashboard con métricas mensuales
  - CRUD productos (precio, oferta, destacado, stock, foto)
  - CRUD categorías y maquinaria
  - Listado de presupuestos con cambio de estado y contacto directo
  - Settings configurables (nombre, teléfono, comunas, IVA, etc.)
- 🎨 **Identidad propia**: navy + naranja, tipografía industrial (Archivo Black + Manrope)
- 🌐 SEO básico, OpenGraph y revalidación ISR cada 60s

---

## Setup paso a paso

### 1. Crear proyecto Supabase

1. Entra a [supabase.com](https://supabase.com) y crea un proyecto nuevo.
2. Anota la URL del proyecto y las API keys (`anon` y `service_role`) desde **Project Settings → API**.

### 2. Aplicar el esquema y los datos de prueba

En el **SQL Editor** de Supabase, ejecuta en orden:

1. `supabase/schema.sql` — crea tablas, índices, RLS y el helper `is_admin()`.
2. `supabase/seed.sql` — inserta 6 categorías, 30 productos, 7 áridos y 3 máquinas.

### 3. Autorizar al admin

En el SQL Editor (o desde **Table Editor → admins**), agrega tu correo:

```sql
insert into admins (email) values ('tu-email@dominio.cl');
```

Solo los emails listados aquí podrán entrar al panel `/admin`.

### 4. Configurar Authentication

En **Authentication → Providers**, asegúrate de que **Email** esté activo. Para producción configura tu dominio en **URL Configuration**.

### 5. Variables de entorno locales

Copia `.env.example` a `.env.local` y completa:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` es **secreta**. No la expongas y nunca con prefijo `NEXT_PUBLIC_`.

### 6. Instalar y correr

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`.

Para entrar al admin: `http://localhost:3000/admin/login` → ingresa tu email autorizado → revisa tu inbox → click al magic link.

---

## Deploy a Vercel

1. Crea un repo en GitHub y pushea este proyecto.
2. En [vercel.com](https://vercel.com), importa el repo (framework: Next.js, detecta solo).
3. Agrega las **variables de entorno** (las mismas del `.env.local`, pero con `NEXT_PUBLIC_SITE_URL` apuntando al dominio final).
4. Deploy. Vercel te dará una URL `*.vercel.app` que puedes usar o conectar a un dominio propio.
5. En Supabase **Authentication → URL Configuration**, agrega tu dominio Vercel en *Site URL* y *Redirect URLs*.

---

## Cómo clonar este piloto para otra ferretería

Este proyecto fue diseñado para revenderse. Para crear una instancia para un cliente nuevo:

1. Crea un nuevo proyecto Supabase para ese cliente.
2. Aplica `schema.sql` (los datos son específicos por cliente).
3. Aplica `seed.sql` solo si quieres datos de muestra; en general, mejor llenar el catálogo desde el panel admin.
4. Actualiza la tabla `settings` con los datos reales del cliente (nombre, teléfono, dirección, comunas).
5. Cambia las credenciales y deploy con su propio dominio.

Todo el branding (nombre, teléfono, dirección, comunas, IVA) se edita desde `/admin/settings` sin tocar código.

Si el cliente quiere otros colores, edita:
- `tailwind.config.ts` → secciones `colors.navy` y `colors.ember`
- `app/globals.css` → variables `--color-*`

---

## Estructura del proyecto

```
nexo-sur/
├─ app/
│  ├─ (público) page.tsx, catalogo, categoria/[slug], producto/[slug],
│  │   aridos, arriendo, arriendo/[slug], carrito, contacto
│  ├─ admin/ (dashboard, productos, categorias, maquinaria, presupuestos,
│  │   settings, login)
│  ├─ api/presupuestos/route.ts
│  └─ layout.tsx, globals.css
├─ components/ (Header, Footer, ProductCard, CategoryGrid,
│  AddToCartButton, CartCheckout, AridosCalculator, WhatsAppFloat,
│  admin/*)
├─ lib/ (types, supabase clients, format, cart, quote)
├─ supabase/ (schema.sql, seed.sql)
├─ tailwind.config.ts, next.config.js, package.json
```

---

## Notas y siguientes pasos

- **Imágenes**: por defecto cada producto muestra una letra grande estilizada como placeholder. Para usar imágenes reales, sube las fotos a **Supabase Storage** y pega la URL pública en cada producto desde el admin.
- **Pasarela de pago**: no incluida por diseño — el flujo es cotización + WhatsApp. Si en el futuro se quiere agregar Flow / Khipu / Mercado Pago, se inserta entre `CartCheckout` y la API `/api/presupuestos`.
- **Stock real**: el campo `stock_estado` es solo cualitativo (`disponible / bajo_stock / sin_stock / consultar`). Para inventario numérico se puede agregar una columna `stock_qty integer` y restarla en el endpoint del presupuesto.

---

© 2025 Luminart SpA. MIT.
