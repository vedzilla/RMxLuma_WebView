'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Event } from '@/data/events';
import { filterEvents, sortEvents, SortOption } from '@/utils/eventUtils';
import SearchBar from '@/components/SearchBar';
import FilterPills from '@/components/FilterPills';
import SortDropdown from '@/components/SortDropdown';
import EventGrid from '@/components/EventGrid';
import EventModal from '@/components/EventModal';

interface UniversityPageClientProps {
  uniSlug: string;
  universityName: string;
  events: Event[];
  tags: string[];
}

export default function UniversityPageClient({ uniSlug, universityName, events, tags }: UniversityPageClientProps) {
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
    router.push(`/universities/${uniSlug}?${params.toString()}`, { scroll: false });
  };

  const closeEvent = () => {
    router.push(`/universities/${uniSlug}`, { scroll: false });
  };

  const universityEvents = useMemo(() => {
    let filtered = filterEvents(events, searchQuery, selectedTag);
    filtered = sortEvents(filtered, sortBy);
    return filtered;
  }, [events, searchQuery, selectedTag, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-text mb-4">
          {universityName} events
        </h1>
        <p className="text-lg text-subtle mb-6">
          Discover society events at {universityName}. Get the app for personalized recommendations.
        </p>
        <Link
          href="/about"
          className="inline-block px-6 py-3 border border-border text-text rounded-lg font-semibold hover:bg-bg transition-colors"
        >
          Get the app
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
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

      {/* Events */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-text">Events</h2>
          <span className="text-sm text-subtle">{universityEvents.length} events</span>
        </div>
        <EventGrid events={universityEvents} onEventClick={openEvent} />
      </div>

      {selectedEvent && (
        <EventModal event={selectedEvent} onClose={closeEvent} />
      )}
    </div>
  );
}
