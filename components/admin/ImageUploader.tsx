'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Upload, X, Loader2, Image as ImageIcon, Link as LinkIcon,
  Star, ArrowUp
} from 'lucide-react';
import { createClient } from '@/lib/supabase-browser';

interface Props {
  /** URL de la imagen principal (portada). */
  value: string | null;
  /** Callback cuando cambia la portada. */
  onChange: (url: string | null) => void;
  /** URLs de imágenes adicionales (galería). Default: []. */
  gallery?: string[];
  /** Callback cuando cambia la galería. */
  onGalleryChange?: (urls: string[]) => void;
  /** Bucket de Supabase Storage. Default: 'product-images' */
  bucket?: string;
  /** Carpeta dentro del bucket. Default: 'products' */
  folder?: string;
  /** Cantidad máxima total de imágenes (portada + galería). Default: 8. */
  maxImages?: number;
}

interface UploadStatus {
  name: string;
  status: 'uploading' | 'done' | 'error';
  message?: string;
}

/**
 * Uploader híbrido con drag & drop, multi-upload, y galería:
 * - Sube archivos a Supabase Storage o acepta URLs pegadas
 * - Drag & drop desde el escritorio (acepta múltiples archivos)
 * - Primera imagen = portada automática si no había
 * - Resto = galería
 * - "Hacer portada" en miniaturas, eliminar individual
 */
