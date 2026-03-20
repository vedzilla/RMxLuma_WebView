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
import { UserPlus, Trash2, ChevronDown, Check, X } from 'lucide-react';

// ---- Constants ----

const COMMITTEE_ROLES = [
  'President',
  'Vice President',
  'Treasurer',
  'Secretary',
  'Social Sec',
  'Events Officer',
  'Welfare Officer',
  'Inclusions Officer',
  'Member',
] as const;

const PERMISSIONS = [
  'event_management',
  'society_profile',
  'member_management',
  'view_analytics',
] as const;

// ---- Types ----

interface CommitteeMember {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
}

interface ApprovalRequest {
  id: string;
  name: string;
  email: string;
  requestedAt: string;
  status: 'pending' | 'rejected';
}

// ---- Mock Data ----

const INITIAL_MEMBERS: CommitteeMember[] = [
  {
    id: 'm1',
    name: 'Alice Johnson',
    email: 'alice.j@student.manchester.ac.uk',
    role: 'President',
    permissions: ['event_management', 'society_profile', 'member_management', 'view_analytics'],
  },
  {
    id: 'm2',
    name: 'Ben Carter',
    email: 'ben.carter@student.manchester.ac.uk',
    role: 'Vice President',
    permissions: ['event_management', 'society_profile', 'view_analytics'],
  },
  {
    id: 'm3',
    name: 'Chloe Williams',
    email: 'chloe.w@student.manchester.ac.uk',
    role: 'Treasurer',
    permissions: ['view_analytics'],
  },
  {
    id: 'm4',
    name: 'David Lee',
    email: 'david.lee@student.manchester.ac.uk',
    role: 'Events Officer',
    permissions: ['event_management'],
  },
  {
    id: 'm5',
    name: 'Emma Patel',
    email: 'emma.p@student.manchester.ac.uk',
    role: 'Social Sec',
    permissions: ['event_management', 'society_profile'],
  },
];

