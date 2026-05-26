import Link from 'next/link';
import { ChevronRight, MapPin, Phone, Mail, Clock, MessageCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase-server';
import { formatPhoneDisplay, whatsappLink } from '@/lib/format';
import type { Settings } from '@/lib/types';

export const revalidate = 60;
export const metadata = { title: 'Contacto' };

export default async function ContactoPage() {
  const supabase = createClient();
  const { data } = await supabase.from('settings').select('*').eq('id', 1).single();
  const s = (data ?? {
    telefono_whatsapp: '+56957845292',
    email: 'contacto@nexosur.cl',
    direccion_fisica: 'Camino Paraguay s/n, Saltos del Laja',
    horarios: 'Lun–Vie 8:30–19:00 · Sáb 9:00–14:00',
    nombre_ferreteria: 'Nexo Sur'
  }) as Partial<Settings>;

  return (
    <div className="bg-bg-page min-h-screen">
      <div className="container-page py-4">
        <nav className="flex items-center gap-1 text-xs text-text-secondary mb-3">
          <Link href="/" className="hover:text-text-link">Inicio</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-text-primary">Contacto</span>
        </nav>

        <div className="bg-white rounded-card shadow-card px-4 py-3 mb-4">
          <h1 className="text-xl font-bold text-text-primary">Contacto</h1>
          <p className="text-xs text-text-secondary">
            Escríbenos o visítanos en nuestro local.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="card p-5 flex gap-4">
              <Phone className="w-6 h-6 text-text-link shrink-0" />
              <div className="flex-1">
                <h3 className="text-xs uppercase tracking-wider text-text-secondary font-semibold">Teléfono y WhatsApp</h3>
                <a href={`tel:${s.telefono_whatsapp}`} className="text-lg font-semibold text-text-primary hover:text-text-link">
                  {formatPhoneDisplay(s.telefono_whatsapp ?? '')}
                </a>
                <div className="mt-2">
                  <a
                    href={whatsappLink(s.telefono_whatsapp ?? '', 'Hola, vengo desde la web:')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-wa font-semibold hover:underline"
                  >
                    <MessageCircle className="w-3 h-3" /> Escribir por WhatsApp →
                  </a>
                </div>
              </div>
            </div>

            <div className="card p-5 flex gap-4">
              <Mail className="w-6 h-6 text-text-link shrink-0" />
              <div className="flex-1">
                <h3 className="text-xs uppercase tracking-wider text-text-secondary font-semibold">Correo</h3>
                <a href={`mailto:${s.email}`} className="text-lg font-semibold text-text-primary hover:text-text-link">
                  {s.email}
                </a>
              </div>
            </div>

            <div className="card p-5 flex gap-4">
              <MapPin className="w-6 h-6 text-text-link shrink-0" />
              <div>
                <h3 className="text-xs uppercase tracking-wider text-text-secondary font-semibold">Dirección</h3>
                <p className="text-base font-semibold text-text-primary">{s.direccion_fisica}</p>
              </div>
            </div>

            <div className="card p-5 flex gap-4">
              <Clock className="w-6 h-6 text-text-link shrink-0" />
              <div>
                <h3 className="text-xs uppercase tracking-wider text-text-secondary font-semibold">Horarios</h3>
                <p className="text-base font-semibold text-text-primary">{s.horarios}</p>
              </div>
            </div>
          </div>

          <div className="card overflow-hidden">
            <iframe
              title="Ubicación"
              src="https://www.openstreetmap.org/export/embed.html?bbox=-72.50%2C-37.30%2C-72.20%2C-37.10&layer=mapnik&marker=-37.165%2C-72.331"
              className="w-full h-full min-h-[400px] border-0"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
