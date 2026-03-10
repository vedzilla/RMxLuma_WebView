'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { createAuthBrowserClient } from '@/supabase_lib/auth/browser';

export default function AuthForm() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<'google' | 'apple' | null>(null);
  const [error, setError] = useState('');

  const unauthorizedError = searchParams.get('error') === 'unauthorized';

  const handleOAuthLogin = async (provider: 'google' | 'apple') => {
    setError('');
    setLoading(provider);

    try {
      const supabase = createAuthBrowserClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
        setLoading(null);
      }
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(null);
    }
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

          {error && (
            <p className="text-sm text-[var(--red)] text-center mb-4">{error}</p>
          )}

          <div className="space-y-3">
            {/* Google */}
            <button
              onClick={() => handleOAuthLogin('google')}
              disabled={loading !== null}
              className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--bg)] text-sm font-medium text-[var(--text)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.26c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
              </svg>
              {loading === 'google' ? 'Signing in…' : 'Continue with Google'}
            </button>

            {/* Apple */}
            <button
              onClick={() => handleOAuthLogin('apple')}
              disabled={loading !== null}
              className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <svg width="18" height="18" viewBox="0 0 18 22" fill="currentColor">
                <path d="M14.94 11.58c-.02-2.2 1.8-3.26 1.88-3.31-1.02-1.5-2.62-1.7-3.19-1.73-1.36-.14-2.65.8-3.34.8-.69 0-1.76-.78-2.89-.76-1.49.02-2.86.87-3.63 2.2-1.54 2.68-.4 6.65 1.11 8.82.74 1.06 1.61 2.26 2.76 2.22 1.11-.04 1.53-.72 2.87-.72 1.34 0 1.72.72 2.89.7 1.19-.02 1.94-1.08 2.67-2.15.84-1.23 1.19-2.42 1.21-2.48-.03-.01-2.32-.89-2.34-3.53ZM12.74 4.56c.61-.74 1.02-1.77.91-2.8-.88.04-1.95.59-2.58 1.33-.56.65-1.06 1.69-.92 2.69.98.07 1.98-.5 2.59-1.22Z"/>
              </svg>
              {loading === 'apple' ? 'Signing in…' : 'Continue with Apple'}
            </button>
          </div>
        </div>

        <p className="text-xs text-[var(--muted)] text-center mt-6">
          &copy; {new Date().getFullYear()} RedefineMe
        </p>
      </div>
    </div>
  );
}
