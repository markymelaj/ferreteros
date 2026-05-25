'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase-browser';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.replace('/admin');
    });
  }, [router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });

    if (error) {
      // Mensajes en español para los casos comunes
      const msg = error.message.toLowerCase();
      if (msg.includes('invalid login credentials')) {
        setError('Correo o contraseña incorrectos.');
      } else if (msg.includes('email not confirmed')) {
        setError('El correo aún no está confirmado. Confírmalo desde Supabase o usa "Auto Confirm User" al crearlo.');
      } else {
        setError(error.message);
      }
      setSubmitting(false);
      return;
    }

    // Login OK → forzamos navegación dura para que el middleware revalide
    window.location.href = '/admin';
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="bg-white border-2 border-navy p-8 max-w-sm w-full shadow-brutal">
        <h1 className="font-display uppercase text-2xl text-navy mb-1">
          Admin
        </h1>
        <p className="text-sm text-navy/70 mb-6">
          Acceso restringido. Ingresa tus credenciales.
        </p>

        <form onSubmit={handleLogin} className="space-y-3">
          <div>
            <label className="label">Correo</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-navy/50 pointer-events-none" />
              <input
                type="email"
                required
                autoComplete="email"
                className="input pl-9"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.cl"
              />
            </div>
          </div>

          <div>
            <label className="label">Contraseña</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-navy/50 pointer-events-none" />
              <input
                type="password"
                required
                minLength={6}
                autoComplete="current-password"
                className="input pl-9"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn-brutal w-full">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            {submitting ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>

        {error && (
          <p className="mt-4 text-sm text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
}
