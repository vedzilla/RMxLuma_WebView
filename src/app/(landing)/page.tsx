import { getSocieties, getUniversities, getUserCount } from '@/supabase_lib';
import LandingPageClient from './LandingPageClient';

export default async function LandingPage() {
  const [societies, universities, userCount] = await Promise.all([
    getSocieties(),
    getUniversities(),
    getUserCount(),
  ]);

  return (
    <LandingPageClient
      societyCount={societies.length}
      universityCount={universities.length}
      studentCount={userCount}
    />
  );
}
