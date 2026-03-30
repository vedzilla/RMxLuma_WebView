'use client';

import { useRouter } from 'next/navigation';

export default function SocietySignOutButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push('/society')}
      className="text-sm text-[var(--muted)] hover:text-[#DC2626] transition-colors"
    >
      Sign out
    </button>
  );
}
