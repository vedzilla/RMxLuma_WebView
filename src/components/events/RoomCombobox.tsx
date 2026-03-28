"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Input } from "@/components/ui/input";
import { Check, DoorOpen, X } from "lucide-react";
import { getRoomsForBuilding, type RoomOption } from "@/supabase_lib/buildings";
import { cn } from "@/lib/utils";

interface RoomComboboxProps {
  buildingId: string;
  roomName: string;
  roomId?: string;
  onSelect: (name: string, id: string) => void;
  onClear: () => void;
  onFreeText: (name: string) => void;
  id?: string;
}

export function RoomCombobox({
  buildingId,
  roomName,
  roomId,
  onSelect,
  onClear,
  onFreeText,
  id,
}: RoomComboboxProps) {
  const [query, setQuery] = useState("");
  const [allRooms, setAllRooms] = useState<RoomOption[]>([]);
  const [filtered, setFiltered] = useState<RoomOption[]>([]);
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  const isConfirmed = !!roomId;

  // Load rooms when building changes
  useEffect(() => {
    setLoaded(false);
    setAllRooms([]);
    getRoomsForBuilding(buildingId).then((rooms) => {
      setAllRooms(rooms);
      setLoaded(true);
    });
  }, [buildingId]);

  // Filter rooms by query
  useEffect(() => {
    if (!query.trim()) {
      setFiltered(allRooms);
    } else {
      const q = query.toLowerCase();
      setFiltered(allRooms.filter((r) => r.name.toLowerCase().includes(q)));
    }
  }, [query, allRooms]);

  const updatePosition = useCallback(() => {
    if (!inputRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();
    setDropdownPos({
      top: rect.bottom + window.scrollY + 4,
      left: rect.left + window.scrollX,
      width: rect.width,
    });
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        inputRef.current && !inputRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setOpen(false);
        // If user typed something but didn't select, treat as free-text room name
        if (query.trim() && !roomId) {
          onFreeText(query.trim());
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [query, roomId, onFreeText]);

  function handleSelect(room: RoomOption) {
    onSelect(room.name, room.id);
    setQuery("");
    setOpen(false);
  }

  function handleClear() {
    onClear();
    setQuery("");
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
        <span className="truncate flex-1">{roomName}</span>
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

  // No rooms exist for this building — show free-text input
  if (loaded && allRooms.length === 0) {
    return (
      <Input
        id={id}
        type="text"
        placeholder="e.g. Room 3.204"
        value={roomName}
        onChange={(e) => onFreeText(e.target.value)}
        autoComplete="off"
      />
    );
  }

  // Search/select state
  const showDropdown = open && loaded;

  return (
    <div ref={inputRef}>
      <Input
        id={id}
        type="text"
        placeholder="Search or type a room..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => {
          updatePosition();
          setOpen(true);
        }}
        onBlur={() => {
          // Delay to allow click events on dropdown
          setTimeout(() => {
            if (query.trim() && !roomId) {
              onFreeText(query.trim());
            }
          }, 200);
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
            {filtered.length > 0 ? (
              <div className="max-h-40 overflow-y-auto p-1">
                {filtered.map((room) => (
                  <button
                    key={room.id}
                    type="button"
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-left hover:bg-muted transition-colors"
                    onClick={() => handleSelect(room)}
                  >
                    <DoorOpen className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate">
                      {room.name}
                      {room.floor && (
                        <span className="ml-1 text-muted-foreground">
                          (Floor {room.floor})
                        </span>
                      )}
                    </span>
                  </button>
                ))}
              </div>
            ) : query.trim() ? (
              <p className="p-3 text-center text-sm text-muted-foreground">
                No matching rooms — press Enter or click away to use &quot;{query}&quot;
              </p>
            ) : (
              <p className="p-3 text-center text-sm text-muted-foreground">
                Type a room name or select from the list
              </p>
            )}
          </div>,
          document.body
        )}
    </div>
  );
}
