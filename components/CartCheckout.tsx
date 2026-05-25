'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Minus, Plus, Trash2, MessageCircle, FileDown, ShoppingBag,
  MapPin, Locate, Loader2, Check, Navigation, Home, Map
} from 'lucide-react';
import { useCart } from '@/lib/cart';
import { formatCLP, whatsappLink } from '@/lib/format';
import { buildWhatsappMessage, generateQuotePDF, mapsLink, formatCoords } from '@/lib/quote';
import type { Settings, UbicacionTipo } from '@/lib/types';

type GeoState = {
  status: 'idle' | 'locating' | 'ok' | 'denied' | 'error' | 'unsupported';
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
  message: string | null;
};

const INITIAL_GEO: GeoState = {
  status: 'idle', lat: null, lng: null, accuracy: null, message: null
};

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
  const [ubicacionTipo, setUbicacionTipo] = useState<UbicacionTipo>('direccion');
  const [geo, setGeo] = useState<GeoState>(INITIAL_GEO);
  const [sending, setSending] = useState(false);

  const iva = Math.round(subtotal * (settings.iva_pct / 100));
  const total = subtotal + iva;

  // Validación dinámica según el tipo de ubicación seleccionado
  const direccionValid = (() => {
    if (ubicacionTipo === 'gps') {
      return geo.lat != null && geo.lng != null;
    }
    if (ubicacionTipo === 'referencia') {
      // Referencia rural: pide texto descriptivo (puede incluir GPS opcional)
      return form.direccion_despacho.trim().length > 5;
    }
    // direccion: pide texto de calle/número
    return form.direccion_despacho.trim().length > 2;
  })();

  const formValid =
    form.cliente_nombre.trim().length > 1 &&
    form.cliente_telefono.trim().length >= 8 &&
    form.comuna &&
    direccionValid;

  function requestLocation() {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGeo({ ...INITIAL_GEO, status: 'unsupported', message: 'Este dispositivo no soporta GPS.' });
      return;
    }
    setGeo((g) => ({ ...g, status: 'locating', message: null }));
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeo({
          status: 'ok',
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy ?? null,
          message: null
        });
      },
      (err) => {
        const msg =
          err.code === err.PERMISSION_DENIED
            ? 'Permiso de ubicación denegado. Actívalo en los ajustes del navegador.'
            : err.code === err.POSITION_UNAVAILABLE
            ? 'No se pudo determinar tu ubicación. Verifica el GPS.'
            : err.code === err.TIMEOUT
            ? 'Tiempo agotado al obtener ubicación. Reintenta.'
            : 'Error al obtener ubicación.';
        setGeo({
          ...INITIAL_GEO,
          status: err.code === err.PERMISSION_DENIED ? 'denied' : 'error',
          message: msg
        });
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }

  function clearLocation() {
    setGeo(INITIAL_GEO);
  }

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

    // Construir la "dirección" de despacho según el tipo
    let direccionFinal = form.direccion_despacho.trim();
    if (ubicacionTipo === 'gps' && !direccionFinal && geo.lat != null) {
      direccionFinal = `Ubicación GPS (${formatCoords(geo.lat, geo.lng!)})`;
    }

    const quote = {
      items,
      subtotal,
      iva,
      total,
      cliente_nombre: form.cliente_nombre.trim(),
      cliente_telefono: form.cliente_telefono.trim(),
      cliente_email: form.cliente_email.trim() || undefined,
      comuna: form.comuna,
      direccion_despacho: direccionFinal,
      observaciones: form.observaciones.trim() || undefined,
      lat: geo.lat,
      lng: geo.lng,
      ubicacion_tipo: ubicacionTipo
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
      {/* CARRITO */}
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
                  <Image src={it.imagen_url} alt={it.nombre} fill sizes="96px" className="object-cover" />
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

      {/* SIDEBAR — datos de despacho + resumen */}
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

            {/* Selector de tipo de ubicación */}
            <div>
              <label className="label">¿Cómo llegamos? *</label>
              <div className="grid grid-cols-3 gap-1 bg-bg-sub rounded p-1">
                <UbicacionTab
                  active={ubicacionTipo === 'direccion'}
                  onClick={() => setUbicacionTipo('direccion')}
                  icon={<Home className="w-3.5 h-3.5" />}
                  label="Dirección"
                />
                <UbicacionTab
                  active={ubicacionTipo === 'gps'}
                  onClick={() => setUbicacionTipo('gps')}
                  icon={<Navigation className="w-3.5 h-3.5" />}
                  label="GPS"
                />
                <UbicacionTab
                  active={ubicacionTipo === 'referencia'}
                  onClick={() => setUbicacionTipo('referencia')}
                  icon={<Map className="w-3.5 h-3.5" />}
                  label="Rural"
                />
              </div>
            </div>

            {/* Panel adaptativo según tipo */}
            {ubicacionTipo === 'direccion' && (
              <div>
                <label className="label">Calle, número y referencia *</label>
                <input
                  className="input"
                  value={form.direccion_despacho}
                  onChange={(e) => setForm({ ...form, direccion_despacho: e.target.value })}
                  placeholder="Ej: O'Higgins 1234, depto 5B"
                />
                <GeoButton
                  geo={geo}
                  requestLocation={requestLocation}
                  clearLocation={clearLocation}
                  small
                />
              </div>
            )}

            {ubicacionTipo === 'gps' && (
              <div className="bg-bg-sub rounded p-3 border border-gray-200">
                <p className="text-2xs text-text-secondary mb-2">
                  Para entregas en parcelas, fundos o sectores sin nombre de calle. Tu ubicación se enviará al ferretero como un link a Google Maps.
                </p>
                <GeoButton
                  geo={geo}
                  requestLocation={requestLocation}
                  clearLocation={clearLocation}
                />
                <input
                  className="input mt-2 text-xs"
                  value={form.direccion_despacho}
                  onChange={(e) => setForm({ ...form, direccion_despacho: e.target.value })}
                  placeholder="Referencia adicional (opcional): casa azul, portón blanco…"
                />
              </div>
            )}

            {ubicacionTipo === 'referencia' && (
              <div className="bg-bg-sub rounded p-3 border border-gray-200">
                <p className="text-2xs text-text-secondary mb-2">
                  Describe cómo llegar: caminos rurales, hitos visibles, km, color de portón, etc.
                </p>
                <textarea
                  className="input min-h-[80px] text-sm"
                  value={form.direccion_despacho}
                  onChange={(e) => setForm({ ...form, direccion_despacho: e.target.value })}
                  placeholder={'Ej: Camino Paraguay s/n, km 3.2 desde la ruta, casa amarilla a mano izquierda después del puente.'}
                />
                <p className="text-2xs text-text-secondary mt-2">
                  Si puedes, suma tu GPS:
                </p>
                <GeoButton
                  geo={geo}
                  requestLocation={requestLocation}
                  clearLocation={clearLocation}
                  small
                />
              </div>
            )}

            <div>
              <label className="label">Observaciones</label>
              <textarea
                className="input min-h-[60px]"
                value={form.observaciones}
                onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
                placeholder="Horario disponible, indicaciones especiales…"
              />
            </div>
          </div>
        </div>

        {/* RESUMEN */}
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

/* ============================================================
   COMPONENTES AUXILIARES
   ============================================================ */

function UbicacionTab({
  active, onClick, icon, label
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-0.5 py-2 px-1 rounded text-2xs font-semibold transition-colors ${
        active ? 'bg-white shadow-card text-text-link' : 'text-text-secondary hover:bg-bg-hover'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function GeoButton({
  geo, requestLocation, clearLocation, small = false
}: {
  geo: GeoState;
  requestLocation: () => void;
  clearLocation: () => void;
  small?: boolean;
}) {
  if (geo.status === 'ok' && geo.lat != null && geo.lng != null) {
    return (
      <div className={`${small ? 'mt-2' : ''} rounded border border-success/30 bg-green-50 p-2.5`}>
        <div className="flex items-start gap-2">
          <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-success">Ubicación capturada</p>
            <p className="text-2xs text-text-secondary font-mono break-all">
              {formatCoords(geo.lat, geo.lng)}
            </p>
            {geo.accuracy != null && (
              <p className="text-2xs text-text-tertiary">
                Precisión: ±{Math.round(geo.accuracy)} m
              </p>
            )}
            <div className="flex gap-2 mt-1">
              <a
                href={mapsLink(geo.lat, geo.lng)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-2xs text-text-link hover:underline inline-flex items-center gap-0.5"
              >
                <MapPin className="w-3 h-3" /> Ver en mapa
              </a>
              <button
                type="button"
                onClick={clearLocation}
                className="text-2xs text-text-secondary hover:text-danger"
              >
                Borrar
              </button>
              <button
                type="button"
                onClick={requestLocation}
                className="text-2xs text-text-secondary hover:text-text-link ml-auto"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (geo.status === 'locating') {
    return (
      <button
        type="button"
        disabled
        className={`${small ? 'mt-2' : ''} btn w-full px-3 py-2 bg-bg-sub text-text-secondary text-xs rounded border border-gray-200`}
      >
        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Obteniendo ubicación…
      </button>
    );
  }

  return (
    <div className={small ? 'mt-2' : ''}>
      <button
        type="button"
        onClick={requestLocation}
        className="btn w-full px-3 py-2 bg-text-link text-white text-xs rounded hover:bg-blue-600"
      >
        <Locate className="w-3.5 h-3.5" /> Usar mi ubicación actual
      </button>
      {geo.message && (
        <p className="text-2xs text-danger mt-1.5">{geo.message}</p>
      )}
    </div>
  );
}
