'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Event } from '@/data/events';
import { Society } from '@/supabase_lib/types';
import { filterEvents, sortEvents, SortOption } from '@/utils/eventUtils';
import SearchBar from '@/components/SearchBar';
import FilterPills from '@/components/FilterPills';
import SortDropdown from '@/components/SortDropdown';
import EventCard from '@/components/EventCard';
import CategoryCard from '@/components/CategoryCard';
import SocietyCard from '@/components/SocietyCard';
import EventModal from '@/components/EventModal';

interface DiscoverPageClientProps {
  events: Event[];
  tags: string[];
  societies: (Society & { eventCount: number; initials: string })[];
  categoryEventCounts: Record<string, number>;
}

export default function DiscoverPageClient({
  events,
  tags,
  societies,
  categoryEventCounts,
}: DiscoverPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | undefined>();
  const [sortBy, setSortBy] = useState<SortOption>('soonest');

  const selectedEventSlug = searchParams.get('event');
  const selectedEvent = selectedEventSlug
    ? events.find(e => e.slug === selectedEventSlug)
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
    let filtered = filterEvents(events, searchQuery, selectedTag);
    filtered = sortEvents(filtered, sortBy);
    return filtered;
  }, [events, searchQuery, selectedTag, sortBy]);

  const popularEvents = useMemo(() => events.slice(0, 6), [events]);

  return (
    <>
      <div className="max-w-[1120px] mx-auto px-[18px]">
        {/* Hero */}
        <div className="pt-[22px] pb-2">
          <h1 className="m-0 text-[36px] font-semibold text-text tracking-[-0.03em] leading-[1.1]">
            Discover events in Manchester
          </h1>
          <div className="mt-2 text-muted text-[15px] font-normal leading-[1.5] tracking-[-0.01em]">
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

        {/* Popular Events */}
        {!searchQuery && !selectedTag && (
          <div className="mt-[26px]">
            <div className="flex items-baseline justify-between gap-[10px]">
              <h2 className="m-0 text-[18px] font-semibold text-text tracking-[-0.02em] leading-[1.2]">
                Popular events
              </h2>
              <Link href="/all-events" className="text-text no-underline font-medium text-sm hover:underline hover:text-muted transition-colors">
                See all
              </Link>
            </div>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[14px]">
              {popularEvents.map(event => (
                <EventCard key={event.id} event={event} onClick={() => openEvent(event.slug)} />
              ))}
            </div>
          </div>
        )}

        {/* Browse by Category */}
        {!searchQuery && !selectedTag && tags.length > 0 && (
          <div className="mt-[26px]">
            <div className="flex items-baseline justify-between gap-[10px]">
              <h2 className="m-0 text-[18px] font-semibold text-text tracking-[-0.02em] leading-[1.2]">
                Browse by category
              </h2>
            </div>
            <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
              {tags.slice(0, 8).map(category => (
                <CategoryCard
                  key={category}
                  categoryName={category}
                  count={categoryEventCounts[category] ?? 0}
                  onClick={() => setSelectedTag(selectedTag === category ? undefined : category)}
                />
              ))}
            </div>
          </div>
        )}

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
                />
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        {(searchQuery || selectedTag) && (
          <div className="mt-[26px]">
            <div className="flex items-baseline justify-between gap-[10px]">
              <h2 className="m-0 text-[18px] font-semibold text-text tracking-[-0.02em] leading-[1.2]">
                Search results
              </h2>
              <span className="text-sm text-muted">{filteredEvents.length} events</span>
            </div>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[14px]">
              {filteredEvents.map(event => (
                <EventCard key={event.id} event={event} onClick={() => openEvent(event.slug)} />
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
