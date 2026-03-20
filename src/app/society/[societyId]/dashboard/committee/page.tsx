'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Check, X, AlertCircle } from 'lucide-react';
import { useDashboardContext } from '@/components/dashboard/DashboardContext';
import { useSocietyAuth } from '@/hooks/useSocietyAuth';
import { createAuthBrowserClient } from '@/supabase_lib/auth/browser';
import {
  getSocietyAccountsForSociety,
  getManagementPermissions,
  getCommitteePermissions,
  toggleCommitteePermission,
} from '@/supabase_lib/societies';
import { getSocietyUserDetails } from '@/supabase_lib/users';
import type { SocietyManagementPermRow } from '@/supabase_lib/types';

// ---- Types ----

interface CommitteeMember {
  accountId: string;
  authUserId: string;
  name: string | null;
  email: string | null;
  status: string;
  permissions: string[]; // permission IDs currently granted
  createdAt: string;
}

interface ApprovalRequest {
  accountId: string;
  authUserId: string;
  name: string | null;
  email: string | null;
  requestedAt: string;
  status: 'pending' | 'rejected';
}

// ---- Helpers ----

function formatPermissionName(name: string): string {
  return name
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// ---- Component ----

export default function CommitteePage() {
  const { societyId } = useDashboardContext();
  const { user, loading: authLoading } = useSocietyAuth();

  const [members, setMembers] = useState<CommitteeMember[]>([]);
  const [pendingRequests, setPendingRequests] = useState<ApprovalRequest[]>([]);
  const [rejectedRequests, setRejectedRequests] = useState<ApprovalRequest[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<SocietyManagementPermRow[]>([]);
  const [showRejected, setShowRejected] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [togglingPermissions, setTogglingPermissions] = useState<Set<string>>(new Set());

  // ---- Data Fetching ----

  const fetchCommitteeData = useCallback(async () => {
    if (!user) return;

    setDataLoading(true);
    setDataError(null);

    try {
      const supabase = createAuthBrowserClient();

      // Fetch accounts and permissions in parallel
      const [accounts, perms] = await Promise.all([
        getSocietyAccountsForSociety(supabase, societyId),
        getManagementPermissions(supabase),
      ]);

      setAvailablePermissions(perms);

      // Split accounts by status
      const memberAccounts = accounts.filter(
        (a) => {
          const status = a.society_account_approval_status?.name;
          return status === 'approved' || status === 'trusted';
        }
      );
      const pending = accounts.filter(
        (a) => a.society_account_approval_status?.name === 'pending'
      );
      const rejected = accounts.filter(
        (a) => a.society_account_approval_status?.name === 'rejected'
      );

      // Fetch committee permissions and user details in parallel
      const memberAccountIds = memberAccounts.map((a) => a.id);
      const allAccounts = [...memberAccounts, ...pending, ...rejected];

      const [committeePerms, ...userDetails] = await Promise.all([
        getCommitteePermissions(supabase, memberAccountIds),
        ...allAccounts.map((a) => getSocietyUserDetails(supabase, a.auth_user_id)),
      ]);

      // Build a map of accountId → permission IDs
      const permsByAccount = new Map<string, string[]>();
      for (const cp of committeePerms) {
        const existing = permsByAccount.get(cp.society_account_id) ?? [];
        existing.push(cp.permission_id);
        permsByAccount.set(cp.society_account_id, existing);
      }

      // Build a map of authUserId → user details
      const detailsByUserId = new Map<string, { name: string | null; email: string | null }>();
      allAccounts.forEach((account, i) => {
        detailsByUserId.set(account.auth_user_id, userDetails[i]);
      });

      // Build member list
      setMembers(
        memberAccounts.map((a) => {
          const details = detailsByUserId.get(a.auth_user_id);
          return {
            accountId: a.id,
            authUserId: a.auth_user_id,
            name: details?.name ?? null,
            email: details?.email ?? null,
            status: a.society_account_approval_status?.name ?? 'approved',
            permissions: permsByAccount.get(a.id) ?? [],
            createdAt: a.created_at,
          };
        })
      );

      // Build request lists
      const buildRequest = (a: typeof accounts[number]): ApprovalRequest => {
        const details = detailsByUserId.get(a.auth_user_id);
        return {
          accountId: a.id,
          authUserId: a.auth_user_id,
          name: details?.name ?? null,
          email: details?.email ?? null,
          requestedAt: a.created_at,
          status: a.society_account_approval_status?.name as 'pending' | 'rejected',
        };
      };

      setPendingRequests(pending.map(buildRequest));
      setRejectedRequests(rejected.map(buildRequest));
    } catch (err) {
      console.error('[CommitteePage] fetch error:', err);
      setDataError('Failed to load committee data. Please try again.');
    } finally {
      setDataLoading(false);
    }
  }, [user, societyId]);

  const hasFetched = useRef(false);
  useEffect(() => {
    if (user && !hasFetched.current) {
      hasFetched.current = true;
      fetchCommitteeData();
    }
  }, [user, fetchCommitteeData]);

  // ---- Handlers ----

  const handlePermissionToggle = useCallback(
    async (accountId: string, authUserId: string, permissionId: string) => {
      const toggleKey = `${accountId}:${permissionId}`;

      // Prevent double-clicks while in flight
      if (togglingPermissions.has(toggleKey)) return;

      // Optimistic update
      setMembers((prev) =>
        prev.map((m) => {
          if (m.accountId !== accountId) return m;
          const has = m.permissions.includes(permissionId);
          return {
            ...m,
            permissions: has
              ? m.permissions.filter((p) => p !== permissionId)
              : [...m.permissions, permissionId],
          };
        })
      );

      setTogglingPermissions((prev) => new Set(prev).add(toggleKey));

      try {
        const supabase = createAuthBrowserClient();
        const result = await toggleCommitteePermission(supabase, authUserId, societyId, permissionId);

        if (result.success) {
          const permName = formatPermissionName(result.permissionName ?? '');
          toast.success(`${permName} ${result.action}`);
        } else {
          // Revert optimistic update
          setMembers((prev) =>
            prev.map((m) => {
              if (m.accountId !== accountId) return m;
              const has = m.permissions.includes(permissionId);
              return {
                ...m,
                permissions: has
                  ? m.permissions.filter((p) => p !== permissionId)
                  : [...m.permissions, permissionId],
              };
            })
          );
          toast.error(result.error ?? 'Failed to toggle permission');
        }
      } catch {
        // Revert on network error
        setMembers((prev) =>
          prev.map((m) => {
            if (m.accountId !== accountId) return m;
            const has = m.permissions.includes(permissionId);
            return {
              ...m,
              permissions: has
                ? m.permissions.filter((p) => p !== permissionId)
                : [...m.permissions, permissionId],
            };
          })
        );
        toast.error('Network error — please try again');
      } finally {
        setTogglingPermissions((prev) => {
          const next = new Set(prev);
          next.delete(toggleKey);
          return next;
        });
      }
    },
    [societyId, togglingPermissions]
  );

  // ---- Loading / Error States ----

  if (authLoading || dataLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Committee</h1>
          <p className="text-muted-foreground">Loading committee data…</p>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Committee</h1>
          <p className="text-muted-foreground">
            Manage your society&apos;s committee members and access requests.
          </p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-4">{dataError}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                hasFetched.current = false;
                fetchCommitteeData();
              }}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ---- Render ----

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Committee</h1>
        <p className="text-muted-foreground">
          Manage your society&apos;s committee members and access requests.
        </p>
      </div>

      {/* ============================================================ */}
      {/* SECTION 1: MEMBERS                                           */}
      {/* ============================================================ */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg">Members</CardTitle>
            <Badge variant="secondary">{members.length}</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {members.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-muted-foreground">No committee members yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {members.map((member) => (
                <div key={member.accountId} className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {/* Name + email */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">
                          {member.name ?? 'Unknown User'}
                        </p>
                        {member.status === 'trusted' && (
                          <Badge variant="secondary" className="text-[10px]">
                            Trusted
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {member.email ?? member.authUserId.slice(0, 8) + '…'}
                      </p>
                    </div>
                  </div>

                  {/* Permission toggles */}
                  <div className="flex flex-wrap gap-3 mt-2.5 ml-0 sm:ml-1">
                    {availablePermissions.map((perm) => {
                      const isChecked = member.permissions.includes(perm.id);
                      const toggleKey = `${member.accountId}:${perm.id}`;
                      const isToggling = togglingPermissions.has(toggleKey);
                      return (
                        <label
                          key={perm.id}
                          className={cn(
                            'flex items-center gap-1.5 select-none',
                            isToggling ? 'opacity-50 cursor-wait' : 'cursor-pointer'
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={isToggling}
                            onChange={() =>
                              handlePermissionToggle(member.accountId, member.authUserId, perm.id)
                            }
                            className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary focus:ring-offset-0"
                          />
                          <span className="text-[11px] text-muted-foreground">
                            {formatPermissionName(perm.name)}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ============================================================ */}
      {/* SECTION 2: PENDING APPROVALS                                 */}
      {/* ============================================================ */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg">Pending Approvals</CardTitle>
            <Badge variant="secondary">{pendingRequests.length}</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {pendingRequests.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-muted-foreground">No pending requests.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {pendingRequests.map((request) => (
                <div
                  key={request.accountId}
                  className="px-6 py-4 flex items-center gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {request.name ?? 'Unknown User'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {request.email ?? request.authUserId.slice(0, 8) + '…'}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0 hidden sm:block">
                    {formatDate(request.requestedAt)}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      onClick={() => toast.info('Approve coming soon')}
                    >
                      <Check className="h-3.5 w-3.5" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 border-red-200 text-red-700 hover:bg-red-50"
                      onClick={() => toast.info('Deny coming soon')}
                    >
                      <X className="h-3.5 w-3.5" />
                      Deny
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rejected profiles toggle */}
      {rejectedRequests.length > 0 && (
        <div>
          <button
            onClick={() => setShowRejected(!showRejected)}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronDown
              className={cn(
                'h-4 w-4 transition-transform duration-200',
                showRejected && 'rotate-180'
              )}
            />
            Show rejected profiles ({rejectedRequests.length})
          </button>

          {/* Rejected profiles card */}
          <div
            className="grid transition-[grid-template-rows] duration-300 ease-in-out"
            style={{ gridTemplateRows: showRejected ? '1fr' : '0fr' }}
          >
            <div className="overflow-hidden min-h-0">
              <Card className={cn('mt-3 border-red-200 transition-opacity duration-300', showRejected ? 'opacity-100' : 'opacity-0')}>
                <CardContent className="p-0">
                  <div className="divide-y divide-red-100">
                    {rejectedRequests.map((request) => (
                      <div
                        key={request.accountId}
                        className="px-6 py-4 flex items-center gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground">
                            {request.name ?? 'Unknown User'}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {request.email ?? request.authUserId.slice(0, 8) + '…'}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0 hidden sm:block">
                          {formatDate(request.requestedAt)}
                        </span>
                        <Badge
                          variant="outline"
                          className="border-red-200 bg-red-50 text-red-700 text-[10px]"
                        >
                          Rejected
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
