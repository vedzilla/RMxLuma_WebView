import { getClient } from './client';
import type { LocationRow } from './types';

/**
 * Search locations by name prefix (case-insensitive).
 * Returns up to `limit` matches, ordered alphabetically.
 */
export async function searchLocations(
  query: string,
  limit = 5
): Promise<Pick<LocationRow, 'id' | 'name' | 'google_maps_url'>[]> {
  if (!query.trim()) return [];

  const { data, error } = await getClient()
    .from('locations')
    .select('id, name, google_maps_url')
    .ilike('name', `%${query}%`)
    .order('name')
    .limit(limit);

  if (error) {
    console.error('[searchLocations]', error);
    return [];
  }

  return data ?? [];
}

/**
 * Insert a new location (from Google Places) into Supabase.
 * Returns the created row, or null on failure.
 */
export async function insertLocation(input: {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  google_maps_url: string;
  google_place_id: string;
}): Promise<Pick<LocationRow, 'id' | 'name' | 'google_maps_url'> | null> {
  // Check if a location with this google_place_id already exists
  const { data: existing } = await getClient()
    .from('locations')
    .select('id, name, google_maps_url')
    .eq('google_place_id', input.google_place_id)
    .limit(1)
    .single();

  if (existing) return existing;

  const { data, error } = await getClient()
    .from('locations')
    .insert({
      name: input.name,
      street: input.address,
      google_maps_url: input.google_maps_url,
      google_place_id: input.google_place_id,
      latitude: input.latitude,
      longitude: input.longitude,
    })
    .select('id, name, google_maps_url')
    .single();

  if (error) {
    console.error('[insertLocation]', error);
    return null;
  }

  return data;
}
