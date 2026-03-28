"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Input } from "@/components/ui/input";
import { Check, MapPin, Search, X } from "lucide-react";
import { searchLocations } from "@/supabase_lib/locations";
import { insertLocation } from "@/supabase_lib/locations";
import { GooglePlacesSearch, type GooglePlaceResult } from "./GooglePlacesSearch";
import { cn } from "@/lib/utils";

interface LocationOption {
  id: string;
  name: string;
  google_maps_url: string | null;
}

interface LocationComboboxProps {
  locationName: string;
  locationId?: string;
  googleMapsUrl?: string | null;
  onSelect: (name: string, id: string, googleMapsUrl: string | null) => void;
  onClear: () => void;
  id?: string;
}

export function LocationCombobox({
  locationName,
  locationId,
  googleMapsUrl,
  onSelect,
  onClear,
  id,
}: LocationComboboxProps) {
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<LocationOption[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showGoogleSearch, setShowGoogleSearch] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  const isConfirmed = !!locationId;

  const updatePosition = useCallback(() => {
    if (!inputRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();
    setDropdownPos({
      top: rect.bottom + window.scrollY + 4,
      left: rect.left + window.scrollX,
      width: rect.width,
    });
  }, []);

  // Search Supabase locations with debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setOptions([]);
      setOpen(false);
      setSearched(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      updatePosition();
      const results = await searchLocations(query, 5);
      setOptions(results);
      setOpen(true);
      setSearched(true);
      setLoading(false);
    }, 200);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, updatePosition]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        inputRef.current && !inputRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(option: LocationOption) {
    onSelect(option.name, option.id, option.google_maps_url);
    setQuery("");
    setOpen(false);
    setShowGoogleSearch(false);
  }

  function handleClear() {
    onClear();
    setQuery("");
    setOptions([]);
    setShowGoogleSearch(false);
  }

  async function handleGooglePlaceConfirm(place: GooglePlaceResult) {
    // Save the new location to Supabase, then select it
    const newLocation = await insertLocation({
      name: place.name,
      address: place.address,
      latitude: place.latitude,
      longitude: place.longitude,
      google_maps_url: place.googleMapsUrl,
      google_place_id: place.googlePlaceId,
    });

    if (newLocation) {
      onSelect(newLocation.name, newLocation.id, newLocation.google_maps_url);
    }

    setQuery("");
    setOpen(false);
    setShowGoogleSearch(false);
  }

  // Confirmed state
  if (isConfirmed) {
    return (
      <div
        className={cn(
          "flex h-8 items-center gap-1.5 rounded-lg border border-input bg-transparent px-2.5 text-sm",
          "border-primary/40 bg-primary/5"
        )}
      >
        <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
        <span className="truncate flex-1">{locationName}</span>
        <button
          type="button"
          onClick={handleClear}
          className="shrink-0 rounded-sm p-0.5 hover:bg-muted"
        >
          <X className="h-3 w-3 text-muted-foreground" />
        </button>
      </div>
    );
  }

  // Google Places search panel (replaces input)
  if (showGoogleSearch) {
    return (
      <GooglePlacesSearch
        onConfirm={handleGooglePlaceConfirm}
        onCancel={() => setShowGoogleSearch(false)}
      />
    );
  }

  // Default search state
  const showDropdown = open && query.trim();

  return (
    <div ref={inputRef}>
      <Input
        id={id}
        type="text"
        placeholder="Search for a building..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => {
          updatePosition();
          if (options.length > 0) setOpen(true);
        }}
        autoComplete="off"
      />

      {showDropdown &&
        createPortal(
          <div
            ref={dropdownRef}
            className="rounded-lg border border-border bg-popover shadow-md"
            style={{
              position: "absolute",
              top: dropdownPos.top,
              left: dropdownPos.left,
              width: dropdownPos.width,
              zIndex: 9999,
            }}
          >
            {loading ? (
              <p className="p-3 text-center text-sm text-muted-foreground">Searching...</p>
            ) : (
              <>
                {options.length > 0 && (
                  <div className="p-1">
                    {options.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-left hover:bg-muted transition-colors"
                        onClick={() => handleSelect(option)}
                      >
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span className="truncate">{option.name}</span>
                      </button>
                    ))}
                  </div>
                )}

                {searched && options.length === 0 && (
                  <p className="px-3 pt-3 pb-1 text-center text-sm text-muted-foreground">
                    No saved locations found
                  </p>
                )}

                {/* Google Maps fallback */}
                {searched && (
                  <div className="border-t border-border p-1">
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-left text-primary hover:bg-muted transition-colors"
                      onClick={() => {
                        setOpen(false);
                        setShowGoogleSearch(true);
                      }}
                    >
                      <Search className="h-3.5 w-3.5 shrink-0" />
                      <span>Search Google Maps</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>,
          document.body
        )}
    </div>
  );
}
