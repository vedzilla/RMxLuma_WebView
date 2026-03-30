"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useDashboardNav } from "@/hooks/useDashboardNav";
import { useSocietyAuth } from "@/hooks/useSocietyAuth";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useEvents } from "@/hooks/useEvents";
import { StatCard } from "@/components/dashboard/StatCard";
import { DateRangeFilter } from "@/components/dashboard/DateRangeFilter";
import { EngagementChart } from "@/components/charts/EngagementChart";
import { EventSourceBadge } from "@/components/dashboard/EventSourceBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, Eye, Heart, CalendarCheck, Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { DashboardPageHeader, DashboardSection } from "@/components/dashboard/DashboardMotion";

type TimeRange = "7d" | "30d" | "90d";

export default function OverviewPage() {
  const nav = useDashboardNav();
  const { society, account } = useSocietyAuth();
  const { analytics, posthogData, loading: analyticsLoading, fetchAnalytics } =
    useAnalytics(society?.id);
  const { events, loading: eventsLoading, fetchEvents } = useEvents(society?.id);
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");

  useEffect(() => {
    if (society?.id) {
      fetchAnalytics(timeRange);
      fetchEvents();
    }
  }, [society?.id, timeRange, fetchAnalytics, fetchEvents]);

  const topEvents = [...events]
    .sort((a, b) => b.likes + b.attending - (a.likes + a.attending))
    .slice(0, 5);

  const engagementData = useMemo(() => {
    if (events.length === 0) return [];

    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    const dateMap = new Map<string, { date: string; likes: number; attending: number; views: number }>();

    // Initialise all dates in range with zeroes
    const now = new Date();
    for (let i = days; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      dateMap.set(key, { date: key, likes: 0, attending: 0, views: 0 });
    }

    // Build eventId → views lookup from PostHog data
    const viewsMap = new Map<string, number>();
    if (posthogData?.viewsByEvent) {
      for (const v of posthogData.viewsByEvent) {
        viewsMap.set(v.eventId, v.views);
      }
    }

    // Place each event's engagement on its date
    for (const event of events) {
      if (!event.date) continue;
      const dateKey = event.date.split("T")[0];
      const entry = dateMap.get(dateKey);
      if (entry) {
        entry.likes += event.likes;
        entry.attending += event.attending;
        entry.views += viewsMap.get(event.id) ?? 0;
      }
    }

    return Array.from(dateMap.values());
  }, [events, posthogData, timeRange]);

  return (
    <div className="space-y-6">
      <DashboardPageHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Overview</h1>
            <p className="text-muted-foreground">
              Welcome back, {society?.name ?? "..."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <DateRangeFilter value={timeRange} onChange={setTimeRange} />
            <Button className="bg-dashboard-cta hover:bg-dashboard-cta/90 text-white" render={<Link href={nav.href("/events/new")} />}>
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </div>
        </div>
      </DashboardPageHeader>

      {/* Stat cards */}
      <DashboardSection delay={0.08}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Followers"
            value={analytics?.followerCount ?? 0}
            icon={Users}
            loading={analyticsLoading}
          />
          <StatCard
            title="Event Views"
            value={posthogData?.totalViews ?? 0}
            icon={Eye}
            loading={analyticsLoading}
          />
          <StatCard
            title="Total Likes"
            value={analytics?.totalLikes ?? 0}
            icon={Heart}
            loading={analyticsLoading}
          />
          <StatCard
            title="Total RSVPs"
            value={analytics?.totalAttending ?? 0}
            icon={CalendarCheck}
            loading={analyticsLoading}
          />
        </div>
      </DashboardSection>

      {/* Engagement chart */}
      <DashboardSection delay={0.16}>
        <EngagementChart data={engagementData} loading={analyticsLoading} />
      </DashboardSection>

      {/* Top events table */}
      <DashboardSection delay={0.24}>
      <Card className="transition-all duration-[120ms] hover:-translate-y-0.5 hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Top Events</CardTitle>
          <Button variant="ghost" size="sm" render={<Link href={nav.href("/events")} />}>
            View all
          </Button>
        </CardHeader>
        <CardContent>
          {eventsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded bg-muted" />
              ))}
            </div>
          ) : topEvents.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No events yet.{" "}
              <Link href={nav.href("/events/new")} className="text-primary hover:underline">
                Create your first event
              </Link>
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead className="text-right">Likes</TableHead>
                  <TableHead className="text-right">RSVPs</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <Link
                        href={nav.href(`/events/${event.id}`)}
                        className="font-medium hover:text-primary"
                      >
                        {event.title}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {event.date ? formatDate(event.date) : "TBD"}
                    </TableCell>
                    <TableCell>
                      <EventSourceBadge source={event.source} />
                    </TableCell>
                    <TableCell className="text-right">{event.likes}</TableCell>
                    <TableCell className="text-right">
                      {event.attending}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      </DashboardSection>
    </div>
  );
}
