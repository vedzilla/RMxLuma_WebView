import Image from 'next/image';
import Link from 'next/link';
import { Event } from '@/data/events';
import { formatDate, formatTime } from '@/utils/dateUtils';
import EventCard from './EventCard';
import { getRelatedEvents } from '@/utils/eventUtils';
import { PublicButton } from '@/components/ui/PublicButton';

interface EventDetailProps {
  event: Event;
  allEvents: Event[];
}

export default function EventDetail({ event, allEvents }: EventDetailProps) {
  const relatedEvents = getRelatedEvents(event, allEvents);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Cover Image */}
      <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden mb-8">
        <Image
          src={event.imageUrl}
          alt={event.title}
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
      </div>

      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-bold text-text mb-4">{event.title}</h1>

      {/* Key Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 p-6 bg-bg rounded-xl">
        <div>
          <p className="text-sm text-subtle mb-1">Date & Time</p>
          <p className="font-semibold text-text">
            {formatDate(event.startDateTime)} • {formatTime(event.startDateTime)}
          </p>
        </div>
        <div>
          <p className="text-sm text-subtle mb-1">Location</p>
          <p className="font-semibold text-text">{event.locationName}</p>
        </div>
        <div>
          <p className="text-sm text-subtle mb-1">City</p>
          <p className="font-semibold text-text">{event.city}</p>
        </div>
        <div>
          <p className="text-sm text-subtle mb-1">University</p>
          <p className="font-semibold text-text">{event.university}</p>
        </div>
        <div>
          <p className="text-sm text-subtle mb-1">Host</p>
          <p className="font-semibold text-text">{event.societyName}</p>
        </div>
        <div>
          <p className="text-sm text-subtle mb-1">Price</p>
          <p className="font-semibold text-text">{event.priceLabel}</p>
        </div>
      </div>

      {/* Description */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-text mb-4">About this event</h2>
        <p className="text-subtle leading-relaxed whitespace-pre-line">{event.description}</p>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-8">
        {event.tags.map(tag => (
          <span
            key={tag}
            className="px-3 py-1.5 text-sm text-subtle bg-bg rounded-lg border border-border"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Social Proof */}
      <div className="flex items-center gap-6 mb-8 text-sm text-subtle">
        <span>{event.interestedCount} interested</span>
        <span>{event.attendingCount} attending</span>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-4 mb-12">
        <PublicButton asChild className="flex-1 text-center">
          <a
            href={event.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Register
          </a>
        </PublicButton>
        <PublicButton variant="outline" asChild className="flex-1 text-center">
          <Link href="/about">
            Get reminders in the app
          </Link>
        </PublicButton>
      </div>

      {/* Related Events */}
      {relatedEvents.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-text mb-6">Other events you may like</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {relatedEvents.map(relatedEvent => (
              <EventCard key={relatedEvent.id} event={relatedEvent} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
