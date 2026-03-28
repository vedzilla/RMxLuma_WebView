import { createAuthServerClient } from '@/supabase_lib/auth/server';
import { isAdmin } from '@/supabase_lib/users';
import { getPushTokens, getAllUserDetails } from '@/supabase_lib/notifications';
import { redirect } from 'next/navigation';
import NotificationsPageClient from './NotificationsPageClient';

export default async function NotificationsPage() {
  const supabase = await createAuthServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !(await isAdmin(supabase, user.id))) {
    redirect('/auth?error=unauthorized');
  }

  // Fetch push tokens and all user details in parallel
  const [pushTokens, userDetailsMap] = await Promise.all([
    getPushTokens(supabase),
    getAllUserDetails(supabase),
  ]);

  // Transform to the shape the client component expects
  const tokens = pushTokens.map((t) => {
    const details = userDetailsMap.get(t.user_id);
    return {
      userId: t.user_id,
      deviceId: t.device_id,
      pushToken: t.push_token,
      platform: t.platform,
      deviceName: t.device_name,
      osVersion: t.os_version,
      userName: details?.name ?? null,
      userEmail: details?.email ?? null,
      registeredAt: t.updated_at,
    };
  });

  return <NotificationsPageClient tokens={tokens} />;
}