export function ImageUploader({
  value,
  onChange,
  gallery = [],
  onGalleryChange,
  bucket = 'product-images',
  folder = 'products',
  maxImages = 8
}: Props) {
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [uploads, setUploads] = useState<UploadStatus[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const totalImages = (value ? 1 : 0) + gallery.length;
  const remaining = maxImages - totalImages;
  const hasGallerySupport = typeof onGalleryChange === 'function';

  /** Sube un archivo individual a Storage. Devuelve la public URL o lanza. */
  const uploadOne = useCallback(
    async (file: File): Promise<string> => {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const safeName = file.name
        .replace(/\.[^/.]+$/, '')
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .slice(0, 40);
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        });
      if (upErr) throw upErr;

      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      return data.publicUrl;
    },
    [bucket, folder, supabase]
  );

  /** Valida + sube en serie una lista de archivos. Aplica límites. */
  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      setError(null);
      const list = Array.from(files);

      // Filtrar imágenes válidas
      const valid: File[] = [];
      for (const f of list) {
        if (!f.type.startsWith('image/')) continue;
        if (f.size > 5 * 1024 * 1024) {
          setError(`"${f.name}" supera los 5 MB y fue ignorada.`);
          continue;
        }
        valid.push(f);
      }
      if (valid.length === 0) {
        if (!error) setError('No hay imágenes válidas para subir (JPG, PNG, WebP, máx 5 MB).');
        return;
      }

      // Aplicar límite total
      const space = maxImages - totalImages;
      if (valid.length > space) {
        setError(`Solo caben ${space} imagen${space === 1 ? '' : 'es'} más. Se subirán las primeras ${space}.`);
        valid.length = space;
      }
      if (valid.length === 0) return;

      // Inicializar estados
      const initial: UploadStatus[] = valid.map((f) => ({ name: f.name, status: 'uploading' }));
      setUploads(initial);

      const newUrls: string[] = [];
      for (let i = 0; i < valid.length; i++) {
        try {
          const url = await uploadOne(valid[i]);
          newUrls.push(url);
          setUploads((prev) =>
            prev.map((s, idx) => (idx === i ? { ...s, status: 'done' } : s))
          );
        } catch (err: any) {
          const msg = err?.message ?? String(err);
          const friendly =
            msg.toLowerCase().includes('not found') || msg.toLowerCase().includes('does not exist')
              ? `Bucket "${bucket}" no existe. Aplica storage_setup.sql.`
              : msg.toLowerCase().includes('row-level') || msg.toLowerCase().includes('rls')
              ? 'Permisos insuficientes. Verifica que estés en la tabla admins.'
              : msg;
          setUploads((prev) =>
            prev.map((s, idx) => (idx === i ? { ...s, status: 'error', message: friendly } : s))
          );
          setError(friendly);
        }
      }

      // Distribuir: primera URL nueva es portada si no había
      const remainingNew = [...newUrls];
      if (!value && remainingNew.length > 0) {
        onChange(remainingNew.shift()!);
      }
      // Resto al final de la galería
      if (remainingNew.length > 0 && hasGallerySupport) {
        onGalleryChange!([...gallery, ...remainingNew]);
      } else if (remainingNew.length > 0 && !hasGallerySupport) {
        // Sin galería habilitada: solo la última nueva queda como portada
        onChange(remainingNew[remainingNew.length - 1]);
      }

      // Limpiar estados después de 1.5s
      setTimeout(() => setUploads([]), 1500);
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [bucket, error, gallery, hasGallerySupport, maxImages, onChange, onGalleryChange, totalImages, uploadOne, value]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) void uploadFiles(e.target.files);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) void uploadFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  /** Quitar portada. Si hay galería, promueve la primera. */
  const removeCover = () => {
    if (gallery.length > 0 && hasGallerySupport) {
      onChange(gallery[0]);
      onGalleryChange!(gallery.slice(1));
    } else {
      onChange(null);
    }
  };

  /** Quitar imagen específica de la galería. */
  const removeGalleryItem = (idx: number) => {
    if (!hasGallerySupport) return;
    onGalleryChange!(gallery.filter((_, i) => i !== idx));
  };

  /** Promover una imagen de la galería a portada (swap con la actual). */
  const makeItCover = (idx: number) => {
    if (!hasGallerySupport) return;
    const newCover = gallery[idx];
    const newGallery = [...gallery];
    newGallery.splice(idx, 1);
    if (value) newGallery.unshift(value);
    onChange(newCover);
    onGalleryChange!(newGallery);
  };

  const uploading = uploads.some((u) => u.status === 'uploading');

  return (
    <div className="space-y-3">
      {/* Tabs: subir vs pegar URL */}
      <div className="inline-flex border border-navy/20 rounded overflow-hidden text-xs">
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`px-3 py-1.5 flex items-center gap-1 ${
            mode === 'upload' ? 'bg-navy text-white' : 'bg-white text-navy hover:bg-sand'
          }`}
        >
          <Upload className="w-3.5 h-3.5" /> Subir desde dispositivo
        </button>
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`px-3 py-1.5 flex items-center gap-1 border-l border-navy/20 ${
            mode === 'url' ? 'bg-navy text-white' : 'bg-white text-navy hover:bg-sand'
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5" /> Pegar URL
        </button>
      </div>

      {/* Preview: PORTADA */}
      {value && (
        <div className="flex items-start gap-3 p-2 bg-white border-2 border-ember rounded">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Portada"
            className="w-24 h-24 object-cover rounded border border-navy/10 shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase font-display tracking-wider text-ember flex items-center gap-1 mb-1">
              <Star className="w-3 h-3 fill-ember" /> Portada
            </p>
            <p className="text-xs text-navy/70 break-all line-clamp-2">{value}</p>
            <button
              type="button"
              onClick={removeCover}
              className="text-xs text-red-600 hover:underline mt-1 inline-flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Quitar portada
              {gallery.length > 0 && hasGallerySupport && ' (promueve la siguiente)'}
            </button>
          </div>
        </div>
      )}

      {/* Preview: GALERÍA */}
      {hasGallerySupport && gallery.length > 0 && (
        <div>
          <p className="text-[10px] uppercase font-display tracking-wider text-navy/60 mb-1.5">
            Galería ({gallery.length})
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {gallery.map((url, idx) => (
              <div key={`${url}-${idx}`} className="relative group bg-white border border-navy/20 rounded overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Galería ${idx + 1}`}
                  className="w-full h-20 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-navy/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                  <button
                    type="button"
                    onClick={() => makeItCover(idx)}
                    title="Hacer portada"
                    className="bg-ember text-white p-1.5 rounded hover:bg-ember/80"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeGalleryItem(idx)}
                    title="Quitar"
                    className="bg-red-600 text-white p-1.5 rounded hover:bg-red-700"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input según modo */}
      {mode === 'upload' ? (
        <div>
          {remaining > 0 ? (
            <label
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragEnter={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded p-6 cursor-pointer transition-all ${
                uploading
                  ? 'opacity-60 cursor-wait border-navy/30'
                  : isDragging
                  ? 'border-ember bg-ember/10 scale-[1.01]'
                  : 'border-navy/30 hover:border-ember hover:bg-sand/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                multiple={hasGallerySupport}
                onChange={handleFileInput}
                disabled={uploading}
                className="hidden"
              />
              {uploading ? (
                <>
                  <Loader2 className="w-7 h-7 animate-spin text-navy" />
                  <p className="text-xs text-navy/70">Subiendo {uploads.length} imagen{uploads.length === 1 ? '' : 'es'}…</p>
                </>
              ) : isDragging ? (
                <>
                  <Upload className="w-7 h-7 text-ember" />
                  <p className="text-sm font-semibold text-ember">Suelta las imágenes aquí</p>
                </>
              ) : (
                <>
                  <ImageIcon className="w-7 h-7 text-navy/50" />
                  <p className="text-xs text-navy/70 text-center">
                    {hasGallerySupport ? (
                      <>
                        <strong>Arrastra una o más imágenes</strong> o haz click para elegir<br/>
                      </>
                    ) : (
                      <>
                        <strong>Arrastra una imagen</strong> o haz click para elegir<br/>
                      </>
                    )}
                    <span className="text-[10px] text-navy/50">
                      JPG, PNG, WebP · máx 5 MB · {remaining} de {maxImages} disponibles
                    </span>
                  </p>
                </>
              )}
            </label>
          ) : (
            <div className="text-xs text-navy/60 bg-sand border border-navy/20 rounded p-3 text-center">
              Llegaste al máximo de {maxImages} imágenes. Elimina alguna para subir más.
            </div>
          )}

          {/* Progreso por archivo */}
          {uploads.length > 0 && (
            <ul className="mt-2 space-y-1 text-xs">
              {uploads.map((u, i) => (
                <li key={i} className="flex items-center gap-2">
                  {u.status === 'uploading' && <Loader2 className="w-3 h-3 animate-spin text-navy" />}
                  {u.status === 'done' && <span className="text-whatsapp">✓</span>}
                  {u.status === 'error' && <span className="text-red-600">✕</span>}
                  <span className={`truncate ${u.status === 'error' ? 'text-red-600' : 'text-navy/70'}`}>
                    {u.name}
                    {u.message && ` — ${u.message}`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <input
            className="input"
            placeholder="https://media.falabella.com/sodimacCL/…"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value || null)}
          />
          <p className="text-[10px] text-navy/50">
            URL externa para la portada. La galería solo acepta uploads.
          </p>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">
          {error}
        </p>
      )}
    </div>
  );
}
