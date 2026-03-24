'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Camera } from 'lucide-react';

interface ProfilePictureStepProps {
  defaultAvatarUrl: string;
  fullName: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  onNext: () => void;
}

export default function ProfilePictureStep({
  defaultAvatarUrl,
  fullName,
  file,
  onFileChange,
  onNext,
}: ProfilePictureStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    file ? URL.createObjectURL(file) : null
  );

  const displayUrl = previewUrl || defaultAvatarUrl;
  const initials = fullName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    // Validate size (max 5MB)
    if (selected.size > 5 * 1024 * 1024) {
      alert('Image must be under 5MB');
      return;
    }

    onFileChange(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  };

  return (
    <div className="bg-[var(--surface)] rounded-[var(--radius)] shadow-[var(--shadow)] p-8">
      <h2 className="text-xl font-semibold text-[var(--text)] text-center mb-1">
        Add a profile photo
      </h2>
      <p className="text-sm text-[var(--muted)] text-center mb-8">
        Help others recognise you — or skip for now
      </p>

      {/* Avatar */}
      <div className="flex justify-center mb-8">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="relative group cursor-pointer"
        >
          <div className="w-28 h-28 rounded-full overflow-hidden bg-[var(--bg)] border-2 border-[var(--border)] flex items-center justify-center">
            {displayUrl ? (
              <Image
                src={displayUrl}
                alt="Profile"
                width={112}
                height={112}
                className="object-cover w-full h-full"
              />
            ) : (
              <span className="text-2xl font-semibold text-[var(--muted)]">
                {initials || '?'}
              </span>
            )}
          </div>
          <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Camera size={24} className="text-white" />
          </div>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={onNext}
          className="w-full py-2.5 rounded-xl bg-[var(--text)] text-[var(--surface)] text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
        >
          Continue
        </button>
        {!file && !defaultAvatarUrl && (
          <button
            onClick={onNext}
            className="w-full py-2.5 rounded-xl text-sm font-medium text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
}
