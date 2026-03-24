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
    <div className="bg-[var(--surface)] rounded-[var(--radius)] shadow-[var(--shadow)] p-8">
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
                  ? 'border-[var(--accent)] bg-[var(--accentSoft)] text-[var(--accent)]'
                  : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--bg)]'
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
          className="flex-1 py-2.5 rounded-xl bg-[var(--text)] text-[var(--surface)] text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
