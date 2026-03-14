"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/StatCard";
import { DateRangeFilter } from "@/components/dashboard/DateRangeFilter";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  Users,
  UserPlus,
  Activity,
  UserCheck,
  BarChart3,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import type { StatisticsData } from "@/lib/posthog";

type TimeRange = "7d" | "30d" | "90d";

const newUsersConfig: ChartConfig = {
  count: { label: "New Users", color: "var(--chart-1)" },
};

const retentionConfig: ChartConfig = {
  count: { label: "Active Users", color: "var(--chart-2)" },
};

const topEventsConfig: ChartConfig = {
  opens: { label: "Opens", color: "var(--chart-1)" },
  uniqueUsers: { label: "Unique Users", color: "var(--chart-3)" },
};

const rsvpConfig: ChartConfig = {
  rsvps: { label: "RSVPs", color: "var(--chart-2)" },
  unrsvps: { label: "Un-RSVPs", color: "var(--chart-4)" },
};

const likesConfig: ChartConfig = {
  likes: { label: "Likes", color: "var(--chart-1)" },
  unlikes: { label: "Unlikes", color: "var(--chart-4)" },
};

const screenConfig: ChartConfig = {
  views: { label: "Views", color: "var(--chart-3)" },
};

const followerConfig: ChartConfig = {
  followed: { label: "Followed", color: "var(--chart-2)" },
  unfollowed: { label: "Unfollowed", color: "var(--chart-4)" },
};

const profileViewsConfig: ChartConfig = {
  views: { label: "Profile Views", color: "var(--chart-1)" },
};

function truncate(str: string, max: number) {
  return str.length > max ? str.slice(0, max) + "..." : str;
}

function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div
      className="animate-pulse rounded bg-muted w-full"
      style={{ height }}
    />
  );
}

