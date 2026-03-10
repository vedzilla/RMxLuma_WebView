import { SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ajwfegvmvmcddapigswd.supabase.co';

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
