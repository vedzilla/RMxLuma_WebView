'use client';

import { ChevronLeft, Loader2 } from 'lucide-react';
import type { Interest } from '@/supabase_lib/types';

interface InterestsStepProps {
  interests: Interest[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  submitting: boolean;
}

export default function InterestsStep({
  interests,
  selectedIds,
  onToggle,
  onSubmit,
  onBack,
  submitting,
}: InterestsStepProps) {
  const canSubmit = selectedIds.length > 0 && !submitting;

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-[var(--radius)] shadow-[var(--shadow)] p-8">
      <h2 className="text-xl font-semibold text-[var(--text)] text-center mb-1">
        What are you into?
      </h2>
      <p className="text-sm text-[var(--muted)] text-center mb-6">
        Pick at least one interest &middot;{' '}
        <span className="font-medium text-[var(--accent)]">
          {selectedIds.length} selected
        </span>
      </p>

      {/* Interest pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {interests.map(interest => {
          const isSelected = selectedIds.includes(interest.id);
          return (
            <button
              key={interest.id}
              onClick={() => onToggle(interest.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer hover:scale-[1.02] hover:brightness-95 ${
                isSelected
                  ? 'bg-[#DC2626]/15 border border-[#DC2626]/60 text-[#DC2626]'
                  : 'bg-white/60 border border-[var(--border)] text-[var(--text)] hover:bg-white/80'
              }`}
            >
              {interest.name}
            </button>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={submitting}
          className="flex items-center justify-center gap-1 px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm font-medium text-[var(--text)] hover:bg-[var(--bg)] transition-colors disabled:opacity-40 cursor-pointer"
        >
          <ChevronLeft size={16} />
          Back
        </button>
        <button
          onClick={onSubmit}
          disabled={!canSubmit}
          className="group relative flex-1 py-2.5 rounded-xl bg-[#DC2626] text-white text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer overflow-hidden flex items-center justify-center gap-2"
        >
          <span className="absolute inset-0 bg-[linear-gradient(110deg,transparent_30%,rgba(255,255,255,0.15)_38%,rgba(255,255,255,0.5)_50%,rgba(255,255,255,0.15)_62%,transparent_70%)] bg-[length:200%_100%] bg-[position:200%_0] group-hover:bg-[position:-200%_0] transition-[background-position] duration-1000 ease-in-out" />
          {submitting ? (
            <span className="relative flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              Saving...
            </span>
          ) : (
            <span className="relative">Complete Setup</span>
          )}
        </button>
      </div>
    </div>
  );
}
