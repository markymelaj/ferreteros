import type { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase-server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ferreteria-piloto.vercel.app';
  const supabase = createClient();

  const [{ data: prods }, { data: cats }, { data: maquinas }] = await Promise.all([
    supabase.from('products').select('slug, updated_at').eq('activo', true),
    supabase.from('categories').select('slug').eq('activo', true),
    supabase.from('maquinaria').select('slug').eq('activo', true)
  ]);

  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`,            changeFrequency: 'weekly', priority: 1,   lastModified: now },
    { url: `${base}/catalogo`,    changeFrequency: 'daily',  priority: 0.9, lastModified: now },
    { url: `${base}/aridos`,      changeFrequency: 'weekly', priority: 0.8, lastModified: now },
    { url: `${base}/arriendo`,    changeFrequency: 'weekly', priority: 0.8, lastModified: now },
    { url: `${base}/contacto`,    changeFrequency: 'monthly', priority: 0.5, lastModified: now }
  ];

  const productPages: MetadataRoute.Sitemap = (prods ?? []).map((p: { slug: string; updated_at: string }) => ({
    url: `${base}/producto/${p.slug}`,
    changeFrequency: 'weekly',
    priority: 0.7,
    lastModified: new Date(p.updated_at)
  }));

  const categoryPages: MetadataRoute.Sitemap = (cats ?? []).map((c: { slug: string }) => ({
    url: `${base}/categoria/${c.slug}`,
    changeFrequency: 'weekly',
    priority: 0.6,
    lastModified: now
  }));

  const machinePages: MetadataRoute.Sitemap = (maquinas ?? []).map((m: { slug: string }) => ({
    url: `${base}/arriendo/${m.slug}`,
    changeFrequency: 'monthly',
    priority: 0.6,
    lastModified: now
  }));

  return [...staticPages, ...productPages, ...categoryPages, ...machinePages];
}
