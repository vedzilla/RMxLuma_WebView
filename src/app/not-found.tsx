import Link from 'next/link';
import { PublicButton } from '@/components/ui/PublicButton';

export default function NotFound() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <h1 className="text-4xl font-bold text-text mb-4">404</h1>
      <p className="text-lg text-subtle mb-8">Page not found</p>
      <PublicButton asChild>
        <Link href="/">
          Return home
        </Link>
      </PublicButton>
    </div>
  );
}
