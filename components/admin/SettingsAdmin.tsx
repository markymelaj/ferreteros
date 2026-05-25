'use client';

import { useState } from 'react';
import { Save, Loader2, Check, Settings as SettingsIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase-browser';
import type { Settings } from '@/lib/types';

export function SettingsAdmin({ initial }: { initial: Settings }) {
  const [s, setS] = useState<Settings>(initial);
  const [comunasText, setComunasText] = useState((initial.comunas_despacho ?? []).join('\n'));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const supabase = createClient();

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    const comunas = comunasText
      .split(/\r?\n/)
      .map((c) => c.trim())
      .filter(Boolean);

    const payload = {
      nombre_ferreteria: s.nombre_ferreteria,
      descripcion_seo: s.descripcion_seo,
      telefono_whatsapp: s.telefono_whatsapp,
      email: s.email,
      direccion_fisica: s.direccion_fisica,
      horarios: s.horarios,
      comunas_despacho: comunas,
      iva_pct: Number(s.iva_pct) || 19,
      costo_despacho_base: Number(s.costo_despacho_base) || 0
    };

    const { error } = await supabase.from('settings').update(payload).eq('id', 1);
    if (error) { alert(error.message); setSaving(false); return; }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div>
      <header className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Configuración</h1>
        <p className="text-text-secondary text-sm mt-0.5">
          <SettingsIcon className="w-3.5 h-3.5 inline mr-1" />
          Estos valores se reflejan en toda la web.
        </p>
      </header>

      <form onSubmit={handleSave} className="bg-white rounded-card shadow-card p-4 sm:p-6 max-w-3xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Identidad */}
          <div className="sm:col-span-2">
            <h2 className="text-xs uppercase font-semibold text-text-secondary mb-2 pb-1 border-b border-gray-100">
              Identidad
            </h2>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-text-primary mb-1">Nombre de la ferretería</label>
            <input className="input" value={s.nombre_ferreteria} onChange={(e) => setS({ ...s, nombre_ferreteria: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-text-primary mb-1">Descripción SEO</label>
            <textarea
              className="input min-h-[60px]"
              value={s.descripcion_seo}
              onChange={(e) => setS({ ...s, descripcion_seo: e.target.value })}
              placeholder="Descripción corta que aparece en buscadores"
            />
            <p className="text-2xs text-text-tertiary mt-1">Recomendado: 150-160 caracteres.</p>
          </div>

          {/* Contacto */}
          <div className="sm:col-span-2 mt-2">
            <h2 className="text-xs uppercase font-semibold text-text-secondary mb-2 pb-1 border-b border-gray-100">
              Contacto
            </h2>
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">WhatsApp (formato +56)</label>
            <input
              className="input"
              value={s.telefono_whatsapp}
              onChange={(e) => setS({ ...s, telefono_whatsapp: e.target.value })}
              placeholder="+56912345678"
              inputMode="tel"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">Email de contacto</label>
            <input
              type="email"
              className="input"
              value={s.email}
              onChange={(e) => setS({ ...s, email: e.target.value })}
              inputMode="email"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-text-primary mb-1">Dirección física</label>
            <input className="input" value={s.direccion_fisica} onChange={(e) => setS({ ...s, direccion_fisica: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-text-primary mb-1">Horarios de atención</label>
            <input
              className="input"
              value={s.horarios}
              onChange={(e) => setS({ ...s, horarios: e.target.value })}
              placeholder="Lun-Vie 9-19, Sáb 9-14"
            />
          </div>

          {/* Despacho */}
          <div className="sm:col-span-2 mt-2">
            <h2 className="text-xs uppercase font-semibold text-text-secondary mb-2 pb-1 border-b border-gray-100">
              Despacho
            </h2>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-text-primary mb-1">
              Comunas de despacho (una por línea)
            </label>
            <textarea
              className="input min-h-[100px] font-mono text-xs"
              value={comunasText}
              onChange={(e) => setComunasText(e.target.value)}
              placeholder={'Los Ángeles\nCabrero\nYumbel'}
            />
            <p className="text-2xs text-text-tertiary mt-1">
              Cada línea es una comuna. Se muestran en el selector del checkout.
            </p>
          </div>

          {/* Precios */}
          <div className="sm:col-span-2 mt-2">
            <h2 className="text-xs uppercase font-semibold text-text-secondary mb-2 pb-1 border-b border-gray-100">
              Precios e impuestos
            </h2>
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">IVA (%)</label>
            <input
              type="number"
              className="input"
              value={s.iva_pct}
              onChange={(e) => setS({ ...s, iva_pct: Number(e.target.value) })}
              inputMode="numeric"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">Costo despacho base (CLP)</label>
            <input
              type="number"
              className="input"
              value={s.costo_despacho_base}
              onChange={(e) => setS({ ...s, costo_despacho_base: Number(e.target.value) })}
              inputMode="numeric"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3 pt-4 border-t border-gray-100">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
          {saved && (
            <span className="text-success font-semibold text-sm flex items-center gap-1">
              <Check className="w-4 h-4" /> Guardado
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
