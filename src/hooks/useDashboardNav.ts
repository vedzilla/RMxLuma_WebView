"use client";

export function useDashboardNav() {
  const basePath = "";
  return { basePath, href: (path: string) => path };
}
