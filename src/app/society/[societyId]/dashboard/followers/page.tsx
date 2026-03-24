"use client";

import { useEffect, useState } from "react";
import { useSocietyAuth } from "@/hooks/useSocietyAuth";
import { useAnalytics } from "@/hooks/useAnalytics";
import { StatCard } from "@/components/dashboard/StatCard";
import { DateRangeFilter } from "@/components/dashboard/DateRangeFilter";
import { FollowerGrowthChart } from "@/components/charts/FollowerGrowthChart";
import { Users } from "lucide-react";
import { DashboardPageHeader, DashboardSection } from "@/components/dashboard/DashboardMotion";

type TimeRange = "7d" | "30d" | "90d";

export default function FollowersPage() {
  const { society } = useSocietyAuth();
  const { analytics, loading, fetchAnalytics } = useAnalytics(society?.id);
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");

  useEffect(() => {
    if (society?.id) {
      fetchAnalytics(timeRange);
    }
  }, [society?.id, timeRange, fetchAnalytics]);

  return (
    <div className="space-y-6">
      <DashboardPageHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Followers</h1>
            <p className="text-muted-foreground">
              Track your society&apos;s follower growth over time
            </p>
          </div>
          <DateRangeFilter value={timeRange} onChange={setTimeRange} />
        </div>
      </DashboardPageHeader>

      <DashboardSection delay={0.08}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total Followers"
            value={analytics?.followerCount ?? 0}
            icon={Users}
            loading={loading}
          />
        </div>
      </DashboardSection>

      <DashboardSection delay={0.16}>
        <FollowerGrowthChart
          data={analytics?.followerGrowth ?? []}
          loading={loading}
        />
      </DashboardSection>
    </div>
  );
}
