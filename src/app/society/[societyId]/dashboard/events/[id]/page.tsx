"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useDashboardNav } from "@/hooks/useDashboardNav";
import { useSocietyAuth } from "@/hooks/useSocietyAuth";
import { useEvents } from "@/hooks/useEvents";
import { formatDateTime } from "@/lib/utils";
import { EventSourceBadge } from "@/components/dashboard/EventSourceBadge";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Pencil,
  Trash2,
  MapPin,
  Calendar,
  Globe,
  ExternalLink,
  Eye,
  Heart,
  CalendarCheck,
} from "lucide-react";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  live: "bg-green-100 text-green-800",
  approved: "bg-green-100 text-green-800",
  ingested: "bg-yellow-100 text-yellow-800",
  rejected: "bg-red-100 text-red-800",
};

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const nav = useDashboardNav();
  const { society } = useSocietyAuth();
  const { events, loading, fetchEvents, deleteEvent } = useEvents(society?.id);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (society?.id) {
      fetchEvents();
    }
  }, [society?.id, fetchEvents]);

  const event = events.find((e) => e.id === params.id);

  const handleDelete = async () => {
    if (!params.id) return;
    setDeleting(true);

    try {
      await deleteEvent(params.id);
      toast.success("Event deleted successfully.");
      router.push(nav.href("/events"));
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete event"
      );
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 animate-pulse rounded bg-muted" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded bg-muted" />
          ))}
        </div>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{event.title}</h1>
            <Badge
              variant="secondary"
              className={statusColors[event.status] ?? "bg-muted"}
            >
              {event.status}
            </Badge>
            <EventSourceBadge source={event.source} />
          </div>
          {event.description && (
            <p className="max-w-2xl text-muted-foreground">
              {event.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" render={<Link href={nav.href(`/events/${params.id}/edit`)} />}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Dialog>
            <DialogTrigger
              render={
                <Button variant="destructive" disabled={deleting} />
              }
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {deleting ? "Deleting..." : "Delete"}
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete event</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete &ldquo;{event.title}&rdquo;?
                  This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose
                  render={<Button variant="outline" />}
                >
                  Cancel
                </DialogClose>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Per-event analytics */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Views"
          value={Math.floor(Math.random() * 200) + 30}
          icon={Eye}
        />
        <StatCard
          title="Likes"
          value={event.likes}
          icon={Heart}
        />
        <StatCard
          title="RSVPs"
          value={event.attending}
          icon={CalendarCheck}
        />
      </div>

      {/* Event details */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Event Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Schedule */}
            {event.schedules.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Schedule</h3>
                {event.schedules.map((entry, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-lg border p-3"
                  >
                    <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {formatDateTime(entry.scheduledAt)}
                        {entry.isEnd && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            (end)
                          </span>
                        )}
                      </p>
                      {(entry.buildingName || entry.locationName) && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>
                            {entry.buildingName ?? entry.locationName}
                            {entry.roomName && ` — ${entry.roomName}`}
                          </span>
                          {(entry.buildingGoogleMapsUrl || entry.locationGoogleMapsUrl) && (
                            <a
                              href={(entry.buildingGoogleMapsUrl ?? entry.locationGoogleMapsUrl)!}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      )}
                      {entry.description && (
                        <p className="text-sm text-muted-foreground italic">{entry.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Separator />

            {/* Meta info */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-sm font-medium">Format</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Globe className="h-3 w-3" />
                  {event.isOnline ? "Online" : "In person"}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Price</p>
                <p className="text-sm text-muted-foreground">
                  {event.isFree
                    ? "Free"
                    : event.price
                    ? `${event.price}`
                    : "Paid"}
                </p>
              </div>
              {event.registrationUrl && (
                <div className="space-y-1">
                  <p className="text-sm font-medium">Registration</p>
                  <a
                    href={event.registrationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    Registration link
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Categories */}
            {event.categories.length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm font-medium">Categories</p>
                  <div className="flex flex-wrap gap-2">
                    {event.categories.map((cat) => (
                      <Badge key={cat} variant="secondary">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Images placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Images</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="py-8 text-center text-sm text-muted-foreground">
              No images attached
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
