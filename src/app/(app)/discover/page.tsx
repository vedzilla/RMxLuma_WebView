import { Suspense } from 'react';
import { getEvents, getEventTags, getSocieties } from '@/supabase_lib';
import DiscoverPageClient from './DiscoverPageClient';

export const dynamic = 'force-dynamic';

function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

async function DiscoverPage() {
  const [rawEvents, tags, societies] = await Promise.all([
    getEvents(),
    getEventTags(),
    getSocieties(),
  ]);
  const events = shuffleArray(rawEvents);

  // Compute event count per society from the fetched events
  const societyEventCounts = new Map<string, number>();
  events.forEach(event => {
    const count = societyEventCounts.get(event.societyName) ?? 0;
    societyEventCounts.set(event.societyName, count + 1);
  });

  // Build society list: only those with events, sorted by event count, top 6
  const featuredSocieties = societies
    .map(s => ({
      ...s,
      eventCount: societyEventCounts.get(s.name) ?? 0,
      initials: s.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(),
    }))
    .filter(s => s.eventCount > 0)
    .sort((a, b) => b.eventCount - a.eventCount)
    .slice(0, 6);

  // Compute event count per category tag
  const categoryEventCounts: Record<string, number> = {};
  tags.forEach(tag => {
    categoryEventCounts[tag] = events.filter(e => e.tags.includes(tag)).length;
  });

  return (
    <Suspense fallback={<div className="max-w-[1120px] mx-auto px-[18px] py-8">Loading...</div>}>
      <DiscoverPageClient
        events={events}
        tags={tags}
        societies={featuredSocieties}
        categoryEventCounts={categoryEventCounts}
      />
    </Suspense>
  );
}

export default DiscoverPage;
