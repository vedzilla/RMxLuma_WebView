'use client';

import { useRouter } from 'next/navigation';
import { createAuthBrowserClient } from '@/supabase_lib/auth/browser';

export default function SocietySignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createAuthBrowserClient();
    await supabase.auth.signOut();
    router.push('/auth');
  };

  return (
    <button
      onClick={handleSignOut}
      className="text-sm text-[var(--muted)] hover:text-[#DC2626] transition-colors"
    >
      Sign out
    </button>
  );
}
