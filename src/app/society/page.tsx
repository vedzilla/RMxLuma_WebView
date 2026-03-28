import Image from 'next/image';
import { redirect } from 'next/navigation';
import { createAuthServerClient } from '@/supabase_lib/auth/server';
import { getSocietyAccountsForUser } from '@/supabase_lib/societies';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { GlobalSpotlight } from '@/components/ui/spotlight';
import { SocietyPickerCards } from './SocietyPickerCards';
import SocietySignOutButton from './[societyId]/dashboard/SocietySignOutButton';

export default async function SocietyPickerPage() {
  const supabase = await createAuthServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  const accounts = await getSocietyAccountsForUser(supabase, user.id);

  const approvedAccounts = accounts
    .filter((a) => {
      const status = a.society_account_approval_status.name;
      return status === 'approved' || status === 'trusted';
    })
    .sort((a, b) => (a.societies?.name ?? '').localeCompare(b.societies?.name ?? ''));

  const pendingAccounts = accounts
    .filter((a) => {
      const status = a.society_account_approval_status.name;
      return status !== 'approved' && status !== 'trusted';
    })
    .sort((a, b) => (a.societies?.name ?? '').localeCompare(b.societies?.name ?? ''));

  return (
    <AuroraBackground className="min-h-screen">
      <GlobalSpotlight size={400} color="rgba(220, 38, 38, 0.06)" />
      <div className="relative z-10">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-[var(--surface)]/80 backdrop-blur-md border-b border-[var(--border)] px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logos/rm-dot-logo.png"
              alt="RedefineMe"
              width={120}
              height={30}
            />
            <span className="text-xs font-medium text-[#DC2626] bg-[#DC2626]/10 px-2 py-0.5 rounded-full">
              Society
            </span>
          </div>
          <SocietySignOutButton />
        </header>

        {/* Content */}
        <main className="max-w-3xl mx-auto px-6 py-10">
          <h1 className="text-2xl font-semibold text-[var(--text)] mb-1">
            Your Societies
          </h1>
          <p className="text-[var(--muted)] mb-8">
            Select a society to manage.
          </p>

          {accounts.length === 0 ? (
            <p className="text-[var(--muted)] bg-[#DC2626]/5 border border-[#DC2626]/20 rounded-[var(--radius)] px-5 py-4">
              You don&apos;t have access to any societies yet.
            </p>
          ) : (
            <SocietyPickerCards
              approvedAccounts={approvedAccounts}
              pendingAccounts={pendingAccounts}
            />
          )}
        </main>
      </div>
    </AuroraBackground>
  );
}
