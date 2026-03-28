import type { ScheduleEntry } from '@/components/events/ScheduleBuilder';
import type { ScheduleEntryInput } from '@/supabase_lib/types';

/**
 * Convert EventForm schedule entries to the edge function payload format.
 * Each form entry produces 1-2 ScheduleEntryInput objects (start + optional end).
 * Timestamps are constructed as UTC.
 */
export function formScheduleToPayload(entries: ScheduleEntry[]): ScheduleEntryInput[] {
  const result: ScheduleEntryInput[] = [];
  let order = 0;

  for (const entry of entries) {
    if (!entry.date || !entry.startTime) continue;

    const locationFields = {
      ...(entry.locationId ? { location_id: entry.locationId } : {}),
      ...(entry.locationName ? { location_name: entry.locationName } : {}),
      ...(entry.roomName ? { room_name: entry.roomName } : {}),
    };

    // Start entry
    result.push({
      scheduled_at: `${entry.date}T${entry.startTime}:00.000Z`,
      is_end_schedule: false,
      schedule_order: order++,
      ...locationFields,
    });

    // End entry (if endTime provided)
    if (entry.endTime) {
      result.push({
        scheduled_at: `${entry.date}T${entry.endTime}:00.000Z`,
        is_end_schedule: true,
        schedule_order: order++,
        ...locationFields,
      });
    }
  }

  return result;
}

/**
 * Convert DashboardEvent schedules back to EventForm schedule entries.
 * Pairs start+end entries and extracts date/time components.
 */
export function dashboardScheduleToForm(
  schedules: Array<{
    scheduledAt: string;
    isEnd: boolean;
    order: number;
    locationName: string | null;
    locationId: string | null;
    locationGoogleMapsUrl?: string | null;
    roomName?: string | null;
  }>
): ScheduleEntry[] {
  const startEntries = schedules.filter((s) => !s.isEnd);

  if (startEntries.length === 0) {
    return [{ date: '', startTime: '', endTime: '', locationName: '', roomName: '' }];
  }

  return startEntries.map((start) => {
    // Find matching end entry (next in order)
    const matchingEnd = schedules.find(
      (s) => s.isEnd && s.order === start.order + 1
    );

    const startDate = start.scheduledAt.split('T')[0];
    const startTime = start.scheduledAt.split('T')[1]?.substring(0, 5) ?? '';
    const endTime = matchingEnd
      ? matchingEnd.scheduledAt.split('T')[1]?.substring(0, 5) ?? ''
      : '';

    return {
      date: startDate,
      startTime,
      endTime,
      locationName: start.locationName ?? '',
      locationId: start.locationId ?? undefined,
      locationGoogleMapsUrl: start.locationGoogleMapsUrl ?? null,
      roomName: start.roomName ?? '',
    };
  });
}
