import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ChevronRight, ShieldCheck, FileText, MessageCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase-server';
import { formatCLP, whatsappLink } from '@/lib/format';
import type { Maquinaria, Settings } from '@/lib/types';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data } = await supabase
    .from('maquinaria')
    .select('nombre, descripcion')
    .eq('slug', params.slug)
    .single();
  return {
    title: data?.nombre ?? 'Maquinaria',
    description: data?.descripcion ?? undefined
  };
}

export default async function MaquinaPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const [{ data }, { data: settings }] = await Promise.all([
    supabase.from('maquinaria').select('*').eq('slug', params.slug).single(),
    supabase.from('settings').select('telefono_whatsapp').eq('id', 1).single()
  ]);

  if (!data) notFound();
  const m = data as Maquinaria;
  const phone = (settings as Pick<Settings, 'telefono_whatsapp'> | null)?.telefono_whatsapp ?? '+56957845292';

  return (
    <div className="bg-bg-page min-h-screen">
      <div className="container-page py-4">
        <nav className="flex items-center gap-1 text-xs text-text-secondary mb-3">
          <Link href="/" className="hover:text-text-link">Inicio</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/arriendo" className="hover:text-text-link">Arriendo</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-text-primary truncate max-w-xs">{m.nombre}</span>
        </nav>

        <div className="bg-white rounded-card shadow-card overflow-hidden">
          <div className="grid lg:grid-cols-[1.4fr_1fr]">
            <div className="p-6 border-r border-gray-100">
              <div className="aspect-square bg-bg-sub rounded relative overflow-hidden">
                {m.imagen_url ? (
                  <Image src={m.imagen_url} alt={m.nombre} fill priority sizes="(max-width: 1024px) 100vw, 60vw" className="object-contain p-6" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-9xl text-text-tertiary">
                    {m.nombre.charAt(0)}
                  </div>
                )}
                <span className="absolute top-4 left-4 badge-info">Arriendo</span>
              </div>
            </div>

            <div className="p-6 flex flex-col">
              <div className="text-2xs text-text-secondary uppercase tracking-wide mb-1">
                Maquinaria en arriendo
              </div>
              <h1 className="text-2xl font-semibold text-text-primary leading-tight mb-3">
                {m.nombre}
              </h1>

              {m.descripcion && (
                <p className="text-sm text-text-primary leading-relaxed mb-4">
                  {m.descripcion}
                </p>
              )}

              {/* Tarifas */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                <div className="bg-bg-sub rounded p-3 text-center">
                  <div className="text-2xs text-text-secondary uppercase">Día</div>
                  <div className="text-base font-semibold text-text-primary">{formatCLP(m.tarifa_dia)}</div>
                </div>
                <div className="bg-bg-sub rounded p-3 text-center">
                  <div className="text-2xs text-text-secondary uppercase">Semana</div>
                  <div className="text-base font-semibold text-text-primary">{formatCLP(m.tarifa_semana ?? 0)}</div>
                </div>
                <div className="bg-brand-50 rounded p-3 text-center border border-brand-300">
                  <div className="text-2xs text-text-secondary uppercase">Mes</div>
                  <div className="text-base font-semibold text-text-primary">{formatCLP(m.tarifa_mes ?? 0)}</div>
                </div>
              </div>

              {m.garantia > 0 && (
                <p className="flex items-start gap-2 text-sm text-text-primary mb-2">
                  <ShieldCheck className="w-4 h-4 text-text-link mt-0.5 shrink-0" />
                  Garantía: <strong>{formatCLP(m.garantia)}</strong> (reembolsable).
                </p>
              )}

              {m.requisitos && (
                <p className="flex items-start gap-2 text-sm text-text-secondary mb-5">
                  <FileText className="w-4 h-4 text-text-tertiary mt-0.5 shrink-0" />
                  {m.requisitos}
                </p>
              )}

              <a
                href={whatsappLink(phone, `Hola, quiero arrendar: ${m.nombre}. Necesito disponibilidad y forma de retiro/despacho.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-wa w-full mt-auto"
              >
                <MessageCircle className="w-4 h-4" /> Consultar disponibilidad
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
