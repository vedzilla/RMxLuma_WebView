import { Event } from '@/data/events';

export type SortOption = 'soonest' | 'trending' | 'newest';

/**
 * Sort events by the given option
 */
export function sortEvents(events: Event[], sortBy: SortOption): Event[] {
  const sorted = [...events];
  
  switch (sortBy) {
    case 'soonest':
      return sorted.sort((a, b) => 
        new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime()
      );
    
    case 'trending':
      return sorted.sort((a, b) => b.attendingCount - a.attendingCount);
    
    case 'newest':
      return sorted.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    
    default:
      return sorted;
  }
}

/**
 * Filter events based on search query and filters
 */
export function filterEvents(
  events: Event[],
  searchQuery: string,
  selectedTag?: string,
  city?: string,
  university?: string
): Event[] {
  let filtered = [...events];
  
  // Filter by search query
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(event =>
      event.title.toLowerCase().includes(query) ||
      event.societyName.toLowerCase().includes(query) ||
      event.university.toLowerCase().includes(query) ||
      event.city.toLowerCase().includes(query) ||
      event.tags.some(tag => tag.toLowerCase().includes(query)) ||
      event.description.toLowerCase().includes(query)
    );
  }
  
  // Filter by tag
  if (selectedTag) {
    filtered = filtered.filter(event =>
      event.tags.includes(selectedTag)
    );
  }
  
  // Filter by city
  if (city) {
    filtered = filtered.filter(event =>
      event.city.toLowerCase() === city.toLowerCase()
    );
  }
  
  // Filter by university
  if (university) {
    filtered = filtered.filter(event =>
      event.university.toLowerCase() === university.toLowerCase()
    );
  }
  
  return filtered;
}

/**
 * Get events happening this week
 */
export function getThisWeekEvents(events: Event[]): Event[] {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setUTCDate(now.getUTCDate() - now.getUTCDay());
  startOfWeek.setUTCHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setUTCDate(startOfWeek.getUTCDate() + 7);
  
  return events.filter(event => {
    const eventDate = new Date(event.startDateTime);
    return eventDate >= startOfWeek && eventDate < endOfWeek;
  });
}

/**
 * Get trending events (sorted by attendingCount)
 */
export function getTrendingEvents(events: Event[], limit: number = 6): Event[] {
  return [...events]
    .sort((a, b) => b.attendingCount - a.attendingCount)
    .slice(0, limit);
}

/**
 * Get related events (same city or shared tags)
 */
export function getRelatedEvents(currentEvent: Event, allEvents: Event[], limit: number = 4): Event[] {
  const related = allEvents
    .filter(event => 
      event.id !== currentEvent.id &&
      (event.city === currentEvent.city || 
       event.tags.some(tag => currentEvent.tags.includes(tag)))
    )
    .slice(0, limit);
  
  return related;
}





