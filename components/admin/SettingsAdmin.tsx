'use client';

import { useState } from 'react';
import { Save, Loader2, Check } from 'lucide-react';
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
      <header className="mb-6">
        <h1 className="font-display uppercase text-3xl text-navy">Settings</h1>
        <p className="text-navy/70 text-sm">
          Configuración global del sitio. Estos valores se reflejan en toda la web.
        </p>
      </header>

      <form onSubmit={handleSave} className="bg-white border-2 border-navy p-6 max-w-3xl">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="label">Nombre de la ferretería</label>
            <input className="input" value={s.nombre_ferreteria} onChange={(e) => setS({ ...s, nombre_ferreteria: e.target.value })} />
          </div>
          <div className="col-span-2">
            <label className="label">Descripción SEO</label>
            <textarea className="input min-h-[60px]" value={s.descripcion_seo} onChange={(e) => setS({ ...s, descripcion_seo: e.target.value })} />
          </div>
          <div>
            <label className="label">WhatsApp (con +56)</label>
            <input className="input" value={s.telefono_whatsapp} onChange={(e) => setS({ ...s, telefono_whatsapp: e.target.value })} />
          </div>
          <div>
            <label className="label">Email de contacto</label>
            <input className="input" value={s.email} onChange={(e) => setS({ ...s, email: e.target.value })} />
          </div>
          <div className="col-span-2">
            <label className="label">Dirección física</label>
            <input className="input" value={s.direccion_fisica} onChange={(e) => setS({ ...s, direccion_fisica: e.target.value })} />
          </div>
          <div className="col-span-2">
            <label className="label">Horarios de atención</label>
            <input className="input" value={s.horarios} onChange={(e) => setS({ ...s, horarios: e.target.value })} />
          </div>
          <div className="col-span-2">
            <label className="label">Comunas de despacho (una por línea)</label>
            <textarea
              className="input min-h-[100px]"
              value={comunasText}
              onChange={(e) => setComunasText(e.target.value)}
              placeholder="Los Ángeles
Cabrero
Yumbel"
            />
          </div>
          <div>
            <label className="label">IVA (%)</label>
            <input type="number" className="input" value={s.iva_pct} onChange={(e) => setS({ ...s, iva_pct: Number(e.target.value) })} />
          </div>
          <div>
            <label className="label">Costo despacho base (CLP)</label>
            <input type="number" className="input" value={s.costo_despacho_base} onChange={(e) => setS({ ...s, costo_despacho_base: Number(e.target.value) })} />
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button type="submit" disabled={saving} className="btn-brutal">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
          {saved && (
            <span className="text-whatsapp font-semibold text-sm flex items-center gap-1">
              <Check className="w-4 h-4" /> Guardado
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
