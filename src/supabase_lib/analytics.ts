import { SupabaseClient } from '@supabase/supabase-js';
import type { AnalyticsData, PostHogAnalyticsData } from '@/lib/supabase/types';

type TimeRange = '7d' | '30d' | '90d';

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
): Promise<{ ok: boolean; status: number; data: Record<string, unknown> }> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
    method: 'POST',
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
 * Fetch society analytics (followers, event stats, audience breakdown)
 * via the society-analytics edge function.
 */
export async function fetchSocietyAnalytics(
  supabase: SupabaseClient,
  societyId: string,
  timeRange: TimeRange,
): Promise<AnalyticsData> {
  const token = await getAccessToken(supabase);
  const { ok, status, data } = await callEdgeFunction(token, 'society-analytics', {
    society_id: societyId,
    time_range: timeRange,
  });

  if (!ok) {
    throw new Error(
      (data.error as string) ?? `society-analytics failed with status ${status}`
    );
  }

  // Transform snake_case response → camelCase AnalyticsData
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = data as any;

  return {
    followerCount: raw.follower_count ?? 0,
    followerGrowth: raw.follower_growth ?? [],
    totalLikes: raw.total_likes ?? 0,
    totalAttending: raw.total_attending ?? 0,
    eventStats: (raw.events ?? []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (e: any) => ({
        id: e.event_id,
        title: e.title,
        likes: e.likes ?? 0,
        attending: e.attending ?? 0,
        source: e.source ?? 'scraped',
        date: null, // edge function doesn't return event dates
      })
    ),
    audienceByUniversity: raw.audience_by_university ?? [],
    audienceByStudyLevel: raw.audience_by_study_level ?? [],
  };
}

/**
 * Fetch PostHog analytics (views, registration clicks)
 * via the society-posthog-analytics edge function.
 */
export async function fetchPostHogAnalytics(
  supabase: SupabaseClient,
  societyId: string,
  timeRange: TimeRange,
): Promise<PostHogAnalyticsData> {
  const token = await getAccessToken(supabase);
  const { ok, status, data } = await callEdgeFunction(token, 'society-posthog-analytics', {
    society_id: societyId,
    time_range: timeRange,
  });

  if (!ok) {
    throw new Error(
      (data.error as string) ?? `society-posthog-analytics failed with status ${status}`
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = data as any;

  return {
    totalViews: raw.totalViews ?? 0,
    profileViews: raw.profileViews ?? 0,
    viewsByEvent: (raw.viewsByEvent ?? []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (v: any) => ({
        eventId: v.event_id ?? v.eventId,
        views: v.views ?? 0,
      })
    ),
    registrationClicks: raw.registrationClicks ?? 0,
  };
}
