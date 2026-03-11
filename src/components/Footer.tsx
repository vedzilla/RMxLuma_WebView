import Image from 'next/image';
import Link from 'next/link';

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
                unoptimized
                className="absolute inset-0 animate-[logoDotFade_6s_ease-in-out_infinite]"
              />
              <Image
                src="/logos/rm-no-dot-logo.png"
                alt=""
                width={100}
                height={100}
                unoptimized
                className="absolute inset-0 animate-[logoNoDotFade_6s_ease-in-out_infinite]"
                aria-hidden
              />
            </div>
            <p className="text-sm text-subtle">
              Discover society events across the UK
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-text mb-4">Explore</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-subtle hover:text-text transition-colors">
                  Discover Events
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-subtle hover:text-text transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-sm text-subtle hover:text-text transition-colors">
                  Support
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-text mb-4">Get Started</h3>
            <Link
              href="/about"
              className="inline-block px-4 py-2 text-sm font-medium text-text border border-border rounded-lg hover:bg-bg transition-colors"
            >
              Get the App
            </Link>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-subtle">
          <p>© 2026 Redefine Me. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}





