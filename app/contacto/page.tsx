import { MapPin, Phone, Mail, Clock } from 'lucide-react';
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
    <>
      <section className="bg-navy text-sand py-14">
        <div className="max-w-7xl mx-auto px-4">
          <span className="font-display uppercase text-xs tracking-widest text-ember">
            Hablemos
          </span>
          <h1 className="font-display uppercase text-4xl md:text-5xl mt-1">
            Contacto
          </h1>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12 grid lg:grid-cols-2 gap-10">
        <div className="space-y-5">
          <div className="bg-white border-2 border-navy p-5 flex gap-4">
            <Phone className="w-6 h-6 text-ember shrink-0" />
            <div>
              <h3 className="font-display uppercase text-sm tracking-wider text-navy/60">Teléfono y WhatsApp</h3>
              <a href={`tel:${s.telefono_whatsapp}`} className="font-display text-xl text-navy hover:text-ember">
                {formatPhoneDisplay(s.telefono_whatsapp ?? '')}
              </a>
              <div className="mt-2">
                <a
                  href={whatsappLink(s.telefono_whatsapp ?? '', 'Hola, vengo desde la web:')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-whatsapp font-semibold hover:underline"
                >
                  Escribir por WhatsApp →
                </a>
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-navy p-5 flex gap-4">
            <Mail className="w-6 h-6 text-ember shrink-0" />
            <div>
              <h3 className="font-display uppercase text-sm tracking-wider text-navy/60">Correo</h3>
              <a href={`mailto:${s.email}`} className="font-display text-xl text-navy hover:text-ember">
                {s.email}
              </a>
            </div>
          </div>

          <div className="bg-white border-2 border-navy p-5 flex gap-4">
            <MapPin className="w-6 h-6 text-ember shrink-0" />
            <div>
              <h3 className="font-display uppercase text-sm tracking-wider text-navy/60">Dirección</h3>
              <p className="font-display text-xl text-navy">{s.direccion_fisica}</p>
            </div>
          </div>

          <div className="bg-white border-2 border-navy p-5 flex gap-4">
            <Clock className="w-6 h-6 text-ember shrink-0" />
            <div>
              <h3 className="font-display uppercase text-sm tracking-wider text-navy/60">Horarios</h3>
              <p className="font-display text-xl text-navy">{s.horarios}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-navy aspect-square lg:aspect-auto">
          <iframe
            title="Ubicación"
            src="https://www.openstreetmap.org/export/embed.html?bbox=-72.50%2C-37.30%2C-72.20%2C-37.10&layer=mapnik&marker=-37.165%2C-72.331"
            className="w-full h-full min-h-[400px] border-0"
            loading="lazy"
          />
        </div>
      </section>
    </>
  );
}
