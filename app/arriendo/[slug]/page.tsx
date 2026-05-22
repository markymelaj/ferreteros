import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ChevronRight, ShieldCheck, FileText } from 'lucide-react';
import { createClient } from '@/lib/supabase-server';
import { formatCLP, whatsappLink } from '@/lib/format';
import type { Maquinaria, Settings } from '@/lib/types';

export const revalidate = 60;

export async function generateMetadata({
  params
}: {
  params: { slug: string };
}) {
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

export default async function MaquinaPage({
  params
}: {
  params: { slug: string };
}) {
  const supabase = createClient();
  const [{ data }, { data: settings }] = await Promise.all([
    supabase.from('maquinaria').select('*').eq('slug', params.slug).single(),
    supabase.from('settings').select('telefono_whatsapp').eq('id', 1).single()
  ]);

  if (!data) notFound();
  const m = data as Maquinaria;
  const phone = (settings as Pick<Settings, 'telefono_whatsapp'> | null)
    ?.telefono_whatsapp ?? '+56957845292';

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <nav className="flex items-center gap-1 text-xs uppercase font-display tracking-wider text-navy/60 mb-6">
        <Link href="/" className="hover:text-ember">Inicio</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/arriendo" className="hover:text-ember">Arriendo</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-navy">{m.nombre}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="aspect-square bg-white border-2 border-navy flex items-center justify-center relative overflow-hidden">
          {m.imagen_url ? (
            <Image
              src={m.imagen_url}
              alt={m.nombre}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          ) : (
            <span className="font-display text-[12rem] text-navy/15 select-none">
              {m.nombre.charAt(0)}
            </span>
          )}
        </div>

        <div>
          <span className="font-display uppercase text-xs tracking-widest text-ember">
            Maquinaria en arriendo
          </span>
          <h1 className="font-display uppercase text-3xl md:text-4xl text-navy leading-tight mb-3">
            {m.nombre}
          </h1>
          {m.descripcion && (
            <p className="text-navy/80 leading-relaxed mb-6">{m.descripcion}</p>
          )}

          <div className="grid grid-cols-3 gap-2 mb-6">
            <div className="bg-sand border-2 border-navy p-3 text-center">
              <span className="block text-[11px] uppercase font-display tracking-wider text-navy/60">Día</span>
              <span className="font-display text-xl text-navy">{formatCLP(m.tarifa_dia)}</span>
            </div>
            <div className="bg-sand border-2 border-navy p-3 text-center">
              <span className="block text-[11px] uppercase font-display tracking-wider text-navy/60">Semana</span>
              <span className="font-display text-xl text-navy">{formatCLP(m.tarifa_semana ?? 0)}</span>
            </div>
            <div className="bg-ember border-2 border-navy p-3 text-center">
              <span className="block text-[11px] uppercase font-display tracking-wider text-navy/80">Mes</span>
              <span className="font-display text-xl text-navy">{formatCLP(m.tarifa_mes ?? 0)}</span>
            </div>
          </div>

          {m.garantia > 0 && (
            <p className="flex items-start gap-2 text-sm text-navy/80 mb-3">
              <ShieldCheck className="w-5 h-5 text-ember mt-0.5" />
              Garantía: <strong>{formatCLP(m.garantia)}</strong> (reembolsable
              al devolver en óptimas condiciones).
            </p>
          )}

          {m.requisitos && (
            <p className="flex items-start gap-2 text-sm text-navy/80 mb-6">
              <FileText className="w-5 h-5 text-ember mt-0.5" />
              {m.requisitos}
            </p>
          )}

          <a
            href={whatsappLink(
              phone,
              `Hola, quiero arrendar: ${m.nombre}. Necesito disponibilidad y forma de retiro/despacho.`
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-wa"
          >
            Consultar disponibilidad
          </a>
        </div>
      </div>
    </div>
  );
}
