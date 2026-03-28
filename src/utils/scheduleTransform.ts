import type { ScheduleEntry } from '@/components/events/ScheduleBuilder';
import type { ScheduleEntryInput } from '@/supabase_lib/types';

/**
 * Convert EventForm schedule entries to the edge function payload format.
 * Each form entry produces 1-2 ScheduleEntryInput objects (start + optional end).
 */
export function formScheduleToPayload(entries: ScheduleEntry[]): ScheduleEntryInput[] {
  const result: ScheduleEntryInput[] = [];
  let order = 0;

  for (const entry of entries) {
    if (!entry.date || !entry.startTime) continue;

    const locationFields: Partial<ScheduleEntryInput> = {};
    if (entry.buildingId) locationFields.building_id = entry.buildingId;
    if (entry.roomId) locationFields.room_id = entry.roomId;
    if (entry.description) locationFields.description = entry.description;

    // Start entry
    result.push({
      scheduled_at: `${entry.date}T${entry.startTime}:00.000Z`,
      is_end_schedule: false,
      schedule_order: order++,
      ...locationFields,
    });

    // End entry — no building/room/description per backend constraint
    if (entry.endTime) {
      result.push({
        scheduled_at: `${entry.date}T${entry.endTime}:00.000Z`,
        is_end_schedule: true,
        schedule_order: order++,
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
    buildingName: string | null;
    buildingId: string | null;
    buildingGoogleMapsUrl: string | null;
    roomName: string | null;
    roomId: string | null;
    description: string | null;
  }>
): ScheduleEntry[] {
  const startEntries = schedules.filter((s) => !s.isEnd);

  if (startEntries.length === 0) {
    return [{ date: '', startTime: '', endTime: '', buildingName: '', roomName: '', description: '' }];
  }

  return startEntries.map((start) => {
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
      buildingName: start.buildingName ?? '',
      buildingId: start.buildingId ?? undefined,
      buildingGoogleMapsUrl: start.buildingGoogleMapsUrl ?? null,
      roomName: start.roomName ?? '',
      roomId: start.roomId ?? undefined,
      description: start.description ?? '',
    };
  });
}
