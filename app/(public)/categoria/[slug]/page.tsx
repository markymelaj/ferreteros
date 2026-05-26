import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase-server';
import { ProductCard } from '@/components/ProductCard';
import { ListingFilters } from '@/components/ListingFilters';
import type { Product, Category } from '@/lib/types';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data } = await supabase
    .from('categories')
    .select('nombre')
    .eq('slug', params.slug)
    .single();
  return { title: data?.nombre ?? 'Categoría' };
}

export default async function CategoriaPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data: catData } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (!catData) notFound();
  const cat = catData as Category;

  const [{ data: prods }, { data: allCats }] = await Promise.all([
    supabase.from('products').select('*').eq('activo', true).eq('categoria_id', cat.id).eq('tipo', 'producto').order('nombre'),
    supabase.from('categories').select('*').eq('activo', true).order('orden')
  ]);

  const products = (prods ?? []) as Product[];
  const categorias = (allCats ?? []) as Category[];

  return (
    <div className="bg-bg-page min-h-screen">
      <div className="container-page py-4">
        <nav className="flex items-center gap-1 text-xs text-text-secondary mb-3">
          <Link href="/" className="hover:text-text-link">Inicio</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/materiales" className="hover:text-text-link">Materiales</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-text-primary">{cat.nombre}</span>
        </nav>

        <div className="bg-white rounded-card shadow-card px-4 py-3 mb-4">
          <h1 className="text-xl font-bold text-text-primary">{cat.nombre}</h1>
          <p className="text-xs text-text-secondary">{products.length} productos</p>
        </div>

        <div className="grid lg:grid-cols-[240px_1fr] gap-4">
          <aside>
            <ListingFilters categorias={categorias} />
          </aside>
          <section className="bg-white rounded-card shadow-card p-4">
            {products.length === 0 ? (
              <p className="text-center text-text-secondary py-12">Sin productos en esta categoría aún.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
