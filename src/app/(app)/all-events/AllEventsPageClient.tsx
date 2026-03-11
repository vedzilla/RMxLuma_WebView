'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Event } from '@/data/events';
import { filterEvents, sortEvents, SortOption } from '@/utils/eventUtils';
import SearchBar from '@/components/SearchBar';
import FilterPills from '@/components/FilterPills';
import SortDropdown from '@/components/SortDropdown';
import EventCard from '@/components/EventCard';
import EventModal from '@/components/EventModal';

interface AllEventsPageClientProps {
  events: Event[];
  tags: string[];
}

export default function AllEventsPageClient({ events, tags }: AllEventsPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | undefined>();
  const [sortBy, setSortBy] = useState<SortOption>('soonest');
  const [visibleCount, setVisibleCount] = useState(21);

  const selectedEventSlug = searchParams.get('event');
  const selectedEvent = selectedEventSlug ? events.find(e => e.slug === selectedEventSlug) : null;

  const openEvent = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('event', slug);
    router.push(`/all-events?${params.toString()}`, { scroll: false });
  };

  const closeEvent = () => {
    router.push('/all-events', { scroll: false });
  };

  const filteredEvents = useMemo(() => {
    let filtered = filterEvents(events, searchQuery, selectedTag);
    filtered = sortEvents(filtered, sortBy);
    return filtered;
  }, [events, searchQuery, selectedTag, sortBy]);

  useEffect(() => {
    setVisibleCount(21);
  }, [searchQuery, selectedTag, sortBy]);

  const visibleEvents = useMemo(() => filteredEvents.slice(0, visibleCount), [filteredEvents, visibleCount]);
  const hasMore = visibleCount < filteredEvents.length;

  return (
    <div className="max-w-[1120px] mx-auto px-[18px]">
      {/* Hero */}
      <div className="pt-[22px] pb-2">
        <h1 className="m-0 text-[36px] font-semibold text-text tracking-[-0.03em] leading-[1.1]">
          All events
        </h1>
        <p className="mt-2 text-subtle text-[15px] font-normal leading-[1.5] tracking-[-0.01em]">
          Every upcoming society event, sorted by date.
        </p>
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

      {/* Grid section */}
      <div className="mt-[26px]">
        <div className="flex items-baseline justify-between gap-[10px]">
          <h2 className="m-0 text-[18px] font-semibold text-text tracking-[-0.02em] leading-[1.2]">
            {filteredEvents.length} upcoming events
          </h2>
        </div>

        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[14px]">
          {visibleEvents.map(event => (
            <EventCard key={event.id} event={event} onClick={() => openEvent(event.slug)} />
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <p className="text-subtle text-[15px] mt-6">No events match your search.</p>
        )}

        {hasMore && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setVisibleCount(c => c + 21)}
              className="px-6 py-2.5 text-sm font-medium text-text bg-surface border border-border
                         rounded-[14px] shadow-[var(--shadowSoft)] hover:shadow-[var(--shadow)]
                         hover:-translate-y-0.5 transition-all duration-[0.12s]"
            >
              Load more ({filteredEvents.length - visibleCount} remaining)
            </button>
          </div>
        )}
      </div>

      {selectedEvent && <EventModal event={selectedEvent} onClose={closeEvent} />}
    </div>
  );
}
