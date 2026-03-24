'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Event } from '@/data/events';
import { sortEvents, SortOption } from '@/utils/eventUtils';
import SortDropdown from '@/components/SortDropdown';
import EventCard from '@/components/EventCard';
import EventModal from '@/components/EventModal';
import SocietyCard from '@/components/SocietyCard';
import { PublicButton } from '@/components/ui/PublicButton';

interface CategoryPageClientProps {
  categoryName: string;
  description: string;
  keywords: string[];
  imageKeyword: string;
  eventCount: number;
  subscriberCount: number;
  events: Event[];
}

export default function CategoryPageClient({
  categoryName,
  description,
  keywords,
  imageKeyword,
  eventCount,
  subscriberCount,
  events,
}: CategoryPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sortBy, setSortBy] = useState<SortOption>('soonest');

  const selectedEventSlug = searchParams.get('event');
  const selectedEvent = selectedEventSlug
    ? events.find(e => e.slug === selectedEventSlug)
    : null;

  const openEvent = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('event', slug);
    router.push(`/categories/${categoryName.toLowerCase().replace(/\s+/g, '-')}?${params.toString()}`, { scroll: false });
  };

  const closeEvent = () => {
    router.push(`/categories/${categoryName.toLowerCase().replace(/\s+/g, '-')}`, { scroll: false });
  };

  const categoryEvents = useMemo(() => sortEvents(events, sortBy), [events, sortBy]);

  const popularSocieties = useMemo(() => {
    const societies = new Map<string, { name: string; count: number; category: string }>();
    categoryEvents.forEach(event => {
      const existing = societies.get(event.societyName);
      if (existing) {
        existing.count += 1;
      } else {
        societies.set(event.societyName, { name: event.societyName, count: 1, category: categoryName });
      }
    });
    return Array.from(societies.values()).sort((a, b) => b.count - a.count).slice(0, 6);
  }, [categoryEvents, categoryName]);

  const imageUrl = `https://images.unsplash.com/photo-${imageKeyword === 'sports' ? '1571008887538-b36bb32f4571' : imageKeyword === 'business' ? '1556761175-5973dc0f32e7' : imageKeyword === 'culture' ? '1606220945770-b5b6c2c55bf1' : imageKeyword === 'wellness' ? '1506126613408-eca07ce68773' : imageKeyword === 'social' ? '1521737604893-d14cc237f11d' : imageKeyword === 'technology' ? '1677442136019-21780ecad995' : imageKeyword === 'art' ? '1502920917128-1aa500764cbd' : '1556910103-1c02745aae4d'}?w=800`;

  return (
    <>
      <div className="max-w-[1120px] mx-auto px-5 py-8">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div>
            <h1 className="text-5xl md:text-6xl font-semibold text-text mb-6 tracking-[-0.03em]">
              {categoryName}
            </h1>
            <div className="flex items-center gap-6 mb-6">
              <div className="flex items-center gap-2 text-subtle">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="3" y="4" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  <path d="M3 8h14M8 4v4" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                <span className="font-semibold text-text">{eventCount} Events</span>
              </div>
              <div className="flex items-center gap-2 text-subtle">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  <path d="M5 17c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                </svg>
                <span className="font-semibold text-text">{subscriberCount.toLocaleString()} Subscribers</span>
              </div>
            </div>
            <p className="text-lg text-subtle mb-8 leading-relaxed">{description}</p>
            <PublicButton>
              Subscribe
            </PublicButton>
          </div>

          <div className="bg-bg border border-border rounded-[var(--radius)] p-8 relative min-h-[500px]">
            <div className="flex items-center justify-center my-8">
              <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-surface shadow-lg">
                <Image src={imageUrl} alt={categoryName} fill className="object-cover" sizes="256px" />
              </div>
            </div>
            <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-3">
              {keywords.map((keyword, idx) => (
                <div
                  key={idx}
                  className="text-subtle font-semibold text-xs tracking-wider uppercase"
                  style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
                >
                  {keyword}
                </div>
              ))}
            </div>
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-xs">
              <span className="text-subtle font-medium">DISCOVER</span>
              <span className="font-bold text-text uppercase">{categoryName.toUpperCase()} EVENTS</span>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <SortDropdown value={sortBy} onChange={setSortBy} />
        </div>

        {popularSocieties.length > 0 && (
          <div className="mb-12">
            <div className="flex items-baseline justify-between gap-2.5 mb-6">
              <h2 className="m-0 text-[18px] font-semibold text-text tracking-[-0.02em] leading-[1.2]">
                Popular Calendars
              </h2>
              <Link href="#" className="text-text no-underline font-medium text-sm hover:underline hover:text-subtle transition-colors">
                View all
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {popularSocieties.map(society => (
                <SocietyCard
                  key={society.name}
                  name={society.name}
                  category={society.category}
                  eventCount={society.count}
                  initials={society.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                />
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="flex items-baseline justify-between gap-2.5 mb-6">
            <h2 className="m-0 text-[18px] font-semibold text-text tracking-[-0.02em] leading-[1.2]">Events</h2>
            <span className="text-sm text-subtle">{categoryEvents.length} events</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {categoryEvents.map(event => (
              <EventCard key={event.id} event={event} onClick={() => openEvent(event.slug)} />
            ))}
          </div>
        </div>
      </div>

      {selectedEvent && <EventModal event={selectedEvent} onClose={closeEvent} />}
    </>
  );
}
