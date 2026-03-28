import type { SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

/**
 * Submit onboarding data via the onboarding edge function.
 * Creates a row in public.users with university_id and study_level_id.
 */
export async function submitOnboarding(
  supabase: SupabaseClient,
  data: { university_id: string; study_level_id: string; university_course_id: string }
): Promise<{ success: boolean; alreadyOnboarded: boolean }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    console.error('[supabase_lib] submitOnboarding: no active session');
    return { success: false, alreadyOnboarded: false };
  }

  const res = await fetch(`${SUPABASE_URL}/functions/v1/onboarding`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(data),
  });

  if (res.status === 409) {
    return { success: true, alreadyOnboarded: true };
  }

  if (!res.ok) {
    console.error('[supabase_lib] submitOnboarding error: HTTP', res.status);
    return { success: false, alreadyOnboarded: false };
  }

  return { success: true, alreadyOnboarded: false };
}

/**
 * Upload a profile picture via the upload-profile-picture edge function.
 */
export async function uploadProfilePicture(
  supabase: SupabaseClient,
  file: File
): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    console.error('[supabase_lib] uploadProfilePicture: no active session');
    return null;
  }

  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${SUPABASE_URL}/functions/v1/upload-profile-picture`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    console.error('[supabase_lib] uploadProfilePicture error: HTTP', res.status);
    return null;
  }

  const result = await res.json();
  return result.profile_url ?? null;
}

/**
 * Replace all user interests with a new set.
 * Deletes existing interests then inserts the new ones.
 */
export async function saveUserInterests(
  supabase: SupabaseClient,
  userId: string,
  interestIds: string[]
): Promise<boolean> {
  // Delete existing interests
  const { error: deleteError } = await supabase
    .from('user_interests')
    .delete()
    .eq('user_id', userId);

  if (deleteError) {
    console.error('[supabase_lib] saveUserInterests delete error:', deleteError.message);
    return false;
  }

  if (interestIds.length === 0) return true;

  // Insert new interests
  const rows = interestIds.map(interest_id => ({ user_id: userId, interest_id }));
  const { error: insertError } = await supabase
    .from('user_interests')
    .insert(rows);

  if (insertError) {
    console.error('[supabase_lib] saveUserInterests insert error:', insertError.message);
    return false;
  }

  return true;
}
