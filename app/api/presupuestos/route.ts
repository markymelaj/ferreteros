import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

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
        observaciones: body.observaciones ?? null
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
