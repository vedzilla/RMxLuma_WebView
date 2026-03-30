import Image from 'next/image';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { GlobalSpotlight } from '@/components/ui/spotlight';
import { SocietyPickerCards } from './SocietyPickerCards';
import SocietySignOutButton from './[societyId]/dashboard/SocietySignOutButton';

const mockApprovedAccounts = [
  {
    id: "sa-001",
    society_account_approval_status: { name: "trusted" },
    societies: {
      id: "s-001",
      name: "UoM Computer Science Society",
      image_url: null,
      universities: { name: "University of Manchester" },
    },
  },
];

export default function SocietyPickerPage() {
  return (
    <AuroraBackground className="min-h-screen">
      <GlobalSpotlight size={400} color="rgba(220, 38, 38, 0.06)" />
      <div className="relative z-10">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-[var(--surface)]/80 backdrop-blur-md border-b border-[var(--border)] px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logos/rm-dot-logo.png"
              alt="RedefineMe"
              width={120}
              height={30}
            />
            <span className="text-xs font-medium text-[#DC2626] bg-[#DC2626]/10 px-2 py-0.5 rounded-full">
              Society
            </span>
          </div>
          <SocietySignOutButton />
        </header>

        {/* Content */}
        <main className="max-w-3xl mx-auto px-6 py-10">
          <h1 className="text-2xl font-semibold text-[var(--text)] mb-1">
            Your Societies
          </h1>
          <p className="text-[var(--muted)] mb-8">
            Select a society to manage.
          </p>

          <SocietyPickerCards
            approvedAccounts={mockApprovedAccounts}
            pendingAccounts={[]}
          />
        </main>
      </div>
    </AuroraBackground>
  );
}
