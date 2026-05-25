import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

const VALID_TIPOS = new Set(['direccion', 'gps', 'referencia']);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validación mínima
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: 'Carrito vacío' }, { status: 400 });
    }
    if (typeof body.total !== 'number' || body.total <= 0) {
      return NextResponse.json({ error: 'Total inválido' }, { status: 400 });
    }
    if (!body.cliente_nombre || !body.cliente_telefono) {
      return NextResponse.json({ error: 'Datos de cliente requeridos' }, { status: 400 });
    }

    // Validación de geolocalización
    const ubicacion_tipo = VALID_TIPOS.has(body.ubicacion_tipo)
      ? body.ubicacion_tipo
      : 'direccion';

    let lat: number | null = null;
    let lng: number | null = null;
    if (body.lat != null && body.lng != null) {
      const latN = Number(body.lat);
      const lngN = Number(body.lng);
      if (
        Number.isFinite(latN) && Number.isFinite(lngN) &&
        latN >= -90 && latN <= 90 && lngN >= -180 && lngN <= 180
      ) {
        lat = latN;
        lng = lngN;
      }
    }

    // Si el tipo es 'gps' pero no llegaron coords válidas → error
    if (ubicacion_tipo === 'gps' && (lat == null || lng == null)) {
      return NextResponse.json(
        { error: 'Tipo de ubicación GPS requiere coordenadas válidas' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('presupuestos')
      .insert({
        items: body.items,
        subtotal: body.subtotal,
        iva: body.iva,
        total: body.total,
        cliente_nombre: body.cliente_nombre,
        cliente_telefono: body.cliente_telefono,
        cliente_email: body.cliente_email ?? null,
        comuna: body.comuna ?? null,
        direccion_despacho: body.direccion_despacho ?? null,
        observaciones: body.observaciones ?? null,
        lat,
        lng,
        ubicacion_tipo
      })
      .select('id, fecha')
      .single();

    if (error) {
      console.error('Insert presupuesto error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const numero = data.id.split('-')[0].toUpperCase();
    return NextResponse.json({ ok: true, id: data.id, numero });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
