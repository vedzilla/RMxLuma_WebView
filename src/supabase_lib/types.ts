// Raw database row types — match the Supabase schema exactly.

export interface EventRow {
  id: string;
  title: string;
  description: string;
  is_online: boolean;
  is_free: boolean;
  price: string | null;
  category_id: string;
  registration_url: string | null;
  likes: number;
  attending: number;
  source_post_url: string | null;
  post_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface LocationRow {
  id: string;
  name: string;
  street: string | null;
  postcode: string | null;
  google_maps_url: string | null;
  city_id: string | null;
  created_at: string;
}

export interface ScheduleEntryRow {
  id: string;
  event_id: string;
  location_id: string | null;
  scheduled_at: string;
  is_end_schedule: boolean;
  schedule_order: number;
  created_at: string;
}

export interface ScheduleEntryWithLocation extends ScheduleEntryRow {
  locations: Pick<LocationRow, 'id' | 'name' | 'google_maps_url'> | null;
}

export interface SocietyRow {
  id: string;
  name: string;
  instagram_handle: string;
  description: string | null;
  bio_url: string | null;
  university_id: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CityRow {
  id: string;
  name: string;
}

export interface UniversityRow {
  id: string;
  name: string;
  short_name: string;
  city_id: string | null;
  building_url: string | null;
  logo_url: string | null;
  description: string | null;
  created_at: string;
}

export interface UniversityWithCity extends UniversityRow {
  cities: CityRow | null;
}

export interface CategoryRow {
  id: string;
  name: string;
}

export interface PostImageRow {
  id: string;
  full_url: string;
  created_at: string;
}

export interface EventImageRow {
  event_id: string;
  post_image_id: string;
  post_id: string | null;
  image_index: number | null;
  created_at: string;
}

export interface N8nEventStatusRow {
  id: string;
  event_id: string;
  status: string;
  ig_post_status: string;
  ig_generated_image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRow {
  id: string;
  role: string;
  created_at: string;
}

// Joined shape returned by getEvents() — events with nested relations.
export interface EventWithRelations extends EventRow {
  categories: CategoryRow | null;
  event_societies: Array<{
    societies: (SocietyRow & {
      universities: UniversityWithCity | null;
    }) | null;
  }>;
  event_images: Array<{
    post_id: string | null;
    image_index: number | null;
    post_images: Pick<PostImageRow, 'full_url'> | null;
  }>;
  schedule_entries: ScheduleEntryWithLocation[];
}

// Shape returned by getSocieties() — societies with nested university.
export interface SocietyWithUniversity extends SocietyRow {
  universities: UniversityRow | null;
}

// ---- Transformed frontend types ----

export interface EventSchedule {
  scheduledAt: string;
  isEnd: boolean;
  order: number;
  locationName: string | null;
  locationGoogleMapsUrl: string | null;
}

export interface Event {
  id: string;
  slug: string;
  title: string;
  description: string;
  startDateTime: string;
  endDateTime?: string;
  city: string;
  university: string;
  societyName: string;
  locationName: string;
  locationGoogleMapsUrl: string | null;
  schedules: EventSchedule[];
  imageUrl: string;
  externalUrl: string;
  tags: string[];
  interestedCount: number;
  attendingCount: number;
  createdAt: string;
  priceLabel: string;
}

export interface Society {
  id: string;
  name: string;
  instagram: string;
  description: string;
  university: string;
  imageUrl: string;
  bioUrl: string;
}

export interface University {
  id: string;
  name: string;
  shortName: string;
  cityName: string | null;
  buildingUrl: string | null;
  logoUrl: string | null;
  description: string | null;
}

export interface City {
  id: string;
  name: string;
  slug: string;
}

export interface Category {
  id: string;
  name: string;
}
