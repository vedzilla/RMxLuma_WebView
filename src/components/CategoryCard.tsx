import Link from 'next/link';

interface CategoryCardProps {
  categoryName: string;
  count: number;
  onClick?: () => void;
}

const categoryIcons: Record<string, React.ReactElement> = {
  'Sports': (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M10 2 L10 18 M2 10 L18 10" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  'Business': (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="6" width="12" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M6 6 V4 C6 3.4 6.4 3 7 3 H13 C13.6 3 14 3.4 14 4 V6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M8 10 H12" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  'Culture': (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 2 L12 8 L18 8 L13 12 L15 18 L10 14 L5 18 L7 12 L2 8 L8 8 Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    </svg>
  ),
  'Wellbeing': (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M10 6 V10 L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  'Social': (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="7" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <circle cx="13" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M5 13 C5 11.5 6.5 10 8 10 H12 C13.5 10 15 11.5 15 13" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    </svg>
  ),
  'Tech': (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="4" width="10" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M8 4 V2 H12 V4" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <circle cx="10" cy="10" r="1.5" fill="currentColor"/>
    </svg>
  ),
  'Arts': (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 16 L8 4 L12 16" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M6 12 L10 12" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="14" cy="6" r="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M14 8 V14" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  'Food & Drink': (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M6 8 C6 5 7.5 3 10 3 C12.5 3 14 5 14 8" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M7 12 L13 12 L12 17 L8 17 Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    </svg>
  ),
};

const categoryColors: Record<string, string> = {
  'Sports': '#3B82F6',
  'Business': '#6366F1',
  'Culture': '#A855F7',
  'Wellbeing': '#10B981',
  'Social': '#F59E0B',
  'Tech': '#EF4444',
  'Arts': '#EC4899',
  'Food & Drink': '#F97316',
};

export default function CategoryCard({ categoryName, count, onClick }: CategoryCardProps) {
  const icon = categoryIcons[categoryName] || categoryIcons['Social'];
  const color = categoryColors[categoryName] || '#64748B';
  const categorySlug = categoryName.toLowerCase().replace(/\s+/g, '-');

  return (
    <Link
      href={`/categories/${categorySlug}`}
      onClick={onClick}
      className="block bg-surface border border-border rounded-[var(--radius)] px-5 py-4 text-left cursor-pointer transition-all duration-[0.12s] hover:border-text hover:bg-[rgba(15,23,42,0.02)]"
    >
      <div className="w-5 h-5 mb-[10px] text-subtle flex items-center justify-start" style={{ color }}>
        {icon}
      </div>
      <div className="font-semibold text-[15px] text-text tracking-[-0.01em] mb-1">
        {categoryName}
      </div>
      <div className="text-xs text-subtle font-normal">
        {count} events
      </div>
    </Link>
  );
}
