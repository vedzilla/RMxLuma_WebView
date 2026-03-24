'use client';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChange, placeholder = "Search events, societies, or keywords…" }: SearchBarProps) {
  return (
    <div className="flex-[1_1_360px] flex items-center gap-2.5 bg-surface border border-border rounded-[14px] px-3 py-3 shadow-[var(--shadowSoft)]">
      <span className="text-subtle font-black text-lg">⌕</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 border-none outline-none w-full text-sm bg-transparent text-text placeholder:text-subtle"
        aria-label="Search events"
      />
    </div>
  );
}

