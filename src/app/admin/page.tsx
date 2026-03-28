import Image from 'next/image';
import Link from 'next/link';
import { createAuthServerClient } from '@/supabase_lib/auth/server';
import { getEvents } from '@/supabase_lib/events';
import { getSocieties, getPendingSocietyAccounts } from '@/supabase_lib/societies';
import { getUniversities } from '@/supabase_lib/universities';
import { getPushTokens } from '@/supabase_lib/notifications';
import AdminSignOutButton from './AdminSignOutButton';

export default async function AdminDashboard() {
  const supabase = await createAuthServerClient();

  const [events, societies, universities, pendingAccounts, pushTokens] = await Promise.all([
    getEvents({ upcomingOnly: false }),
    getSocieties(),
    getUniversities(),
    getPendingSocietyAccounts(supabase),
    getPushTokens(supabase),
  ]);

  const pendingApplications = pendingAccounts.length;

  const stats = [
    { label: 'Total Events', value: events.length },
    { label: 'Societies', value: societies.length },
    { label: 'Universities', value: universities.length },
    { label: 'Pending Applications', value: pendingApplications, href: '/admin/applications' },
    { label: 'Push Tokens', value: pushTokens.length, href: '/admin/notifications' },
  ];

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
          <span className="text-xs font-medium text-[var(--muted)] bg-[var(--accentSoft)] text-[var(--accent)] px-2 py-0.5 rounded-full">
            Admin
          </span>
        </div>
        <AdminSignOutButton />
      </header>

      {/* Dashboard content */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold text-[var(--text)] mb-2">
          Dashboard
        </h1>
        <p className="text-[var(--muted)] mb-8">
          Welcome to the RedefineMe admin panel.
        </p>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => {
            const content = (
              <>
                <p className="text-sm text-[var(--muted)] mb-1">{stat.label}</p>
                <p className="text-2xl font-semibold text-[var(--text)]">
                  {stat.value}
                </p>
              </>
            );

            return stat.href ? (
              <Link
                key={stat.label}
                href={stat.href}
                className="bg-[var(--surface)] rounded-[var(--radius)] border border-[var(--border)] p-5 hover:border-[var(--accent)] transition-colors"
              >
                {content}
              </Link>
            ) : (
              <div
                key={stat.label}
                className="bg-[var(--surface)] rounded-[var(--radius)] border border-[var(--border)] p-5"
              >
                {content}
              </div>
            );
          })}
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/admin/applications"
            className="bg-[var(--surface)] rounded-[var(--radius)] border border-[var(--border)] p-5 hover:border-[var(--accent)] transition-colors group"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">
                Society Applications
              </p>
              {pendingApplications > 0 && (
                <span className="text-xs font-medium bg-[var(--accent)] text-white px-2 py-0.5 rounded-full">
                  {pendingApplications}
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--muted)] mt-1">
              Review and approve society ownership requests
            </p>
          </Link>

          <Link
            href="/admin/statistics"
            className="bg-[var(--surface)] rounded-[var(--radius)] border border-[var(--border)] p-5 hover:border-[var(--accent)] transition-colors group"
          >
            <p className="text-sm font-medium text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">
              Analytics & Statistics
            </p>
            <p className="text-xs text-[var(--muted)] mt-1">
              View app usage analytics from PostHog
            </p>
          </Link>

          <Link
            href="/admin/notifications"
            className="bg-[var(--surface)] rounded-[var(--radius)] border border-[var(--border)] p-5 hover:border-[var(--accent)] transition-colors group"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">
                Push Notifications
              </p>
              {pushTokens.length > 0 && (
                <span className="text-xs font-medium bg-[var(--accent)] text-white px-2 py-0.5 rounded-full">
                  {pushTokens.length}
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--muted)] mt-1">
              Send push notifications to registered devices
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
}
