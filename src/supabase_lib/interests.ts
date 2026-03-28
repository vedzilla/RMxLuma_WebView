import { getClient } from './client';
import { transformInterest } from './transform';
import type { Interest, InterestRow } from './types';

/**
 * Fetch all interests, ordered alphabetically.
 */
export async function getInterests(): Promise<Interest[]> {
  const { data, error } = await getClient()
    .from('interests')
    .select('id, name')
    .order('name', { ascending: true });

  if (error) {
    console.error('[supabase_lib] getInterests error:', error.message);
    return [];
  }

  return (data as InterestRow[]).map(transformInterest);
}
