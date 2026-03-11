'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Event } from '@/data/events';
import { Society } from '@/supabase_lib/types';
import { filterEvents, sortEvents, SortOption } from '@/utils/eventUtils';
import SearchBar from '@/components/SearchBar';
import FilterPills from '@/components/FilterPills';
import SortDropdown from '@/components/SortDropdown';
import EventCard from '@/components/EventCard';
import SocietyCard from '@/components/SocietyCard';
import EventModal from '@/components/EventModal';

interface DiscoverPageClientProps {
  events: Event[];
  tags: string[];
  societies: (Society & { eventCount: number; initials: string })[];
}

export default function DiscoverPageClient({
  events,
  tags,
  societies,
}: DiscoverPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | undefined>();
  const [sortBy, setSortBy] = useState<SortOption>('soonest');

  // Start with the server order so SSR and client hydration match.
  // After hydration, shuffle once client-side — stable for the session, resets on hard refresh.
  const [shuffledEvents, setShuffledEvents] = useState<Event[]>(events);
  useEffect(() => {
    const arr = [...events];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setShuffledEvents(arr);
  }, []);

  const selectedEventSlug = searchParams.get('event');
  const selectedEvent = selectedEventSlug
    ? shuffledEvents.find(e => e.slug === selectedEventSlug)
    : null;

  const openEvent = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('event', slug);
    router.push(`/discover?${params.toString()}`, { scroll: false });
  };

  const closeEvent = () => {
    router.push('/discover', { scroll: false });
  };

  const filteredEvents = useMemo(() => {
    let filtered = filterEvents(shuffledEvents, searchQuery, selectedTag);
    filtered = sortEvents(filtered, sortBy);
    return filtered;
  }, [shuffledEvents, searchQuery, selectedTag, sortBy]);

  return (
    <>
      <div className="max-w-[1120px] mx-auto px-[18px]">
        {/* Hero */}
        <div className="pt-[22px] pb-2">
          <h1 className="m-0 text-[36px] font-semibold text-text tracking-[-0.03em] leading-[1.1]">
            Discover events in Manchester
          </h1>
          <div className="mt-2 text-subtle text-[15px] font-normal leading-[1.5] tracking-[-0.01em]">
            Society events + curated city events. Register externally — we personalise what you see.
          </div>

          <div className="flex flex-wrap gap-3 mt-4 items-center">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
            <div className="hidden md:block">
              <SortDropdown value={sortBy} onChange={setSortBy} />
            </div>
          </div>

          <div className="mt-3">
            <FilterPills tags={tags} selectedTag={selectedTag} onTagSelect={setSelectedTag} />
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="mt-[26px]">
          <div className="flex items-baseline justify-between gap-[10px]">
            <h2 className="m-0 text-[18px] font-semibold text-text tracking-[-0.02em] leading-[1.2]">
              Upcoming events
            </h2>
            <Link href="/all-events" className="text-text no-underline font-medium text-sm hover:underline hover:text-subtle transition-colors">
              See all
            </Link>
          </div>
          {filteredEvents.length > 0 ? (
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[14px]">
              {filteredEvents.slice(0, 6).map(event => (
                <EventCard key={event.id} event={event} onClick={() => openEvent(event.slug)} />
              ))}
            </div>
          ) : (
            <p className="mt-3 text-subtle text-sm">No events match your search.</p>
          )}
        </div>

        {/* Featured Societies */}
        {!searchQuery && !selectedTag && societies.length > 0 && (
          <div className="mt-[26px]">
            <div className="flex items-baseline justify-between gap-[10px]">
              <h2 className="m-0 text-[18px] font-semibold text-text tracking-[-0.02em] leading-[1.2]">
                Featured societies
              </h2>
            </div>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-[14px]">
              {societies.map(society => (
                <SocietyCard
                  key={society.id}
                  name={society.name}
                  category={society.university}
                  eventCount={society.eventCount}
                  initials={society.initials}
                  imageUrl={society.imageUrl}
                  instagramHandle={society.instagram}
                />
              ))}
            </div>
          </div>
        )}

        {selectedEvent && (
          <EventModal event={selectedEvent} onClose={closeEvent} />
        )}
      </div>
    </>
  );
}
