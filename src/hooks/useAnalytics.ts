"use client";

import { useState, useCallback } from "react";
import type { AnalyticsData, PostHogAnalyticsData } from "@/lib/supabase/types";
import { getMockAnalytics, getMockPostHogAnalytics } from "@/lib/mock-data";

type TimeRange = "7d" | "30d" | "90d";

export function useAnalytics(societyId: string | undefined) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [posthogData, setPosthogData] = useState<PostHogAnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(
    async (timeRange: TimeRange = "30d") => {
      setLoading(true);
      setError(null);

      // Simulate network delay
      await new Promise((r) => setTimeout(r, 300));

      setAnalytics(getMockAnalytics(timeRange));
      setPosthogData(getMockPostHogAnalytics());
      setLoading(false);
    },
    []
  );

  return { analytics, posthogData, loading, error, fetchAnalytics };
}
