"use client";

import { useMemo, useState } from "react";
import { useSocietyAuth } from "@/hooks/useSocietyAuth";
import { StatCard } from "@/components/dashboard/StatCard";
import { DateRangeFilter } from "@/components/dashboard/DateRangeFilter";
import { FollowerGrowthChart } from "@/components/charts/FollowerGrowthChart";
import { Users, Info } from "lucide-react";

type TimeRange = "7d" | "30d" | "90d";

function generateMockGrowth(days: number): Array<{ date: string; count: number }> {
  const data: Array<{ date: string; count: number }> = [];
  const now = new Date();
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split("T")[0],
      count: Math.floor(Math.random() * 8) + 1,
    });
  }
  return data;
}

export default function FollowersPage() {
  const { profile, loading } = useSocietyAuth();
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");

  const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
  const mockGrowth = useMemo(() => generateMockGrowth(days), [days]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Followers</h1>
          <p className="text-muted-foreground">
            Track your society&apos;s follower growth over time
          </p>
        </div>
        <DateRangeFilter value={timeRange} onChange={setTimeRange} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Followers"
          value={profile?.follow_count ?? 0}
          icon={Users}
          loading={loading}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Info className="h-4 w-4 shrink-0" />
          <span>Growth chart shows demo data. Real historical tracking coming soon.</span>
        </div>
        <FollowerGrowthChart data={mockGrowth} loading={loading} />
      </div>
    </div>
  );
}
