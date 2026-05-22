import { createClient } from '@/lib/supabase-server';
import { ProductsAdmin } from '@/components/admin/ProductsAdmin';
import type { Product, Category } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function AdminProductosPage() {
  const supabase = createClient();
  const [{ data: prods }, { data: cats }] = await Promise.all([
    supabase.from('products').select('*').order('nombre'),
    supabase.from('categories').select('*').order('orden')
  ]);
  return (
    <ProductsAdmin
      initialProducts={(prods ?? []) as Product[]}
      categories={(cats ?? []) as Category[]}
    />
  );
}
