import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/lib/cart';
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

/**
 * Root layout MÍNIMO.
 * Solo html, body, fuentes, CartProvider y metadata global.
 *
 * El chrome del sitio público (Header, Footer, WhatsAppFloat, JSON-LD) vive en
 * app/(public)/layout.tsx — así el admin no lo arrastra encima.
 * El shell del admin vive en app/admin/layout.tsx.
 */
export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={sans.variable}>
      <body className="font-sans min-h-screen flex flex-col">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
