"use client";

import { useState, useEffect } from "react";
import { getCategories } from "@/supabase_lib/categories";
import type { Category } from "@/supabase_lib/types";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories().then((data) => {
      setCategories(data);
      setLoading(false);
    });
  }, []);

  return { categories, loading };
}
