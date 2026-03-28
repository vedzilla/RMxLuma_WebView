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
  source: "scraped" | "manual";
  created_by_society_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface LocationRow {
  id: string;
  name: string;
  street: string | null;
  postcode: string | null;
  google_maps_url: string | null;
  google_place_id: string | null;
  latitude: number | null;
  longitude: number | null;
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
  locations: Pick<LocationRow, "id" | "name" | "google_maps_url"> | null;
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

export interface SocietyProfileRow {
  id: string;
  society_id: string;
  name: string;
  handle: string;
  description: string | null;
  image_url: string | null;
  follow_count: number;
  event_count: number;
  created_at: string;
  updated_at: string;
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

export interface CategoryRow {
  id: string;
  name: string;
}

export interface PostImageRow {
  id: string;
  s3_url: string;
  full_url: string;
  small_url: string | null;
  summary: string | null;
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
  status: "ingested" | "approved" | "rejected" | "live";
  ig_post_status: string;
  ig_generated_image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface SocietyAccountRow {
  id: string;
  auth_user_id: string;
  society_id: string;
  approval_status: "pending" | "approved" | "trusted" | "rejected";
  created_at: string;
  updated_at: string;
}

// Joined shapes

export interface EventWithRelations extends EventRow {
  categories: CategoryRow | null;
  event_societies: Array<{
    societies: (SocietyRow & {
      universities: UniversityRow | null;
    }) | null;
  }>;
  event_images: Array<{
    post_id: string | null;
    image_index: number | null;
    post_images: Pick<PostImageRow, "full_url" | "small_url"> | null;
  }>;
  schedule_entries: ScheduleEntryWithLocation[];
  n8n_event_status: N8nEventStatusRow[];
  event_categories: Array<{
    categories: CategoryRow | null;
  }>;
}

export interface SocietyWithProfile extends SocietyRow {
  society_profiles: SocietyProfileRow | null;
  universities: UniversityRow | null;
}

// Dashboard-specific types

export interface DashboardEvent {
  id: string;
  title: string;
  description: string;
  date: string | null;
  status: string;
  source: "scraped" | "manual";
  likes: number;
  attending: number;
  categories: string[];
  imageUrl: string | null;
  registrationUrl: string | null;
  isOnline: boolean;
  isFree: boolean;
  price: string | null;
  schedules: Array<{
    scheduledAt: string;
    isEnd: boolean;
    order: number;
    locationName: string | null;
    locationId: string | null;
    locationGoogleMapsUrl: string | null;
    roomName: string | null;
  }>;
}

export interface AnalyticsData {
  followerCount: number;
  followerGrowth: Array<{ date: string; count: number }>;
  totalLikes: number;
  totalAttending: number;
  eventStats: Array<{
    id: string;
    title: string;
    likes: number;
    attending: number;
    source: string;
    date: string | null;
  }>;
  audienceByUniversity: Array<{ name: string; count: number }>;
  audienceByStudyLevel: Array<{ name: string; count: number }>;
}

export interface PostHogAnalyticsData {
  totalViews: number;
  profileViews: number;
  viewsByEvent: Array<{
    eventId: string;
    views: number;
  }>;
  registrationClicks: number;
}
