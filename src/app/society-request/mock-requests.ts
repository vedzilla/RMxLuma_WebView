// TODO: Remove mock data once backend request API is implemented.
// This module assigns deterministic mock statuses to societies for UI demonstration.
// First 5 alphabetically (without a real status) = pending, next 3 = rejected, rest = available.

import type { Society, SocietyAccountWithSociety } from '@/supabase_lib/types';
import type { RequestStatus } from './types';

export function getMockStatuses(
  allSocieties: Society[],
  existingAccounts: SocietyAccountWithSociety[],
): Map<string, RequestStatus> {
  const statusMap = new Map<string, RequestStatus>();

  // Apply real statuses from existing accounts first
  for (const account of existingAccounts) {
    const status = account.society_account_approval_status.name as RequestStatus;
    statusMap.set(account.society_id, status);
  }

  // For societies without a real status, assign mock statuses deterministically
  const unassigned = allSocieties
    .filter((s) => !statusMap.has(s.id))
    .sort((a, b) => a.name.localeCompare(b.name));

  let pendingCount = 0;
  let rejectedCount = 0;

  for (const society of unassigned) {
    if (pendingCount < 5) {
      statusMap.set(society.id, 'pending');
      pendingCount++;
    } else if (rejectedCount < 3) {
      statusMap.set(society.id, 'rejected');
      rejectedCount++;
    } else {
      statusMap.set(society.id, 'available');
    }
  }

  return statusMap;
}
