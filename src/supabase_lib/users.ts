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
