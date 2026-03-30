'use client';

import { useState } from 'react';
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
import { ChevronDown, Check, X } from 'lucide-react';

// ---- Types ----

interface CommitteeMember {
  accountId: string;
  authUserId: string;
  name: string | null;
  email: string | null;
  status: string;
  roleName: string | null;
  permissions: string[];
}

interface ApprovalRequest {
  accountId: string;
  authUserId: string;
  name: string | null;
  email: string | null;
  requestedAt: string;
  status: 'pending' | 'rejected';
}

// ---- Mock Data ----

const MOCK_PERMISSIONS = [
  { id: 'p-001', name: 'event_management' },
  { id: 'p-002', name: 'society_profile' },
  { id: 'p-003', name: 'member_management' },
  { id: 'p-004', name: 'view_analytics' },
];

const INITIAL_MEMBERS: CommitteeMember[] = [
  {
    accountId: 'sa-001',
    authUserId: 'auth-001',
    name: 'Alice Johnson',
    email: 'alice.j@student.manchester.ac.uk',
    status: 'trusted',
    roleName: 'President',
    permissions: ['p-001', 'p-002', 'p-003', 'p-004'],
  },
  {
    accountId: 'sa-002',
    authUserId: 'auth-002',
    name: 'Ben Carter',
    email: 'ben.carter@student.manchester.ac.uk',
    status: 'approved',
    roleName: 'Vice President',
    permissions: ['p-001', 'p-002', 'p-004'],
  },
  {
    accountId: 'sa-003',
    authUserId: 'auth-003',
    name: 'Chloe Williams',
    email: 'chloe.w@student.manchester.ac.uk',
    status: 'approved',
    roleName: 'Treasurer',
    permissions: ['p-004'],
  },
  {
    accountId: 'sa-004',
    authUserId: 'auth-004',
    name: 'David Lee',
    email: 'david.lee@student.manchester.ac.uk',
    status: 'approved',
    roleName: 'Events Officer',
    permissions: ['p-001'],
  },
  {
    accountId: 'sa-005',
    authUserId: 'auth-005',
    name: 'Emma Patel',
    email: 'emma.p@student.manchester.ac.uk',
    status: 'approved',
    roleName: 'Social Sec',
    permissions: ['p-001', 'p-002'],
  },
];

const INITIAL_PENDING: ApprovalRequest[] = [
  {
    accountId: 'sa-006',
    authUserId: 'auth-006',
    name: 'Fatima Khan',
    email: 'fatima.k@student.manchester.ac.uk',
    requestedAt: '2026-03-18T10:30:00Z',
    status: 'pending',
  },
  {
    accountId: 'sa-007',
    authUserId: 'auth-007',
    name: 'George Chen',
    email: 'george.c@student.manchester.ac.uk',
    requestedAt: '2026-03-15T14:20:00Z',
    status: 'pending',
  },
];

const INITIAL_REJECTED: ApprovalRequest[] = [
  {
    accountId: 'sa-008',
    authUserId: 'auth-008',
    name: 'Hannah Brooks',
    email: 'hannah.b@student.manchester.ac.uk',
    requestedAt: '2026-03-10T09:00:00Z',
    status: 'rejected',
  },
  {
    accountId: 'sa-009',
    authUserId: 'auth-009',
    name: 'Ian Murray',
    email: 'ian.m@student.manchester.ac.uk',
    requestedAt: '2026-03-05T11:45:00Z',
    status: 'rejected',
  },
];

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
  const [members, setMembers] = useState<CommitteeMember[]>(INITIAL_MEMBERS);
  const [pendingRequests, setPendingRequests] = useState<ApprovalRequest[]>(INITIAL_PENDING);
  const [rejectedRequests] = useState<ApprovalRequest[]>(INITIAL_REJECTED);
  const [showRejected, setShowRejected] = useState(false);

  // ---- Handlers ----

  const handlePermissionToggle = (accountId: string, permissionId: string) => {
    const perm = MOCK_PERMISSIONS.find((p) => p.id === permissionId);
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
    toast.success(`${formatPermissionName(perm?.name ?? '')} ${members.find((m) => m.accountId === accountId)?.permissions.includes(permissionId) ? 'revoked' : 'granted'}`);
  };

  const handleApprove = (accountId: string) => {
    const request = pendingRequests.find((r) => r.accountId === accountId);
    if (!request) return;
    setPendingRequests((prev) => prev.filter((r) => r.accountId !== accountId));
    setMembers((prev) => [
      ...prev,
      {
        accountId: request.accountId,
        authUserId: request.authUserId,
        name: request.name,
        email: request.email,
        status: 'approved',
        roleName: null,
        permissions: [],
      },
    ]);
    toast.success(`${request.name} approved and added as member`);
  };

  const handleDeny = (accountId: string) => {
    const request = pendingRequests.find((r) => r.accountId === accountId);
    if (!request) return;
    setPendingRequests((prev) => prev.filter((r) => r.accountId !== accountId));
    toast.success(`${request.name} denied`);
  };

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
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">
                          {member.name ?? 'Unknown User'}
                        </p>
                        {member.roleName && (
                          <Badge variant="outline" className="text-[10px]">
                            {member.roleName}
                          </Badge>
                        )}
                        {member.status === 'trusted' && (
                          <Badge variant="secondary" className="text-[10px]">
                            Trusted
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {member.email ?? member.authUserId.slice(0, 8) + '\u2026'}
                      </p>
                    </div>
                  </div>

                  {/* Permission toggles */}
                  <div className="flex flex-wrap gap-3 mt-2.5 ml-0 sm:ml-1">
                    {MOCK_PERMISSIONS.map((perm) => {
                      const isChecked = member.permissions.includes(perm.id);
                      return (
                        <label
                          key={perm.id}
                          className="flex items-center gap-1.5 cursor-pointer select-none"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() =>
                              handlePermissionToggle(member.accountId, perm.id)
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
                      {request.email ?? request.authUserId.slice(0, 8) + '\u2026'}
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
                      onClick={() => handleApprove(request.accountId)}
                    >
                      <Check className="h-3.5 w-3.5" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 border-red-200 text-red-700 hover:bg-red-50"
                      onClick={() => handleDeny(request.accountId)}
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
          See previous rejections ({rejectedRequests.length})
        </button>

        <div
          className="grid transition-[grid-template-rows] duration-300 ease-in-out"
          style={{ gridTemplateRows: showRejected ? '1fr' : '0fr' }}
        >
          <div className="overflow-hidden min-h-0">
            <Card className={cn('mt-3 border-red-200 transition-opacity duration-300', showRejected ? 'opacity-100' : 'opacity-0')}>
              <CardContent className="p-0">
                {rejectedRequests.length === 0 ? (
                  <div className="px-6 py-8 text-center">
                    <p className="text-sm text-muted-foreground">No previous rejections.</p>
                  </div>
                ) : (
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
                            {request.email ?? request.authUserId.slice(0, 8) + '\u2026'}
                          </p>
                        </div>
                        {request.requestedAt && (
                          <span className="text-xs text-muted-foreground shrink-0 hidden sm:block">
                            {formatDate(request.requestedAt)}
                          </span>
                        )}
                        <Badge
                          variant="outline"
                          className="border-red-200 bg-red-50 text-red-700 text-[10px]"
                        >
                          Rejected
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
