import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/lib/cart';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { WhatsAppFloat } from '@/components/WhatsAppFloat';
import { createClient } from '@/lib/supabase-server';

const sans = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap'
});

export async function generateMetadata(): Promise<Metadata> {
  const supabase = createClient();
  const { data } = await supabase
    .from('settings')
    .select('nombre_ferreteria, descripcion_seo')
    .eq('id', 1)
    .single();

  const nombre = data?.nombre_ferreteria ?? 'Nexo Sur';
  const desc = data?.descripcion_seo ?? 'Ferretería, áridos y arriendo de maquinaria';

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ferreteria-piloto.vercel.app'),
    title: { default: `${nombre} — Ferretería · Áridos · Arriendo`, template: `%s | ${nombre}` },
    description: desc,
    openGraph: {
      title: nombre,
      description: desc,
      type: 'website',
      locale: 'es_CL'
    }
  };
}

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: settings } = await supabase.from('settings').select('*').eq('id', 1).single();

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ferreteria-piloto.vercel.app';
  const localBusinessLd = settings ? {
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
      '@type': 'City', name: c
    })),
    priceRange: '$$'
  } : null;

  return (
    <html lang="es" className={sans.variable}>
      <body className="font-sans min-h-screen flex flex-col">
        {localBusinessLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessLd) }}
          />
        )}
        <CartProvider>
          <Header settings={settings} />
          <main className="flex-1">{children}</main>
          <Footer settings={settings} />
          <WhatsAppFloat phone={settings?.telefono_whatsapp ?? '+56957845292'} />
        </CartProvider>
      </body>
    </html>
  );
}
