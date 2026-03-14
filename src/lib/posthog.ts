const POSTHOG_API_URL = "https://eu.posthog.com/api/projects/134688/query/";

async function executeHogQLQuery(sql: string): Promise<{ columns: string[]; results: unknown[][] }> {
  const apiKey = process.env.POSTHOG_PERSONAL_API_KEY;
  if (!apiKey) {
    throw new Error("POSTHOG_PERSONAL_API_KEY environment variable is not set");
  }

  const res = await fetch(POSTHOG_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      query: { kind: "HogQLQuery", query: sql },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`PostHog API error ${res.status}: ${body}`);
  }

  const data = await res.json();
  return { columns: data.columns ?? [], results: data.results ?? [] };
}

// ---- Types ----

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

// ---- Queries ----

function buildDateFilter(days: number): string {
  return `timestamp >= now() - interval ${days} day`;
}

async function fetchTotalUsers(): Promise<number> {
  const { results } = await executeHogQLQuery(
    `SELECT count(DISTINCT person_id) FROM events WHERE event = 'onboarding_completed'`
  );
  return Number(results[0]?.[0] ?? 0);
}

async function fetchNewUsersTrend(days: number): Promise<StatisticsData["newUsersTrend"]> {
  const { results } = await executeHogQLQuery(
    `SELECT toDate(timestamp) AS day, count(DISTINCT person_id)
     FROM events
     WHERE event = 'onboarding_completed' AND ${buildDateFilter(days)}
     GROUP BY day ORDER BY day`
  );
  return results.map((r) => ({ date: String(r[0]), count: Number(r[1]) }));
}

async function fetchActiveUsers(days: number): Promise<number> {
  const { results } = await executeHogQLQuery(
    `SELECT count(DISTINCT person_id)
     FROM events
     WHERE event = 'event_opened' AND ${buildDateFilter(days)}`
  );
  return Number(results[0]?.[0] ?? 0);
}

async function fetchRetentionTrend(days: number): Promise<StatisticsData["retentionTrend"]> {
  const { results } = await executeHogQLQuery(
    `SELECT toStartOfWeek(timestamp) AS week, count(DISTINCT person_id)
     FROM events
     WHERE event IN ('event_opened', 'screen_viewed') AND ${buildDateFilter(days)}
     GROUP BY week ORDER BY week`
  );
  return results.map((r) => ({ week: String(r[0]), count: Number(r[1]) }));
}

async function fetchReturningUsers(days: number): Promise<number> {
  const { results } = await executeHogQLQuery(
    `SELECT count() FROM (
       SELECT person_id, count(DISTINCT toStartOfWeek(timestamp)) AS weeks
       FROM events
       WHERE event IN ('event_opened', 'screen_viewed') AND ${buildDateFilter(days)}
       GROUP BY person_id
       HAVING weeks >= 2
     )`
  );
  return Number(results[0]?.[0] ?? 0);
}

async function fetchAvgEventsPerUser(days: number): Promise<number> {
  const { results } = await executeHogQLQuery(
    `SELECT avg(event_count) FROM (
       SELECT person_id, count() AS event_count
       FROM events
       WHERE event = 'event_opened' AND ${buildDateFilter(days)}
       GROUP BY person_id
     )`
  );
  return Math.round((Number(results[0]?.[0] ?? 0)) * 10) / 10;
}

async function fetchTopEvents(days: number): Promise<StatisticsData["topEvents"]> {
  const { results } = await executeHogQLQuery(
    `SELECT properties.event_title AS title, count() AS opens, count(DISTINCT person_id) AS unique_users
     FROM events
     WHERE event = 'event_opened' AND ${buildDateFilter(days)} AND properties.event_title IS NOT NULL
     GROUP BY title ORDER BY opens DESC LIMIT 10`
  );
  return results.map((r) => ({
    title: String(r[0]),
    opens: Number(r[1]),
    uniqueUsers: Number(r[2]),
  }));
}

