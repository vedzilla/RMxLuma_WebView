import { getClient } from './client';
import { transformUniversityCourse } from './transform';
import type { UniversityCourse } from './types';

export async function getUniversityCourses(universityId: string): Promise<UniversityCourse[]> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('university_courses')
    .select('*, degree_types(id, name)')
    .eq('university_id', universityId)
    .order('name', { ascending: true });

  if (error) {
    console.error('[supabase_lib] getUniversityCourses error:', error.message);
    return [];
  }

  return (data ?? []).map(transformUniversityCourse);
}
