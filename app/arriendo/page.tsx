import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase-server';
import { formatCLP, whatsappLink } from '@/lib/format';
import type { Maquinaria, Settings } from '@/lib/types';

export const revalidate = 60;
export const metadata = { title: 'Arriendo de Maquinaria' };

export default async function ArriendoPage() {
  const supabase = createClient();
  const [{ data: maquinas }, { data: settings }] = await Promise.all([
    supabase.from('maquinaria').select('*').eq('activo', true).order('nombre'),
    supabase.from('settings').select('telefono_whatsapp').eq('id', 1).single()
  ]);

  const lista = (maquinas ?? []) as Maquinaria[];
  const phone = (settings as Pick<Settings, 'telefono_whatsapp'> | null)?.telefono_whatsapp ?? '+56957845292';

  return (
    <div className="bg-bg-page min-h-screen">
      <div className="container-page py-4">
        <nav className="flex items-center gap-1 text-xs text-text-secondary mb-3">
          <Link href="/" className="hover:text-text-link">Inicio</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-text-primary">Arriendo</span>
        </nav>

        <div className="bg-white rounded-card shadow-card px-4 py-3 mb-4">
          <div className="text-2xs uppercase tracking-widest text-text-secondary">Día · Semana · Mes</div>
          <h1 className="text-xl font-bold text-text-primary">Arriendo de maquinaria</h1>
          <p className="text-xs text-text-secondary mt-1">
            Tarifas flexibles. Se solicita cédula y un cheque o efectivo en garantía.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {lista.map((m) => (
            <div key={m.id} className="card flex flex-col overflow-hidden">
              <Link href={`/arriendo/${m.slug}`} className="relative aspect-[4/3] bg-bg-sub block">
                {m.imagen_url ? (
                  <Image src={m.imagen_url} alt={m.nombre} fill sizes="(max-width:768px) 100vw, 33vw" className="object-contain p-4" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl text-text-tertiary">
                    {m.nombre.charAt(0)}
                  </div>
                )}
                <span className="absolute top-2 left-2 badge-info">Arriendo</span>
              </Link>
              <div className="p-4 flex flex-col flex-1">
                <h3 className="text-sm font-semibold text-text-primary leading-snug mb-2">
                  {m.nombre}
                </h3>
                {m.descripcion && (
                  <p className="text-2xs text-text-secondary line-clamp-2 mb-3">{m.descripcion}</p>
                )}
                <div className="grid grid-cols-3 gap-1.5 mb-3 text-center">
                  <div className="bg-bg-sub rounded p-2">
                    <div className="text-2xs text-text-secondary uppercase">Día</div>
                    <div className="text-sm font-semibold text-text-primary">{formatCLP(m.tarifa_dia)}</div>
                  </div>
                  <div className="bg-bg-sub rounded p-2">
                    <div className="text-2xs text-text-secondary uppercase">Sem.</div>
                    <div className="text-sm font-semibold text-text-primary">{formatCLP(m.tarifa_semana ?? 0)}</div>
                  </div>
                  <div className="bg-brand-50 rounded p-2 border border-brand-300">
                    <div className="text-2xs text-text-secondary uppercase">Mes</div>
                    <div className="text-sm font-semibold text-text-primary">{formatCLP(m.tarifa_mes ?? 0)}</div>
                  </div>
                </div>
                <div className="flex gap-2 mt-auto">
                  <Link href={`/arriendo/${m.slug}`} className="btn-secondary flex-1 text-center">
                    Ver detalle
                  </Link>
                  <a
                    href={whatsappLink(phone, `Hola, quiero arrendar: ${m.nombre}`)}
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
      </div>
    </div>
  );
}
