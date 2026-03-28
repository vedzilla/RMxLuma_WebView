"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, X, MapPin } from "lucide-react";
import { LocationCombobox } from "./LocationCombobox";

export interface ScheduleEntry {
  date: string;
  startTime: string;
  endTime: string;
  locationName: string;
  locationId?: string;
  locationGoogleMapsUrl?: string | null;
  roomName: string;
}

interface ScheduleBuilderProps {
  value: ScheduleEntry[];
  onChange: (entries: ScheduleEntry[]) => void;
}

const emptyEntry: ScheduleEntry = {
  date: "",
  startTime: "",
  endTime: "",
  locationName: "",
  roomName: "",
};

export function ScheduleBuilder({ value, onChange }: ScheduleBuilderProps) {
  const [mapOpenIndex, setMapOpenIndex] = useState<number | null>(null);

  function updateEntry(index: number, field: keyof ScheduleEntry, fieldValue: string) {
    const updated = value.map((entry, i) =>
      i === index ? { ...entry, [field]: fieldValue } : entry
    );
    onChange(updated);
  }

  function selectLocation(index: number, name: string, id: string, googleMapsUrl: string | null) {
    const updated = value.map((entry, i) =>
      i === index
        ? { ...entry, locationName: name, locationId: id, locationGoogleMapsUrl: googleMapsUrl }
        : entry
    );
    onChange(updated);
  }

  function clearLocation(index: number) {
    const updated = value.map((entry, i) =>
      i === index
        ? { ...entry, locationName: "", locationId: undefined, locationGoogleMapsUrl: null }
        : entry
    );
    onChange(updated);
    setMapOpenIndex(null);
  }

  function addEntry() {
    onChange([...value, { ...emptyEntry }]);
  }

  function removeEntry(index: number) {
    if (mapOpenIndex === index) setMapOpenIndex(null);
    onChange(value.filter((_, i) => i !== index));
  }

  function toggleMap(index: number) {
    setMapOpenIndex(mapOpenIndex === index ? null : index);
  }

  return (
    <div className="space-y-3">
      {value.map((entry, index) => (
        <Card key={index}>
          <CardContent>
            <div className="space-y-3">
              {/* Row 1: Date, Start, End */}
              <div className="flex items-start gap-3">
                <div className="grid flex-1 grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor={`schedule-date-${index}`}>Date</Label>
                    <Input
                      id={`schedule-date-${index}`}
                      type="date"
                      value={entry.date}
                      onChange={(e) => updateEntry(index, "date", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`schedule-start-${index}`}>Start time</Label>
                    <Input
                      id={`schedule-start-${index}`}
                      type="time"
                      value={entry.startTime}
                      onChange={(e) => updateEntry(index, "startTime", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`schedule-end-${index}`}>End time</Label>
                    <Input
                      id={`schedule-end-${index}`}
                      type="time"
                      value={entry.endTime}
                      onChange={(e) => updateEntry(index, "endTime", e.target.value)}
                    />
                  </div>
                </div>
                {value.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="mt-6 shrink-0"
                    onClick={() => removeEntry(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Row 2: Building + Room */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor={`schedule-location-${index}`}>Building</Label>
                  <LocationCombobox
                    id={`schedule-location-${index}`}
                    locationName={entry.locationName}
                    locationId={entry.locationId}
                    googleMapsUrl={entry.locationGoogleMapsUrl}
                    onSelect={(name, id, url) => selectLocation(index, name, id, url)}
                    onClear={() => clearLocation(index)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`schedule-room-${index}`}>Room</Label>
                  <Input
                    id={`schedule-room-${index}`}
                    type="text"
                    placeholder="e.g. Room 3.204"
                    value={entry.roomName}
                    onChange={(e) => updateEntry(index, "roomName", e.target.value)}
                  />
                </div>
              </div>

              {/* Google Maps preview button + embed */}
              {entry.locationId && entry.locationGoogleMapsUrl && (
                <div>
                  <button
                    type="button"
                    onClick={() => toggleMap(index)}
                    className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    {mapOpenIndex === index ? "Hide map" : "Show on map"}
                  </button>

                  {mapOpenIndex === index && (
                    <div className="mt-2 overflow-hidden rounded-lg border border-border">
                      <iframe
                        title={`Map — ${entry.locationName}`}
                        src={buildMapEmbedUrl(entry.locationGoogleMapsUrl)}
                        className="h-52 w-full border-0"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        allowFullScreen
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addEntry}>
        <Plus className="h-4 w-4" />
        Add another date
      </Button>
    </div>
  );
}

/**
 * Convert a Google Maps URL into an embeddable URL.
 * Accepts formats like:
 *   https://maps.google.com/?q=...
 *   https://www.google.com/maps/place/...
 *   https://goo.gl/maps/...
 * Falls back to a search-based embed using the URL as the query.
 */
function buildMapEmbedUrl(googleMapsUrl: string): string {
  // If it's already an embed URL, return as-is
  if (googleMapsUrl.includes("/maps/embed")) return googleMapsUrl;

  // Try to extract a query parameter
  try {
    const url = new URL(googleMapsUrl);
    const q = url.searchParams.get("q");
    if (q) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;
    }
  } catch {
    // not a valid URL
  }

  // Try to extract place name from /maps/place/PLACE_NAME/ format
  const placeMatch = googleMapsUrl.match(/\/maps\/place\/([^/@]+)/);
  if (placeMatch) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(decodeURIComponent(placeMatch[1]))}&output=embed`;
  }

  // Fallback: embed the entire URL as a query
  return `https://maps.google.com/maps?q=${encodeURIComponent(googleMapsUrl)}&output=embed`;
}
