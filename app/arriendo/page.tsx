import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase-server';
import { formatCLP, whatsappLink } from '@/lib/format';
import type { Maquinaria, Settings } from '@/lib/types';

export const revalidate = 60;
export const metadata = { title: 'Arriendo de Maquinaria' };

export default async function ArriendoPage() {
  const supabase = createClient();
  const [{ data: maquinas }, { data: settings }] = await Promise.all([
    supabase
      .from('maquinaria')
      .select('*')
      .eq('activo', true)
      .order('nombre'),
    supabase.from('settings').select('telefono_whatsapp').eq('id', 1).single()
  ]);

  const lista = (maquinas ?? []) as Maquinaria[];
  const phone = (settings as Pick<Settings, 'telefono_whatsapp'> | null)
    ?.telefono_whatsapp ?? '+56957845292';

  return (
    <>
      <section className="bg-navy text-sand py-14 relative overflow-hidden">
        <div className="absolute inset-0 bg-grit opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4">
          <span className="font-display uppercase text-xs tracking-widest text-ember">
            Equipos para tu obra
          </span>
          <h1 className="font-display uppercase text-4xl md:text-5xl mt-1 mb-3">
            Arriendo de Maquinaria
          </h1>
          <p className="max-w-2xl text-sand/80">
            Tarifas por día, semana y mes. Se solicita cédula y un cheque o
            efectivo en garantía.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {lista.map((m) => (
            <div
              key={m.id}
              className="bg-white border-2 border-navy flex flex-col"
            >
              <Link
                href={`/arriendo/${m.slug}`}
                className="aspect-[4/3] bg-sand-dark border-b-2 border-navy flex items-center justify-center relative overflow-hidden"
              >
                {m.imagen_url ? (
                  <Image
                    src={m.imagen_url}
                    alt={m.nombre}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <span className="font-display text-7xl text-navy/15 select-none">
                    {m.nombre.charAt(0)}
                  </span>
                )}
              </Link>
              <div className="p-5 flex flex-col flex-1">
                <span className="font-display uppercase text-[11px] tracking-widest text-ember">
                  Maquinaria
                </span>
                <h3 className="font-display uppercase text-xl text-navy mb-2 leading-tight">
                  {m.nombre}
                </h3>
                <p className="text-sm text-navy/70 line-clamp-3 mb-4 flex-1">
                  {m.descripcion}
                </p>
                <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                  <div className="bg-sand border-2 border-navy p-2">
                    <span className="block text-[10px] uppercase font-display tracking-wider text-navy/60">Día</span>
                    <span className="font-display text-navy">{formatCLP(m.tarifa_dia)}</span>
                  </div>
                  <div className="bg-sand border-2 border-navy p-2">
                    <span className="block text-[10px] uppercase font-display tracking-wider text-navy/60">Semana</span>
                    <span className="font-display text-navy">{formatCLP(m.tarifa_semana ?? 0)}</span>
                  </div>
                  <div className="bg-ember border-2 border-navy p-2">
                    <span className="block text-[10px] uppercase font-display tracking-wider text-navy/80">Mes</span>
                    <span className="font-display text-navy">{formatCLP(m.tarifa_mes ?? 0)}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/arriendo/${m.slug}`} className="btn-ghost flex-1 text-center">
                    Detalle
                  </Link>
                  <a
                    href={whatsappLink(
                      phone,
                      `Hola, quiero arrendar: ${m.nombre}`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-wa flex-1"
                  >
                    Consultar
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
