'use client';

import { useRouter } from 'next/navigation';
import { createAuthBrowserClient } from '@/supabase_lib/auth/browser';

export default function AdminSignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createAuthBrowserClient();
    await supabase.auth.signOut();
    router.push('/auth');
  };

  return (
    <button
      onClick={handleSignOut}
      className="text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors"
    >
      Sign out
    </button>
  );
}
