import Link from 'next/link';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { formatPhoneDisplay } from '@/lib/format';
import type { Settings } from '@/lib/types';

export function Footer({ settings }: { settings: Settings | null }) {
  const nombre = settings?.nombre_ferreteria ?? 'Nexo Sur';
  const phone = settings?.telefono_whatsapp ?? '+56957845292';

  return (
    <footer className="bg-navy text-sand mt-20">
      <div className="h-2 bg-ember" />
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 bg-ember border-2 border-sand flex items-center justify-center font-display text-navy text-lg">
              N
            </div>
            <span className="font-display text-xl uppercase">{nombre}</span>
          </div>
          <p className="text-sm text-sand/70 leading-relaxed">
            Ferretería, áridos y arriendo de maquinaria al servicio del sur.
            Materiales sólidos, precios honestos.
          </p>
        </div>

        <div>
          <h4 className="font-display uppercase text-sm tracking-wider mb-3 text-ember">
            Tienda
          </h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/catalogo"   className="hover:text-ember">Catálogo completo</Link></li>
            <li><Link href="/aridos"     className="hover:text-ember">Áridos</Link></li>
            <li><Link href="/arriendo"   className="hover:text-ember">Arriendo de maquinaria</Link></li>
            <li><Link href="/contacto"   className="hover:text-ember">Contacto</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display uppercase text-sm tracking-wider mb-3 text-ember">
            Visítanos
          </h4>
          <ul className="space-y-2 text-sm text-sand/80">
            <li className="flex gap-2"><MapPin className="w-4 h-4 mt-0.5 shrink-0" />{settings?.direccion_fisica ?? 'Camino Paraguay, Saltos del Laja'}</li>
            <li className="flex gap-2"><Clock  className="w-4 h-4 mt-0.5 shrink-0" />{settings?.horarios ?? 'Lun–Vie 8:30–19:00 · Sáb 9:00–14:00'}</li>
          </ul>
        </div>

        <div>
          <h4 className="font-display uppercase text-sm tracking-wider mb-3 text-ember">
            Contacto
          </h4>
          <ul className="space-y-2 text-sm">
            <li>
              <a href={`tel:${phone}`} className="flex items-center gap-2 hover:text-ember">
                <Phone className="w-4 h-4" />{formatPhoneDisplay(phone)}
              </a>
            </li>
            {settings?.email && (
              <li>
                <a href={`mailto:${settings.email}`} className="flex items-center gap-2 hover:text-ember">
                  <Mail className="w-4 h-4" />{settings.email}
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-sand/20">
        <div className="max-w-7xl mx-auto px-4 py-4 text-xs text-sand/60 flex flex-col md:flex-row justify-between gap-2">
          <span>© {new Date().getFullYear()} {nombre}. Todos los derechos reservados.</span>
          <span>Sitio desarrollado en Chile</span>
        </div>
      </div>
    </footer>
  );
}