const INITIAL_REQUESTS: ApprovalRequest[] = [
  {
    id: 'r1',
    name: 'Fatima Khan',
    email: 'fatima.k@student.manchester.ac.uk',
    requestedAt: '2026-03-18T10:30:00Z',
    status: 'pending',
  },
  {
    id: 'r2',
    name: 'George Chen',
    email: 'george.c@student.manchester.ac.uk',
    requestedAt: '2026-03-15T14:20:00Z',
    status: 'pending',
  },
  {
    id: 'r3',
    name: 'Hannah Brooks',
    email: 'hannah.b@student.manchester.ac.uk',
    requestedAt: '2026-03-10T09:00:00Z',
    status: 'rejected',
  },
  {
    id: 'r4',
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
  const [requests, setRequests] = useState<ApprovalRequest[]>(INITIAL_REQUESTS);
  const [showRejected, setShowRejected] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const rejectedRequests = requests.filter((r) => r.status === 'rejected');

  // ---- Handlers ----

  const handleRoleChange = (memberId: string, newRole: string) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
    );
    const member = members.find((m) => m.id === memberId);
    toast.success(`${member?.name ?? 'Member'} role updated to ${newRole}`);
  };

  const handlePermissionToggle = (memberId: string, permission: string) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== memberId) return m;
        const has = m.permissions.includes(permission);
        return {
          ...m,
          permissions: has
            ? m.permissions.filter((p) => p !== permission)
            : [...m.permissions, permission],
        };
      })
    );
  };

  const handleRemoveMember = () => {
    if (!removingMemberId) return;
    const member = members.find((m) => m.id === removingMemberId);
    setMembers((prev) => prev.filter((m) => m.id !== removingMemberId));
    setRemovingMemberId(null);
    toast.success(`${member?.name ?? 'Member'} removed from committee`);
  };

  const handleApprove = (requestId: string) => {
    const request = requests.find((r) => r.id === requestId);
    if (!request) return;

    setRequests((prev) => prev.filter((r) => r.id !== requestId));
    setMembers((prev) => [
      ...prev,
      {
        id: `approved-${requestId}`,
        name: request.name,
        email: request.email,
        role: 'Member',
        permissions: [],
      },
    ]);
    toast.success(`${request.name} approved and added as Member`);
  };

  const handleDeny = (requestId: string) => {
    const request = requests.find((r) => r.id === requestId);
    if (!request) return;

    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'rejected' as const } : r))
    );
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
      {/* SECTION 1: MEMBERS MANAGEMENT                                */}
      {/* ============================================================ */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg">Members</CardTitle>
            <Badge variant="secondary">{members.length}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 border-red-200 text-red-700 hover:bg-red-50"
              disabled={members.length === 0}
              onClick={() => setShowDeleteAllConfirm(true)}
            >
              <Trash2 className="h-4 w-4" />
              Delete All
            </Button>
            <Button
              size="sm"
              onClick={() => toast.info('Add member coming soon')}
              className="gap-1.5"
            >
              <UserPlus className="h-4 w-4" />
              Add Member
            </Button>
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
                <div key={member.id} className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {/* Name + email */}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {member.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {member.email}
                      </p>
                    </div>

                    {/* Role dropdown */}
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleChange(member.id, e.target.value)}
                      className="shrink-0 text-xs px-2 py-1.5 rounded-lg border border-border bg-card text-foreground outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      {COMMITTEE_ROLES.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>

                    {/* Remove button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setRemovingMemberId(member.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Permission toggles */}
                  <div className="flex flex-wrap gap-3 mt-2.5 ml-0 sm:ml-1">
                    {PERMISSIONS.map((perm) => {
                      const isChecked = member.permissions.includes(perm);
                      return (
                        <label
                          key={perm}
                          className="flex items-center gap-1.5 cursor-pointer select-none"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handlePermissionToggle(member.id, perm)}
                            className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary focus:ring-offset-0"
                          />
                          <span className="text-[11px] text-muted-foreground">
                            {formatPermissionName(perm)}
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
      {/* SECTION 2: APPROVALS                                         */}
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
                  key={request.id}
                  className="px-6 py-4 flex items-center gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {request.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {request.email}
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
                      onClick={() => handleApprove(request.id)}
                    >
                      <Check className="h-3.5 w-3.5" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 border-red-200 text-red-700 hover:bg-red-50"
                      onClick={() => handleDeny(request.id)}
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
                        key={request.id}
                        className="px-6 py-4 flex items-center gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground">
                            {request.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {request.email}
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
      {/* Remove member confirmation modal */}
      {removingMemberId && (() => {
        const member = members.find((m) => m.id === removingMemberId);
        if (!member) return null;

        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={() => setRemovingMemberId(null)}
          >
            <div
              className="bg-card rounded-xl border border-border p-6 max-w-sm w-full mx-4 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-base font-semibold text-foreground mb-2">
                Remove Member
              </h3>
              <p className="text-sm text-muted-foreground">
                Are you sure you want to remove{' '}
                <span className="font-medium text-foreground">{member.name}</span> from
                the committee?
              </p>
              <div className="flex items-center justify-end gap-2 mt-5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRemovingMemberId(null)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleRemoveMember}
                >
                  Remove
                </Button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Delete all confirmation modal */}
      {showDeleteAllConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setShowDeleteAllConfirm(false)}
        >
          <div
            className="bg-card rounded-xl border border-border p-6 max-w-sm w-full mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-foreground mb-2">
              Delete All Members
            </h3>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to remove all{' '}
              <span className="font-medium text-foreground">{members.length}</span>{' '}
              member{members.length !== 1 ? 's' : ''} from the committee?
            </p>
            <div className="flex items-center justify-end gap-2 mt-5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteAllConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  setMembers([]);
                  setShowDeleteAllConfirm(false);
                  toast.success('All members removed');
                }}
              >
                Delete All
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
