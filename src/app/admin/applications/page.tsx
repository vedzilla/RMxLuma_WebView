import { createAuthServerClient } from '@/supabase_lib/auth/server';
import { isAdmin } from '@/supabase_lib/users';
import { getPendingSocietyAccounts, getApprovalStatuses } from '@/supabase_lib/societies';
import { redirect } from 'next/navigation';
import ApplicationsPageClient from './ApplicationsPageClient';

export default async function ApplicationsPage() {
  const supabase = await createAuthServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !(await isAdmin(supabase, user.id))) {
    redirect('/auth?error=unauthorized');
  }

  const [pendingAccounts, approvalStatuses] = await Promise.all([
    getPendingSocietyAccounts(supabase),
    getApprovalStatuses(supabase),
  ]);

  // Transform to the shape the client component expects
  const applications = pendingAccounts.map((acc) => ({
    id: acc.id,
    authUserId: acc.auth_user_id,
    societyId: acc.society_id,
    societyName: acc.societies?.name ?? 'Unknown Society',
    appliedAt: acc.created_at,
  }));

  const statuses = approvalStatuses.map((s) => ({
    id: s.id,
    name: s.name,
  }));

  return (
    <ApplicationsPageClient
      initialApplications={applications}
      approvalStatuses={statuses}
    />
  );
}
