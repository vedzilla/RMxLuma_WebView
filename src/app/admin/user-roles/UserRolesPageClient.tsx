'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AdminSignOutButton from '../AdminSignOutButton';
import type { Society } from '@/supabase_lib/types';
import {
  generateMockData,
  COMMITTEE_ROLES,
  AVAILABLE_USERS,
  type SocietyWithMembers,
  type CommitteeMember,
  type CommitteeRole,
} from './mockData';

type ModalState =
  | null
  | { type: 'remove'; societyId: string; memberId: string }
  | { type: 'transfer'; societyId: string; memberId: string }
  | { type: 'add'; societyId: string };

interface UserRolesPageClientProps {
  societies: Society[];
}

// Pending role changes per society: societyId -> memberId -> newRole
type PendingChanges = Record<string, Record<string, CommitteeRole>>;

export default function UserRolesPageClient({ societies }: UserRolesPageClientProps) {
  const [data, setData] = useState<SocietyWithMembers[]>(() => generateMockData(societies));
  const [pendingRoleChanges, setPendingRoleChanges] = useState<PendingChanges>({});
  const [search, setSearch] = useState('');
  const [expandedSocieties, setExpandedSocieties] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState<ModalState>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Add member modal state
  const [addSearch, setAddSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<{ name: string; email: string } | null>(null);
  const [selectedRole, setSelectedRole] = useState<CommitteeRole>('Committee Member');

  // Auto-dismiss success message
  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  // Close modal on Escape
  useEffect(() => {
    if (!modal) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModal(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [modal]);

  const toggleSociety = useCallback((id: string) => {
    setExpandedSocieties((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleRoleChange = useCallback((societyId: string, memberId: string, newRole: CommitteeRole) => {
    setPendingRoleChanges((prev) => {
      // Check if this reverts to the saved value
      const savedMember = data
        .find((s) => s.id === societyId)
        ?.members.find((m) => m.id === memberId);
      if (savedMember?.role === newRole) {
        // Remove the pending change since it matches saved state
        const societyChanges = { ...prev[societyId] };
        delete societyChanges[memberId];
        if (Object.keys(societyChanges).length === 0) {
          const next = { ...prev };
          delete next[societyId];
          return next;
        }
        return { ...prev, [societyId]: societyChanges };
      }
      return {
        ...prev,
        [societyId]: { ...prev[societyId], [memberId]: newRole },
      };
    });
  }, [data]);

  const handleSaveRoles = useCallback((societyId: string) => {
    const changes = pendingRoleChanges[societyId];
    if (!changes) return;
    setData((prev) =>
      prev.map((s) =>
        s.id !== societyId
          ? s
          : {
              ...s,
              members: s.members.map((m) =>
                changes[m.id] ? { ...m, role: changes[m.id] } : m
              ),
            }
      )
    );
    setPendingRoleChanges((prev) => {
      const next = { ...prev };
      delete next[societyId];
      return next;
    });
    const society = data.find((s) => s.id === societyId);
    setSuccessMessage(`Roles saved for ${society?.name ?? 'society'}.`);
  }, [pendingRoleChanges, data]);

  const hasPendingChanges = useCallback((societyId: string) => {
    return !!pendingRoleChanges[societyId] && Object.keys(pendingRoleChanges[societyId]).length > 0;
  }, [pendingRoleChanges]);

  const getDisplayRole = useCallback((societyId: string, member: CommitteeMember): CommitteeRole => {
    return pendingRoleChanges[societyId]?.[member.id] ?? member.role;
  }, [pendingRoleChanges]);

  const handleRemove = useCallback(() => {
    if (modal?.type !== 'remove') return;
    const { societyId, memberId } = modal;
    const society = data.find((s) => s.id === societyId);
    const member = society?.members.find((m) => m.id === memberId);
    setData((prev) =>
      prev.map((s) =>
        s.id !== societyId
          ? s
          : { ...s, members: s.members.filter((m) => m.id !== memberId) }
      )
    );
    // Clean up any pending role change for this member
    setPendingRoleChanges((prev) => {
      if (!prev[societyId]?.[memberId]) return prev;
      const societyChanges = { ...prev[societyId] };
      delete societyChanges[memberId];
      if (Object.keys(societyChanges).length === 0) {
        const next = { ...prev };
        delete next[societyId];
        return next;
      }
      return { ...prev, [societyId]: societyChanges };
    });
    setModal(null);
    setSuccessMessage(`${member?.name ?? 'Member'} removed from ${society?.name ?? 'society'}.`);
  }, [modal, data]);

  const handleTransfer = useCallback(() => {
    if (modal?.type !== 'transfer') return;
    const { societyId, memberId } = modal;
    const society = data.find((s) => s.id === societyId);
    const newPresident = society?.members.find((m) => m.id === memberId);
    setData((prev) =>
      prev.map((s) => {
        if (s.id !== societyId) return s;
        return {
          ...s,
          members: s.members.map((m) => {
            if (m.id === memberId) return { ...m, role: 'President' as CommitteeRole };
            if (m.role === 'President') return { ...m, role: 'Committee Member' as CommitteeRole };
            return m;
          }),
        };
      })
    );
    setModal(null);
    setSuccessMessage(`Presidency transferred to ${newPresident?.name ?? 'member'}.`);
  }, [modal, data]);

  const handleAddMember = useCallback(() => {
    if (modal?.type !== 'add' || !selectedUser) return;
    const { societyId } = modal;
    const society = data.find((s) => s.id === societyId);
    const newMember: CommitteeMember = {
      id: `${societyId}-member-${Date.now()}`,
      name: selectedUser.name,
      email: selectedUser.email,
      role: selectedRole,
      joinedAt: new Date().toISOString(),
    };
    setData((prev) =>
      prev.map((s) =>
        s.id !== societyId ? s : { ...s, members: [...s.members, newMember] }
      )
    );
    setModal(null);
    setSelectedUser(null);
    setAddSearch('');
    setSelectedRole('Committee Member');
    setSuccessMessage(`${selectedUser.name} added to ${society?.name ?? 'society'}.`);
  }, [modal, selectedUser, selectedRole, data]);

  const openAddModal = useCallback((societyId: string) => {
    setModal({ type: 'add', societyId });
    setSelectedUser(null);
    setAddSearch('');
    setSelectedRole('Committee Member');
  }, []);

  // Filtering
  const query = search.toLowerCase().trim();
  const filtered = data
    .map((society) => {
      const societyMatches = society.name.toLowerCase().includes(query);
      const matchingMembers = society.members.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.email.toLowerCase().includes(query)
      );
      if (!societyMatches && matchingMembers.length === 0) return null;
      return {
        ...society,
        members: societyMatches ? society.members : matchingMembers,
      };
    })
    .filter(Boolean) as SocietyWithMembers[];

  const totalMembers = data.reduce((sum, s) => sum + s.members.length, 0);

  // Helpers for modals
  const getModalSociety = () => modal ? data.find((s) => s.id === modal.societyId) : null;
  const getModalMember = () => {
    if (!modal || !('memberId' in modal)) return null;
    return getModalSociety()?.members.find((m) => m.id === modal.memberId) ?? null;
  };

  const getRoleSummary = (societyId: string, members: CommitteeMember[]) => {
    const counts: Partial<Record<CommitteeRole, number>> = {};
    members.forEach((m) => {
      const role = getDisplayRole(societyId, m);
      counts[role] = (counts[role] ?? 0) + 1;
    });
    return COMMITTEE_ROLES
      .filter((r) => counts[r])
      .map((r) => `${counts[r]} ${r}${(counts[r] ?? 0) > 1 && r === 'Committee Member' ? 's' : ''}`)
      .join(' \u00b7 ');
  };

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-[var(--surface)] border-b border-[var(--border)] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin">
            <Image
              src="/logos/rm-dot-logo.png"
              alt="RedefineMe"
              width={120}
              height={30}
            />
          </Link>
          <span className="text-xs font-medium bg-[var(--accentSoft)] text-[var(--accent)] px-2 py-0.5 rounded-full">
            Admin
          </span>
        </div>
        <AdminSignOutButton />
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Back link */}
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors mb-4"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Dashboard
        </Link>

        {/* Title */}
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-semibold text-[var(--text)]">
            Committee Roles
          </h1>
          <span className="text-sm text-[var(--muted)]">
            {totalMembers} member{totalMembers !== 1 ? 's' : ''} across {data.length} societ{data.length !== 1 ? 'ies' : 'y'}
          </span>
        </div>
        <p className="text-[var(--muted)] mb-6">
          Manage committee member roles for each society.
        </p>

        {/* Success message */}
        {successMessage && (
          <div className="mb-4 px-4 py-3 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm">
            {successMessage}
          </div>
        )}

        {/* Search */}
        <div className="relative mb-8">
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]"
          >
            <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12.5 12.5L16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by member name, email, or society..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] text-sm placeholder:text-[var(--muted)] outline-none transition-shadow focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
          />
        </div>

        {/* Society accordions */}
        {filtered.length === 0 ? (
          <div className="bg-[var(--surface)] rounded-[var(--radius)] border border-[var(--border)] p-12 text-center">
            <p className="text-[var(--muted)]">
              {data.length === 0
                ? 'No societies found.'
                : 'No results match your search.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((society) => {
              const isExpanded = expandedSocieties.has(society.id);
              return (
                <div
                  key={society.id}
                  className="bg-[var(--surface)] rounded-[var(--radius)] border border-[var(--border)] overflow-hidden"
                >
                  {/* Accordion header */}
                  <div className="flex items-center">
                    <button
                      onClick={() => toggleSociety(society.id)}
                      className="flex-1 px-5 py-3.5 flex items-center gap-3 hover:bg-[var(--bg)] transition-colors text-left"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        className={`shrink-0 text-[var(--muted)] transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                      >
                        <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {society.imageUrl && (
                        <Image
                          src={society.imageUrl}
                          alt={society.name}
                          width={32}
                          height={32}
                          className="rounded-full object-cover shrink-0"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h2 className="text-sm font-semibold text-[var(--text)]">
                            {society.name}
                          </h2>
                          <span className="text-xs text-[var(--muted)]">
                            {society.members.length} member{society.members.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--muted)] mt-0.5">
                          {getRoleSummary(society.id, society.members)}
                        </p>
                      </div>
                      <span className="text-xs text-[var(--muted)] shrink-0 hidden sm:block">
                        @{society.instagramHandle}
                      </span>
                    </button>
                    {hasPendingChanges(society.id) && (
                      <button
                        onClick={() => handleSaveRoles(society.id)}
                        className="shrink-0 mr-4 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                      >
                        Save
                      </button>
                    )}
                  </div>

                  {/* Accordion content — animated via CSS grid-rows */}
                  <div
                    className="grid transition-[grid-template-rows] duration-500 ease-in-out"
                    style={{ gridTemplateRows: isExpanded ? '1fr' : '0fr' }}
                  >
                    <div className="overflow-hidden min-h-0">
                      <div className={`border-t border-[var(--border)] transition-opacity duration-500 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
                      {/* Member rows */}
                      <div className="divide-y divide-[var(--border)]">
                        {society.members.map((member) => {
                          const displayRole = getDisplayRole(society.id, member);
                          const isPending = pendingRoleChanges[society.id]?.[member.id] !== undefined;
                          return (
                            <div
                              key={member.id}
                              className="px-5 py-3 flex items-center gap-3"
                            >
                              {/* Name + email */}
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  {displayRole === 'President' && (
                                    <span className="text-amber-500 shrink-0" title="President">
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                                      </svg>
                                    </span>
                                  )}
                                  <span className="text-sm font-medium text-[var(--text)]">
                                    {member.name}
                                  </span>
                                  {isPending && (
                                    <span className="text-[10px] font-medium text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded shrink-0">
                                      Unsaved
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs text-[var(--muted)] truncate block">
                                  {member.email}
                                </span>
                              </div>

                              {/* Role dropdown */}
                              <select
                                value={displayRole}
                                onChange={(e) =>
                                  handleRoleChange(society.id, member.id, e.target.value as CommitteeRole)
                                }
                                className={`shrink-0 text-xs px-2 py-1.5 rounded-lg border bg-[var(--surface)] text-[var(--text)] outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent ${
                                  isPending ? 'border-amber-300' : 'border-[var(--border)]'
                                }`}
                              >
                                {COMMITTEE_ROLES.map((role) => (
                                  <option key={role} value={role}>
                                    {role}
                                  </option>
                                ))}
                              </select>

                              {/* Actions */}
                              <div className="flex items-center gap-1.5 shrink-0">
                                {displayRole !== 'President' && (
                                  <button
                                    onClick={() =>
                                      setModal({ type: 'transfer', societyId: society.id, memberId: member.id })
                                    }
                                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-colors"
                                    title="Transfer presidency to this member"
                                  >
                                    Transfer
                                  </button>
                                )}
                                <button
                                  onClick={() =>
                                    setModal({ type: 'remove', societyId: society.id, memberId: member.id })
                                  }
                                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-colors"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Add member button */}
                      <div className="px-5 py-3 border-t border-[var(--border)] bg-[var(--bg)]">
                        <button
                          onClick={() => openAddModal(society.id)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-[var(--accent)] text-white hover:opacity-90 transition-opacity"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <line x1="19" y1="8" x2="19" y2="14" />
                            <line x1="22" y1="11" x2="16" y2="11" />
                          </svg>
                          Add Member
                        </button>
                      </div>
                    </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Remove confirmation modal */}
      {modal?.type === 'remove' && (() => {
        const society = getModalSociety();
        const member = getModalMember();
        if (!society || !member) return null;
        const isPresident = member.role === 'President';
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={() => setModal(null)}
          >
            <div
              className="bg-[var(--surface)] rounded-[var(--radius)] border border-[var(--border)] p-6 max-w-md w-full mx-4 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-base font-semibold text-[var(--text)] mb-2">
                Remove Member
              </h3>
              <p className="text-sm text-[var(--muted)] mb-1">
                Are you sure you want to remove <span className="font-medium text-[var(--text)]">{member.name}</span> from <span className="font-medium text-[var(--text)]">{society.name}</span>?
              </p>
              {isPresident && (
                <p className="text-sm text-amber-600 mt-2 mb-1">
                  Warning: This will leave the society without a president. Consider transferring the presidency first.
                </p>
              )}
              <div className="flex items-center justify-end gap-2 mt-5">
                <button
                  onClick={() => setModal(null)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRemove}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Transfer presidency modal */}
      {modal?.type === 'transfer' && (() => {
        const society = getModalSociety();
        const member = getModalMember();
        const currentPresident = society?.members.find((m) => getDisplayRole(society!.id, m) === 'President');
        if (!society || !member) return null;
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={() => setModal(null)}
          >
            <div
              className="bg-[var(--surface)] rounded-[var(--radius)] border border-[var(--border)] p-6 max-w-md w-full mx-4 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-base font-semibold text-[var(--text)] mb-2">
                Transfer Presidency
              </h3>
              <p className="text-sm text-[var(--muted)]">
                Transfer presidency of <span className="font-medium text-[var(--text)]">{society.name}</span> to <span className="font-medium text-[var(--text)]">{member.name}</span>?
              </p>
              {currentPresident && (
                <p className="text-sm text-[var(--muted)] mt-2">
                  <span className="font-medium text-[var(--text)]">{currentPresident.name}</span> will become a Committee Member.
                </p>
              )}
              <div className="flex items-center justify-end gap-2 mt-5">
                <button
                  onClick={() => setModal(null)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTransfer}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent)] text-white hover:opacity-90 transition-opacity"
                >
                  Transfer
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Add member modal */}
      {modal?.type === 'add' && (() => {
        const society = getModalSociety();
        if (!society) return null;
        const existingEmails = new Set(society.members.map((m) => m.email));
        const addQuery = addSearch.toLowerCase().trim();
        const availableFiltered = AVAILABLE_USERS.filter(
          (u) =>
            !existingEmails.has(u.email) &&
            (u.name.toLowerCase().includes(addQuery) || u.email.toLowerCase().includes(addQuery))
        );
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={() => setModal(null)}
          >
            <div
              className="bg-[var(--surface)] rounded-[var(--radius)] border border-[var(--border)] p-6 max-w-md w-full mx-4 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-base font-semibold text-[var(--text)] mb-4">
                Add Member to {society.name}
              </h3>

              {/* User search */}
              <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">
                Search Users
              </label>
              <input
                type="text"
                value={addSearch}
                onChange={(e) => setAddSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm placeholder:text-[var(--muted)] outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent mb-2"
              />

              {/* User list */}
              <div className="max-h-40 overflow-y-auto border border-[var(--border)] rounded-lg mb-4">
                {availableFiltered.length === 0 ? (
                  <p className="px-3 py-4 text-xs text-[var(--muted)] text-center">
                    No available users found.
                  </p>
                ) : (
                  availableFiltered.map((user) => (
                    <button
                      key={user.email}
                      onClick={() => setSelectedUser(user)}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-[var(--bg)] transition-colors flex items-center justify-between ${
                        selectedUser?.email === user.email
                          ? 'bg-[var(--accentSoft)] border-l-2 border-l-[var(--accent)]'
                          : ''
                      }`}
                    >
                      <div>
                        <span className="font-medium text-[var(--text)]">{user.name}</span>
                        <span className="text-xs text-[var(--muted)] ml-2">{user.email}</span>
                      </div>
                      {selectedUser?.email === user.email && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                  ))
                )}
              </div>

              {/* Role selector */}
              <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">
                Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as CommitteeRole)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent mb-5"
              >
                {COMMITTEE_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setModal(null)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMember}
                  disabled={!selectedUser}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent)] text-white hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Add Member
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
