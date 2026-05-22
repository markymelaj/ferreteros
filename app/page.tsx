import Link from 'next/link';
import { ArrowRight, Truck, Hammer, ShieldCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase-server';
import { ProductCard } from '@/components/ProductCard';
import { CategoryGrid } from '@/components/CategoryGrid';
import { formatCLP, whatsappLink } from '@/lib/format';
import type { Product, Category, Maquinaria, Settings } from '@/lib/types';

export const revalidate = 60;

export default async function Home() {
  const supabase = createClient();

  const [{ data: destacadosData }, { data: cats }, { data: maquinas }, { data: settings }] =
    await Promise.all([
      supabase
        .from('products')
        .select('*')
        .eq('activo', true)
        .eq('destacado', true)
        .order('created_at', { ascending: false })
        .limit(8),
      supabase.from('categories').select('*').eq('activo', true).order('orden'),
      supabase.from('maquinaria').select('*').eq('activo', true).limit(3),
      supabase.from('settings').select('*').eq('id', 1).single()
    ]);

  const destacados = (destacadosData ?? []) as Product[];
  const categorias = (cats ?? []) as Category[];
  const maquinaria = (maquinas ?? []) as Maquinaria[];
  const s = settings as Settings | null;

  return (
    <>
      {/* HERO */}
      <section className="relative bg-navy text-sand overflow-hidden">
        <div className="absolute inset-0 bg-grit opacity-50" />
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-ember/30 rotate-12 hidden lg:block" />
        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24 grid lg:grid-cols-2 gap-10 items-center">
          <div className="animate-slide-up">
            <span className="inline-block bg-ember text-navy font-display uppercase text-xs tracking-widest px-3 py-1 border-2 border-sand mb-5">
              Ferretería · Áridos · Arriendo
            </span>
            <h1 className="font-display uppercase text-5xl md:text-6xl lg:text-7xl leading-[0.95] mb-5">
              Construir el sur,<br />
              <span className="text-ember">una obra a la vez.</span>
            </h1>
            <p className="text-sand/80 max-w-md text-lg mb-7 leading-relaxed">
              Materiales sólidos, áridos por m³ y maquinaria en arriendo desde
              Camino Paraguay para toda la zona de Saltos del Laja y alrededores.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/catalogo" className="btn-brutal">
                Ver Catálogo <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href={whatsappLink(
                  s?.telefono_whatsapp ?? '+56957845292',
                  'Hola, quiero cotizar materiales:'
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-wa"
              >
                Cotizar por WhatsApp
              </a>
            </div>
          </div>

          {/* Bloque mosaico hero */}
          <div className="grid grid-cols-3 gap-2 animate-slide-up" style={{ animationDelay: '0.15s' }}>
            <div className="aspect-square bg-ember border-2 border-sand col-span-2 flex flex-col justify-end p-5">
              <span className="font-display uppercase text-xs tracking-wider text-navy">Despacho local</span>
              <span className="font-display uppercase text-2xl text-navy leading-tight">A toda la comuna</span>
            </div>
            <div className="aspect-square bg-sand border-2 border-sand text-navy flex flex-col items-center justify-center p-3">
              <Truck className="w-10 h-10 mb-1" />
              <span className="font-display uppercase text-xs">Áridos m³</span>
            </div>
            <div className="aspect-square bg-sand border-2 border-sand text-navy flex flex-col items-center justify-center p-3">
              <Hammer className="w-10 h-10 mb-1" />
              <span className="font-display uppercase text-xs">Arriendo</span>
            </div>
            <div className="aspect-square bg-sand border-2 border-sand text-navy flex flex-col items-center justify-center p-3">
              <ShieldCheck className="w-10 h-10 mb-1" />
              <span className="font-display uppercase text-xs">Garantía</span>
            </div>
            <div className="aspect-square bg-navy-900 border-2 border-ember p-3 flex flex-col justify-end">
              <span className="font-display uppercase text-[10px] text-ember tracking-widest">Activo desde</span>
              <span className="font-display uppercase text-3xl text-sand leading-none">2025</span>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORÍAS */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="font-display uppercase text-xs tracking-widest text-ember">
              Categorías
            </span>
            <h2 className="font-display uppercase text-3xl md:text-4xl text-navy">
              Todo lo que necesitas
            </h2>
          </div>
          <Link href="/catalogo" className="hidden md:flex items-center gap-1 font-display uppercase text-sm text-navy hover:text-ember">
            Ver catálogo <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <CategoryGrid categories={categorias} />
      </section>

      {/* DESTACADOS */}
      <section className="bg-white border-y-2 border-navy py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="font-display uppercase text-xs tracking-widest text-ember">
                Ofertas y destacados
              </span>
              <h2 className="font-display uppercase text-3xl md:text-4xl text-navy">
                Lo que se mueve esta semana
              </h2>
            </div>
            <Link href="/catalogo" className="hidden md:flex items-center gap-1 font-display uppercase text-sm text-navy hover:text-ember">
              Todos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {destacados.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* ÁRIDOS BANNER */}
      <section className="max-w-7xl mx-auto px-4 py-16 grid lg:grid-cols-2 gap-8 items-center">
        <div>
          <span className="font-display uppercase text-xs tracking-widest text-ember">
            Áridos por m³
          </span>
          <h2 className="font-display uppercase text-3xl md:text-4xl text-navy mb-3">
            Arena, gravilla, ripio, bolón.
          </h2>
          <p className="text-navy/70 mb-5 leading-relaxed">
            Todo el material para tu obra al volumen que necesites. Calcula
            cuántos metros cúbicos requieres y obtén un estimado al toque.
          </p>
          <Link href="/aridos" className="btn-brutal">
            Ir a Áridos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {['Arena Gruesa', 'Gravilla 1/2"', 'Ripio Camino', 'Bolón'].map((n, i) => (
            <div
              key={n}
              className="aspect-square bg-navy text-sand border-2 border-navy p-4 flex flex-col justify-end relative overflow-hidden"
            >
              <div className="absolute top-2 right-2 font-display text-[10px] uppercase tracking-wider text-ember">
                0{i + 1}
              </div>
              <span className="font-display uppercase text-xl leading-tight">{n}</span>
              <span className="text-xs text-sand/70 mt-1">desde {formatCLP(18000)}/m³</span>
            </div>
          ))}
        </div>
      </section>

      {/* ARRIENDO */}
      <section className="bg-navy text-sand py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-grit opacity-20" />
        <div className="relative max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="font-display uppercase text-xs tracking-widest text-ember">
                Arriendo de maquinaria
              </span>
              <h2 className="font-display uppercase text-3xl md:text-4xl">
                Potencia para tu faena
              </h2>
            </div>
            <Link href="/arriendo" className="hidden md:flex items-center gap-1 font-display uppercase text-sm hover:text-ember">
              Ver todo <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {maquinaria.map((m) => (
              <Link
                key={m.id}
                href={`/arriendo/${m.slug}`}
                className="bg-white text-navy border-2 border-ember p-5 flex flex-col hover:-translate-y-1 transition-transform"
              >
                <span className="font-display uppercase text-xs tracking-wider text-ember mb-2">
                  Maquinaria
                </span>
                <h3 className="font-display uppercase text-xl leading-tight mb-3">
                  {m.nombre}
                </h3>
                <p className="text-sm text-navy/70 line-clamp-3 mb-4 flex-1">
                  {m.descripcion}
                </p>
                <div className="border-t-2 border-navy pt-3 flex items-end justify-between">
                  <div>
                    <span className="text-[11px] uppercase font-display text-navy/60">desde</span>
                    <p className="font-display text-2xl text-ember leading-none">
                      {formatCLP(m.tarifa_dia)}
                    </p>
                    <span className="text-[11px] uppercase font-display">por día</span>
                  </div>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
