import Link from 'next/link';
import { ArrowLeft, Hammer } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-grit">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-ember border-2 border-navy mb-6">
          <Hammer className="w-10 h-10 text-navy" />
        </div>
        <p className="font-display uppercase text-xs tracking-widest text-ember mb-2">
          Error 404
        </p>
        <h1 className="font-display uppercase text-5xl md:text-6xl text-navy mb-3 leading-none">
          Página no encontrada
        </h1>
        <p className="text-navy/70 mb-6">
          La página que buscas se mudó, fue demolida o nunca existió.
          Volvamos a la obra.
        </p>
        <Link href="/" className="btn-brutal">
          <ArrowLeft className="w-4 h-4" /> Volver al inicio
        </Link>
      </div>
    </div>
  );
}
