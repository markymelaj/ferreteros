import Link from 'next/link';
import { MapPin, Phone, Mail, Clock, ShieldCheck, Truck, CreditCard } from 'lucide-react';
import { formatPhoneDisplay } from '@/lib/format';
import type { Settings } from '@/lib/types';

export function Footer({ settings }: { settings: Settings | null }) {
  const nombre = settings?.nombre_ferreteria ?? 'Nexo Sur';
  const phone = settings?.telefono_whatsapp ?? '+56957845292';

  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      {/* Strip de garantías */}
      <div className="bg-bg-sub border-b border-gray-200">
        <div className="container-page py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <Truck className="w-7 h-7 text-text-link shrink-0" />
            <div>
              <div className="text-sm font-semibold text-text-primary">Despacho local</div>
              <div className="text-2xs text-text-secondary">A toda la comuna</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-7 h-7 text-text-link shrink-0" />
            <div>
              <div className="text-sm font-semibold text-text-primary">Compra segura</div>
              <div className="text-2xs text-text-secondary">Boleta y factura</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CreditCard className="w-7 h-7 text-text-link shrink-0" />
            <div>
              <div className="text-sm font-semibold text-text-primary">Múltiples pagos</div>
              <div className="text-2xs text-text-secondary">Efectivo, transfer., tarjeta</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="w-7 h-7 text-text-link shrink-0" />
            <div>
              <div className="text-sm font-semibold text-text-primary">Atención local</div>
              <div className="text-2xs text-text-secondary">{formatPhoneDisplay(phone)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Columnas */}
      <div className="container-page py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 bg-brand-500 text-ink-900 flex items-center justify-center font-bold rounded">
              N
            </div>
            <span className="font-bold text-text-primary">{nombre}</span>
          </div>
          <p className="text-2xs text-text-secondary leading-relaxed">
            Tu ferretería en Camino Paraguay y Saltos del Laja.
            Materiales, áridos por m³ y arriendo de maquinaria.
          </p>
        </div>

        <div>
          <h4 className="text-2xs font-bold uppercase tracking-wider text-text-primary mb-3">
            Comprar
          </h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/materiales" className="text-text-secondary hover:text-text-link">Materiales</Link></li>
            <li><Link href="/aridos"     className="text-text-secondary hover:text-text-link">Áridos</Link></li>
            <li><Link href="/arriendo"   className="text-text-secondary hover:text-text-link">Arriendo de maquinaria</Link></li>
            <li><Link href="/buscar"     className="text-text-secondary hover:text-text-link">Buscar productos</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-2xs font-bold uppercase tracking-wider text-text-primary mb-3">
            Información
          </h4>
          <ul className="space-y-2 text-sm">
            <li className="flex gap-2 text-text-secondary"><MapPin className="w-4 h-4 mt-0.5 shrink-0 text-text-tertiary" />{settings?.direccion_fisica ?? 'Camino Paraguay, Saltos del Laja'}</li>
            <li className="flex gap-2 text-text-secondary"><Clock  className="w-4 h-4 mt-0.5 shrink-0 text-text-tertiary" />{settings?.horarios ?? 'Lun–Vie 8:30–19:00'}</li>
          </ul>
        </div>

        <div>
          <h4 className="text-2xs font-bold uppercase tracking-wider text-text-primary mb-3">
            Contacto
          </h4>
          <ul className="space-y-2 text-sm">
            <li>
              <a href={`tel:${phone}`} className="flex items-center gap-2 text-text-secondary hover:text-text-link">
                <Phone className="w-4 h-4" />{formatPhoneDisplay(phone)}
              </a>
            </li>
            {settings?.email && (
              <li>
                <a href={`mailto:${settings.email}`} className="flex items-center gap-2 text-text-secondary hover:text-text-link">
                  <Mail className="w-4 h-4" />{settings.email}
                </a>
              </li>
            )}
            <li>
              <Link href="/contacto" className="text-text-link hover:underline text-sm">
                Ver formulario de contacto
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-bg-sub border-t border-gray-200">
        <div className="container-page py-3 text-2xs text-text-secondary flex flex-col md:flex-row justify-between gap-2">
          <span>© {new Date().getFullYear()} {nombre}. Todos los derechos reservados.</span>
          <span>Sitio desarrollado en Chile</span>
        </div>
      </div>
    </footer>
  );
}
