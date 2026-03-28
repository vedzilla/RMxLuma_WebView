import Image from 'next/image';
import Link from 'next/link';
import { PublicButton } from '@/components/ui/PublicButton';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <div className="relative w-[100px] h-[100px] mb-4">
              <Image
                src="/logos/rm-dot-logo.png"
                alt="RedefineMe"
                width={100}
                height={100}
                className="absolute inset-0 animate-[logoDotFade_6s_ease-in-out_infinite]"
              />
              <Image
                src="/logos/rm-no-dot-logo.png"
                alt=""
                width={100}
                height={100}
                className="absolute inset-0 animate-[logoNoDotFade_6s_ease-in-out_infinite]"
                aria-hidden
              />
            </div>
            <p className="text-sm text-subtle">
              Discover society events across the UK
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-text mb-4">Explore</p>
            <ul className="space-y-1">
              <li>
                <Link href="/discover" className="text-sm text-subtle hover:text-text transition-colors">
                  Discover Events
                </Link>
              </li>
              <li>
                <Link href="/about" className="inline-block py-2 text-sm text-subtle hover:text-text transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/help" className="inline-block py-2 text-sm text-subtle hover:text-text transition-colors">
                  Help
                </Link>
              </li>
              <li>
                <Link href="/support" className="inline-block py-2 text-sm text-subtle hover:text-text transition-colors">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-text mb-4">Get Started</p>
            <PublicButton variant="outline" asChild className="px-4 py-2 font-medium">
              <Link href="/about">
                Get the App
              </Link>
            </PublicButton>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-subtle">
          <p>© 2026 Redefine Me. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