async function fetchRsvpRates(days: number): Promise<StatisticsData["rsvpRates"]> {
  const { results } = await executeHogQLQuery(
    `SELECT
       properties.event_title AS title,
       countIf(event = 'event_rsvp') AS rsvps,
       countIf(event = 'event_unrsvp') AS unrsvps
     FROM events
     WHERE event IN ('event_rsvp', 'event_unrsvp') AND ${buildDateFilter(days)} AND properties.event_title IS NOT NULL
     GROUP BY title ORDER BY rsvps DESC LIMIT 10`
  );
  return results.map((r) => ({
    title: String(r[0]),
    rsvps: Number(r[1]),
    unrsvps: Number(r[2]),
  }));
}

async function fetchLikesPerEvent(days: number): Promise<StatisticsData["likesPerEvent"]> {
  const { results } = await executeHogQLQuery(
    `SELECT
       properties.event_title AS title,
       countIf(event = 'event_liked') AS likes,
       countIf(event = 'event_unliked') AS unlikes
     FROM events
     WHERE event IN ('event_liked', 'event_unliked') AND ${buildDateFilter(days)} AND properties.event_title IS NOT NULL
     GROUP BY title ORDER BY likes DESC LIMIT 10`
  );
  return results.map((r) => ({
    title: String(r[0]),
    likes: Number(r[1]),
    unlikes: Number(r[2]),
  }));
}

async function fetchScreenViews(days: number): Promise<StatisticsData["screenViews"]> {
  const { results } = await executeHogQLQuery(
    `SELECT properties.screen_name AS screen, count() AS views
     FROM events
     WHERE event = 'screen_viewed' AND ${buildDateFilter(days)} AND properties.screen_name IS NOT NULL
     GROUP BY screen ORDER BY views DESC LIMIT 15`
  );
  return results.map((r) => ({ screen: String(r[0]), views: Number(r[1]) }));
}

async function fetchSocietyFollowerGrowth(days: number): Promise<StatisticsData["societyFollowerGrowth"]> {
  const { results } = await executeHogQLQuery(
    `SELECT
       properties.society_name AS name,
       countIf(event = 'society_followed') AS followed,
       countIf(event = 'society_unfollowed') AS unfollowed,
       followed - unfollowed AS net
     FROM events
     WHERE event IN ('society_followed', 'society_unfollowed') AND ${buildDateFilter(days)} AND properties.society_name IS NOT NULL
     GROUP BY name ORDER BY net DESC LIMIT 10`
  );
  return results.map((r) => ({
    name: String(r[0]),
    followed: Number(r[1]),
    unfollowed: Number(r[2]),
    net: Number(r[3]),
  }));
}

async function fetchSocietyProfileViews(days: number): Promise<StatisticsData["societyProfileViews"]> {
  const { results } = await executeHogQLQuery(
    `SELECT properties.society_name AS name, count() AS views
     FROM events
     WHERE event = 'society_profile_viewed' AND ${buildDateFilter(days)} AND properties.society_name IS NOT NULL
     GROUP BY name ORDER BY views DESC LIMIT 10`
  );
  return results.map((r) => ({ name: String(r[0]), views: Number(r[1]) }));
}

// ---- Main fetch ----

export async function fetchStatistics(days: number): Promise<StatisticsData> {
  // Batch 1: User metrics
  const [totalUsers, newUsersTrend, activeUsers] = await Promise.all([
    fetchTotalUsers(),
    fetchNewUsersTrend(days),
    fetchActiveUsers(days),
  ]);

  // Batch 2: Retention
  const [retentionTrend, returningUsers, avgEventsPerUser] = await Promise.all([
    fetchRetentionTrend(days),
    fetchReturningUsers(days),
    fetchAvgEventsPerUser(days),
  ]);

  // Batch 3: Event engagement
  const [topEvents, rsvpRates, likesPerEvent] = await Promise.all([
    fetchTopEvents(days),
    fetchRsvpRates(days),
    fetchLikesPerEvent(days),
  ]);

  // Batch 4: Screens + societies
  const [screenViews, societyFollowerGrowth, societyProfileViews] = await Promise.all([
    fetchScreenViews(days),
    fetchSocietyFollowerGrowth(days),
    fetchSocietyProfileViews(days),
  ]);

  return {
    totalUsers,
    newUsersTrend,
    activeUsers,
    retentionTrend,
    returningUsers,
    avgEventsPerUser,
    topEvents,
    rsvpRates,
    likesPerEvent,
    screenViews,
    societyFollowerGrowth,
    societyProfileViews,
  };
}
