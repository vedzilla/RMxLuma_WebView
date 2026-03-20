"use client";

import { useState, useCallback } from "react";
import type { AnalyticsData, PostHogAnalyticsData } from "@/lib/supabase/types";
import { createAuthBrowserClient } from "@/supabase_lib/auth/browser";
import { fetchSocietyAnalytics, fetchPostHogAnalytics } from "@/supabase_lib/analytics";

type TimeRange = "7d" | "30d" | "90d";

export function useAnalytics(societyId: string | undefined) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [posthogData, setPosthogData] = useState<PostHogAnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(
    async (timeRange: TimeRange = "30d") => {
      if (!societyId) return;
      setLoading(true);
      setError(null);

      try {
        const supabase = createAuthBrowserClient();
        const [analyticsResult, posthogResult] = await Promise.allSettled([
          fetchSocietyAnalytics(supabase, societyId, timeRange),
          fetchPostHogAnalytics(supabase, societyId, timeRange),
        ]);

        if (analyticsResult.status === "fulfilled") {
          setAnalytics(analyticsResult.value);
        } else {
          console.error("[useAnalytics] analytics fetch failed:", analyticsResult.reason);
          setAnalytics(null);
          setError(
            analyticsResult.reason instanceof Error
              ? analyticsResult.reason.message
              : "Failed to load analytics"
          );
        }

        if (posthogResult.status === "fulfilled") {
          setPosthogData(posthogResult.value);
        } else {
          // PostHog failure is non-fatal — views will show as 0
          console.warn("[useAnalytics] PostHog fetch failed:", posthogResult.reason);
          setPosthogData(null);
        }
      } catch (err) {
        console.error("[useAnalytics] unexpected error:", err);
        setError(err instanceof Error ? err.message : "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    },
    [societyId]
  );

  return { analytics, posthogData, loading, error, fetchAnalytics };
}
