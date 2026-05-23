'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, Trash2, MessageCircle, FileDown, ShoppingBag } from 'lucide-react';
import { useCart } from '@/lib/cart';
import { formatCLP, whatsappLink, formatQty } from '@/lib/format';
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
      <div className="bg-white rounded-card shadow-card p-10 text-center">
        <ShoppingBag className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-text-primary mb-2">
          Tu carrito está vacío
        </h2>
        <p className="text-sm text-text-secondary mb-5">
          Agrega productos desde el catálogo para cotizar.
        </p>
        <Link href="/materiales" className="btn-primary">
          Ir a Materiales
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

    const msg = buildWhatsappMessage(quote, settings);
    const link = whatsappLink(settings.telefono_whatsapp, msg);
    window.open(link, '_blank');

    setSending(false);
  }

  return (
    <div className="grid lg:grid-cols-[1fr_380px] gap-4 items-start">
      <div className="bg-white rounded-card shadow-card overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-text-primary">
            Productos ({count})
          </h2>
          <button
            onClick={clear}
            className="text-xs text-text-secondary hover:text-danger flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" /> Vaciar carrito
          </button>
        </div>

        <ul>
          {items.map((it) => (
            <li
              key={it.id}
              className="flex flex-col sm:flex-row gap-3 p-4 border-b border-gray-100 last:border-0"
            >
              <Link
                href={`/producto/${it.slug}`}
                className="relative w-full sm:w-24 h-24 bg-bg-sub rounded shrink-0 overflow-hidden"
              >
                {it.imagen_url ? (
                  <Image src={it.imagen_url} alt={it.nombre} fill sizes="96px" className="object-contain p-1" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl text-text-tertiary">
                    {it.nombre.charAt(0)}
                  </div>
                )}
              </Link>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/producto/${it.slug}`}
                  className="text-sm font-semibold text-text-primary hover:text-text-link line-clamp-2"
                >
                  {it.nombre}
                </Link>
                <p className="text-xs text-text-secondary mt-0.5">
                  {formatCLP(it.precio)} por {it.unidad}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="inline-flex items-center border border-gray-300 rounded">
                    <button
                      onClick={() => setQty(it.id, it.cantidad - (it.tipo === 'arido' ? 0.5 : 1))}
                      className="w-8 h-8 flex items-center justify-center hover:bg-bg-sub text-text-secondary"
                      aria-label="Restar"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <input
                      type="number"
                      min={it.tipo === 'arido' ? 0.5 : 1}
                      step={it.tipo === 'arido' ? 0.5 : 1}
                      value={it.cantidad}
                      onChange={(e) => setQty(it.id, parseFloat(e.target.value) || (it.tipo === 'arido' ? 0.5 : 1))}
                      className="w-14 h-8 text-center text-sm text-text-primary bg-transparent border-x border-gray-300 focus:outline-none"
                    />
                    <button
                      onClick={() => setQty(it.id, it.cantidad + (it.tipo === 'arido' ? 0.5 : 1))}
                      className="w-8 h-8 flex items-center justify-center hover:bg-bg-sub text-text-secondary"
                      aria-label="Sumar"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="text-xs text-text-secondary">
                    {it.tipo === 'arido' ? 'm³' : it.unidad}
                  </span>
                  <button
                    onClick={() => remove(it.id)}
                    className="ml-auto text-xs text-text-link hover:underline"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-lg font-semibold text-text-primary">
                  {formatCLP(it.precio * it.cantidad)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <aside className="lg:sticky lg:top-32 space-y-4">
        <div className="bg-white rounded-card shadow-card p-4">
          <h3 className="font-semibold text-text-primary mb-3">Datos de despacho</h3>
          <div className="space-y-3">
            <div>
              <label className="label">Nombre completo *</label>
              <input
                className="input"
                value={form.cliente_nombre}
                onChange={(e) => setForm({ ...form, cliente_nombre: e.target.value })}
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
              <label className="label">Dirección *</label>
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
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-card shadow-card p-4">
          <h3 className="font-semibold text-text-primary mb-3">Resumen</h3>
          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between text-text-secondary">
              <dt>Subtotal neto</dt>
              <dd>{formatCLP(subtotal)}</dd>
            </div>
            <div className="flex justify-between text-text-secondary">
              <dt>IVA {settings.iva_pct}%</dt>
              <dd>{formatCLP(iva)}</dd>
            </div>
            <div className="flex justify-between items-end border-t border-gray-200 pt-2 mt-2">
              <dt className="font-semibold text-text-primary">Total</dt>
              <dd className="text-2xl font-light text-text-primary">{formatCLP(total)}</dd>
            </div>
          </dl>
          <p className="text-2xs text-text-secondary mt-2">
            Despacho se confirma según comuna y volumen.
          </p>

          <button
            onClick={handleSend}
            disabled={!formValid || sending}
            className="btn-wa w-full mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MessageCircle className="w-4 h-4" />
            {sending ? 'Enviando…' : 'Enviar cotización por WhatsApp'}
          </button>
          <p className="text-2xs text-text-secondary mt-2 flex items-center justify-center gap-1">
            <FileDown className="w-3 h-3" /> Se descargará un PDF con tu cotización
          </p>
        </div>
      </aside>
    </div>
  );
}
