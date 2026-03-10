import Image from 'next/image';
import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { createAuthServerClient } from '@/supabase_lib/auth/server';
import { getSocietyAccount } from '@/supabase_lib/societies';
import SocietySignOutButton from './SocietySignOutButton';

export default async function SocietyDashboard({
  params,
}: {
  params: Promise<{ societyId: string }>;
}) {
  const { societyId } = await params;

  const supabase = await createAuthServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  const account = await getSocietyAccount(supabase, user.id, societyId);

  if (!account) {
    notFound();
  }

  const status = account.society_account_approval_status.name;
  if (status !== 'approved' && status !== 'trusted') {
    redirect('/society');
  }

  // Fetch the society name for display — query the societies table directly
  const { data: society } = await supabase
    .from('societies')
    .select('name')
    .eq('id', societyId)
    .single();

  const societyName = society?.name ?? 'Society';

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-[var(--surface)] border-b border-[var(--border)] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/logos/rm-dot-logo.png"
            alt="RedefineMe"
            width={120}
            height={30}
          />
          <span className="text-xs font-medium text-[var(--accent)] bg-[var(--accentSoft)] px-2 py-0.5 rounded-full">
            {societyName}
          </span>
        </div>
        <SocietySignOutButton />
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        <Link
          href="/society"
          className="inline-flex items-center gap-1 text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors mb-6"
        >
          &larr; All societies
        </Link>

        <h1 className="text-2xl font-semibold text-[var(--text)] mb-2">
          Hello World
        </h1>
        <p className="text-[var(--muted)]">
          You are managing <span className="font-medium text-[var(--text)]">{societyName}</span> as{' '}
          <span className="font-medium text-[var(--text)]">{user.email}</span>.
        </p>
      </main>
    </div>
  );
}
