import type {
  EventWithRelations,
  SocietyWithUniversity,
  UniversityWithCity,
  UniversityCourseWithDegreeType,
  CityRow,
  CategoryRow,
  StudyLevelRow,
  InterestRow,
  Event,
  EventSchedule,
  Society,
  University,
  Category,
  City,
  StudyLevel,
  Interest,
  UniversityCourse,
} from './types';

// ---- Helpers ----

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function formatPriceLabel(isFree: boolean, price: string | null): string {
  if (isFree) return 'Free';
  if (price) return price;
  return 'See event page';
}

function capitalizeCategory(name: string): string {
  const mapping: Record<string, string> = {
    workshop: 'Workshop',
    social: 'Social',
    academic: 'Academic',
    career: 'Career',
    sports: 'Sports',
    arts: 'Arts',
    trip: 'Trip',
  };
  return mapping[name.toLowerCase()] ?? name.charAt(0).toUpperCase() + name.slice(1);
}

// ---- Transformers ----

export function transformEvent(row: EventWithRelations): Event {
  const firstSocietyEntry = row.event_societies?.[0];
  const society = firstSocietyEntry?.societies ?? null;
  const university = society?.universities ?? null;
  const category = row.categories;

  // Pick the primary image: sort event_images by image_index, take the first full_url.
  const sortedImages = [...(row.event_images ?? [])].sort(
    (a, b) => (a.image_index ?? 0) - (b.image_index ?? 0)
  );
  const imageUrl = sortedImages[0]?.post_images?.full_url ?? '';

  // Derive start/end/location from schedule_entries.
  const sortedEntries = [...(row.schedule_entries ?? [])].sort(
    (a, b) => a.schedule_order - b.schedule_order
  );
  const startEntry = sortedEntries.find(e => !e.is_end_schedule) ?? null;
  const endEntry = sortedEntries.find(e => e.is_end_schedule) ?? null;

  const schedules: EventSchedule[] = sortedEntries.map(e => ({
    scheduledAt: e.scheduled_at,
    isEnd: e.is_end_schedule,
    order: e.schedule_order,
    locationName: e.locations?.name ?? null,
    locationGoogleMapsUrl: e.locations?.google_maps_url ?? null,
  }));

  return {
    id: row.id,
    slug: generateSlug(row.title),
    title: row.title,
    description: row.description,
    startDateTime: startEntry?.scheduled_at ?? '',
    endDateTime: endEntry?.scheduled_at ?? undefined,
    city: university?.cities?.name ?? 'Unknown',
    university: university?.name ?? 'University of Manchester',
    societyName: society?.name ?? 'Unknown Society',
    locationName: startEntry?.locations?.name ?? '',
    locationGoogleMapsUrl: startEntry?.locations?.google_maps_url ?? null,
    schedules,
    imageUrl,
    externalUrl: row.registration_url ?? row.source_post_url ?? '',
    tags: category ? [capitalizeCategory(category.name)] : ['General'],
    interestedCount: row.likes,
    attendingCount: row.attending,
    createdAt: row.created_at,
    priceLabel: formatPriceLabel(row.is_free, row.price),
  };
}

export function transformSociety(row: SocietyWithUniversity): Society {
  return {
    id: row.id,
    name: row.name,
    instagram: row.instagram_handle,
    description: row.description ?? '',
    university: row.universities?.name ?? 'Unknown University',
    imageUrl: row.image_url ?? '',
    bioUrl: row.bio_url ?? '',
  };
}

export function transformUniversity(row: UniversityWithCity): University {
  return {
    id: row.id,
    name: row.name,
    shortName: row.short_name,
    cityName: row.cities?.name ?? null,
    buildingUrl: row.building_url ?? null,
    logoUrl: row.logo_url ?? null,
    description: row.description ?? null,
  };
}

export function transformCity(row: CityRow): City {
  return {
    id: row.id,
    name: row.name,
    slug: generateSlug(row.name),
  };
}

export function transformCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
  };
}

export function transformStudyLevel(row: StudyLevelRow): StudyLevel {
  return { id: row.id, name: row.name };
}

export function transformInterest(row: InterestRow): Interest {
  return { id: row.id, name: row.name };
}

export function transformUniversityCourse(row: UniversityCourseWithDegreeType): UniversityCourse {
  return {
    id: row.id,
    name: row.name,
    degreeTypeName: row.degree_types?.name ?? '',
    courseLength: row.course_length,
    yearInIndustry: row.year_in_industry,
  };
}
