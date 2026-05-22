-- =====================================================
-- NEXO SUR — Schema completo
-- Aplicar en Supabase SQL Editor en este orden:
-- 1) schema.sql   2) seed.sql
-- =====================================================

-- Extensiones
create extension if not exists "uuid-ossp";

-- =====================================================
-- TABLAS
-- =====================================================

-- Configuración global (singleton)
create table if not exists settings (
  id int primary key default 1,
  nombre_ferreteria text not null default 'Nexo Sur',
  descripcion_seo text default 'Ferretería, áridos y arriendo de maquinaria — Camino Paraguay, Saltos del Laja',
  telefono_whatsapp text not null default '+56957845292',
  email text default 'contacto@nexosur.cl',
  direccion_fisica text default 'Camino Paraguay s/n, Saltos del Laja, Los Ángeles, Región del Biobío',
  horarios text default 'Lun a Vie 8:30 — 19:00 · Sáb 9:00 — 14:00',
  comunas_despacho text[] default array['Los Ángeles','Cabrero','Yumbel','Tucapel','Antuco','Mulchén','Negrete','Nacimiento','San Rosendo','Laja'],
  iva_pct numeric not null default 19,
  costo_despacho_base int default 15000,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint settings_singleton check (id = 1)
);

-- Categorías
create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  nombre text not null,
  icono text,
  orden int default 0,
  activo boolean default true,
  created_at timestamptz default now()
);

-- Productos (incluye áridos vía columna tipo)
create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  sku text unique,
  slug text not null unique,
  nombre text not null,
  descripcion text,
  categoria_id uuid references categories(id) on delete set null,
  precio int not null,
  precio_oferta int,
  unidad text not null default 'unidad',
  stock_estado text not null default 'disponible' check (stock_estado in ('disponible','bajo_stock','sin_stock','consultar')),
  destacado boolean default false,
  activo boolean default true,
  tipo text not null default 'producto' check (tipo in ('producto','arido')),
  imagen_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Maquinaria para arriendo
create table if not exists maquinaria (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  nombre text not null,
  descripcion text,
  tarifa_dia int not null,
  tarifa_semana int,
  tarifa_mes int,
  garantia int default 0,
  requisitos text,
  imagen_url text,
  activo boolean default true,
  created_at timestamptz default now()
);

-- Presupuestos generados desde el carrito
create table if not exists presupuestos (
  id uuid primary key default uuid_generate_v4(),
  fecha timestamptz default now(),
  items jsonb not null,
  subtotal int not null,
  iva int not null,
  total int not null,
  cliente_nombre text,
  cliente_telefono text,
  cliente_email text,
  comuna text,
  direccion_despacho text,
  observaciones text,
  estado text default 'enviado' check (estado in ('enviado','contactado','vendido','perdido'))
);

-- Admins (lista blanca de emails con acceso)
create table if not exists admins (
  email text primary key,
  created_at timestamptz default now()
);

-- =====================================================
-- ÍNDICES
-- =====================================================
create index if not exists products_categoria_idx on products(categoria_id);
create index if not exists products_destacado_idx on products(destacado) where destacado = true;
create index if not exists products_tipo_idx on products(tipo);
create index if not exists products_activo_idx on products(activo) where activo = true;
create index if not exists presupuestos_fecha_idx on presupuestos(fecha desc);

-- =====================================================
-- TRIGGER updated_at
-- =====================================================
create or replace function touch_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists touch_products on products;
create trigger touch_products before update on products
  for each row execute procedure touch_updated_at();

drop trigger if exists touch_settings on settings;
create trigger touch_settings before update on settings
  for each row execute procedure touch_updated_at();

-- =====================================================
-- HELPER: is_admin()
-- =====================================================
create or replace function is_admin() returns boolean as $$
  select exists (
    select 1 from admins
    where email = (auth.jwt() ->> 'email')
  );
$$ language sql security definer stable;

-- =====================================================
-- RLS
-- =====================================================
alter table settings    enable row level security;
alter table categories  enable row level security;
alter table products    enable row level security;
alter table maquinaria  enable row level security;
alter table presupuestos enable row level security;
alter table admins      enable row level security;

-- Lectura pública para catálogo
drop policy if exists "read settings"    on settings;
create policy "read settings"    on settings    for select using (true);

drop policy if exists "read categories"  on categories;
create policy "read categories"  on categories  for select using (activo = true or is_admin());

drop policy if exists "read products"    on products;
create policy "read products"    on products    for select using (activo = true or is_admin());

drop policy if exists "read maquinaria"  on maquinaria;
create policy "read maquinaria"  on maquinaria  for select using (activo = true or is_admin());

-- Insert público de presupuestos (cliente cotizando)
drop policy if exists "insert presupuestos" on presupuestos;
create policy "insert presupuestos" on presupuestos for insert with check (true);

-- Solo admins pueden leer presupuestos
drop policy if exists "read presupuestos admin" on presupuestos;
create policy "read presupuestos admin" on presupuestos for select using (is_admin());

drop policy if exists "update presupuestos admin" on presupuestos;
create policy "update presupuestos admin" on presupuestos for update using (is_admin());

-- Escritura solo admin
drop policy if exists "admin write settings"   on settings;
create policy "admin write settings"   on settings   for all using (is_admin()) with check (is_admin());

drop policy if exists "admin write categories" on categories;
create policy "admin write categories" on categories for all using (is_admin()) with check (is_admin());

drop policy if exists "admin write products"   on products;
create policy "admin write products"   on products   for all using (is_admin()) with check (is_admin());

drop policy if exists "admin write maquinaria" on maquinaria;
create policy "admin write maquinaria" on maquinaria for all using (is_admin()) with check (is_admin());

drop policy if exists "admin read admins" on admins;
create policy "admin read admins" on admins for select using (is_admin());

-- =====================================================
-- BOOTSTRAP: row inicial de settings
-- =====================================================
insert into settings (id) values (1) on conflict (id) do nothing;
