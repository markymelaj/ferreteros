import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Wrench } from 'lucide-react';
import { createClient } from '@/lib/supabase-server';
import { ProductCard } from '@/components/ProductCard';
import { SearchFilters } from '@/components/SearchFilters';
import { formatCLP } from '@/lib/format';
import type { Product, Maquinaria, Category } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q?.trim();
  return {
    title: q ? `Resultados: "${q}"` : 'Buscar',
    robots: { index: false }
  };
}

export default async function BuscarPage({
  searchParams
}: {
  searchParams: { q?: string; tipo?: string; cat?: string };
}) {
  const q = (searchParams.q ?? '').trim();
  const tipo = searchParams.tipo ?? '';
  const cat = searchParams.cat ?? '';

  const supabase = createClient();

  const { data: cats } = await supabase
    .from('categories')
    .select('*')
    .eq('activo', true)
    .order('orden');
  const categorias = (cats ?? []) as Category[];

  let categoriaId: string | null = null;
  if (cat) {
    const found = categorias.find((c) => c.slug === cat);
    categoriaId = found?.id ?? null;
  }

  let productosQuery = supabase
    .from('products')
    .select('*, categoria:categories(slug, nombre)')
    .eq('activo', true)
    .order('nombre')
    .limit(80);

  if (q) {
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

  let maquinariaQuery = supabase
    .from('maquinaria')
    .select('*')
    .eq('activo', true)
    .order('nombre')
    .limit(30);
  if (q) {
    maquinariaQuery = maquinariaQuery.or(
      `nombre.ilike.%${q}%,descripcion.ilike.%${q}%`
    );
  }

  const fetchProductos = !tipo || tipo === 'producto' || tipo === 'arido';
  const fetchMaquinaria = !tipo || tipo === 'maquinaria';

  const [prodsRes, maqRes] = await Promise.all([
    fetchProductos ? productosQuery : Promise.resolve({ data: [] }),
    fetchMaquinaria && !categoriaId ? maquinariaQuery : Promise.resolve({ data: [] })
  ]);

  const productos = ((prodsRes.data as Product[]) ?? []);
  const maquinaria = ((maqRes.data as Maquinaria[]) ?? []);
  const total = productos.length + maquinaria.length;

  const hasActiveFilters = q || tipo || cat;

  return (
    <div className="bg-bg-page min-h-screen">
      <div className="container-page py-4">
        <nav className="flex items-center gap-1 text-xs text-text-secondary mb-3">
          <Link href="/" className="hover:text-text-link">Inicio</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-text-primary">Buscar</span>
        </nav>

        <div className="bg-white rounded-card shadow-card px-4 py-3 mb-4">
          {q ? (
            <h1 className="text-xl font-bold text-text-primary">
              Resultados para "<span className="text-text-link">{q}</span>"
            </h1>
          ) : (
            <h1 className="text-xl font-bold text-text-primary">Buscar en el catálogo</h1>
          )}
          {hasActiveFilters ? (
            <p className="text-xs text-text-secondary mt-1">{total} resultados encontrados</p>
          ) : (
            <p className="text-xs text-text-secondary mt-1">Usa la barra superior para buscar.</p>
          )}
        </div>

        <div className="grid lg:grid-cols-[240px_1fr] gap-4">
          <aside>
            <SearchFilters categorias={categorias} q={q} tipoActivo={tipo} catActiva={cat} />
          </aside>

          <section>
            {!hasActiveFilters && (
              <div className="bg-white rounded-card shadow-card p-10 text-center">
                <p className="text-text-secondary mb-4">Empezá escribiendo arriba o eligí un filtro.</p>
                <Link href="/materiales" className="btn-primary">
                  Ver todos los materiales
                </Link>
              </div>
            )}

            {hasActiveFilters && total === 0 && (
              <div className="bg-white rounded-card shadow-card p-10 text-center">
                <p className="text-xl font-bold text-text-primary mb-2">Sin resultados</p>
                <p className="text-sm text-text-secondary mb-4">
                  Probá con otra palabra, sin filtros o con un término más general.
                </p>
                <Link href="/buscar" className="btn-secondary">
                  Limpiar búsqueda
                </Link>
              </div>
            )}

            {productos.length > 0 && (
              <div className="bg-white rounded-card shadow-card overflow-hidden mb-4">
                <div className="px-4 py-3 border-b border-gray-100">
                  <h2 className="text-base font-semibold text-text-primary">
                    Productos · {productos.length}
                  </h2>
                </div>
                <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                  {productos.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
            )}

            {maquinaria.length > 0 && (
              <div className="bg-white rounded-card shadow-card overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-text-link" />
                  <h2 className="text-base font-semibold text-text-primary">
                    Arriendo · {maquinaria.length}
                  </h2>
                </div>
                <div className="p-4 grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {maquinaria.map((m) => (
                    <Link
                      key={m.id}
                      href={`/arriendo/${m.slug}`}
                      className="card flex hover:shadow-card-hover transition-shadow overflow-hidden"
                    >
                      <div className="relative w-24 h-24 bg-bg-sub shrink-0">
                        {m.imagen_url ? (
                          <Image src={m.imagen_url} alt={m.nombre} fill sizes="96px" className="object-contain p-2" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl text-text-tertiary">
                            {m.nombre.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="p-3 flex flex-col flex-1 min-w-0">
                        <span className="text-2xs uppercase tracking-wider text-text-link">
                          Arriendo
                        </span>
                        <h3 className="text-sm font-semibold text-text-primary line-clamp-2">
                          {m.nombre}
                        </h3>
                        <span className="mt-auto text-base font-light text-text-primary">
                          {formatCLP(m.tarifa_dia)}<span className="text-2xs text-text-secondary">/día</span>
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
