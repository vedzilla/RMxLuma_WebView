"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useDashboardNav } from "@/hooks/useDashboardNav";
import { useSocietyAuth } from "@/hooks/useSocietyAuth";
import { useEvents } from "@/hooks/useEvents";
import { EventTable } from "@/components/events/EventTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DashboardPageHeader, DashboardSection } from "@/components/dashboard/DashboardMotion";

export default function EventsPage() {
  const nav = useDashboardNav();
  const { society } = useSocietyAuth();
  const { events, loading, error, fetchEvents } = useEvents(society?.id);

  useEffect(() => {
    if (society?.id) {
      fetchEvents();
    }
  }, [society?.id, fetchEvents]);

  return (
    <div className="space-y-6">
      <DashboardPageHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Events</h1>
            <p className="text-muted-foreground">
              Manage and track all your society events
            </p>
          </div>
          <Button className="bg-dashboard-cta hover:bg-dashboard-cta/90 text-white" render={<Link href={nav.href("/events/new")} />}>
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </div>
      </DashboardPageHeader>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <DashboardSection delay={0.08}>
        <EventTable events={events} loading={loading} basePath={nav.basePath} />
      </DashboardSection>
    </div>
  );
}
