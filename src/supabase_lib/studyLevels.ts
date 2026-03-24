import { getClient } from './client';
import { transformStudyLevel } from './transform';
import type { StudyLevel, StudyLevelRow } from './types';

/**
 * Fetch all study levels, ordered alphabetically.
 */
export async function getStudyLevels(): Promise<StudyLevel[]> {
  const { data, error } = await getClient()
    .from('study_levels')
    .select('id, name')
    .order('name', { ascending: true });

  if (error) {
    console.error('[supabase_lib] getStudyLevels error:', error.message);
    return [];
  }

  return (data as StudyLevelRow[]).map(transformStudyLevel);
}
