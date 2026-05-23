import Link from 'next/link';
import { ArrowLeft, Hammer } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="bg-bg-page min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="bg-white rounded-card shadow-card p-10 text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-50 rounded-full mb-4">
          <Hammer className="w-8 h-8 text-brand-600" />
        </div>
        <p className="text-xs uppercase tracking-widest text-text-secondary mb-2">
          Error 404
        </p>
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          Página no encontrada
        </h1>
        <p className="text-sm text-text-secondary mb-5">
          La página que buscas no existe o se movió.
        </p>
        <Link href="/" className="btn-primary">
          <ArrowLeft className="w-4 h-4" /> Volver al inicio
        </Link>
      </div>
    </div>
  );
}
