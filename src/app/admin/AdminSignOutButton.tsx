'use client';

import { useRouter } from 'next/navigation';

export default function AdminSignOutButton() {
  const router = useRouter();

  const handleSignOut = () => {
    sessionStorage.removeItem('admin_authenticated');
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