export default function StatisticsPageClient() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [data, setData] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(
    async (showLoading = true) => {
      if (showLoading) setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/statistics?period=${timeRange}`);
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `HTTP ${res.status}`);
        }
        const json: StatisticsData = await res.json();
        setData(json);
        setLastUpdated(new Date());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch");
      } finally {
        setLoading(false);
      }
    },
    [timeRange]
  );

  // Fetch on mount and when timeRange changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => fetchData(false), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const retentionRate =
    data && data.totalUsers > 0
      ? Math.round((data.returningUsers / data.totalUsers) * 100)
      : 0;

  const newUsersInPeriod =
    data?.newUsersTrend.reduce((sum, d) => sum + d.count, 0) ?? 0;

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[var(--surface)] border-b border-[var(--border)] px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="flex items-center gap-1 text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Admin
            </Link>
            <h1 className="text-lg font-semibold text-[var(--text)]">
              Analytics & Statistics
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <DateRangeFilter value={timeRange} onChange={setTimeRange} />
            {lastUpdated && (
              <div className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
                <RefreshCw className="h-3 w-3" />
                {lastUpdated.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Section 1: User Acquisition */}
        <section>
          <h2 className="text-base font-semibold text-[var(--text)] mb-4">
            User Acquisition
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
            <StatCard
              title="Total Users"
              value={data?.totalUsers ?? 0}
              icon={Users}
              loading={loading}
            />
            <StatCard
              title="New Users"
              value={newUsersInPeriod}
              icon={UserPlus}
              loading={loading}
            />
            <StatCard
              title="Active Users"
              value={data?.activeUsers ?? 0}
              icon={Activity}
              loading={loading}
            />
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Daily new users</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <ChartSkeleton />
              ) : (
                <ChartContainer
                  config={newUsersConfig}
                  className="h-[300px] w-full"
                >
                  <AreaChart data={data?.newUsersTrend ?? []}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-border"
                    />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(val) =>
                        new Date(val).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                        })
                      }
                      className="text-xs"
                    />
                    <YAxis className="text-xs" allowDecimals={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="var(--chart-1)"
                      fill="var(--chart-1)"
                      fillOpacity={0.15}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Section 2: Retention */}
        <section>
          <h2 className="text-base font-semibold text-[var(--text)] mb-4">
            Retention
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <StatCard
              title="Returning Users"
              value={data?.returningUsers ?? 0}
              icon={UserCheck}
              loading={loading}
            />
            <StatCard
              title="Retention Rate"
              value={`${retentionRate}%`}
              icon={Activity}
              loading={loading}
            />
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Weekly active users
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <ChartSkeleton />
              ) : (
                <ChartContainer
                  config={retentionConfig}
                  className="h-[300px] w-full"
                >
                  <LineChart data={data?.retentionTrend ?? []}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-border"
                    />
                    <XAxis
                      dataKey="week"
                      tickFormatter={(val) =>
                        new Date(val).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                        })
                      }
                      className="text-xs"
                    />
                    <YAxis className="text-xs" allowDecimals={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="var(--chart-2)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Section 3: Event Engagement */}
        <section>
          <h2 className="text-base font-semibold text-[var(--text)] mb-4">
            Event Engagement
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <StatCard
              title="Avg Events / User"
              value={data?.avgEventsPerUser ?? 0}
              icon={BarChart3}
              loading={loading}
            />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Top Events */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Top events by opens
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <ChartSkeleton height={350} />
                ) : (
                  <ChartContainer
                    config={topEventsConfig}
                    className="h-[350px] w-full"
                  >
                    <BarChart
                      data={data?.topEvents ?? []}
                      layout="vertical"
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-border"
                      />
                      <XAxis type="number" className="text-xs" />
                      <YAxis
                        dataKey="title"
                        type="category"
                        width={120}
                        className="text-xs"
                        tickFormatter={(val) => truncate(val, 18)}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar
                        dataKey="opens"
                        fill="var(--chart-1)"
                        radius={[0, 4, 4, 0]}
                      />
                      <Bar
                        dataKey="uniqueUsers"
                        fill="var(--chart-3)"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            {/* RSVPs */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">RSVPs per event</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <ChartSkeleton height={350} />
                ) : (
                  <ChartContainer
                    config={rsvpConfig}
                    className="h-[350px] w-full"
                  >
                    <BarChart
                      data={data?.rsvpRates ?? []}
                      layout="vertical"
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-border"
                      />
                      <XAxis type="number" className="text-xs" />
                      <YAxis
                        dataKey="title"
                        type="category"
                        width={120}
                        className="text-xs"
                        tickFormatter={(val) => truncate(val, 18)}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar
                        dataKey="rsvps"
                        fill="var(--chart-2)"
                        radius={[0, 4, 4, 0]}
                      />
                      <Bar
                        dataKey="unrsvps"
                        fill="var(--chart-4)"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            {/* Likes */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Likes per event</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <ChartSkeleton height={350} />
                ) : (
                  <ChartContainer
                    config={likesConfig}
                    className="h-[350px] w-full"
                  >
                    <BarChart
                      data={data?.likesPerEvent ?? []}
                      layout="vertical"
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-border"
                      />
                      <XAxis type="number" className="text-xs" />
                      <YAxis
                        dataKey="title"
                        type="category"
                        width={120}
                        className="text-xs"
                        tickFormatter={(val) => truncate(val, 18)}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar
                        dataKey="likes"
                        fill="var(--chart-1)"
                        radius={[0, 4, 4, 0]}
                      />
                      <Bar
                        dataKey="unlikes"
                        fill="var(--chart-4)"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Section 4: Screen Views */}
        <section>
          <h2 className="text-base font-semibold text-[var(--text)] mb-4">
            Screen Views
          </h2>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Most visited screens
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <ChartSkeleton height={400} />
              ) : (
                <ChartContainer
                  config={screenConfig}
                  className="h-[400px] w-full"
                >
                  <BarChart
                    data={data?.screenViews ?? []}
                    layout="vertical"
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-border"
                    />
                    <XAxis type="number" className="text-xs" />
                    <YAxis
                      dataKey="screen"
                      type="category"
                      width={140}
                      className="text-xs"
                      tickFormatter={(val) => truncate(val, 22)}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="views"
                      fill="var(--chart-3)"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Section 5: Society Performance */}
        <section>
          <h2 className="text-base font-semibold text-[var(--text)] mb-4">
            Society Performance
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Follower Growth */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Top societies by follower growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <ChartSkeleton height={350} />
                ) : (
                  <ChartContainer
                    config={followerConfig}
                    className="h-[350px] w-full"
                  >
                    <BarChart
                      data={data?.societyFollowerGrowth ?? []}
                      layout="vertical"
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-border"
                      />
                      <XAxis type="number" className="text-xs" />
                      <YAxis
                        dataKey="name"
                        type="category"
                        width={120}
                        className="text-xs"
                        tickFormatter={(val) => truncate(val, 18)}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar
                        dataKey="followed"
                        fill="var(--chart-2)"
                        radius={[0, 4, 4, 0]}
                      />
                      <Bar
                        dataKey="unfollowed"
                        fill="var(--chart-4)"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            {/* Profile Views */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Top societies by profile views
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <ChartSkeleton height={350} />
                ) : (
                  <ChartContainer
                    config={profileViewsConfig}
                    className="h-[350px] w-full"
                  >
                    <BarChart
                      data={data?.societyProfileViews ?? []}
                      layout="vertical"
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-border"
                      />
                      <XAxis type="number" className="text-xs" />
                      <YAxis
                        dataKey="name"
                        type="category"
                        width={120}
                        className="text-xs"
                        tickFormatter={(val) => truncate(val, 18)}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar
                        dataKey="views"
                        fill="var(--chart-1)"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
