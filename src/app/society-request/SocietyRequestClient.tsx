'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, X, ChevronDown, Loader2 } from 'lucide-react';
import { Toaster } from 'sonner';
import type { Society, SocietyAccountWithSociety } from '@/supabase_lib/types';
import { useSocietyRequests } from './useSocietyRequests';
import { MAX_PENDING_REQUESTS } from './types';

interface SocietyRequestClientProps {
  allSocieties: Society[];
  existingAccounts: SocietyAccountWithSociety[];
  userId: string;
}

function SocietyAvatar({ society }: { society: Society }) {
  return (
    <Image
      src={society.imageUrl || '/logos/rm-dot-logo.png'}
      alt={society.name}
      width={48}
      height={48}
      className="rounded-full object-cover flex-shrink-0"
    />
  );
}

export default function SocietyRequestClient({
  allSocieties,
  existingAccounts,
  userId,
}: SocietyRequestClientProps) {
  const {
    pendingSocieties,
    rejectedSocieties,
    displayedSocieties,
    pendingCount,
    isAtLimit,
    hasMore,
    searchQuery,
    updateSearch,
    requestAccess,
    cancelRequest,
    reRequest,
    sentinelRef,
  } = useSocietyRequests(allSocieties, existingAccounts);

  const [rejectedOpen, setRejectedOpen] = useState(false);

  return (
    <>
      <Toaster position="top-right" />

      {/* Title */}
      <h1 className="text-2xl font-semibold text-[var(--text)] mb-1">
        Request to Join a Society
      </h1>
      <p className="text-[var(--muted)] mb-8">
        Browse societies at your university and request committee access.
      </p>

      <div className="space-y-8">
        {/* ── Pending Requests ── */}
        {pendingSocieties.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-[var(--muted)] uppercase tracking-wide">
                Pending Requests
              </h2>
              <Link
                href="/society"
                className="text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors"
              >
                View your societies &rarr;
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {pendingSocieties.map((society) => (
                <div
                  key={society.id}
                  className="flex items-center gap-4 p-4 bg-[var(--surface)] rounded-[var(--radius)] border border-[var(--border)]"
                >
                  <SocietyAvatar society={society} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--text)] truncate">{society.name}</p>
                    <p className="text-sm text-[var(--muted)] truncate">@{society.instagram}</p>
                    <span className="inline-block mt-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      Pending
                    </span>
                  </div>
                  <button
                    onClick={() => cancelRequest(society.id)}
                    className="flex-shrink-0 p-2 rounded-lg text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors"
                    title="Cancel request"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Rejected Requests (collapsible) ── */}
        {rejectedSocieties.length > 0 && (
          <section>
            <button
              onClick={() => setRejectedOpen((prev) => !prev)}
              className="flex items-center gap-2 text-sm font-medium text-[var(--muted)] uppercase tracking-wide mb-3 hover:text-[var(--text)] transition-colors"
            >
              <ChevronDown
                size={16}
                className={`transition-transform ${rejectedOpen ? 'rotate-0' : '-rotate-90'}`}
              />
              Previous Rejections ({rejectedSocieties.length})
            </button>

            {rejectedOpen && (
              <div className="grid gap-4 sm:grid-cols-2">
                {rejectedSocieties.map((society) => (
                  <div
                    key={society.id}
                    className="flex items-center gap-4 p-4 bg-[var(--surface)] rounded-[var(--radius)] border border-[var(--border)]"
                  >
                    <SocietyAvatar society={society} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[var(--text)] truncate">{society.name}</p>
                      <p className="text-sm text-[var(--muted)] truncate">@{society.instagram}</p>
                      <span className="inline-block mt-1 text-xs font-medium text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                        Request Denied
                      </span>
                    </div>
                    <button
                      onClick={() => reRequest(society.id)}
                      disabled={isAtLimit}
                      className="flex-shrink-0 text-sm font-medium px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text)] hover:bg-[var(--bg)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Re-request
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── Search Bar ── */}
        <div>
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            />
            <input
              type="text"
              placeholder="Search societies by name or handle…"
              value={searchQuery}
              onChange={(e) => updateSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[#C04138]/40 transition"
            />
          </div>

          {/* Pending counter */}
          <p className={`text-sm mt-2 ${isAtLimit ? 'text-[#C04138] font-medium' : 'text-[var(--muted)]'}`}>
            {pendingCount}/{MAX_PENDING_REQUESTS} pending requests
            {isAtLimit && ' — limit reached'}
          </p>
        </div>

        {/* ── Available Societies Grid ── */}
        {displayedSocieties.length > 0 ? (
          <section>
            <h2 className="text-sm font-medium text-[var(--muted)] uppercase tracking-wide mb-3">
              Available Societies
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {displayedSocieties.map((society) => (
                <div
                  key={society.id}
                  className="flex items-center gap-4 p-4 bg-[var(--surface)] rounded-[var(--radius)] border border-[var(--border)] transition-all hover:border-[var(--accent)] hover:shadow-md"
                >
                  <SocietyAvatar society={society} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--text)] truncate">{society.name}</p>
                    <p className="text-sm text-[var(--muted)] truncate">@{society.instagram}</p>
                  </div>
                  <button
                    onClick={() => requestAccess(society.id)}
                    disabled={isAtLimit}
                    className="flex-shrink-0 text-sm font-semibold px-4 py-2 rounded-lg bg-[#C04138] text-white hover:bg-[#a8352d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Request
                  </button>
                </div>
              ))}
            </div>

            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} className="flex justify-center py-6">
              {hasMore && <Loader2 size={24} className="animate-spin text-[var(--muted)]" />}
            </div>
          </section>
        ) : (
          <div className="text-center py-12">
            <p className="text-[var(--muted)]">
              {searchQuery
                ? 'No societies found matching your search.'
                : 'No more societies available at your university.'}
            </p>
            {!searchQuery && pendingSocieties.length > 0 && (
              <Link
                href="/society"
                className="inline-block mt-3 text-sm text-[#C04138] hover:underline"
              >
                View your societies &rarr;
              </Link>
            )}
          </div>
        )}
      </div>
    </>
  );
}
