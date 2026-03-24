'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Event } from '@/data/events';
import { formatDate, formatTime } from '@/utils/dateUtils';
import { PublicButton } from '@/components/ui/PublicButton';

interface EventModalProps {
  event: Event;
  onClose: () => void;
}

export default function EventModal({ event, onClose }: EventModalProps) {
  const router = useRouter();
  const [translateX, setTranslateX] = useState('100%');
  const [backdropOpacity, setBackdropOpacity] = useState(0);

  // Slide in on mount — defer one frame so the transition fires
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setTranslateX('0%');
      setBackdropOpacity(1);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleClose = () => {
    setTranslateX('100%');
    setBackdropOpacity(0);
    setTimeout(onClose, 170);
  };

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/events/${event.slug}`);
    // Could add a toast notification here
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[rgba(15,23,42,0.45)] z-40"
        style={{ opacity: backdropOpacity, transition: 'opacity 200ms ease' }}
        onClick={handleClose}
      />

      {/* Modal Panel */}
      <div
        className="fixed right-0 top-0 bottom-0 w-full md:w-[600px] lg:w-[700px] bg-surface z-50 overflow-y-auto shadow-[var(--shadow)]"
        style={{ transform: `translateX(${translateX})`, transition: 'transform 300ms ease' }}
      >
        {/* Header Bar */}
        <div className="sticky top-0 bg-surface border-b border-border px-6 py-4 flex items-center justify-between z-10 backdrop-blur-sm bg-surface/95">
          <button
            onClick={handleClose}
            className="text-subtle hover:text-text transition-colors p-2 -ml-2"
            aria-label="Close"
          >
            ←
          </button>
          <div className="flex items-center gap-4">
            <button
              onClick={copyLink}
              className="text-sm font-medium text-text hover:text-subtle transition-colors flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-bg"
            >
              <span>Copy Link</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6.5 1.5H11.5C12.3284 1.5 13 2.17157 13 3V8M10.5 5.5H4.5C3.67157 5.5 3 6.17157 3 7V12.5C3 13.3284 3.67157 14 4.5 14H9.5C10.3284 14 11 13.3284 11 12.5V8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
            <a
              href={event.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-text hover:text-subtle transition-colors flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-bg"
            >
              <span>Event Page</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 3H13V10M13 3L3 13M13 3L10 3M13 3L13 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {/* Event Image */}
          <div className="relative w-full rounded-xl overflow-hidden mb-6">
            <Image
              src={event.imageUrl}
              alt={event.title}
              width={700}
              height={700}
              className="w-full h-auto"
              sizes="(max-width: 768px) 100vw, 700px"
              priority
            />
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-text mb-4 tracking-[-0.02em]">
            {event.title}
          </h1>

          {/* Host */}
          <div className="flex items-center gap-2 mb-6 text-subtle">
            <div className="w-6 h-6 rounded-full bg-bg border border-border flex items-center justify-center text-xs font-semibold">
              {event.societyName.charAt(0)}
            </div>
            <span className="text-sm font-medium">Hosted by {event.societyName}</span>
          </div>

          {/* Date & Time */}
          <div className="mb-6 p-4 bg-bg rounded-xl border border-border">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-surface border border-border flex items-center justify-center flex-shrink-0">
                <div className="text-center">
                  {(() => {
                    const date = new Date(event.startDateTime);
                    const day = date.getUTCDate();
                    const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
                    return (
                      <>
                        <div className="text-xs font-bold text-text">{month}</div>
                        <div className="text-sm font-semibold text-text">{day}</div>
                      </>
                    );
                  })()}
                </div>
              </div>
              <div>
                <div className="font-semibold text-text">{formatDate(event.startDateTime)}</div>
                <div className="text-sm text-subtle">{formatTime(event.startDateTime)} {event.endDateTime && `- ${formatTime(event.endDateTime)}`}</div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="mb-6 flex items-start gap-3">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-subtle mt-0.5">
              <path d="M10 2C7.24 2 5 4.24 5 7C5 11.5 10 18 10 18C10 18 15 11.5 15 7C15 4.24 12.76 2 10 2ZM10 9.5C8.62 9.5 7.5 8.38 7.5 7C7.5 5.62 8.62 4.5 10 4.5C11.38 4.5 12.5 5.62 12.5 7C12.5 8.38 11.38 9.5 10 9.5Z" fill="currentColor"/>
            </svg>
            <div className="flex-1">
              <div className="font-semibold text-text mb-1">{event.locationName}</div>
              <div className="text-sm text-subtle">{event.city}, {event.city}</div>
            </div>
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(event.locationName + ', ' + event.city)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-subtle hover:text-text"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 3H13V10M13 3L3 13M13 3L10 3M13 3L13 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </a>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-text mb-3">About this event</h2>
            <p className="text-subtle leading-relaxed whitespace-pre-line">{event.description}</p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
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
          <div className="flex items-center gap-6 mb-6 text-sm text-subtle">
            <span>{event.interestedCount} interested</span>
            <span>{event.attendingCount} attending</span>
          </div>

          {/* Registration Section */}
          <div className="border-t border-border pt-6">
            <h3 className="text-lg font-semibold text-text mb-4">Registration</h3>
            <div className="mb-4 p-4 bg-bg rounded-xl border border-border">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 1C4.13 1 1 4.13 1 8C1 11.87 4.13 15 8 15C11.87 15 15 11.87 15 8C15 4.13 11.87 1 8 1ZM8 11.5C7.59 11.5 7.25 11.16 7.25 10.75C7.25 10.34 7.59 10 8 10C8.41 10 8.75 10.34 8.75 10.75C8.75 11.16 8.41 11.5 8 11.5ZM8.75 8.5H7.25C7.25 7.95 7.7 7.5 8.25 7.5H8.75C9.3 7.5 9.75 7.95 9.75 8.5V9.25C9.75 9.8 9.3 10.25 8.75 10.25H8.25C7.7 10.25 7.25 9.8 7.25 9.25V8.5Z" fill="currentColor"/>
                  </svg>
                </div>
                <div className="text-sm text-text">
                  <div className="font-semibold">Registration required</div>
                  <div className="text-subtle">Click below to register on the society's platform</div>
                </div>
              </div>
            </div>
            <PublicButton asChild className="w-full text-center mb-3">
              <a
                href={event.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Register Now
              </a>
            </PublicButton>
            <PublicButton variant="outline" asChild className="w-full text-center">
              <Link href="/about">
                Get reminders in the app
              </Link>
            </PublicButton>
          </div>
        </div>
      </div>
    </>
  );
}
