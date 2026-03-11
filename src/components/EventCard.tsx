'use client';

import Image from 'next/image';
import { Event } from '@/data/events';
import { formatDateTime } from '@/utils/dateUtils';

interface EventCardProps {
  event: Event;
  onClick?: () => void;
}

export default function EventCard({ event, onClick }: EventCardProps) {
  return (
    <div
      onClick={onClick}
      className="group bg-surface border border-border rounded-[var(--radius)] overflow-hidden shadow-[var(--shadowSoft)] transition-all duration-[0.12s] cursor-pointer hover:-translate-y-0.5 hover:shadow-[var(--shadow)]"
    >
      {/* Cover Image */}
      <div className="relative w-full h-[120px] bg-gradient-to-br from-[rgba(99,102,241,0.08)] via-transparent to-[rgba(239,68,68,0.06)] border-b border-border">
        <Image
          src={event.imageUrl}
          alt={event.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      {/* Card Body */}
      <div className="p-[14px]">
        {/* Meta Info */}
        <div className="flex gap-[10px] items-center text-subtle font-medium text-[11px] tracking-[-0.01em] uppercase mb-2">
          <span>{formatDateTime(event.startDateTime)}</span>
          {event.interestedCount > 50 && (
            <span className="px-2 py-1 rounded bg-[rgba(239,68,68,0.08)] text-red font-medium text-[10px] uppercase tracking-[0.5px] border-none">
              Trending
            </span>
          )}
        </div>

        {/* Title */}
        <div className="my-[10px] mb-2 text-base font-bold text-text tracking-[-0.02em] leading-[1.3]">
          {event.title}
        </div>

        {/* Host */}
        <div className="text-subtle font-bold text-[13px] mb-0">
          {event.societyName} • {event.locationName}
        </div>

        {/* Footer */}
        <div className="mt-[14px] flex justify-between items-center">
          <div className="text-subtle text-xs font-medium tracking-[-0.01em]">
            {event.priceLabel} • {event.interestedCount} going
          </div>
          <div className="border border-border bg-transparent text-text px-[14px] py-2 rounded-lg font-medium text-xs cursor-pointer transition-all duration-200 hover:bg-[rgba(15,23,42,0.04)] hover:border-text hover:-translate-y-0.5">
            Register
          </div>
        </div>
      </div>
    </div>
  );
}

