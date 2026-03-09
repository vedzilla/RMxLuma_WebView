'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

export default function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const unauthorizedError = searchParams.get('error') === 'unauthorized';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);

    // Accepts any credentials — replace with real Supabase auth later
    await new Promise((r) => setTimeout(r, 400));
    sessionStorage.setItem('admin_authenticated', 'true');

    router.push('/admin');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/logos/rm-dot-logo.png"
            alt="RedefineMe"
            width={160}
            height={40}
            priority
          />
        </div>

        {/* Card */}
        <div className="bg-[var(--surface)] rounded-[var(--radius)] shadow-[var(--shadow)] p-8">
          <h1 className="text-xl font-semibold text-[var(--text)] text-center mb-1">
            Admin Login
          </h1>
          <p className="text-sm text-[var(--muted)] text-center mb-6">
            Sign in to the admin dashboard
          </p>

          {unauthorizedError && (
            <p className="text-sm text-[var(--red)] text-center mb-4">
              You do not have admin access.
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[var(--text)] mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@redefineme.co.uk"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm placeholder:text-[var(--muted)] outline-none transition-shadow focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[var(--text)] mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm placeholder:text-[var(--muted)] outline-none transition-shadow focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
              />
            </div>

            {error && (
              <p className="text-sm text-[var(--red)] text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accentHover)] text-white text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-xs text-[var(--muted)] text-center mt-6">
          &copy; {new Date().getFullYear()} RedefineMe
        </p>
      </div>
    </div>
  );
}
