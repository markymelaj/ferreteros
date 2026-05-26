import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { WhatsAppFloat } from '@/components/WhatsAppFloat';
import { createClient } from '@/lib/supabase-server';

/**
 * Layout del sitio público.
 * Envuelve todas las rutas dentro del route group (public) con
 * Header, Footer, WhatsAppFloat y el JSON-LD de LocalBusiness.
 *
 * El admin (app/admin/*) NO pasa por este layout, así que el chrome
 * público no se mezcla con el shell del admin.
 */
export default async function PublicLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: settings } = await supabase.from('settings').select('*').eq('id', 1).single();

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ferreteria-piloto.vercel.app';
  const localBusinessLd = settings
    ? {
        '@context': 'https://schema.org',
        '@type': 'HardwareStore',
        name: settings.nombre_ferreteria,
        description: settings.descripcion_seo,
        url: baseUrl,
        telephone: settings.telefono_whatsapp,
        email: settings.email,
        address: {
          '@type': 'PostalAddress',
          streetAddress: settings.direccion_fisica,
          addressLocality: 'Los Ángeles',
          addressRegion: 'Región del Biobío',
          addressCountry: 'CL'
        },
        areaServed: (settings.comunas_despacho ?? []).map((c: string) => ({
          '@type': 'City',
          name: c
        })),
        priceRange: '$$'
      }
    : null;

  return (
    <>
      {localBusinessLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessLd) }}
        />
      )}
      <Header settings={settings} />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
      <WhatsAppFloat phone={settings?.telefono_whatsapp ?? '+56957845292'} />
    </>
  );
}
