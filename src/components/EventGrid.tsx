'use client';

import { Event } from '@/data/events';
import EventCard from './EventCard';

interface EventGridProps {
  events: Event[];
  onEventClick?: (slug: string) => void;
}

export default function EventGrid({ events, onEventClick }: EventGridProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-subtle">No events found. Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
      {events.map(event => (
        <EventCard
          key={event.id}
          event={event}
          onClick={() => onEventClick?.(event.slug)}
        />
      ))}
    </div>
  );
}

