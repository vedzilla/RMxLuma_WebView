import { SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

/**
 * Fetch the total number of users (students) via the user-count edge function.
 */
export async function getUserCount(): Promise<number> {
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/user-count`);
    if (!res.ok) {
      console.error('[supabase_lib] getUserCount error: HTTP', res.status);
      return 0;
    }
    const data = await res.json();
    return data.count ?? 0;
  } catch (err) {
    console.error('[supabase_lib] getUserCount error:', err);
    return 0;
  }
}

/**
 * Fetch all role names for a given user via the users_roles junction table.
 * Returns an array of role name strings (e.g. ['user', 'admin']).
 */
export async function getUserRoles(
  supabase: SupabaseClient,
  userId: string
): Promise<string[]> {
  const { data, error } = await supabase
    .from('users_roles')
    .select('user_roles(name)')
    .eq('user_id', userId);

  if (error) {
    console.error('[supabase_lib] getUserRoles error:', error.message);
    return [];
  }

  return (data ?? [])
    .map((row: { user_roles: { name: string } | { name: string }[] | null }) => {
      const role = row.user_roles;
      if (!role) return undefined;
      if (Array.isArray(role)) return role[0]?.name;
      return role.name;
    })
    .filter((name): name is string => !!name);
}

/**
 * Fetch the primary role for a given user.
 * Returns the first role name, or null if the user has no roles.
 * Kept for backwards compatibility — prefer getUserRoles() for multi-role checks.
 */
export async function getUserRole(
  supabase: SupabaseClient,
  userId: string
): Promise<string | null> {
  const roles = await getUserRoles(supabase, userId);
  return roles[0] ?? null;
}

/**
 * Check whether a given user has the "admin" role.
 */
export async function isAdmin(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const roles = await getUserRoles(supabase, userId);
  return roles.includes('admin');
}

/**
 * Check whether a public.users row exists for this auth user (i.e. they've completed onboarding).
 */
export async function checkUserProfileExists(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('[supabase_lib] checkUserProfileExists error:', error.message);
    return false;
  }

  return !!data;
}

/**
 * Fetch name and email for a user with a pending society account
 * via the get-society-user-details edge function.
 */
export async function getSocietyUserDetails(
  supabase: SupabaseClient,
  userId: string
): Promise<{ email: string | null; name: string | null }> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('[supabase_lib] getSocietyUserDetails: no authenticated user');
      return { email: null, name: null };
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('[supabase_lib] getSocietyUserDetails: no active session');
      return { email: null, name: null };
    }

    const res = await fetch(
      `${SUPABASE_URL}/functions/v1/get-society-user-details`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ user_id: userId }),
      }
    );

    if (!res.ok) {
      console.error('[supabase_lib] getSocietyUserDetails error: HTTP', res.status);
      return { email: null, name: null };
    }

    const data = await res.json();
    return { email: data.email ?? null, name: data.name ?? null };
  } catch (err) {
    console.error('[supabase_lib] getSocietyUserDetails error:', err);
    return { email: null, name: null };
  }
}
