import { SupabaseClient } from '@supabase/supabase-js';
import { getClient } from './client';
import { transformSociety } from './transform';
import type {
  Society,
  SocietyWithUniversity,
  SocietyAccountWithStatus,
  SocietyAccountWithSociety,
} from './types';

const SOCIETY_SELECT = `
  *, universities(id, name, short_name, created_at)
`.trim();

/**
 * Fetch all societies with their associated university.
 */
export async function getSocieties(): Promise<Society[]> {
  const { data, error } = await getClient()
    .from('societies')
    .select(SOCIETY_SELECT)
    .order('name', { ascending: true });

  if (error) {
    console.error('[supabase_lib] getSocieties error:', error.message);
    return [];
  }

  return (data as unknown as SocietyWithUniversity[]).map(transformSociety);
}

/**
 * Fetch a single society by its Instagram handle.
 */
export async function getSocietyByHandle(handle: string): Promise<Society | null> {
  const { data, error } = await getClient()
    .from('societies')
    .select(SOCIETY_SELECT)
    .eq('instagram_handle', handle)
    .single();

  if (error || !data) {
    if (error?.code !== 'PGRST116') {
      console.error('[supabase_lib] getSocietyByHandle error:', error?.message);
    }
    return null;
  }

  return transformSociety(data as unknown as SocietyWithUniversity);
}

/**
 * Fetch all societies belonging to a given university (by university id).
 */
export async function getSocietiesByUniversity(universityId: string): Promise<Society[]> {
  const { data, error } = await getClient()
    .from('societies')
    .select(SOCIETY_SELECT)
    .eq('university_id', universityId)
    .order('name', { ascending: true });

  if (error) {
    console.error('[supabase_lib] getSocietiesByUniversity error:', error.message);
    return [];
  }

  return (data as unknown as SocietyWithUniversity[]).map(transformSociety);
}

/**
 * Fetch all society_accounts for an authenticated user, joined with the society
 * and approval status. Used by the society picker page.
 */
export async function getSocietyAccountsForUser(
  supabase: SupabaseClient,
  userId: string
): Promise<SocietyAccountWithSociety[]> {
  const { data, error } = await supabase
    .from('society_accounts')
    .select(`
      *,
      society_account_approval_status(name),
      societies(*, universities(id, name))
    `)
    .eq('auth_user_id', userId);

  if (error) {
    console.error('[supabase_lib] getSocietyAccountsForUser error:', error.message);
    return [];
  }

  return (data ?? []) as unknown as SocietyAccountWithSociety[];
}

/**
 * Fetch a single society_account for a user + society pair.
 * Used for auth checks on the society dashboard.
 */
export async function getSocietyAccount(
  supabase: SupabaseClient,
  userId: string,
  societyId: string
): Promise<SocietyAccountWithStatus | null> {
  const { data, error } = await supabase
    .from('society_accounts')
    .select('*, society_account_approval_status(name)')
    .eq('auth_user_id', userId)
    .eq('society_id', societyId)
    .single();

  if (error || !data) {
    if (error?.code !== 'PGRST116') {
      console.error('[supabase_lib] getSocietyAccount error:', error?.message);
    }
    return null;
  }

  return data as unknown as SocietyAccountWithStatus;
}
