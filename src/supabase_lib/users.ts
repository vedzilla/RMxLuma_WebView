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
 * Fetch the role for a given user from the `users` table.
 * Requires an authenticated Supabase client (server-side with session cookies).
 * Returns the role string, or null if the user has no row or the query fails.
 */
export async function getUserRole(
  supabase: SupabaseClient,
  userId: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('[supabase_lib] getUserRole error:', error.message);
    return null;
  }

  return data?.role ?? null;
}

/**
 * Check whether a given user has the "admin" role.
 */
export async function isAdmin(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const role = await getUserRole(supabase, userId);
  return role === 'admin';
}
