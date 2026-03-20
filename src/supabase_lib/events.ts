import { SupabaseClient } from '@supabase/supabase-js';
import { getClient } from './client';
import { transformEvent, generateSlug } from './transform';
import { getCities } from './cities';
import type { Event, EventWithRelations } from './types';
import type { DashboardEvent } from '@/lib/supabase/types';

// Supabase select string that joins all needed relations.
const EVENT_SELECT = `
  *,
  categories(id, name),
  event_societies(
    societies(
      id, name, instagram_handle, description, bio_url, image_url, university_id, created_at, updated_at,
      universities(id, name, short_name, city_id, created_at, cities(id, name))
    )
  ),
  event_images(post_id, image_index, post_images(full_url)),
  schedule_entries(id, scheduled_at, is_end_schedule, schedule_order, location_id, locations(id, name, google_maps_url))
`.trim();

export interface GetEventsOptions {
  /** Filter by category name (e.g. 'Social', 'Sports'). Case-insensitive. */
  category?: string;
  /** Filter by city derived from location string (e.g. 'Manchester'). */
  city?: string;
  /** Filter by university name (matched on joined societies.universities). */
  university?: string;
  /** Only return upcoming events (event_date >= now). Defaults to true. */
  upcomingOnly?: boolean;
  /** Max number of results to return. */
  limit?: number;
}

/**
 * Fetch all events, optionally filtered.
 * Returns events ordered by event_date ascending.
 */
export async function getEvents(options: GetEventsOptions = {}): Promise<Event[]> {
  const { upcomingOnly = true, limit } = options;

  const { data, error } = await getClient()
    .from('events')
    .select(EVENT_SELECT);

  if (error) {
    console.error('[supabase_lib] getEvents error:', error.message);
    return [];
  }

  let events = (data as unknown as EventWithRelations[]).map(transformEvent);

  // Sort by first schedule entry ascending.
  events.sort((a, b) => a.startDateTime.localeCompare(b.startDateTime));

  // Apply upcoming filter client-side (event_date no longer on events table).
  if (upcomingOnly) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    events = events.filter(e => e.startDateTime >= today.toISOString());
  }

  if (limit) events = events.slice(0, limit);

  // Client-side filtering for fields not easily filtered in SQL.
  return events.filter(event => {
    if (options.category && !event.tags.some(t => t.toLowerCase() === options.category!.toLowerCase())) {
      return false;
    }
    if (options.city && event.city.toLowerCase() !== options.city.toLowerCase()) {
      return false;
    }
    if (options.university && event.university.toLowerCase() !== options.university.toLowerCase()) {
      return false;
    }
    return true;
  });
}

/**
 * Fetch a single event by its UUID.
 */
export async function getEventById(id: string): Promise<Event | null> {
  const { data, error } = await getClient()
    .from('events')
    .select(EVENT_SELECT)
    .eq('id', id)
    .single();

  if (error || !data) {
    if (error?.code !== 'PGRST116') {
      console.error('[supabase_lib] getEventById error:', error?.message);
    }
    return null;
  }

  return transformEvent(data as unknown as EventWithRelations);
}

/**
 * Fetch a single event by its slug (derived from title).
 * Note: slugs are generated client-side, so this fetches all events
 * and finds the match — use getEventById when you have the UUID.
 */
export async function getEventBySlug(slug: string): Promise<Event | null> {
  const events = await getEvents({ upcomingOnly: false });
  return events.find(e => e.slug === slug) ?? null;
}

/**
 * Fetch trending events sorted by likes (descending).
 */
export async function getTrendingEvents(limit = 6): Promise<Event[]> {
  const { data, error } = await getClient()
    .from('events')
    .select(EVENT_SELECT)
    .order('likes', { ascending: false })
    .limit(limit * 3);

  if (error) {
    console.error('[supabase_lib] getTrendingEvents error:', error.message);
    return [];
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (data as unknown as EventWithRelations[])
    .map(transformEvent)
    .filter(e => e.startDateTime >= today.toISOString())
    .slice(0, limit);
}

/**
 * Return all unique city names from the cities table.
 */
export async function getEventCities(): Promise<string[]> {
  const cities = await getCities();
  return cities.map(c => c.name);
}

/**
 * Return all unique tags/categories from events.
 */
export async function getEventTags(): Promise<string[]> {
  const events = await getEvents({ upcomingOnly: false });
  return Array.from(new Set(events.flatMap(e => e.tags))).sort();
}

/**
 * Return all unique universities from events.
 */
export async function getEventUniversities(): Promise<string[]> {
  const events = await getEvents({ upcomingOnly: false });
  return Array.from(new Set(events.map(e => e.university))).sort();
}

// ---- Dashboard (authenticated) ----

// Select string for dashboard event queries — includes multi-category and status joins.
const DASHBOARD_EVENT_SELECT = `
  *,
  categories(id, name),
  event_categories(categories(id, name)),
  event_societies!inner(society_id),
  event_images(post_id, image_index, post_images(full_url)),
  schedule_entries(id, scheduled_at, is_end_schedule, schedule_order, location_id, locations(id, name, google_maps_url)),
  n8n_event_status(status)
`.trim();

/** Transform a raw dashboard event row into a DashboardEvent. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toDashboardEvent(row: any): DashboardEvent {
  // Categories: prefer event_categories junction, fall back to legacy FK
  const categories: string[] =
    row.event_categories?.length > 0
      ? row.event_categories
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((ec: any) => ec.categories?.name)
          .filter(Boolean)
      : row.categories
        ? [row.categories.name]
        : [];

  // Status: latest from n8n_event_status, default to "live"
  const status: string = row.n8n_event_status?.[0]?.status ?? 'live';

  // Sort schedule entries by order
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sortedEntries = [...(row.schedule_entries ?? [])].sort(
    (a: any, b: any) => a.schedule_order - b.schedule_order
  );
  const startEntry = sortedEntries.find(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (e: any) => !e.is_end_schedule
  );

  // Primary image (lowest index)
  const sortedImages = [...(row.event_images ?? [])].sort(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (a: any, b: any) => (a.image_index ?? 0) - (b.image_index ?? 0)
  );

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    date: startEntry?.scheduled_at ?? null,
    status,
    source: row.source ?? 'scraped',
    likes: row.likes ?? 0,
    attending: row.attending ?? 0,
    categories,
    imageUrl: sortedImages[0]?.post_images?.full_url ?? null,
    registrationUrl: row.registration_url,
    isOnline: row.is_online ?? false,
    isFree: row.is_free ?? true,
    price: row.price,
    schedules: sortedEntries.map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (e: any) => ({
        scheduledAt: e.scheduled_at,
        isEnd: e.is_end_schedule,
        order: e.schedule_order,
        locationName: e.locations?.name ?? null,
        locationId: e.location_id ?? null,
        locationGoogleMapsUrl: e.locations?.google_maps_url ?? null,
      })
    ),
  };
}

/**
 * Fetch all events belonging to a society (via event_societies junction).
 * Requires an authenticated Supabase client.
 */
export async function getEventsForSociety(
  supabase: SupabaseClient,
  societyId: string
): Promise<DashboardEvent[]> {
  const { data, error } = await supabase
    .from('events')
    .select(DASHBOARD_EVENT_SELECT)
    .eq('event_societies.society_id', societyId);

  if (error) {
    console.error('[supabase_lib] getEventsForSociety error:', error.message);
    return [];
  }

  return (data ?? []).map(toDashboardEvent);
}
