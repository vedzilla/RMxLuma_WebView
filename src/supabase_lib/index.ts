// supabase_lib — public read-only data access for the RedefineMe web app.
// All functions fetch live data from Supabase and return typed frontend objects.

export { getClient } from './client';

// Types
export type {
  Event,
  Society,
  University,
  Category,
  City,
  EventRow,
  SocietyRow,
  UniversityRow,
  UniversityWithCity,
  CityRow,
  CategoryRow,
  PostImageRow,
  EventImageRow,
  N8nEventStatusRow,
  UserRow,
  EventWithRelations,
  SocietyWithUniversity,
} from './types';

// Events
export {
  getEvents,
  getEventById,
  getEventBySlug,
  getTrendingEvents,
  getEventCities,
  getEventTags,
  getEventUniversities,
} from './events';

export type { GetEventsOptions } from './events';

// Societies
export {
  getSocieties,
  getSocietyByHandle,
  getSocietiesByUniversity,
} from './societies';

// Universities
export {
  getUniversities,
  getUniversityByShortName,
} from './universities';

// Categories
export { getCategories } from './categories';

// Cities
export { getCities, getCityBySlug } from './cities';

// Users
export { getUserCount, getUserRole, isAdmin } from './users';

// Transform utilities (useful if callers have raw DB rows)
export {
  generateSlug,
  transformEvent,
  transformSociety,
  transformUniversity,
  transformCategory,
  transformCity,
} from './transform';
