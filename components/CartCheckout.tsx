'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, Trash2, MessageCircle, FileDown, ShoppingBag } from 'lucide-react';
import { useCart } from '@/lib/cart';
import { formatCLP, whatsappLink } from '@/lib/format';
import { buildWhatsappMessage, generateQuotePDF } from '@/lib/quote';
import type { Settings } from '@/lib/types';

export function CartCheckout({ settings }: { settings: Settings }) {
  const { items, remove, setQty, clear, subtotal, count } = useCart();
  const [form, setForm] = useState({
    cliente_nombre: '',
    cliente_telefono: '',
    cliente_email: '',
    comuna: settings.comunas_despacho?.[0] ?? '',
    direccion_despacho: '',
    observaciones: ''
  });
  const [sending, setSending] = useState(false);

  const iva = Math.round(subtotal * (settings.iva_pct / 100));
  const total = subtotal + iva;

  const formValid =
    form.cliente_nombre.trim().length > 1 &&
    form.cliente_telefono.trim().length >= 8 &&
    form.comuna &&
    form.direccion_despacho.trim().length > 2;

  if (count === 0) {
    return (
      <div className="bg-white border-2 border-navy p-10 text-center">
        <ShoppingBag className="w-12 h-12 text-navy/30 mx-auto mb-4" />
        <h2 className="font-display uppercase text-2xl text-navy mb-2">
          Tu carrito está vacío
        </h2>
        <p className="text-navy/60 mb-5">
          Agrega productos desde el catálogo para cotizar.
        </p>
        <Link href="/catalogo" className="btn-brutal">
          Ir al Catálogo
        </Link>
      </div>
    );
  }

  async function handleSend() {
    if (!formValid || sending) return;
    setSending(true);

    const quote = {
      items,
      subtotal,
      iva,
      total,
      cliente_nombre: form.cliente_nombre.trim(),
      cliente_telefono: form.cliente_telefono.trim(),
      cliente_email: form.cliente_email.trim() || undefined,
      comuna: form.comuna,
      direccion_despacho: form.direccion_despacho.trim(),
      observaciones: form.observaciones.trim() || undefined
    };

    // Registrar presupuesto en backend (best-effort)
    let numero = `${Date.now().toString().slice(-6)}`;
    try {
      const res = await fetch('/api/presupuestos', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(quote)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.numero) numero = json.numero;
      }
    } catch (err) {
      console.error('No se pudo registrar el presupuesto', err);
    }

    // Generar PDF y descargar
    try {
      const blob = await generateQuotePDF(quote, settings, numero);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cotizacion-${settings.nombre_ferreteria.toLowerCase().replace(/\s+/g, '-')}-${numero}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generando PDF', err);
    }

    // Abrir WhatsApp
    const msg = buildWhatsappMessage(quote, settings);
    const link = whatsappLink(settings.telefono_whatsapp, msg);
    window.open(link, '_blank');

    setSending(false);
  }

  return (
    <div className="grid lg:grid-cols-[1fr_400px] gap-8 items-start">
      <div className="bg-white border-2 border-navy">
        <div className="px-5 py-3 border-b-2 border-navy flex items-center justify-between">
          <h2 className="font-display uppercase text-navy">
            Productos ({count})
          </h2>
          <button
            onClick={clear}
            className="text-xs uppercase font-display tracking-wider text-navy/60 hover:text-red-600 flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" /> Vaciar
          </button>
        </div>

        <ul>
          {items.map((it) => (
            <li
              key={it.id}
              className="flex flex-col sm:flex-row gap-3 p-4 border-b border-navy/10 last:border-0"
            >
              <Link
                href={`/producto/${it.slug}`}
                className="relative w-full sm:w-20 h-20 bg-sand-dark border-2 border-navy shrink-0 flex items-center justify-center font-display text-navy/30 text-2xl overflow-hidden"
              >
                {it.imagen_url ? (
                  <Image
                    src={it.imagen_url}
                    alt={it.nombre}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  it.nombre.charAt(0)
                )}
              </Link>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/producto/${it.slug}`}
                  className="font-display uppercase text-sm text-navy hover:text-ember line-clamp-2"
                >
                  {it.nombre}
                </Link>
                <p className="text-xs text-navy/60 mt-0.5">
                  {formatCLP(it.precio)} por {it.unidad}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="inline-flex items-center border-2 border-navy">
                    <button
                      onClick={() => setQty(it.id, it.cantidad - 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-navy hover:text-sand"
                      aria-label="Restar"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <input
                      type="number"
                      min={1}
                      value={it.cantidad}
                      onChange={(e) => setQty(it.id, parseInt(e.target.value) || 1)}
                      className="w-12 h-8 text-center bg-transparent border-x-2 border-navy text-sm font-semibold focus:outline-none"
                    />
                    <button
                      onClick={() => setQty(it.id, it.cantidad + 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-navy hover:text-sand"
                      aria-label="Sumar"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    onClick={() => remove(it.id)}
                    className="text-xs text-red-600 hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Quitar
                  </button>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="font-display text-lg text-navy">
                  {formatCLP(it.precio * it.cantidad)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <aside className="lg:sticky lg:top-24 space-y-5">
        <div className="bg-white border-2 border-navy p-5">
          <h3 className="font-display uppercase text-lg text-navy mb-4">
            Datos de despacho
          </h3>
          <div className="space-y-3">
            <div>
              <label className="label">Nombre *</label>
              <input
                className="input"
                value={form.cliente_nombre}
                onChange={(e) => setForm({ ...form, cliente_nombre: e.target.value })}
                placeholder="Tu nombre completo"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="label">Teléfono *</label>
                <input
                  className="input"
                  type="tel"
                  value={form.cliente_telefono}
                  onChange={(e) => setForm({ ...form, cliente_telefono: e.target.value })}
                  placeholder="+56 9 ..."
                />
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  className="input"
                  type="email"
                  value={form.cliente_email}
                  onChange={(e) => setForm({ ...form, cliente_email: e.target.value })}
                  placeholder="opcional"
                />
              </div>
            </div>
            <div>
              <label className="label">Comuna *</label>
              <select
                className="input"
                value={form.comuna}
                onChange={(e) => setForm({ ...form, comuna: e.target.value })}
              >
                {settings.comunas_despacho?.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Dirección de despacho *</label>
              <input
                className="input"
                value={form.direccion_despacho}
                onChange={(e) => setForm({ ...form, direccion_despacho: e.target.value })}
                placeholder="Calle, número, referencia"
              />
            </div>
            <div>
              <label className="label">Observaciones</label>
              <textarea
                className="input min-h-[60px]"
                value={form.observaciones}
                onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
                placeholder="Horario preferido, indicaciones, etc."
              />
            </div>
          </div>
        </div>

        <div className="bg-navy text-sand border-2 border-navy p-5">
          <h3 className="font-display uppercase text-lg mb-4">Resumen</h3>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between">
              <dt>Subtotal neto</dt>
              <dd>{formatCLP(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>IVA {settings.iva_pct}%</dt>
              <dd>{formatCLP(iva)}</dd>
            </div>
            <div className="flex justify-between items-end border-t border-sand/30 pt-2 mt-2">
              <dt className="font-display uppercase">Total</dt>
              <dd className="font-display text-2xl text-ember">{formatCLP(total)}</dd>
            </div>
          </dl>
          <p className="text-xs text-sand/60 mt-3">
            Costo de despacho a confirmar según comuna y volumen.
          </p>

          <button
            onClick={handleSend}
            disabled={!formValid || sending}
            className="btn-wa w-full mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MessageCircle className="w-4 h-4" />
            {sending ? 'Enviando…' : 'Enviar cotización por WhatsApp'}
          </button>
          <p className="text-[11px] text-sand/60 mt-2 flex items-center justify-center gap-1">
            <FileDown className="w-3 h-3" /> Se descargará el PDF automáticamente
          </p>
        </div>
      </aside>
    </div>
  );
}
