import { SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export interface PushTokenRow {
  user_id: string;
  device_id: string;
  push_token: string;
  platform: string | null;
  device_name: string | null;
  os_version: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserDetails {
  user_id: string;
  email: string | null;
  name: string | null;
}

/**
 * Fetch all registered push tokens.
 */
export async function getPushTokens(
  supabase: SupabaseClient
): Promise<PushTokenRow[]> {
  const { data, error } = await supabase
    .from('push_tokens')
    .select('user_id, device_id, push_token, platform, device_name, os_version, created_at, updated_at')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('[supabase_lib] getPushTokens error:', error.message);
    return [];
  }

  return data ?? [];
}

/**
 * Fetch all user details (email, name) via the get-user-details admin edge function.
 * Returns a Map keyed by user_id for easy lookup.
 */
export async function getAllUserDetails(
  supabase: SupabaseClient
): Promise<Map<string, UserDetails>> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('[supabase_lib] getAllUserDetails: no authenticated user');
      return new Map();
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('[supabase_lib] getAllUserDetails: no active session');
      return new Map();
    }

    const res = await fetch(
      `${SUPABASE_URL}/functions/v1/get-user-details`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': SUPABASE_ANON_KEY,
        },
      }
    );

    if (!res.ok) {
      const errorBody = await res.text();
      console.error('[supabase_lib] getAllUserDetails error: HTTP', res.status, errorBody);
      return new Map();
    }

    const data = await res.json();
    console.log('[supabase_lib] getAllUserDetails: got', data.users?.length ?? 0, 'users');
    const users: UserDetails[] = data.users ?? [];

    return new Map(users.map((u) => [u.user_id, u]));
  } catch (err) {
    console.error('[supabase_lib] getAllUserDetails error:', err);
    return new Map();
  }
}
