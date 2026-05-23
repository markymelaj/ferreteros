import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';
import { ProductCard } from '@/components/ProductCard';
import { SearchFilters } from '@/components/SearchFilters';
import { formatCLP } from '@/lib/format';
import { Wrench } from 'lucide-react';
import Image from 'next/image';
import type { Product, Maquinaria, Category } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  searchParams
}: {
  searchParams: { q?: string };
}) {
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

  // Cargar categorías para los filtros
  const { data: cats } = await supabase
    .from('categories')
    .select('*')
    .eq('activo', true)
    .order('orden');
  const categorias = (cats ?? []) as Category[];

  // Resolver cat slug -> id
  let categoriaId: string | null = null;
  if (cat) {
    const found = categorias.find((c) => c.slug === cat);
    categoriaId = found?.id ?? null;
  }

  // Query productos
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

  // Query maquinaria
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
    <div className="max-w-7xl mx-auto px-4 py-10">
      <header className="mb-6">
        <span className="font-display uppercase text-xs tracking-widest text-ember">
          Búsqueda
        </span>
        {q ? (
          <h1 className="font-display uppercase text-3xl md:text-4xl text-navy">
            Resultados para "{q}"
          </h1>
        ) : (
          <h1 className="font-display uppercase text-3xl md:text-4xl text-navy">
            Buscar en el catálogo
          </h1>
        )}
        <p className="text-navy/70 mt-2">
          {hasActiveFilters
            ? `${total} ${total === 1 ? 'resultado encontrado' : 'resultados encontrados'}`
            : 'Usa la barra superior para buscar, o filtra por categoría.'}
        </p>
      </header>

      <div className="grid lg:grid-cols-[240px_1fr] gap-8">
        <aside>
          <SearchFilters
            categorias={categorias}
            q={q}
            tipoActivo={tipo}
            catActiva={cat}
          />
        </aside>

        <section>
          {!hasActiveFilters && (
            <div className="bg-white border-2 border-navy p-8 text-center">
              <p className="text-navy/60 mb-4">
                Empieza escribiendo arriba o elige un filtro.
              </p>
              <Link href="/materiales" className="btn-brutal">
                Ver todos los materiales
              </Link>
            </div>
          )}

          {hasActiveFilters && total === 0 && (
            <div className="bg-white border-2 border-navy p-8 text-center">
              <p className="font-display uppercase text-xl text-navy mb-2">
                Sin resultados
              </p>
              <p className="text-navy/60 mb-4">
                Probá con otra palabra, sin filtros o con un término más general.
              </p>
              <Link href="/buscar" className="btn-ghost">
                Limpiar búsqueda
              </Link>
            </div>
          )}

          {productos.length > 0 && (
            <>
              <h2 className="font-display uppercase text-lg text-navy mb-3">
                Productos · {productos.length}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
                {productos.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </>
          )}

          {maquinaria.length > 0 && (
            <>
              <h2 className="font-display uppercase text-lg text-navy mb-3 flex items-center gap-2">
                <Wrench className="w-5 h-5" /> Arriendo · {maquinaria.length}
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {maquinaria.map((m) => (
                  <Link
                    key={m.id}
                    href={`/arriendo/${m.slug}`}
                    className="bg-white border-2 border-navy flex hover:-translate-y-1 transition-transform"
                  >
                    <div className="relative w-28 h-28 bg-sand-dark border-r-2 border-navy shrink-0 overflow-hidden">
                      {m.imagen_url ? (
                        <Image src={m.imagen_url} alt={m.nombre} fill sizes="112px" className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-display text-3xl text-navy/15">
                          {m.nombre.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="p-3 flex flex-col flex-1 min-w-0">
                      <span className="text-[10px] uppercase font-display tracking-widest text-ember">
                        Maquinaria
                      </span>
                      <h3 className="font-display uppercase text-sm text-navy line-clamp-2">
                        {m.nombre}
                      </h3>
                      <span className="mt-auto font-display text-base text-ember">
                        {formatCLP(m.tarifa_dia)}/día
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
