'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import type { Society, SocietyAccountWithSociety } from '@/supabase_lib/types';
import type { RequestStatus } from './types';
import { MAX_PENDING_REQUESTS, PAGE_SIZE } from './types';
import { getMockStatuses } from './mock-requests';

export function useSocietyRequests(
  allSocieties: Society[],
  existingAccounts: SocietyAccountWithSociety[],
) {
  const [statusMap, setStatusMap] = useState<Map<string, RequestStatus>>(() =>
    getMockStatuses(allSocieties, existingAccounts),
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const inFlight = useRef(new Set<string>());

  // Build a lookup from society ID to Society object
  const societyById = useMemo(() => {
    const map = new Map<string, Society>();
    for (const s of allSocieties) map.set(s.id, s);
    return map;
  }, [allSocieties]);

  // Derived lists
  const pendingSocieties = useMemo(
    () =>
      allSocieties.filter((s) => statusMap.get(s.id) === 'pending'),
    [allSocieties, statusMap],
  );

  const rejectedSocieties = useMemo(
    () =>
      allSocieties.filter((s) => statusMap.get(s.id) === 'rejected'),
    [allSocieties, statusMap],
  );

  const availableSocieties = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return allSocieties.filter((s) => {
      const status = statusMap.get(s.id);
      if (status && status !== 'available') return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.instagram.toLowerCase().includes(q)
      );
    });
  }, [allSocieties, statusMap, searchQuery]);

  const displayedSocieties = useMemo(
    () => availableSocieties.slice(0, visibleCount),
    [availableSocieties, visibleCount],
  );

  const pendingCount = pendingSocieties.length;
  const isAtLimit = pendingCount >= MAX_PENDING_REQUESTS;
  const hasMore = visibleCount < availableSocieties.length;

  // Reset visible count when search changes
  const updateSearch = useCallback((q: string) => {
    setSearchQuery(q);
    setVisibleCount(PAGE_SIZE);
  }, []);

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => prev + PAGE_SIZE);
  }, []);

  // Helper to update a single society's status
  const updateStatus = useCallback(
    (societyId: string, status: RequestStatus) => {
      setStatusMap((prev) => {
        const next = new Map(prev);
        next.set(societyId, status);
        return next;
      });
    },
    [],
  );

  const requestAccess = useCallback(
    async (societyId: string) => {
      if (inFlight.current.has(societyId)) return;
      if (isAtLimit) {
        toast.error(`You can only have ${MAX_PENDING_REQUESTS} pending requests at a time`);
        return;
      }

      const prevStatus = statusMap.get(societyId) ?? 'available';
      inFlight.current.add(societyId);
      updateStatus(societyId, 'pending');

      try {
        // TODO: implement backend request — POST to create society account request
        await new Promise((resolve) => setTimeout(resolve, 500));
        toast.success(`Request sent to ${societyById.get(societyId)?.name ?? 'society'}`);
      } catch {
        updateStatus(societyId, prevStatus);
        toast.error('Failed to send request. Please try again.');
      } finally {
        inFlight.current.delete(societyId);
      }
    },
    [statusMap, isAtLimit, updateStatus, societyById],
  );

  const cancelRequest = useCallback(
    async (societyId: string) => {
      if (inFlight.current.has(societyId)) return;

      inFlight.current.add(societyId);
      updateStatus(societyId, 'available');

      try {
        // TODO: implement backend request — DELETE or update society account request
        await new Promise((resolve) => setTimeout(resolve, 500));
        toast.success('Request cancelled');
      } catch {
        updateStatus(societyId, 'pending');
        toast.error('Failed to cancel request. Please try again.');
      } finally {
        inFlight.current.delete(societyId);
      }
    },
    [updateStatus],
  );

  const reRequest = useCallback(
    async (societyId: string) => {
      if (inFlight.current.has(societyId)) return;
      if (isAtLimit) {
        toast.error(`You can only have ${MAX_PENDING_REQUESTS} pending requests at a time`);
        return;
      }

      inFlight.current.add(societyId);
      updateStatus(societyId, 'pending');

      try {
        // TODO: implement backend request — POST to re-request society account
        await new Promise((resolve) => setTimeout(resolve, 500));
        toast.success(`Request re-sent to ${societyById.get(societyId)?.name ?? 'society'}`);
      } catch {
        updateStatus(societyId, 'rejected');
        toast.error('Failed to re-send request. Please try again.');
      } finally {
        inFlight.current.delete(societyId);
      }
    },
    [isAtLimit, updateStatus, societyById],
  );

  // Infinite scroll via IntersectionObserver
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore) {
          loadMore();
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  return {
    pendingSocieties,
    rejectedSocieties,
    availableSocieties,
    displayedSocieties,
    pendingCount,
    isAtLimit,
    hasMore,
    searchQuery,
    updateSearch,
    loadMore,
    requestAccess,
    cancelRequest,
    reRequest,
    sentinelRef,
  };
}
