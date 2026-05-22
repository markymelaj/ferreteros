'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase-browser';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.replace('/admin');
    });
  }, [router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError(null);
    setMessage(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/admin`
      }
    });

    if (error) setError(error.message);
    else setMessage('Te enviamos un enlace mágico a tu correo. Revisa tu inbox.');
    setSending(false);
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="bg-white border-2 border-navy p-8 max-w-sm w-full shadow-brutal">
        <h1 className="font-display uppercase text-2xl text-navy mb-1">
          Admin
        </h1>
        <p className="text-sm text-navy/70 mb-6">
          Acceso restringido. Ingresa tu correo autorizado.
        </p>

        <form onSubmit={handleLogin} className="space-y-3">
          <div>
            <label className="label">Correo</label>
            <input
              type="email"
              required
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.cl"
            />
          </div>

          <button type="submit" disabled={sending} className="btn-brutal w-full">
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
            Enviar link de acceso
          </button>
        </form>

        {message && (
          <p className="mt-4 text-sm text-whatsapp font-semibold">{message}</p>
        )}
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
