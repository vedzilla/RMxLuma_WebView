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
  source: string;
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
  status: string;
  ig_post_status: string;
  ig_generated_image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRow {
  id: string;
  university_id: string | null;
  study_level_id: string | null;
  profile_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRoleRow {
  id: string;
  name: string;
}

export interface UsersRolesRow {
  id: string;
  user_id: string;
  role_id: string;
  created_at: string;
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

export interface SocietyBioLinkRow {
  id: string;
  society_id: string;
  url: string;
  created_at: string;
}

export interface SocietyAccountApprovalStatusRow {
  id: string;
  name: string;
}

export interface SocietyAccountRow {
  id: string;
  auth_user_id: string;
  society_id: string;
  status_id: string;
  created_at: string;
  updated_at: string;
}

export interface StudyLevelRow {
  id: string;
  name: string;
}

export interface InteractionTypeRow {
  id: string;
  name: string;
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

// ---- Event management (edge function) types ----

export interface ScheduleEntryInput {
  scheduled_at: string;
  is_end_schedule?: boolean;
  schedule_order?: number;
  location_id?: string;
}

export interface CreateEventInput {
  society_id: string;
  title: string;
  description: string;
  /** Category UUIDs */
  categories: string[];
  schedule: ScheduleEntryInput[];
  is_online?: boolean;
  is_free?: boolean;
  price?: string;
  registration_url?: string;
}

export interface UpdateEventInput {
  event_id: string;
  title?: string;
  description?: string;
  /** Category UUIDs */
  categories?: string[];
  schedule?: ScheduleEntryInput[];
  is_online?: boolean;
  is_free?: boolean;
  price?: string | null;
  registration_url?: string | null;
}

export interface DeleteEventInput {
  event_id: string;
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

// ---- Society management permission types ----

/** Row from the society_management_perms lookup table. */
export interface SocietyManagementPermRow {
  id: string;
  name: string;
}

/** Row from the society_committee_perms junction table, with the permission name joined. */
export interface SocietyCommitteePermWithName {
  id: string;
  society_account_id: string;
  permission_id: string;
  society_management_perms: Pick<SocietyManagementPermRow, 'id' | 'name'>;
}

/** A member record returned by the get-committee-members-details edge function. */
export interface CommitteeMemberDetail {
  user_id: string;
  email: string;
  name: string;
  role_name: string | null;
}

/** An applicant record returned by the get-committee-application-details edge function. */
export interface CommitteeApplicantDetail {
  user_id: string;
  email: string;
  name: string;
  status: 'pending' | 'rejected';
}

// ---- Society account joined types ----

// SocietyAccount with nested approval status name.
export interface SocietyAccountWithStatus extends SocietyAccountRow {
  society_account_approval_status: Pick<SocietyAccountApprovalStatusRow, 'name'>;
}

// SocietyAccount with nested society and university — used by the society picker page.
export interface SocietyAccountWithSociety extends SocietyAccountWithStatus {
  societies: (SocietyRow & {
    universities: Pick<UniversityRow, 'id' | 'name'> | null;
  }) | null;
}
