'use client';

import { getCategoryMeta, LayoutGrid } from '@/data/categoryMeta';

interface FilterPillsProps {
  tags: string[];
  selectedTag?: string;
  onTagSelect: (tag: string | undefined) => void;
}

export default function FilterPills({ tags, selectedTag, onTagSelect }: FilterPillsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {/* "All" pill — neutral dark/white */}
      <button
        onClick={() => onTagSelect(undefined)}
        className={`inline-flex items-center gap-1.5 px-3 py-2.5 rounded-full text-[13px] font-bold cursor-pointer transition-all hover:brightness-95 hover:scale-[1.02] ${
          !selectedTag
            ? 'bg-text text-surface border border-text'
            : 'bg-surface text-subtle border border-border hover:bg-bg'
        }`}
      >
        <LayoutGrid size={14} strokeWidth={2.5} />
        All
      </button>

      {/* Category pills — colored */}
      {tags.map(tag => {
        const { icon: Icon, color } = getCategoryMeta(tag);
        const isSelected = selectedTag === tag;

        return (
          <button
            key={tag}
            onClick={() => onTagSelect(isSelected ? undefined : tag)}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-full text-[13px] font-bold cursor-pointer transition-all hover:brightness-95 hover:scale-[1.02]"
            style={{
              backgroundColor: isSelected ? `${color}20` : `${color}1A`,
              border: `1px solid ${isSelected ? `${color}80` : `${color}40`}`,
              color: color,
            }}
          >
            <Icon size={14} strokeWidth={2.5} />
            {tag}
          </button>
        );
      })}
    </div>
  );
}
