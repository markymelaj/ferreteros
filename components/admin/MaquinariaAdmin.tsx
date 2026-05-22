'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { createClient } from '@/lib/supabase-browser';
import { formatCLP } from '@/lib/format';
import type { Maquinaria } from '@/lib/types';

const EMPTY: Partial<Maquinaria> = {
  slug: '', nombre: '', descripcion: '', tarifa_dia: 0, tarifa_semana: 0, tarifa_mes: 0, garantia: 0, requisitos: '', imagen_url: '', activo: true
};

export function MaquinariaAdmin({ initial }: { initial: Maquinaria[] }) {
  const [items, setItems] = useState<Maquinaria[]>(initial);
  const [editing, setEditing] = useState<Partial<Maquinaria> | null>(null);
  const supabase = createClient();

  const slugify = (s: string) =>
    s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
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
      if (error) return alert(error.message);
      setItems((prev) => prev.map((m) => m.id === editing.id ? (data as Maquinaria) : m));
    } else {
      const { data, error } = await supabase.from('maquinaria').insert(payload).select().single();
      if (error) return alert(error.message);
      setItems((prev) => [...prev, data as Maquinaria]);
    }
    setEditing(null);
  }

  async function handleDelete(m: Maquinaria) {
    if (!confirm(`¿Eliminar "${m.nombre}"?`)) return;
    const { error } = await supabase.from('maquinaria').delete().eq('id', m.id);
    if (error) return alert(error.message);
    setItems((prev) => prev.filter((x) => x.id !== m.id));
  }

  return (
    <div>
      <header className="flex items-center justify-between mb-6">
        <h1 className="font-display uppercase text-3xl text-navy">Maquinaria</h1>
        <button onClick={() => setEditing({ ...EMPTY })} className="btn-brutal">
          <Plus className="w-4 h-4" /> Nueva máquina
        </button>
      </header>

      <div className="bg-white border-2 border-navy overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-sand">
            <tr>
              <th className="text-left p-3 font-display uppercase text-xs">Nombre</th>
              <th className="text-right p-3 font-display uppercase text-xs">Día</th>
              <th className="text-right p-3 font-display uppercase text-xs">Semana</th>
              <th className="text-right p-3 font-display uppercase text-xs">Mes</th>
              <th className="text-right p-3 font-display uppercase text-xs">Garantía</th>
              <th className="text-center p-3 font-display uppercase text-xs">Activo</th>
              <th className="text-right p-3 font-display uppercase text-xs">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((m) => (
              <tr key={m.id} className="border-t border-navy/10">
                <td className="p-3 font-semibold">{m.nombre}</td>
                <td className="p-3 text-right">{formatCLP(m.tarifa_dia)}</td>
                <td className="p-3 text-right">{m.tarifa_semana ? formatCLP(m.tarifa_semana) : '—'}</td>
                <td className="p-3 text-right">{m.tarifa_mes ? formatCLP(m.tarifa_mes) : '—'}</td>
                <td className="p-3 text-right">{formatCLP(m.garantia)}</td>
                <td className="p-3 text-center">{m.activo ? '✓' : '—'}</td>
                <td className="p-3 text-right whitespace-nowrap">
                  <button onClick={() => setEditing(m)} className="text-navy hover:text-ember mr-2"><Pencil className="w-4 h-4 inline" /></button>
                  <button onClick={() => handleDelete(m)} className="text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4 inline" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-navy/80 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleSave} className="bg-sand border-2 border-navy max-w-2xl w-full p-6 shadow-brutal my-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display uppercase text-xl text-navy">
                {editing.id ? 'Editar' : 'Nueva'} máquina
              </h2>
              <button type="button" onClick={() => setEditing(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="label">Nombre *</label>
                <input className="input" required value={editing.nombre ?? ''} onChange={(e) => setEditing({ ...editing, nombre: e.target.value })} />
              </div>
              <div className="col-span-2">
                <label className="label">Slug</label>
                <input className="input" value={editing.slug ?? ''} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} placeholder="Auto si vacío" />
              </div>
              <div className="col-span-2">
                <label className="label">Descripción</label>
                <textarea className="input min-h-[80px]" value={editing.descripcion ?? ''} onChange={(e) => setEditing({ ...editing, descripcion: e.target.value })} />
              </div>
              <div>
                <label className="label">Tarifa día (CLP) *</label>
                <input type="number" className="input" required value={editing.tarifa_dia ?? 0} onChange={(e) => setEditing({ ...editing, tarifa_dia: Number(e.target.value) })} />
              </div>
              <div>
                <label className="label">Tarifa semana</label>
                <input type="number" className="input" value={editing.tarifa_semana ?? ''} onChange={(e) => setEditing({ ...editing, tarifa_semana: e.target.value ? Number(e.target.value) : null })} />
              </div>
              <div>
                <label className="label">Tarifa mes</label>
                <input type="number" className="input" value={editing.tarifa_mes ?? ''} onChange={(e) => setEditing({ ...editing, tarifa_mes: e.target.value ? Number(e.target.value) : null })} />
              </div>
              <div>
                <label className="label">Garantía (CLP)</label>
                <input type="number" className="input" value={editing.garantia ?? 0} onChange={(e) => setEditing({ ...editing, garantia: Number(e.target.value) })} />
              </div>
              <div className="col-span-2">
                <label className="label">Requisitos</label>
                <textarea className="input" value={editing.requisitos ?? ''} onChange={(e) => setEditing({ ...editing, requisitos: e.target.value })} />
              </div>
              <div className="col-span-2">
                <label className="label">URL imagen</label>
                <input className="input" value={editing.imagen_url ?? ''} onChange={(e) => setEditing({ ...editing, imagen_url: e.target.value })} />
              </div>
              <label className="col-span-2 flex items-center gap-2 font-semibold">
                <input type="checkbox" checked={editing.activo !== false} onChange={(e) => setEditing({ ...editing, activo: e.target.checked })} className="w-4 h-4 accent-ember" />
                Activo (visible en web)
              </label>
            </div>
            <div className="mt-6 flex gap-2 justify-end">
              <button type="button" onClick={() => setEditing(null)} className="btn-ghost">Cancelar</button>
              <button type="submit" className="btn-brutal">Guardar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
