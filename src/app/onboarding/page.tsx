import { redirect } from 'next/navigation';
import { createAuthServerClient } from '@/supabase_lib/auth/server';
import { checkUserProfileExists } from '@/supabase_lib/users';
import { getUniversities } from '@/supabase_lib/universities';
import { getStudyLevels } from '@/supabase_lib/studyLevels';
import { getInterests } from '@/supabase_lib/interests';
import OnboardingWizard from './OnboardingWizard';

export default async function OnboardingPage() {
  const supabase = await createAuthServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth');
  if (await checkUserProfileExists(supabase, user.id)) redirect('/discover');

  const [universities, studyLevels, interests] = await Promise.all([
    getUniversities(),
    getStudyLevels(),
    getInterests(),
  ]);

  // Extract info from OAuth metadata (Google/Apple provide these)
  const fullName = user.user_metadata?.full_name ?? user.user_metadata?.name ?? '';
  const defaultAvatarUrl = user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? '';

  return (
    <OnboardingWizard
      userId={user.id}
      fullName={fullName}
      defaultAvatarUrl={defaultAvatarUrl}
      universities={universities}
      studyLevels={studyLevels}
      interests={interests}
    />
  );
}
