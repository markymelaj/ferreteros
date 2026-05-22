import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase-server';
import { ProductCard } from '@/components/ProductCard';
import type { Product, Category } from '@/lib/types';

export const revalidate = 60;

export async function generateMetadata({
  params
}: {
  params: { slug: string };
}) {
  const supabase = createClient();
  const { data } = await supabase
    .from('categories')
    .select('nombre')
    .eq('slug', params.slug)
    .single();
  return { title: data?.nombre ?? 'Categoría' };
}

export default async function CategoriaPage({
  params
}: {
  params: { slug: string };
}) {
  const supabase = createClient();
  const { data: catData } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (!catData) notFound();
  const cat = catData as Category;

  const { data: prods } = await supabase
    .from('products')
    .select('*')
    .eq('activo', true)
    .eq('categoria_id', cat.id)
    .eq('tipo', 'producto')
    .order('nombre');

  const products = (prods ?? []) as Product[];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <nav className="flex items-center gap-1 text-xs uppercase font-display tracking-wider text-navy/60 mb-4">
        <Link href="/" className="hover:text-ember">Inicio</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/catalogo" className="hover:text-ember">Catálogo</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-navy">{cat.nombre}</span>
      </nav>

      <h1 className="font-display uppercase text-4xl md:text-5xl text-navy mb-8">
        {cat.nombre}
      </h1>

      {products.length === 0 ? (
        <p className="text-navy/60">Sin productos en esta categoría aún.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
