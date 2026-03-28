import { getClient } from './client';

export interface BuildingOption {
  id: string;
  name: string;
  google_maps_url: string | null;
}

export interface RoomOption {
  id: string;
  name: string;
  floor: string | null;
}

/**
 * Search buildings by name (case-insensitive partial match).
 * Returns up to `limit` matches, ordered alphabetically.
 */
export async function searchBuildings(
  query: string,
  limit = 5
): Promise<BuildingOption[]> {
  if (!query.trim()) return [];

  const { data, error } = await getClient()
    .from('buildings')
    .select('id, name, google_maps_url')
    .ilike('name', `%${query}%`)
    .order('name')
    .limit(limit);

  if (error) {
    console.error('[searchBuildings]', error);
    return [];
  }

  return data ?? [];
}

/**
 * Get all rooms for a given building, ordered alphabetically.
 */
export async function getRoomsForBuilding(
  buildingId: string
): Promise<RoomOption[]> {
  const { data, error } = await getClient()
    .from('rooms')
    .select('id, name, floor')
    .eq('building_id', buildingId)
    .order('name');

  if (error) {
    console.error('[getRoomsForBuilding]', error);
    return [];
  }

  return data ?? [];
}

/**
 * Upsert a building (and optional room) via the society-event-location-upload edge function.
 * This function handles Google Place ID validation and deduplication server-side.
 * Returns the building (and optional room) IDs.
 */
export async function uploadLocation(
  token: string,
  input: { place_id: string; room_name?: string }
): Promise<{ building_id: string; room_id?: string; building_name: string; google_maps_url: string | null } | null> {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  const res = await fetch(`${SUPABASE_URL}/functions/v1/society-event-location-upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error('[uploadLocation]', err);
    return null;
  }

  const data = await res.json();
  return {
    building_id: data.building_id,
    room_id: data.room_id,
    building_name: data.building_name ?? '',
    google_maps_url: data.google_maps_url ?? null,
  };
}
