import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/buscar?q=texto&tipo=producto|arido|maquinaria&cat=slug
 * Retorna { productos: [...], maquinaria: [...], total: N }
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const q = (sp.get('q') ?? '').trim();
  const tipo = sp.get('tipo'); // 'producto' | 'arido' | 'maquinaria' | null
  const cat = sp.get('cat');   // slug de categoría

  // Si la búsqueda viene vacía y no hay filtros, devolver vacío
  if (!q && !tipo && !cat) {
    return NextResponse.json({ productos: [], maquinaria: [], total: 0 });
  }

  const supabase = createClient();

  // Resolver categoría por slug si vino
  let categoriaId: string | null = null;
  if (cat) {
    const { data: catData } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', cat)
      .maybeSingle();
    categoriaId = catData?.id ?? null;
  }

  // Query base productos
  let productosQuery = supabase
    .from('products')
    .select('*, categoria:categories(slug, nombre)')
    .eq('activo', true)
    .limit(60);

  if (q) {
    // ilike sobre nombre, descripcion y sku
    productosQuery = productosQuery.or(
      `nombre.ilike.%${q}%,descripcion.ilike.%${q}%,sku.ilike.%${q}%`
    );
  }
  if (tipo === 'producto' || tipo === 'arido') {
    productosQuery = productosQuery.eq('tipo', tipo);
  }
  if (categoriaId) {
    productosQuery = productosQuery.eq('categoria_id', categoriaId);
  }

  // Query maquinaria (solo si no se pidió excluir explícitamente)
  let maquinariaQuery = supabase
    .from('maquinaria')
    .select('*')
    .eq('activo', true)
    .limit(20);

  if (q) {
    maquinariaQuery = maquinariaQuery.or(
      `nombre.ilike.%${q}%,descripcion.ilike.%${q}%`
    );
  }

  const shouldFetchMaquinaria = !tipo || tipo === 'maquinaria';
  const shouldFetchProductos = !tipo || tipo === 'producto' || tipo === 'arido';

  const [prodsResult, maqResult] = await Promise.all([
    shouldFetchProductos ? productosQuery : Promise.resolve({ data: [], error: null }),
    shouldFetchMaquinaria ? maquinariaQuery : Promise.resolve({ data: [], error: null })
  ]);

  if (prodsResult.error) {
    return NextResponse.json({ error: prodsResult.error.message }, { status: 500 });
  }
  if (maqResult.error) {
    return NextResponse.json({ error: maqResult.error.message }, { status: 500 });
  }

  const productos = prodsResult.data ?? [];
  const maquinaria = maqResult.data ?? [];

  return NextResponse.json({
    productos,
    maquinaria,
    total: productos.length + maquinaria.length,
    query: q,
    filtros: { tipo, cat }
  });
}
