import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <h1 className="text-4xl font-bold text-text mb-4">404</h1>
      <p className="text-lg text-subtle mb-8">Page not found</p>
      <Link
        href="/"
        className="inline-block px-6 py-3 bg-text text-surface rounded-lg font-semibold hover:bg-subtle transition-colors"
      >
        Return home
      </Link>
    </div>
  );
}





