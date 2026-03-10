import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createAuthServerClient } from '@/supabase_lib/auth/server';
import { getSocietyAccountsForUser } from '@/supabase_lib/societies';
import SocietySignOutButton from './[societyId]/dashboard/SocietySignOutButton';

export default async function SocietyPickerPage() {
  const supabase = await createAuthServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  const accounts = await getSocietyAccountsForUser(supabase, user.id);

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
          <p className="text-[var(--muted)]">
            You don&apos;t have access to any societies yet.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {accounts.map((account) => {
              const society = account.societies;
              if (!society) return null;
              const status = account.society_account_approval_status.name;
              const isApproved = status === 'approved' || status === 'trusted';

              return (
                <Link
                  key={account.id}
                  href={isApproved ? `/society/${society.id}/dashboard` : '#'}
                  aria-disabled={!isApproved}
                  className={`flex items-center gap-4 p-4 bg-[var(--surface)] rounded-[var(--radius)] border border-[var(--border)] transition-all ${
                    isApproved
                      ? 'hover:border-[var(--accent)] hover:shadow-md'
                      : 'opacity-60 cursor-not-allowed'
                  }`}
                >
                  <Image
                    src={society.image_url || '/logos/rm-dot-logo.png'}
                    alt={society.name}
                    width={48}
                    height={48}
                    className="rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-[var(--text)]">{society.name}</p>
                    <p className="text-sm text-[var(--muted)]">
                      {society.universities?.name ?? 'Unknown university'}
                    </p>
                    {!isApproved && (
                      <p className="text-xs text-[var(--muted)] mt-0.5 capitalize">
                        {status}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
