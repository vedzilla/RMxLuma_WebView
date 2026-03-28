"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, X, MapPin } from "lucide-react";
import { LocationCombobox } from "./LocationCombobox";
import { RoomCombobox } from "./RoomCombobox";

export interface ScheduleEntry {
  date: string;
  startTime: string;
  endTime: string;
  buildingName: string;
  buildingId?: string;
  buildingGoogleMapsUrl?: string | null;
  roomName: string;
  roomId?: string;
  description: string;
}

interface ScheduleBuilderProps {
  value: ScheduleEntry[];
  onChange: (entries: ScheduleEntry[]) => void;
}

const emptyEntry: ScheduleEntry = {
  date: "",
  startTime: "",
  endTime: "",
  buildingName: "",
  roomName: "",
  description: "",
};

export function ScheduleBuilder({ value, onChange }: ScheduleBuilderProps) {
  const [mapOpenIndex, setMapOpenIndex] = useState<number | null>(null);

  function updateEntry(index: number, field: keyof ScheduleEntry, fieldValue: string) {
    const updated = value.map((entry, i) =>
      i === index ? { ...entry, [field]: fieldValue } : entry
    );
    onChange(updated);
  }

  function selectBuilding(index: number, name: string, id: string, googleMapsUrl: string | null) {
    const updated = value.map((entry, i) =>
      i === index
        ? { ...entry, buildingName: name, buildingId: id, buildingGoogleMapsUrl: googleMapsUrl, roomName: "", roomId: undefined }
        : entry
    );
    onChange(updated);
  }

  function clearBuilding(index: number) {
    const updated = value.map((entry, i) =>
      i === index
        ? { ...entry, buildingName: "", buildingId: undefined, buildingGoogleMapsUrl: null, roomName: "", roomId: undefined }
        : entry
    );
    onChange(updated);
    setMapOpenIndex(null);
  }

  function selectRoom(index: number, name: string, id: string) {
    const updated = value.map((entry, i) =>
      i === index ? { ...entry, roomName: name, roomId: id } : entry
    );
    onChange(updated);
  }

  function clearRoom(index: number) {
    const updated = value.map((entry, i) =>
      i === index ? { ...entry, roomName: "", roomId: undefined } : entry
    );
    onChange(updated);
  }

  function setRoomFreeText(index: number, name: string) {
    const updated = value.map((entry, i) =>
      i === index ? { ...entry, roomName: name, roomId: undefined } : entry
    );
    onChange(updated);
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
                  <Label htmlFor={`schedule-building-${index}`}>Building</Label>
                  <LocationCombobox
                    id={`schedule-building-${index}`}
                    buildingName={entry.buildingName}
                    buildingId={entry.buildingId}
                    googleMapsUrl={entry.buildingGoogleMapsUrl}
                    onSelect={(name, id, url) => selectBuilding(index, name, id, url)}
                    onClear={() => clearBuilding(index)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`schedule-room-${index}`}>Room</Label>
                  {entry.buildingId ? (
                    <RoomCombobox
                      id={`schedule-room-${index}`}
                      buildingId={entry.buildingId}
                      roomName={entry.roomName}
                      roomId={entry.roomId}
                      onSelect={(name, id) => selectRoom(index, name, id)}
                      onClear={() => clearRoom(index)}
                      onFreeText={(name) => setRoomFreeText(index, name)}
                    />
                  ) : (
                    <Input
                      id={`schedule-room-${index}`}
                      type="text"
                      placeholder="Select a building first"
                      disabled
                    />
                  )}
                </div>
              </div>

              {/* Row 3: Description */}
              <div className="space-y-1.5">
                <Label htmlFor={`schedule-desc-${index}`}>
                  Activity <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Input
                  id={`schedule-desc-${index}`}
                  type="text"
                  placeholder="e.g. Pottery making, Networking drinks"
                  value={entry.description}
                  onChange={(e) => updateEntry(index, "description", e.target.value)}
                />
              </div>

              {/* Google Maps preview */}
              {entry.buildingId && entry.buildingGoogleMapsUrl && (
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
                        title={`Map — ${entry.buildingName}`}
                        src={buildMapEmbedUrl(entry.buildingGoogleMapsUrl)}
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
 */
function buildMapEmbedUrl(googleMapsUrl: string): string {
  if (googleMapsUrl.includes("/maps/embed")) return googleMapsUrl;

  try {
    const url = new URL(googleMapsUrl);
    const q = url.searchParams.get("q");
    if (q) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;
    }
  } catch {
    // not a valid URL
  }

  const placeMatch = googleMapsUrl.match(/\/maps\/place\/([^/@]+)/);
  if (placeMatch) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(decodeURIComponent(placeMatch[1]))}&output=embed`;
  }

  const placeIdMatch = googleMapsUrl.match(/place_id[=:]([A-Za-z0-9_-]+)/);
  if (placeIdMatch) {
    return `https://maps.google.com/maps?q=place_id:${placeIdMatch[1]}&output=embed`;
  }

  return `https://maps.google.com/maps?q=${encodeURIComponent(googleMapsUrl)}&output=embed`;
}
