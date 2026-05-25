'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Plus, Pencil, Trash2, X, Loader2, Wrench } from 'lucide-react';
import { createClient } from '@/lib/supabase-browser';
import { formatCLP } from '@/lib/format';
import { ImageUploader } from './ImageUploader';
import type { Maquinaria } from '@/lib/types';

const EMPTY: Partial<Maquinaria> = {
  slug: '',
  nombre: '',
  descripcion: '',
  tarifa_dia: 0,
  tarifa_semana: 0,
  tarifa_mes: 0,
  garantia: 0,
  requisitos: '',
  imagen_url: '',
  activo: true
};

export function MaquinariaAdmin({ initial }: { initial: Maquinaria[] }) {
  const [items, setItems] = useState<Maquinaria[]>(initial);
  const [editing, setEditing] = useState<Partial<Maquinaria> | null>(null);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const slugify = (s: string) =>
    s.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    const payload = {
      slug: editing.slug || slugify(editing.nombre ?? ''),
      nombre: editing.nombre,
      descripcion: editing.descripcion || null,
      tarifa_dia: Number(editing.tarifa_dia) || 0,
      tarifa_semana: editing.tarifa_semana ? Number(editing.tarifa_semana) : null,
      tarifa_mes: editing.tarifa_mes ? Number(editing.tarifa_mes) : null,
      garantia: Number(editing.garantia) || 0,
      requisitos: editing.requisitos || null,
      imagen_url: editing.imagen_url || null,
      activo: editing.activo !== false
    };
    if (editing.id) {
      const { data, error } = await supabase.from('maquinaria').update(payload).eq('id', editing.id).select().single();
      if (error) { alert(error.message); setSaving(false); return; }
      setItems((prev) => prev.map((m) => m.id === editing.id ? (data as Maquinaria) : m));
    } else {
      const { data, error } = await supabase.from('maquinaria').insert(payload).select().single();
      if (error) { alert(error.message); setSaving(false); return; }
      setItems((prev) => [...prev, data as Maquinaria]);
    }
    setSaving(false);
    setEditing(null);
  }

  async function handleDelete(m: Maquinaria) {
    if (!confirm(`¿Eliminar "${m.nombre}"? Esta acción no se puede deshacer.`)) return;
    const { error } = await supabase.from('maquinaria').delete().eq('id', m.id);
    if (error) { alert(error.message); return; }
    setItems((prev) => prev.filter((x) => x.id !== m.id));
  }

  async function toggleActivo(id: string, value: boolean) {
    const { error } = await supabase.from('maquinaria').update({ activo: value }).eq('id', id);
    if (error) { alert(error.message); return; }
    setItems((prev) => prev.map((m) => m.id === id ? { ...m, activo: value } : m));
  }

  return (
    <div>
      <header className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Maquinaria de Arriendo</h1>
          <p className="text-text-secondary text-sm mt-0.5">
            <Wrench className="w-3.5 h-3.5 inline mr-1" />
            {items.length} máquina{items.length === 1 ? '' : 's'}
          </p>
        </div>
        <button onClick={() => setEditing({ ...EMPTY })} className="btn-primary text-sm">
          <Plus className="w-4 h-4" /> Nueva máquina
        </button>
      </header>

      {/* Tabla desktop */}
      <div className="hidden md:block bg-white rounded-card shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-bg-sub text-text-secondary text-xs uppercase">
            <tr>
              <th className="text-left p-3 font-semibold">Nombre</th>
              <th className="text-right p-3 font-semibold">Día</th>
              <th className="text-right p-3 font-semibold">Semana</th>
              <th className="text-right p-3 font-semibold">Mes</th>
              <th className="text-right p-3 font-semibold">Garantía</th>
              <th className="text-center p-3 font-semibold">Activo</th>
              <th className="text-right p-3 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((m) => (
              <tr key={m.id} className="border-t border-gray-100 hover:bg-bg-hover">
                <td className="p-3 font-semibold text-text-primary">{m.nombre}</td>
                <td className="p-3 text-right text-text-primary">{formatCLP(m.tarifa_dia)}</td>
                <td className="p-3 text-right text-text-secondary">{m.tarifa_semana ? formatCLP(m.tarifa_semana) : '—'}</td>
                <td className="p-3 text-right text-text-secondary">{m.tarifa_mes ? formatCLP(m.tarifa_mes) : '—'}</td>
                <td className="p-3 text-right text-text-secondary">{formatCLP(m.garantia)}</td>
                <td className="p-3 text-center">
                  <input
                    type="checkbox"
                    checked={m.activo}
                    onChange={(e) => toggleActivo(m.id, e.target.checked)}
                    className="w-4 h-4 accent-text-link"
                  />
                </td>
                <td className="p-3 text-right whitespace-nowrap">
                  <button
                    onClick={() => setEditing(m)}
                    className="text-text-link hover:text-blue-700 mr-2 p-1.5 hover:bg-blue-50 rounded transition-colors"
                    aria-label="Editar"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(m)}
                    className="text-danger hover:text-red-700 p-1.5 hover:bg-red-50 rounded transition-colors"
                    aria-label="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={7} className="p-8 text-center text-text-tertiary">Sin maquinaria registrada</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Cards mobile */}
      <div className="md:hidden space-y-2">
        {items.map((m) => (
          <div key={m.id} className="bg-white rounded-card shadow-card p-3 flex gap-3">
            <div className="w-16 h-16 bg-bg-sub rounded shrink-0 overflow-hidden relative">
              {m.imagen_url ? (
                <Image src={m.imagen_url} alt={m.nombre} fill sizes="64px" className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-tertiary">
                  <Wrench className="w-6 h-6" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-text-primary line-clamp-1 mb-1">{m.nombre}</p>
              <div className="text-xs text-text-secondary space-y-0.5">
                <div>Día: <span className="text-text-primary font-semibold">{formatCLP(m.tarifa_dia)}</span></div>
                {m.tarifa_semana && <div>Semana: <span className="text-text-primary">{formatCLP(m.tarifa_semana)}</span></div>}
                {m.tarifa_mes && <div>Mes: <span className="text-text-primary">{formatCLP(m.tarifa_mes)}</span></div>}
              </div>
              <div className="flex items-center gap-3 mt-2 text-xs">
                <label className="inline-flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={m.activo}
                    onChange={(e) => toggleActivo(m.id, e.target.checked)}
                    className="w-4 h-4 accent-text-link"
                  />
                  <span className="text-text-secondary">Activo</span>
                </label>
                <button onClick={() => setEditing(m)} className="ml-auto text-text-link font-semibold">
                  Editar
                </button>
                <button onClick={() => handleDelete(m)} className="text-danger" aria-label="Eliminar">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="bg-white rounded-card shadow-card p-8 text-center text-text-tertiary">
            Sin maquinaria registrada
          </div>
        )}
      </div>

      {/* Modal — backdrop opaco real, fullscreen mobile */}
      {editing && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-modal="true" role="dialog">
          <div
            className="fixed inset-0 bg-ink-900/90 backdrop-blur-sm"
            onClick={() => setEditing(null)}
            aria-hidden="true"
          />
          <div className="relative min-h-full flex items-start sm:items-center justify-center p-0 sm:p-4">
            <form
              onSubmit={handleSave}
              className="relative bg-white w-full sm:max-w-2xl shadow-card-hover min-h-screen sm:min-h-0 sm:rounded-card flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between z-10">
                <h2 className="text-lg sm:text-xl font-bold text-text-primary">
                  {editing.id ? 'Editar' : 'Nueva'} máquina
                </h2>
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  aria-label="Cerrar"
                  className="p-2 -mr-2 text-text-secondary hover:text-text-primary hover:bg-bg-sub rounded transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 px-4 sm:px-6 py-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-text-primary mb-1">Nombre *</label>
                  <input className="input" required value={editing.nombre ?? ''} onChange={(e) => setEditing({ ...editing, nombre: e.target.value })} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-text-primary mb-1">Slug (URL)</label>
                  <input className="input" value={editing.slug ?? ''} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} placeholder="Auto desde nombre si vacío" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-text-primary mb-1">Descripción</label>
                  <textarea className="input min-h-[80px]" value={editing.descripcion ?? ''} onChange={(e) => setEditing({ ...editing, descripcion: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">Tarifa día (CLP) *</label>
                  <input type="number" className="input" required value={editing.tarifa_dia ?? 0} onChange={(e) => setEditing({ ...editing, tarifa_dia: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">Tarifa semana</label>
                  <input type="number" className="input" value={editing.tarifa_semana ?? ''} onChange={(e) => setEditing({ ...editing, tarifa_semana: e.target.value ? Number(e.target.value) : null })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">Tarifa mes</label>
                  <input type="number" className="input" value={editing.tarifa_mes ?? ''} onChange={(e) => setEditing({ ...editing, tarifa_mes: e.target.value ? Number(e.target.value) : null })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">Garantía (CLP)</label>
                  <input type="number" className="input" value={editing.garantia ?? 0} onChange={(e) => setEditing({ ...editing, garantia: Number(e.target.value) })} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-text-primary mb-1">Requisitos</label>
                  <textarea className="input min-h-[60px]" value={editing.requisitos ?? ''} onChange={(e) => setEditing({ ...editing, requisitos: e.target.value })} placeholder="Cédula vigente, comprobante de domicilio…" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-text-primary mb-1">Imagen</label>
                  <ImageUploader
                    value={editing.imagen_url ?? null}
                    onChange={(url) => setEditing({ ...editing, imagen_url: url ?? '' })}
                  />
                </div>
                <label className="sm:col-span-2 flex items-center gap-2 font-medium text-text-primary text-sm">
                  <input type="checkbox" checked={editing.activo !== false} onChange={(e) => setEditing({ ...editing, activo: e.target.checked })} className="w-4 h-4 accent-text-link" />
                  Activo (visible en web)
                </label>
              </div>

              <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 sm:px-6 py-3 flex gap-2 justify-end">
                <button type="button" onClick={() => setEditing(null)} className="btn-ghost">Cancelar</button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {saving ? 'Guardando…' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
