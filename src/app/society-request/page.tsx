import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { createAuthServerClient } from '@/supabase_lib/auth/server';
import { getSocietiesByUniversity, getSocietyAccountsForUser } from '@/supabase_lib/societies';
import SocietySignOutButton from '@/app/society/[societyId]/dashboard/SocietySignOutButton';
import SocietyRequestClient from './SocietyRequestClient';

export default async function SocietyRequestPage() {
  const supabase = await createAuthServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  // Fetch the user's university_id from the users table
  const { data: userData } = await supabase
    .from('users')
    .select('university_id')
    .eq('id', user.id)
    .single();

  const universityId = userData?.university_id;

  if (!universityId) {
    return (
      <div className="min-h-screen bg-[var(--bg)]">
        <Header />
        <main className="max-w-3xl mx-auto px-6 py-10 text-center">
          <h1 className="text-2xl font-semibold text-[var(--text)] mb-4">
            University Not Linked
          </h1>
          <p className="text-[var(--muted)] mb-6">
            Your account isn&apos;t linked to a university yet. Please complete your profile or contact support.
          </p>
          <Link
            href="/support"
            className="inline-block text-sm font-medium text-[#C04138] hover:underline"
          >
            Contact Support &rarr;
          </Link>
        </main>
      </div>
    );
  }

  // Fetch societies for the user's university and their existing accounts
  const [allSocieties, existingAccounts] = await Promise.all([
    getSocietiesByUniversity(universityId),
    getSocietyAccountsForUser(supabase, user.id),
  ]);

  // Filter out societies the user already has approved/trusted access to
  const approvedSocietyIds = new Set(
    existingAccounts
      .filter((a) => {
        const status = a.society_account_approval_status.name;
        return status === 'approved' || status === 'trusted';
      })
      .map((a) => a.society_id),
  );

  const filteredSocieties = allSocieties.filter((s) => !approvedSocietyIds.has(s.id));

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-10">
        <SocietyRequestClient
          allSocieties={filteredSocieties}
          existingAccounts={existingAccounts.filter(
            (a) => !approvedSocietyIds.has(a.society_id),
          )}
          userId={user.id}
        />
      </main>
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-30 bg-[var(--surface)] border-b border-[var(--border)] px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Link
          href="/society"
          className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors"
          title="Back to your societies"
        >
          <ArrowLeft size={20} />
        </Link>
        <Image
          src="/logos/rm-dot-logo.png"
          alt="RedefineMe"
          width={120}
          height={30}
        />
        <span className="text-xs font-medium text-[var(--accent)] bg-[var(--accentSoft)] px-2 py-0.5 rounded-full">
          Society
        </span>
      </div>
      <SocietySignOutButton />
    </header>
  );
}
