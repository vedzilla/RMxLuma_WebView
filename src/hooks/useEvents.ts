"use client";

import { useState, useCallback } from "react";
import { createAuthBrowserClient } from "@/supabase_lib/auth/browser";
import { getEventsForSociety } from "@/supabase_lib/events";
import {
  createEvent as createEventEdge,
  updateEvent as updateEventEdge,
  deleteEvent as deleteEventEdge,
} from "@/supabase_lib/event-management";
import { formScheduleToPayload } from "@/utils/scheduleTransform";
import type { EventFormData } from "@/components/events/EventForm";
import type { DashboardEvent } from "@/lib/supabase/types";

export function useEvents(societyId: string | undefined) {
  const [events, setEvents] = useState<DashboardEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    if (!societyId) return;
    setLoading(true);
    setError(null);
    try {
      const supabase = createAuthBrowserClient();
      const data = await getEventsForSociety(supabase, societyId);
      setEvents(data);
    } catch (err) {
      console.error("[useEvents] fetchEvents error:", err);
      setError(err instanceof Error ? err.message : "Failed to load events");
    } finally {
      setLoading(false);
    }
  }, [societyId]);

  const createEvent = async (
    formData: EventFormData,
    categoryIds: string[]
  ) => {
    if (!societyId) throw new Error("No society selected");
    const supabase = createAuthBrowserClient();
    const result = await createEventEdge(supabase, {
      society_id: societyId,
      title: formData.title,
      description: formData.description,
      categories: categoryIds,
      schedule: formScheduleToPayload(formData.schedules),
      is_online: formData.isOnline,
      is_free: formData.isFree,
      price: formData.isFree ? undefined : formData.price || undefined,
      registration_url: formData.registrationUrl || undefined,
    });
    await fetchEvents();
    return result;
  };

  const updateEvent = async (
    eventId: string,
    formData: EventFormData,
    categoryIds: string[]
  ) => {
    const supabase = createAuthBrowserClient();
    await updateEventEdge(supabase, {
      event_id: eventId,
      title: formData.title,
      description: formData.description,
      categories: categoryIds,
      schedule: formScheduleToPayload(formData.schedules),
      is_online: formData.isOnline,
      is_free: formData.isFree,
      price: formData.isFree ? undefined : formData.price || undefined,
      registration_url: formData.registrationUrl || undefined,
    });
    await fetchEvents();
  };

  const deleteEvent = async (eventId: string) => {
    const supabase = createAuthBrowserClient();
    await deleteEventEdge(supabase, eventId);
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
  };

  return {
    events,
    loading,
    error,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
  };
}
