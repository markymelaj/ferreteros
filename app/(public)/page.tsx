import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronRight, Truck, ShieldCheck, MessageCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase-server';
import { ProductCard } from '@/components/ProductCard';
import { AridosCalculator } from '@/components/AridosCalculator';
import { formatCLP, whatsappLink, effectivePrice } from '@/lib/format';
import type { Product, Category, Maquinaria, Settings } from '@/lib/types';

export const revalidate = 60;

export default async function Home() {
  const supabase = createClient();

  const [{ data: destacadosData }, { data: cats }, { data: maquinas }, { data: aridosData }, { data: ofertasData }, { data: settings }] =
    await Promise.all([
      supabase.from('products').select('*').eq('activo', true).eq('destacado', true).order('created_at', { ascending: false }).limit(6),
      supabase.from('categories').select('*').eq('activo', true).order('orden'),
      supabase.from('maquinaria').select('*').eq('activo', true).limit(3),
      supabase.from('products').select('*').eq('activo', true).eq('tipo', 'arido').order('precio'),
      supabase.from('products').select('*').eq('activo', true).not('precio_oferta', 'is', null).limit(8),
      supabase.from('settings').select('*').eq('id', 1).single()
    ]);

  const destacados = (destacadosData ?? []) as Product[];
  const categorias = (cats ?? []) as Category[];
  const maquinaria = (maquinas ?? []) as Maquinaria[];
  const aridosAll = (aridosData ?? []) as Product[];
  const aridosHome = aridosAll.slice(0, 4);
  const ofertas = (ofertasData ?? []) as Product[];
  const s = settings as Settings | null;

  return (
    <div className="bg-bg-page">
      {/* HERO BANNER */}
      <section className="bg-ink-900 text-white">
        <div className="container-page py-8 md:py-12 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <span className="inline-block text-2xs font-bold uppercase tracking-widest text-brand-400 mb-3">
              Ferretería · Áridos · Arriendo
            </span>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">
              Tu obra empieza<br />
              <span className="text-brand-500">con materiales de verdad.</span>
            </h1>
            <p className="text-white/80 text-sm md:text-base mb-6 max-w-md">
              Despacho a Los Ángeles, Cabrero, Yumbel y comunas vecinas.
              Cotiza por WhatsApp o pídelo desde la web.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/materiales" className="btn-primary !bg-brand-500 !text-ink-900 hover:!bg-brand-400">
                Ver catálogo <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href={whatsappLink(s?.telefono_whatsapp ?? '+56957845292', 'Hola, quiero cotizar:')}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-wa"
              >
                <MessageCircle className="w-4 h-4" /> Cotizar
              </a>
            </div>
          </div>
          <div className="hidden md:grid grid-cols-2 gap-3">
            <div className="bg-brand-500 text-ink-900 p-6 rounded col-span-2 flex flex-col justify-end aspect-[2/1]">
              <div className="text-xs font-semibold uppercase">Despacho local</div>
              <div className="text-2xl font-bold leading-tight">A toda la comuna</div>
            </div>
            <div className="bg-white/10 border border-white/20 p-4 rounded flex items-center gap-3">
              <Truck className="w-8 h-8 text-brand-500" />
              <div className="text-sm">
                <div className="font-semibold">Áridos m³</div>
                <div className="text-2xs text-white/60">Calcula tu pedido</div>
              </div>
            </div>
            <div className="bg-white/10 border border-white/20 p-4 rounded flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-brand-500" />
              <div className="text-sm">
                <div className="font-semibold">Garantía</div>
                <div className="text-2xs text-white/60">Productos certificados</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORÍAS — chips horizontales */}
      <section className="container-page py-6">
        <div className="bg-white rounded-card shadow-card p-4">
          <div className="flex items-end justify-between mb-3">
            <h2 className="text-base font-semibold text-text-primary">Categorías</h2>
            <Link href="/materiales" className="text-xs text-text-link font-semibold hover:underline">
              Ver todas <ChevronRight className="inline w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {categorias.map((c) => (
              <Link
                key={c.id}
                href={`/categoria/${c.slug}`}
                className="flex flex-col items-center justify-center gap-1.5 p-3 rounded hover:bg-bg-sub transition-colors text-center"
              >
                <div className="w-10 h-10 bg-bg-sub rounded-full flex items-center justify-center text-text-link font-bold">
                  {c.nombre.charAt(0)}
                </div>
                <span className="text-2xs text-text-primary leading-tight">{c.nombre}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* OFERTAS — productos con precio_oferta */}
      {ofertas.length > 0 && (
        <section className="container-page py-4">
          <div className="bg-white rounded-card shadow-card overflow-hidden">
            <div className="bg-gradient-to-r from-danger to-warning text-white px-4 py-3 flex items-end justify-between">
              <div>
                <div className="text-2xs uppercase tracking-widest opacity-90">Aprovecha</div>
                <h2 className="text-xl font-bold">Ofertas de la semana</h2>
              </div>
              <Link href="/buscar" className="text-xs text-white hover:underline font-semibold">
                Ver todas →
              </Link>
            </div>
            <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              {ofertas.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* DESTACADOS */}
      <section className="container-page py-4">
        <div className="bg-white rounded-card shadow-card overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-end justify-between">
            <h2 className="text-xl font-bold text-text-primary">Productos destacados</h2>
            <Link href="/materiales" className="text-xs text-text-link font-semibold hover:underline">
              Ver todos →
            </Link>
          </div>
          <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {destacados.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* ÁRIDOS + CALCULADORA */}
      <section className="container-page py-4">
        <div className="bg-white rounded-card shadow-card overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-end justify-between">
            <div>
              <div className="text-2xs uppercase tracking-widest text-text-secondary">Por metro cúbico</div>
              <h2 className="text-xl font-bold text-text-primary">Áridos</h2>
            </div>
            <Link href="/aridos" className="text-xs text-text-link font-semibold hover:underline">
              Ver todos →
            </Link>
          </div>
          <div className="p-4 grid lg:grid-cols-[1fr_380px] gap-6">
            <div className="grid grid-cols-2 gap-3">
              {aridosHome.map((a) => {
                const price = effectivePrice(a.precio, a.precio_oferta);
                return (
                  <Link
                    key={a.id}
                    href="/aridos"
                    className="card group flex items-stretch overflow-hidden"
                  >
                    <div className="relative w-24 h-24 bg-bg-sub shrink-0">
                      {a.imagen_url ? (
                        <Image src={a.imagen_url} alt={a.nombre} fill sizes="96px" className="object-contain p-2" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-text-tertiary text-xl">
                          {a.nombre.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="p-3 flex-1">
                      <h3 className="text-sm text-text-primary group-hover:text-text-link font-semibold leading-tight">
                        {a.nombre}
                      </h3>
                      <div className="text-lg font-light text-text-primary mt-1">
                        {formatCLP(price)}
                      </div>
                      <div className="text-2xs text-text-secondary">por m³</div>
                    </div>
                  </Link>
                );
              })}
            </div>
            <AridosCalculator aridos={aridosAll} />
          </div>
        </div>
      </section>

      {/* ARRIENDO */}
      <section className="container-page py-4 pb-12">
        <div className="bg-white rounded-card shadow-card overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-end justify-between">
            <div>
              <div className="text-2xs uppercase tracking-widest text-text-secondary">Día · Semana · Mes</div>
              <h2 className="text-xl font-bold text-text-primary">Arriendo de maquinaria</h2>
            </div>
            <Link href="/arriendo" className="text-xs text-text-link font-semibold hover:underline">
              Ver todas →
            </Link>
          </div>
          <div className="p-4 grid md:grid-cols-3 gap-3">
            {maquinaria.map((m) => (
              <Link
                key={m.id}
                href={`/arriendo/${m.slug}`}
                className="card group flex flex-col overflow-hidden"
              >
                <div className="relative aspect-[4/3] bg-bg-sub">
                  {m.imagen_url ? (
                    <Image src={m.imagen_url} alt={m.nombre} fill sizes="(max-width:768px) 100vw, 33vw" className="object-contain p-4" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl text-text-tertiary">
                      {m.nombre.charAt(0)}
                    </div>
                  )}
                  <span className="absolute top-2 left-2 badge-info">Arriendo</span>
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-text-primary group-hover:text-text-link line-clamp-2">
                    {m.nombre}
                  </h3>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xs text-text-secondary">Desde</span>
                    <span className="text-xl font-light text-text-primary">{formatCLP(m.tarifa_dia)}</span>
                    <span className="text-2xs text-text-secondary">/día</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
