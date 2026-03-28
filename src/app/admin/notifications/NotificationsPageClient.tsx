'use client';

import { useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AdminSignOutButton from '../AdminSignOutButton';
import { createAuthBrowserClient } from '@/supabase_lib/auth/browser';

interface PushToken {
  userId: string;
  deviceId: string;
  pushToken: string;
  platform: string | null;
  deviceName: string | null;
  osVersion: string | null;
  userName: string | null;
  userEmail: string | null;
  registeredAt: string;
}

interface NotificationsPageClientProps {
  tokens: PushToken[];
}

export default function NotificationsPageClient({ tokens }: NotificationsPageClientProps) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set()); // set of "userId:deviceId"
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [dataJson, setDataJson] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const query = search.toLowerCase().trim();
  const filtered = tokens.filter(
    (t) =>
      (t.userName?.toLowerCase().includes(query) ?? false) ||
      (t.userEmail?.toLowerCase().includes(query) ?? false) ||
      t.userId.toLowerCase().includes(query) ||
      (t.deviceName?.toLowerCase().includes(query) ?? false) ||
      (t.platform?.toLowerCase().includes(query) ?? false) ||
      t.pushToken.toLowerCase().includes(query)
  );

  const tokenKey = (t: PushToken) => `${t.userId}:${t.deviceId}`;

  const allFilteredSelected = filtered.length > 0 && filtered.every((t) => selected.has(tokenKey(t)));

  const toggleSelectAll = useCallback(() => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) {
        filtered.forEach((t) => next.delete(tokenKey(t)));
      } else {
        filtered.forEach((t) => next.add(tokenKey(t)));
      }
      return next;
    });
  }, [filtered, allFilteredSelected]);

  const toggleToken = useCallback((t: PushToken) => {
    const key = tokenKey(t);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  // Derive unique user IDs from selected tokens
  const selectedUserIds = useMemo(() => {
    const userIds = new Set<string>();
    for (const key of Array.from(selected)) {
      const userId = key.split(':')[0];
      userIds.add(userId);
    }
    return Array.from(userIds);
  }, [selected]);

  const handleSend = useCallback(async () => {
    setError(null);
    setSuccess(null);

    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    if (!body.trim()) {
      setError('Body is required.');
      return;
    }
    if (selected.size === 0) {
      setError('Select at least one token.');
      return;
    }

    // Validate optional JSON data
    let parsedData: Record<string, unknown> | undefined;
    if (dataJson.trim()) {
      try {
        parsedData = JSON.parse(dataJson.trim());
      } catch {
        setError('Data must be valid JSON.');
        return;
      }
    }

    setSending(true);

    try {
      const supabase = createAuthBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setError('Session expired. Please sign in again.');
        setSending(false);
        return;
      }

      const payload: Record<string, unknown> = {
        title: title.trim(),
        body: body.trim(),
        user_ids: selectedUserIds,
      };
      if (parsedData) payload.data = parsedData;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/push-notification`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        setError(`Failed to send: ${text || res.statusText}`);
      } else {
        const result = await res.json();
        const count = result.sent ?? selected.size;
        setSuccess(`Notification sent to ${count} device${count !== 1 ? 's' : ''}.`);
        setTitle('');
        setBody('');
        setDataJson('');
        setSelected(new Set());
      }
    } catch (err) {
      setError(`Network error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSending(false);
    }
  }, [title, body, dataJson, selected, selectedUserIds]);

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

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Back link + heading */}
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors mb-4"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Dashboard
        </Link>

        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-semibold text-[var(--text)]">
            Push Notifications
          </h1>
          <span className="text-sm text-[var(--muted)]">
            {tokens.length} token{tokens.length !== 1 ? 's' : ''} registered
          </span>
        </div>
        <p className="text-[var(--muted)] mb-6">
          Send push notifications to devices with registered Expo push tokens.
        </p>

        {/* Error / Success banners */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 px-4 py-3 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm">
            {success}
          </div>
        )}

        {/* Compose section */}
        <div className="bg-[var(--surface)] rounded-[var(--radius)] border border-[var(--border)] p-5 mb-8">
          <h2 className="text-sm font-semibold text-[var(--text)] mb-4">Compose Notification</h2>
          <div className="space-y-3">
            <div>
              <label htmlFor="notif-title" className="block text-xs font-medium text-[var(--muted)] mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                id="notif-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. New events this week!"
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm placeholder:text-[var(--muted)] outline-none transition-shadow focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="notif-body" className="block text-xs font-medium text-[var(--muted)] mb-1">
                Body <span className="text-red-500">*</span>
              </label>
              <textarea
                id="notif-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="e.g. Check out 12 new events from Manchester societies"
                rows={3}
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm placeholder:text-[var(--muted)] outline-none transition-shadow focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent resize-y"
              />
            </div>
            <div>
              <label htmlFor="notif-data" className="block text-xs font-medium text-[var(--muted)] mb-1">
                Data (optional JSON for deep linking)
              </label>
              <input
                id="notif-data"
                type="text"
                value={dataJson}
                onChange={(e) => setDataJson(e.target.value)}
                placeholder='e.g. {"screen": "event", "eventId": "abc123"}'
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm placeholder:text-[var(--muted)] outline-none transition-shadow focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent font-mono"
              />
            </div>
            <button
              onClick={handleSend}
              disabled={sending || selected.size === 0 ? true : false}
              suppressHydrationWarning
              className="mt-2 px-5 py-2 rounded-xl text-sm font-medium bg-[var(--accent)] text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span suppressHydrationWarning>
                {sending
                  ? 'Sending...'
                  : `Send to ${selected.size} token${selected.size !== 1 ? 's' : ''} (${selectedUserIds.length} user${selectedUserIds.length !== 1 ? 's' : ''})`}
              </span>
            </button>
          </div>
        </div>

        {/* Search + select all */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
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
              placeholder="Search by name, email, device, platform, or token..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] text-sm placeholder:text-[var(--muted)] outline-none transition-shadow focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
            />
          </div>
          <button
            onClick={toggleSelectAll}
            className="shrink-0 px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)] hover:border-[var(--accent)] transition-colors"
          >
            {allFilteredSelected ? 'Deselect all' : 'Select all'}
          </button>
        </div>

        {/* Tokens list */}
        {filtered.length === 0 ? (
          <div className="bg-[var(--surface)] rounded-[var(--radius)] border border-[var(--border)] p-12 text-center">
            <p className="text-[var(--muted)]">
              {tokens.length === 0
                ? 'No push tokens have been registered yet.'
                : 'No tokens match your search.'}
            </p>
          </div>
        ) : (
          <div className="bg-[var(--surface)] rounded-[var(--radius)] border border-[var(--border)] overflow-hidden">
            <div className="divide-y divide-[var(--border)]">
              {filtered.map((t) => {
                const key = tokenKey(t);
                return (
                  <label
                    key={key}
                    className="px-5 py-3.5 flex items-start gap-4 cursor-pointer hover:bg-[var(--bg)] transition-colors"
                  >
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selected.has(key)}
                      onChange={() => toggleToken(t)}
                      className="mt-1 w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)] shrink-0"
                    />

                    <div className="min-w-0 flex-1">
                      {/* User info */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {t.userName && (
                          <span className="text-sm font-medium text-[var(--text)]">
                            {t.userName}
                          </span>
                        )}
                        {t.userEmail && (
                          <span className="text-xs text-[var(--muted)]">
                            {t.userEmail}
                          </span>
                        )}
                        {!t.userName && !t.userEmail && (
                          <span className="text-xs text-[var(--muted)] font-mono">
                            {t.userId.slice(0, 8)}...
                          </span>
                        )}
                      </div>

                      {/* Token + device details */}
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-[10px] font-mono text-[var(--muted)] bg-[var(--bg)] px-1.5 py-0.5 rounded">
                          {t.pushToken.length > 40
                            ? `${t.pushToken.slice(0, 20)}...${t.pushToken.slice(-12)}`
                            : t.pushToken}
                        </span>
                        {t.platform && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[var(--accentSoft)] text-[var(--accent)]">
                            {t.platform}
                          </span>
                        )}
                        {t.deviceName && (
                          <span className="text-[10px] text-[var(--muted)]">
                            {t.deviceName}
                          </span>
                        )}
                        {t.osVersion && (
                          <span className="text-[10px] text-[var(--muted)]">
                            v{t.osVersion}
                          </span>
                        )}
                      </div>

                      {/* Registered date */}
                      <p className="text-[10px] text-[var(--muted)] mt-1">
                        Registered{' '}
                        {new Date(t.registeredAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
