import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { createAdminClient } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

const VALID_TIPOS = new Set(['producto', 'arido']);
const VALID_STOCK = new Set(['disponible', 'bajo_stock', 'sin_stock', 'consultar']);

function slugify(s: string): string {
  return s.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function parseBool(v: any): boolean {
  if (typeof v !== 'string') return !!v;
  const s = v.toLowerCase().trim();
  return s === 'si' || s === 'sí' || s === 'yes' || s === 'true' || s === '1';
}

export async function POST(req: NextRequest) {
  // 1. Autenticación + verificación admin
  const supabaseAuth = createClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }
  const { data: adminRow } = await supabaseAuth
    .from('admins')
    .select('email')
    .eq('email', user.email)
    .maybeSingle();
  if (!adminRow) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  // 2. Parsear body
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
  }
  if (!Array.isArray(body.rows) || body.rows.length === 0) {
    return NextResponse.json({ error: 'No hay filas para importar' }, { status: 400 });
  }
  if (body.rows.length > 500) {
    return NextResponse.json(
      { error: 'Máximo 500 filas por importación. Divide tu CSV en partes.' },
      { status: 400 }
    );
  }

  // 3. Cargar categorías para resolver slug → id
  const admin = createAdminClient();
  const { data: cats } = await admin.from('categories').select('id, slug');
  const catMap = new Map<string, string>();
  (cats ?? []).forEach((c: any) => catMap.set(c.slug, c.id));

  // 4. Detectar slugs existentes (para distinguir insert vs update)
  const incomingSlugs = body.rows.map((r: any) => r.slug || slugify(r.nombre || '')).filter(Boolean);
  const { data: existing } = await admin
    .from('products')
    .select('slug')
    .in('slug', incomingSlugs);
  const existingSet = new Set((existing ?? []).map((p: any) => p.slug));

  // 5. Preparar payloads
  const payloads = body.rows.map((r: any) => {
    const tipo = VALID_TIPOS.has(r.tipo) ? r.tipo : 'producto';
    const stock = VALID_STOCK.has(r.stock_estado) ? r.stock_estado : 'disponible';
    const nombre = String(r.nombre || '').trim();
    const slug = r.slug ? slugify(r.slug) : slugify(nombre);
    const precio = Math.max(0, parseInt(r.precio, 10) || 0);
    const precioOferta = r.precio_oferta ? parseInt(r.precio_oferta, 10) : null;
    const catId = r.categoria_slug ? (catMap.get(r.categoria_slug) ?? null) : null;
    const imagenUrl = r.imagen_url ? String(r.imagen_url).trim() : null;

    return {
      sku: r.sku ? String(r.sku).trim() : null,
      slug,
      nombre,
      descripcion: r.descripcion ? String(r.descripcion).trim() : null,
      categoria_id: catId,
      precio,
      precio_oferta: precioOferta && precioOferta > 0 ? precioOferta : null,
      unidad: r.unidad ? String(r.unidad).trim() : 'unidad',
      stock_estado: stock,
      destacado: parseBool(r.destacado),
      activo: r.activo === undefined || r.activo === '' ? true : parseBool(r.activo),
      tipo,
      imagen_url: imagenUrl
    };
  });

  // 6. Upsert en chunks de 100 (Postgres on conflict por slug)
  let inserted = 0;
  let updated = 0;
  let failed = 0;
  const errors: string[] = [];

  const chunkSize = 100;
  for (let i = 0; i < payloads.length; i += chunkSize) {
    const chunk = payloads.slice(i, i + chunkSize);
    const { data, error } = await admin
      .from('products')
      .upsert(chunk, { onConflict: 'slug' })
      .select('slug');
    if (error) {
      failed += chunk.length;
      errors.push(error.message);
      continue;
    }
    (data ?? []).forEach((row: any) => {
      if (existingSet.has(row.slug)) {
        updated++;
      } else {
        inserted++;
      }
    });
  }

  return NextResponse.json({
    ok: true,
    inserted,
    updated,
    failed,
    errors: errors.slice(0, 5)
  });
}
