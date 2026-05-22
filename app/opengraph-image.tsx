import { ImageResponse } from 'next/og';
import { createClient } from '@/lib/supabase-server';

export const runtime = 'edge';
export const alt = 'Nexo Sur — Ferretería · Áridos · Arriendo';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OGImage() {
  const supabase = createClient();
  const { data } = await supabase
    .from('settings')
    .select('nombre_ferreteria, descripcion_seo, direccion_fisica')
    .eq('id', 1)
    .single();

  const nombre = data?.nombre_ferreteria ?? 'Nexo Sur';
  const desc = data?.descripcion_seo ?? 'Ferretería, áridos y arriendo de maquinaria';
  const dir = data?.direccion_fisica ?? 'Camino Paraguay, Saltos del Laja';

  return new ImageResponse(
    (
      <div
        style={{
          background: '#0B2545',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '60px 80px',
          fontFamily: 'system-ui',
          position: 'relative'
        }}
      >
        {/* Banda diagonal naranja */}
        <div
          style={{
            position: 'absolute',
            top: -80,
            right: -120,
            width: 480,
            height: 480,
            background: '#F77F00',
            transform: 'rotate(15deg)'
          }}
        />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 'auto' }}>
          <div
            style={{
              width: 72,
              height: 72,
              background: '#F77F00',
              border: '4px solid #F5EFE6',
              color: '#0B2545',
              fontSize: 44,
              fontWeight: 900,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            N
          </div>
          <div
            style={{
              color: '#F5EFE6',
              fontSize: 30,
              fontWeight: 800,
              letterSpacing: -1,
              textTransform: 'uppercase'
            }}
          >
            {nombre}
          </div>
        </div>

        {/* Tag */}
        <div
          style={{
            display: 'flex',
            alignSelf: 'flex-start',
            background: '#F77F00',
            color: '#0B2545',
            padding: '8px 16px',
            fontSize: 18,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: 2,
            border: '3px solid #F5EFE6',
            marginBottom: 24
          }}
        >
          Ferretería · Áridos · Arriendo
        </div>

        {/* Headline */}
        <div
          style={{
            color: '#F5EFE6',
            fontSize: 84,
            fontWeight: 900,
            lineHeight: 1,
            textTransform: 'uppercase',
            letterSpacing: -2,
            maxWidth: 900,
            marginBottom: 30
          }}
        >
          Construir el sur,<br />
          <span style={{ color: '#F77F00' }}>una obra a la vez.</span>
        </div>

        {/* Dirección */}
        <div
          style={{
            color: '#F5EFE6',
            opacity: 0.7,
            fontSize: 22,
            fontWeight: 500
          }}
        >
          {dir}
        </div>
      </div>
    ),
    { ...size }
  );
}
