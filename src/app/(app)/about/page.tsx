import Link from 'next/link';
import { PublicButton } from '@/components/ui/PublicButton';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl md:text-5xl font-bold text-text mb-6">
        About Redefine Me
      </h1>

      <div className="prose prose-lg max-w-none space-y-6 text-subtle">
        <p>
          Redefine Me helps you discover society events across UK universities. We're the public discovery layer that connects you with events happening at universities near you.
        </p>

        <p>
          <strong className="text-text">How it works:</strong>
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Browse events from university societies across the UK</li>
          <li>Filter by city, university, category, or search keywords</li>
          <li>Click through to register on the society's own platform</li>
          <li>Get personalized recommendations in our app</li>
        </ul>

        <p>
          <strong className="text-text">Ticketing:</strong> We don't handle ticketing or registration. Every event redirects to the society's own registration link (Fixr, Eventbrite, Google Forms, or their website).
        </p>

        <div className="mt-12 p-8 bg-bg rounded-xl border border-border">
          <h2 className="text-2xl font-semibold text-text mb-4">
            Get the App
          </h2>
          <p className="mb-6 text-subtle">
            Download our app for personalized event recommendations based on your interests, location, and university.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <PublicButton asChild>
              <a href="https://apps.apple.com/gb/app/redefine-me/id6759492024">
                Download for iOS
              </a>
            </PublicButton>
            <PublicButton variant="outline" asChild>
              <a href="https://play.google.com/store/apps/details?id=com.redefineme.app&hl=en_GB">
                Download for Android
              </a>
            </PublicButton>
          </div>
        </div>

        <div className="mt-8">
          <Link href="/" className="text-brand hover:underline font-medium">
            ← Back to events
          </Link>
        </div>
      </div>
    </div>
  );
}
