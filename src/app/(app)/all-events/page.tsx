import { Suspense } from 'react';
import { getEvents, getEventTags } from '@/supabase_lib';
import AllEventsPageClient from './AllEventsPageClient';

export const dynamic = 'force-dynamic';

async function AllEventsPage() {
  const [events, tags] = await Promise.all([
    getEvents(),
    getEventTags(),
  ]);

  return (
    <Suspense fallback={<div className="max-w-[1120px] mx-auto px-5 py-8">Loading...</div>}>
      <AllEventsPageClient events={events} tags={tags} />
    </Suspense>
  );
}

export default AllEventsPage;
