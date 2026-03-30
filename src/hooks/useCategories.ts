"use client";

import { mockCategories } from "@/lib/mock-data";

export function useCategories() {
  return {
    categories: mockCategories.map((c) => ({ id: c.id, name: c.name })),
    loading: false,
  };
}
