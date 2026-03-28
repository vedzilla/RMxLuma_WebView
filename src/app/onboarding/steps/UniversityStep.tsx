'use client';

import { useState, useMemo } from 'react';
import { Search, ChevronLeft } from 'lucide-react';
import type { University } from '@/supabase_lib/types';

interface UniversityStepProps {
  universities: University[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function UniversityStep({
  universities,
  selectedId,
  onSelect,
  onNext,
  onBack,
}: UniversityStepProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return universities;
    const q = search.toLowerCase();
    return universities.filter(
      u =>
        u.name.toLowerCase().includes(q) ||
        u.shortName.toLowerCase().includes(q) ||
        (u.cityName?.toLowerCase().includes(q) ?? false)
    );
  }, [universities, search]);

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-[var(--radius)] shadow-[var(--shadow)] p-8">
      <h2 className="text-xl font-semibold text-[var(--text)] text-center mb-1">
        Select your university
      </h2>
      <p className="text-sm text-[var(--muted)] text-center mb-6">
        We&apos;ll show you events at your uni
      </p>

      {/* Search */}
      <div className="relative mb-4">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
        />
        <input
          type="text"
          placeholder="Search universities..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 transition"
        />
      </div>

      {/* University list */}
      <div className="max-h-[280px] overflow-y-auto space-y-2 mb-6 pr-1">
        {filtered.length === 0 ? (
          <p className="text-sm text-[var(--muted)] text-center py-4">
            No universities found
          </p>
        ) : (
          filtered.map(uni => {
            const isSelected = selectedId === uni.id;
            return (
              <button
                key={uni.id}
                onClick={() => onSelect(uni.id)}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[var(--accent)] bg-[var(--accent)]/15 shadow-[0_0_0_1px_rgba(99,102,241,0.2)]'
                    : 'border-[var(--border)] bg-white/60 hover:bg-white/80'
                }`}
              >
                <span className="text-sm font-medium text-[var(--text)]">
                  {uni.name}
                </span>
                {uni.cityName && (
                  <span className="text-xs text-[var(--muted)] ml-2">
                    {uni.cityName}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex items-center justify-center gap-1 px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm font-medium text-[var(--text)] hover:bg-[var(--bg)] transition-colors cursor-pointer"
        >
          <ChevronLeft size={16} />
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!selectedId}
          className="group relative flex-1 py-2.5 rounded-xl bg-[#DC2626] text-white text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer overflow-hidden"
        >
          <span className="absolute inset-0 bg-[linear-gradient(110deg,transparent_30%,rgba(255,255,255,0.15)_38%,rgba(255,255,255,0.5)_50%,rgba(255,255,255,0.15)_62%,transparent_70%)] bg-[length:200%_100%] bg-[position:200%_0] group-hover:bg-[position:-200%_0] transition-[background-position] duration-1000 ease-in-out" />
          <span className="relative">Continue</span>
        </button>
      </div>
    </div>
  );
}
