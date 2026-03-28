'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, ChevronLeft, Loader2 } from 'lucide-react';
import { getUniversityCourses } from '@/supabase_lib/courses';
import type { UniversityCourse } from '@/supabase_lib/types';

interface CourseStepProps {
  universityId: string;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function CourseStep({
  universityId,
  selectedId,
  onSelect,
  onNext,
  onBack,
}: CourseStepProps) {
  const [courses, setCourses] = useState<UniversityCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    getUniversityCourses(universityId).then(data => {
      setCourses(data);
      setLoading(false);
    });
  }, [universityId]);

  const filtered = useMemo(() => {
    if (!search.trim()) return courses;
    const q = search.toLowerCase();
    return courses.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        c.degreeTypeName.toLowerCase().includes(q)
    );
  }, [courses, search]);

  const formatCourseLabel = (course: UniversityCourse) => {
    let label = course.name;
    if (course.yearInIndustry) label += ' (Year in Industry)';
    return label;
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-[var(--radius)] shadow-[var(--shadow)] p-8">
      <h2 className="text-xl font-semibold text-[var(--text)] text-center mb-1">
        What&apos;s your course?
      </h2>
      <p className="text-sm text-[var(--muted)] text-center mb-6">
        Select the course you&apos;re studying
      </p>

      {/* Search */}
      <div className="relative mb-4">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
        />
        <input
          type="text"
          placeholder="Search courses..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 transition"
        />
      </div>

      {/* Course list */}
      <div className="max-h-[280px] overflow-y-auto space-y-2 mb-6 pr-1">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={24} className="animate-spin text-[var(--muted)]" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-[var(--muted)] text-center py-4">
            {search.trim() ? 'No courses found' : 'No courses available for this university'}
          </p>
        ) : (
          filtered.map(course => {
            const isSelected = selectedId === course.id;
            return (
              <button
                key={course.id}
                onClick={() => onSelect(course.id)}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[var(--accent)] bg-[var(--accent)]/15 shadow-[0_0_0_1px_rgba(99,102,241,0.2)]'
                    : 'border-[var(--border)] bg-white/60 hover:bg-white/80'
                }`}
              >
                <span className="text-sm font-medium text-[var(--text)]">
                  {formatCourseLabel(course)}
                </span>
                {course.degreeTypeName && (
                  <span className="text-xs text-[var(--muted)] ml-2">
                    {course.degreeTypeName}
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
