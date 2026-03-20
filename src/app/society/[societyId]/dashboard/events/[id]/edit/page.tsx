"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useDashboardNav } from "@/hooks/useDashboardNav";
import { useSocietyAuth } from "@/hooks/useSocietyAuth";
import { useEvents } from "@/hooks/useEvents";
import { EventForm, type EventFormData } from "@/components/events/EventForm";
import { dashboardScheduleToForm } from "@/utils/scheduleTransform";
import { mockCategories } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function EditEventPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const nav = useDashboardNav();
  const { society } = useSocietyAuth();
  const { events, loading, fetchEvents, updateEvent } = useEvents(society?.id);

  useEffect(() => {
    if (society?.id) {
      fetchEvents();
    }
  }, [society?.id, fetchEvents]);

  const event = events.find((e) => e.id === params.id);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-4 w-64 animate-pulse rounded bg-muted" />
        <div className="h-64 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <p className="text-muted-foreground">Event not found.</p>
        <Button variant="outline" render={<Link href={nav.href("/events")} />}>
          Back to events
        </Button>
      </div>
    );
  }

  const isScraped = event.source === "scraped";

  // Reverse-map category names to mock IDs for the form
  const categoryIds = event.categories
    .map((name) => mockCategories.find((c) => c.name === name)?.id)
    .filter((id): id is string => !!id);

  const initialData = {
    title: event.title,
    description: event.description,
    categoryIds,
    schedules: dashboardScheduleToForm(event.schedules),
    isOnline: event.isOnline,
    isFree: event.isFree,
    price: event.price ?? "",
    registrationUrl: event.registrationUrl ?? "",
  };

  const handleSubmit = async (formData: EventFormData & { images: File[] }) => {
    if (!params.id) return;

    try {
      // Resolve category IDs to names for the edge function
      const categoryNames = formData.categoryIds
        .map((id) => mockCategories.find((c) => c.id === id)?.name)
        .filter((name): name is string => !!name);

      await updateEvent(params.id, formData, categoryNames);
      toast.success("Event updated successfully.");
      router.push(nav.href(`/events/${params.id}`));
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update event"
      );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit Event</h1>
        <p className="text-muted-foreground">
          {isScraped
            ? "This event was scraped from Instagram. Your edits will override the scraped data."
            : "Update your event details below."}
        </p>
      </div>

      <EventForm
        initialData={initialData}
        isScraped={isScraped}
        onSubmit={handleSubmit}
        submitLabel="Save Changes"
      />
    </div>
  );
}
