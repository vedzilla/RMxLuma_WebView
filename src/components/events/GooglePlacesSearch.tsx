"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Map,
  AdvancedMarker,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, MapPin, X, Loader2 } from "lucide-react";

export interface GooglePlaceResult {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  googleMapsUrl: string;
  googlePlaceId: string;
}

interface GooglePlacesSearchProps {
  onConfirm: (place: GooglePlaceResult) => void;
  onCancel: () => void;
}

// Manchester city centre as default bias
const MANCHESTER_CENTRE = { lat: 53.4808, lng: -2.2426 };

export function GooglePlacesSearch({ onConfirm, onCancel }: GooglePlacesSearchProps) {
  const placesLib = useMapsLibrary("places");

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompleteSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<GooglePlaceResult | null>(null);
  const [markerPos, setMarkerPos] = useState(MANCHESTER_CENTRE);
  const [mapCenter, setMapCenter] = useState(MANCHESTER_CENTRE);

  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const inputWrapperRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Create session token on first focus
  const ensureSessionToken = useCallback(() => {
    if (!sessionTokenRef.current && placesLib) {
      sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();
    }
  }, [placesLib]);

  const updateDropdownPos = useCallback(() => {
    if (!inputWrapperRef.current) return;
    const rect = inputWrapperRef.current.getBoundingClientRect();
    setDropdownPos({
      top: rect.bottom + window.scrollY + 4,
      left: rect.left + window.scrollX,
      width: rect.width,
    });
  }, []);

  // Autocomplete search with debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim() || !placesLib) {
      setSuggestions([]);
      setDropdownOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      ensureSessionToken();
      setLoading(true);
      updateDropdownPos();

      try {
        const request: google.maps.places.AutocompleteRequest = {
          input: query,
          sessionToken: sessionTokenRef.current!,
          locationBias: {
            center: MANCHESTER_CENTRE,
            radius: 10000,
          } as google.maps.places.LocationBias,
          includedRegionCodes: ["gb"],
        };

        const { suggestions: results } =
          await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);

        setSuggestions(results);
        setDropdownOpen(results.length > 0);
      } catch (err) {
        console.error("[GooglePlacesSearch] autocomplete error:", err);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, placesLib, ensureSessionToken, updateDropdownPos]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        inputWrapperRef.current && !inputWrapperRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSelectSuggestion(suggestion: google.maps.places.AutocompleteSuggestion) {
    const placePrediction = suggestion.placePrediction;
    if (!placePrediction) return;

    setDropdownOpen(false);
    setLoading(true);

    try {
      const place = placePrediction.toPlace();
      await place.fetchFields({
        fields: ["location", "formattedAddress", "displayName"],
      });

      // Session token consumed after fetchFields
      sessionTokenRef.current = null;

      const lat = place.location?.lat() ?? MANCHESTER_CENTRE.lat;
      const lng = place.location?.lng() ?? MANCHESTER_CENTRE.lng;

      const result: GooglePlaceResult = {
        name: place.displayName ?? placePrediction.text?.text ?? query,
        address: place.formattedAddress ?? "",
        latitude: lat,
        longitude: lng,
        googleMapsUrl: `https://www.google.com/maps/place/?q=place_id:${placePrediction.placeId}`,
        googlePlaceId: placePrediction.placeId ?? "",
      };

      setSelectedPlace(result);
      setMarkerPos({ lat, lng });
      setMapCenter({ lat, lng });
      setQuery(result.name);
    } catch (err) {
      console.error("[GooglePlacesSearch] fetchFields error:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleMapClick(e: { detail: { latLng: { lat: number; lng: number } | null } }) {
    const latLng = e.detail.latLng;
    if (!latLng) return;
    setMarkerPos({ lat: latLng.lat, lng: latLng.lng });

    if (selectedPlace) {
      setSelectedPlace({ ...selectedPlace, latitude: latLng.lat, longitude: latLng.lng });
    }
  }

  function handleConfirm() {
    if (selectedPlace) {
      onConfirm(selectedPlace);
    }
  }

  return (
    <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Search Google Maps</Label>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-sm p-1 hover:bg-muted"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Search input */}
      <div ref={inputWrapperRef} className="relative">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search for a place..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedPlace(null);
            }}
            onFocus={() => {
              ensureSessionToken();
              updateDropdownPos();
              if (suggestions.length > 0) setDropdownOpen(true);
            }}
            className="pl-8"
            autoComplete="off"
          />
        </div>

        {dropdownOpen && query.trim() &&
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
                <div className="flex items-center justify-center gap-2 p-3">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Searching...</span>
                </div>
              ) : (
                <div className="p-1">
                  {suggestions.map((suggestion, i) => {
                    const text = suggestion.placePrediction?.text?.text;
                    if (!text) return null;
                    return (
                      <button
                        key={suggestion.placePrediction?.placeId ?? i}
                        type="button"
                        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-left hover:bg-muted transition-colors"
                        onClick={() => handleSelectSuggestion(suggestion)}
                      >
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span className="truncate">{text}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>,
            document.body
          )}
      </div>

      {/* Map */}
      <div className="overflow-hidden rounded-lg border border-border">
        <Map
          defaultCenter={MANCHESTER_CENTRE}
          center={mapCenter}
          defaultZoom={13}
          style={{ width: "100%", height: "220px" }}
          mapId="location-picker"
          onClick={handleMapClick}
          gestureHandling="cooperative"
          disableDefaultUI
          zoomControl
        >
          {selectedPlace && (
            <AdvancedMarker
              position={markerPos}
              draggable
              onDragEnd={(e) => {
                if (!e.latLng) return;
                const lat = e.latLng.lat();
                const lng = e.latLng.lng();
                setMarkerPos({ lat, lng });
                setSelectedPlace({ ...selectedPlace, latitude: lat, longitude: lng });
              }}
            />
          )}
        </Map>
      </div>

      {/* Selected place details + confirm */}
      {selectedPlace && (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
          <div className="min-w-0 space-y-0.5">
            <p className="text-sm font-medium truncate">{selectedPlace.name}</p>
            <p className="text-xs text-muted-foreground truncate">{selectedPlace.address}</p>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={handleConfirm}
          >
            Add location
          </Button>
        </div>
      )}
    </div>
  );
}
