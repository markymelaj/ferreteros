'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { createClient } from '@/lib/supabase-browser';
import type { Category } from '@/lib/types';

const EMPTY: Partial<Category> = { slug: '', nombre: '', icono: '', orden: 0, activo: true };

const ICON_HINTS = ['HardHat', 'Zap', 'Droplet', 'Wrench', 'Paintbrush', 'Sprout', 'Box'];

export function CategoriesAdmin({ initial }: { initial: Category[] }) {
  const [items, setItems] = useState<Category[]>(initial);
  const [editing, setEditing] = useState<Partial<Category> | null>(null);
  const supabase = createClient();

  const slugify = (s: string) =>
    s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const payload = {
      slug: editing.slug || slugify(editing.nombre ?? ''),
      nombre: editing.nombre,
      icono: editing.icono || null,
      orden: Number(editing.orden) || 0,
      activo: editing.activo !== false
    };
    if (editing.id) {
      const { data, error } = await supabase.from('categories').update(payload).eq('id', editing.id).select().single();
      if (error) return alert(error.message);
      setItems((prev) => prev.map((c) => c.id === editing.id ? (data as Category) : c).sort((a, b) => a.orden - b.orden));
    } else {
      const { data, error } = await supabase.from('categories').insert(payload).select().single();
      if (error) return alert(error.message);
      setItems((prev) => [...prev, data as Category].sort((a, b) => a.orden - b.orden));
    }
    setEditing(null);
  }

  async function handleDelete(c: Category) {
    if (!confirm(`¿Eliminar la categoría "${c.nombre}"? Los productos asociados perderán su categoría.`)) return;
    const { error } = await supabase.from('categories').delete().eq('id', c.id);
    if (error) return alert(error.message);
    setItems((prev) => prev.filter((x) => x.id !== c.id));
  }

  return (
    <div>
      <header className="flex items-center justify-between mb-6">
        <h1 className="font-display uppercase text-3xl text-navy">Categorías</h1>
        <button onClick={() => setEditing({ ...EMPTY })} className="btn-brutal">
          <Plus className="w-4 h-4" /> Nueva categoría
        </button>
      </header>

      <div className="bg-white border-2 border-navy">
        <table className="w-full text-sm">
          <thead className="bg-sand">
            <tr>
              <th className="text-left p-3 font-display uppercase text-xs">Orden</th>
              <th className="text-left p-3 font-display uppercase text-xs">Nombre</th>
              <th className="text-left p-3 font-display uppercase text-xs">Slug</th>
              <th className="text-left p-3 font-display uppercase text-xs">Icono</th>
              <th className="text-center p-3 font-display uppercase text-xs">Activo</th>
              <th className="text-right p-3 font-display uppercase text-xs">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id} className="border-t border-navy/10 hover:bg-sand/40">
                <td className="p-3 text-navy/60">{c.orden}</td>
                <td className="p-3 font-semibold">{c.nombre}</td>
                <td className="p-3 font-mono text-xs">{c.slug}</td>
                <td className="p-3 text-xs">{c.icono ?? '—'}</td>
                <td className="p-3 text-center">{c.activo ? '✓' : '—'}</td>
                <td className="p-3 text-right whitespace-nowrap">
                  <button onClick={() => setEditing(c)} className="text-navy hover:text-ember mr-2"><Pencil className="w-4 h-4 inline" /></button>
                  <button onClick={() => handleDelete(c)} className="text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4 inline" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-navy/80 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSave} className="bg-sand border-2 border-navy max-w-md w-full p-6 shadow-brutal">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display uppercase text-xl text-navy">
                {editing.id ? 'Editar' : 'Nueva'} categoría
              </h2>
              <button type="button" onClick={() => setEditing(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="label">Nombre *</label>
                <input className="input" required value={editing.nombre ?? ''} onChange={(e) => setEditing({ ...editing, nombre: e.target.value })} />
              </div>
              <div>
                <label className="label">Slug</label>
                <input className="input" value={editing.slug ?? ''} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} placeholder="Auto si vacío" />
              </div>
              <div>
                <label className="label">Icono (lucide-react)</label>
                <input className="input" list="icon-hints" value={editing.icono ?? ''} onChange={(e) => setEditing({ ...editing, icono: e.target.value })} placeholder="Ej: Wrench" />
                <datalist id="icon-hints">
                  {ICON_HINTS.map((i) => <option key={i} value={i} />)}
                </datalist>
                <p className="text-[11px] text-navy/60 mt-1">
                  Sugeridos: {ICON_HINTS.join(', ')}
                </p>
              </div>
              <div>
                <label className="label">Orden</label>
                <input type="number" className="input" value={editing.orden ?? 0} onChange={(e) => setEditing({ ...editing, orden: Number(e.target.value) })} />
              </div>
              <label className="flex items-center gap-2 font-semibold text-navy">
                <input type="checkbox" checked={editing.activo !== false} onChange={(e) => setEditing({ ...editing, activo: e.target.checked })} className="w-4 h-4 accent-ember" />
                Activo
              </label>
            </div>
            <div className="mt-5 flex gap-2 justify-end">
              <button type="button" onClick={() => setEditing(null)} className="btn-ghost">Cancelar</button>
              <button type="submit" className="btn-brutal">Guardar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
