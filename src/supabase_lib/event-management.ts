import { SupabaseClient } from '@supabase/supabase-js';
import type { CreateEventInput, UpdateEventInput } from './types';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

/** Helper: get the current session's access token or throw. */
async function getAccessToken(supabase: SupabaseClient): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('No active session');
  }
  return session.access_token;
}

/** Helper: call a Supabase edge function with auth. */
async function callEdgeFunction(
  token: string,
  functionName: string,
  body: Record<string, unknown>,
  method = 'POST'
): Promise<{ ok: boolean; status: number; data: Record<string, unknown> }> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

/**
 * Create a new event via the create-event edge function.
 * Returns the new event's UUID on success.
 */
export async function createEvent(
  supabase: SupabaseClient,
  input: CreateEventInput
): Promise<{ id: string }> {
  const token = await getAccessToken(supabase);
  const { ok, status, data } = await callEdgeFunction(token, 'create-event', input as unknown as Record<string, unknown>);

  if (!ok) {
    throw new Error(
      (data.error as string) ?? `create-event failed with status ${status}`
    );
  }

  return { id: data.id as string };
}

/**
 * Update an existing event via the update-event edge function.
 * Only the fields provided in `input` (besides event_id) will be updated.
 * Categories and schedule are replaced wholesale when provided.
 */
export async function updateEvent(
  supabase: SupabaseClient,
  input: UpdateEventInput
): Promise<void> {
  const token = await getAccessToken(supabase);
  const { ok, status, data } = await callEdgeFunction(token, 'update-event', input as unknown as Record<string, unknown>);

  if (!ok) {
    throw new Error(
      (data.error as string) ?? `update-event failed with status ${status}`
    );
  }
}

/**
 * Delete an event via the delete-event edge function.
 * Cascades to all child rows (schedule, categories, society links, images).
 */
export async function deleteEvent(
  supabase: SupabaseClient,
  eventId: string
): Promise<void> {
  const token = await getAccessToken(supabase);
  const { ok, status, data } = await callEdgeFunction(token, 'delete-event', { event_id: eventId });

  if (!ok) {
    throw new Error(
      (data.error as string) ?? `delete-event failed with status ${status}`
    );
  }
}
