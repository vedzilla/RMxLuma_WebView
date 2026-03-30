import { SupabaseClient } from '@supabase/supabase-js';
import type { AnalyticsData, PostHogAnalyticsData } from '@/lib/supabase/types';

export type TimeRange = '7d' | '30d' | '90d';

// ── Admin statistics types ──────────────────────────────────────────────────

export interface StatisticsData {
  totalUsers: number;
  newUsersTrend: Array<{ date: string; count: number }>;
  activeUsers: number;
  retentionTrend: Array<{ week: string; count: number }>;
  returningUsers: number;
  avgEventsPerUser: number;
  topEvents: Array<{ title: string; opens: number; uniqueUsers: number }>;
  rsvpRates: Array<{ title: string; rsvps: number; unrsvps: number }>;
  likesPerEvent: Array<{ title: string; likes: number; unlikes: number }>;
  screenViews: Array<{ screen: string; views: number }>;
  societyFollowerGrowth: Array<{ name: string; net: number; followed: number; unfollowed: number }>;
  societyProfileViews: Array<{ name: string; views: number }>;
}

const ADMIN_QUERIES = [
  'totalUsers', 'newUsersTrend', 'activeUsers', 'retentionTrend',
  'returningUsers', 'avgEventsPerUser', 'topEventsByOpens', 'rsvpRates',
  'likesPerEvent', 'screenViews', 'societyFollowerGrowth', 'societyProfileViews',
] as const;

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

// ── Admin analytics ─────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformAdminResults(results: Record<string, any>): StatisticsData {
  const scalar = (key: string): number => results[key]?.value ?? 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const trend = (key: string): Array<{ date: string; count: number }> =>
    results[key]?.trend ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items = (key: string): Array<Record<string, any>> =>
    results[key]?.items ?? [];

  return {
    totalUsers: scalar('totalUsers'),
    newUsersTrend: trend('newUsersTrend'),
    activeUsers: scalar('activeUsers'),
    retentionTrend: trend('retentionTrend').map(d => ({ week: d.date, count: d.count })),
    returningUsers: scalar('returningUsers'),
    avgEventsPerUser: Math.round(scalar('avgEventsPerUser') * 10) / 10,
    topEvents: items('topEventsByOpens').map(i => ({
      title: String(i.name),
      opens: Number(i.opens) || 0,
      uniqueUsers: Number(i.uniqueUsers) || 0,
    })),
    rsvpRates: items('rsvpRates').map(i => ({
      title: String(i.name),
      rsvps: Number(i.rsvps) || 0,
      unrsvps: Number(i.unrsvps) || 0,
    })),
    likesPerEvent: items('likesPerEvent').map(i => ({
      title: String(i.name),
      likes: Number(i.likes) || 0,
      unlikes: Number(i.unlikes) || 0,
    })),
    screenViews: items('screenViews').map(i => ({
      screen: String(i.name),
      views: Number(i.count) || 0,
    })),
    societyFollowerGrowth: items('societyFollowerGrowth').map(i => {
      const followed = Number(i.follows) || 0;
      const unfollowed = Number(i.unfollows) || 0;
      return { name: String(i.name), followed, unfollowed, net: followed - unfollowed };
    }),
    societyProfileViews: items('societyProfileViews').map(i => ({
      name: String(i.name),
      views: Number(i.count) || 0,
    })),
  };
}

/**
 * Fetch admin analytics via the society-posthog-analytics edge function.
 */
export async function fetchAdminAnalytics(
  supabase: SupabaseClient,
  period: TimeRange,
): Promise<StatisticsData> {
  const token = await getAccessToken(supabase);
  const { ok, status, data } = await callEdgeFunction(token, 'society-posthog-analytics', {
    dashboard: 'admin',
    period,
    queries: [...ADMIN_QUERIES],
  });

  if (!ok) {
    throw new Error(
      (data.error as string) ?? `Admin analytics failed with status ${status}`
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = data as any;
  return transformAdminResults(raw.results ?? {});
}
