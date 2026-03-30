"use client";

import { useState, useCallback } from "react";
import type { DashboardEvent } from "@/lib/supabase/types";
import { mockEvents } from "@/lib/mock-data";

export function useEvents(societyId: string | undefined) {
  const [events, setEvents] = useState<DashboardEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    if (!societyId) return;
    setLoading(true);
    setError(null);

    // Simulate network delay
    await new Promise((r) => setTimeout(r, 200));

    setEvents(mockEvents);
    setLoading(false);
  }, [societyId]);

  const createEvent = async (formData: Record<string, unknown>, _categoryIds?: string[]) => {
    const newEvent: DashboardEvent = {
      id: `e-${Date.now()}`,
      title: (formData.title as string) ?? "New Event",
      description: (formData.description as string) ?? "",
      date: new Date().toISOString(),
      status: "ingested",
      source: "manual",
      likes: 0,
      attending: 0,
      categories: [],
      imageUrl: null,
      registrationUrl: null,
      isOnline: false,
      isFree: true,
      price: null,
      schedules: [],
    };
    setEvents((prev) => [newEvent, ...prev]);
    return { event_id: newEvent.id, status: "ingested" };
  };

  const updateEvent = async (eventId: string, formData: Record<string, unknown>, _categoryIds?: string[]) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId
          ? { ...e, ...(formData as Partial<DashboardEvent>) }
          : e
      )
    );
  };

  const deleteEvent = async (eventId: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
  };

  return { events, loading, error, fetchEvents, createEvent, updateEvent, deleteEvent };
}
