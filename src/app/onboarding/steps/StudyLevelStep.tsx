'use client';

import { ChevronLeft } from 'lucide-react';
import type { StudyLevel } from '@/supabase_lib/types';

interface StudyLevelStepProps {
  studyLevels: StudyLevel[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StudyLevelStep({
  studyLevels,
  selectedId,
  onSelect,
  onNext,
  onBack,
}: StudyLevelStepProps) {
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-[var(--radius)] shadow-[var(--shadow)] p-8">
      <h2 className="text-xl font-semibold text-[var(--text)] text-center mb-1">
        What year are you in?
      </h2>
      <p className="text-sm text-[var(--muted)] text-center mb-6">
        This helps us personalise your experience
      </p>

      {/* Study level grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {studyLevels.map(level => {
          const isSelected = selectedId === level.id;
          return (
            <button
              key={level.id}
              onClick={() => onSelect(level.id)}
              className={`px-4 py-4 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                isSelected
                  ? 'border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)] shadow-[0_0_0_1px_rgba(99,102,241,0.2)]'
                  : 'border-[var(--border)] bg-white/60 text-[var(--text)] hover:bg-white/80'
              }`}
            >
              {level.name}
            </button>
          );
        })}
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
