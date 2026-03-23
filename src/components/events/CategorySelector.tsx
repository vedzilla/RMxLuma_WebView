"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";
import type { Category } from "@/supabase_lib/types";

interface CategorySelectorProps {
  value: string[];
  onChange: (ids: string[]) => void;
  categories: Category[];
  loading?: boolean;
}

export function CategorySelector({ value, onChange, categories, loading = false }: CategorySelectorProps) {

  function toggleCategory(id: string) {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-wrap gap-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-6 w-20 animate-pulse rounded-full bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const isSelected = value.includes(category.id);
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => toggleCategory(category.id)}
            >
              <Badge
                variant={isSelected ? "default" : "outline"}
                className={cn(
                  "cursor-pointer select-none px-3 py-1 text-sm transition-colors",
                  isSelected && "ring-2 ring-primary/30"
                )}
              >
                {category.name}
              </Badge>
            </button>
          );
        })}
      </div>
      {value.length > 3 && (
        <p className="flex items-center gap-1 text-sm text-destructive">
          <AlertCircle className="h-3.5 w-3.5" />
          Select up to 3 categories
        </p>
      )}
    </div>
  );
}
