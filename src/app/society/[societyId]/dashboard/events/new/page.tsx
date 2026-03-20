"use client";

import { useRouter } from "next/navigation";
import { useDashboardNav } from "@/hooks/useDashboardNav";
import { useSocietyAuth } from "@/hooks/useSocietyAuth";
import { useEvents } from "@/hooks/useEvents";
import { EventForm, type EventFormData } from "@/components/events/EventForm";
import { mockCategories } from "@/lib/mock-data";
import { toast } from "sonner";

export default function CreateEventPage() {
  const router = useRouter();
  const nav = useDashboardNav();
  const { society } = useSocietyAuth();
  const { createEvent } = useEvents(society?.id);

  const handleSubmit = async (formData: EventFormData & { images: File[] }) => {
    try {
      // Resolve category IDs to names for the edge function
      const categoryNames = formData.categoryIds
        .map((id) => mockCategories.find((c) => c.id === id)?.name)
        .filter((name): name is string => !!name);

      await createEvent(formData, categoryNames);

      toast.success("Event created successfully.");
      router.push(nav.href("/events"));
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create event"
      );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create Event</h1>
        <p className="text-muted-foreground">
          Add a new event for your society
        </p>
      </div>

      <EventForm onSubmit={handleSubmit} />
    </div>
  );
}
