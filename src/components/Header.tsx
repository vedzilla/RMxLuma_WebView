'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createAuthBrowserClient } from '@/supabase_lib/auth/browser';

interface HeaderProps {
  cities: string[];
  universities: string[];
}

export default function Header({ cities, universities }: HeaderProps) {
  const [showCitiesDropdown, setShowCitiesDropdown] = useState(false);
  const [showUniversitiesDropdown, setShowUniversitiesDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [hamburgerActive, setHamburgerActive] = useState(false);
  const [mobileCitiesOpen, setMobileCitiesOpen] = useState(false);
  const [mobileUnisOpen, setMobileUnisOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createAuthBrowserClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });
  }, []);

  const handleSignOut = useCallback(async () => {
    const supabase = createAuthBrowserClient();
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    router.push('/');
  }, [router]);

  useEffect(() => {
    if (showMobileMenu) {
      const timer = setTimeout(() => setHamburgerActive(true), 100);
      return () => clearTimeout(timer);
    } else {
      setHamburgerActive(false);
    }
  }, [showMobileMenu]);

  const handleClose = () => {
    setHamburgerActive(false);
    setTimeout(() => setShowMobileMenu(false), 100);
  };

  return (
    <>
    <div className="sticky top-0 z-50 bg-[#FAFAFA] border-b border-border">
      <div className="max-w-[1120px] mx-auto px-[18px]">
        <div className="flex items-center justify-between gap-3 h-16">
          {/* Logo — crossfade between dot and no-dot variants over 6s */}
          <Link href="/" className="-ml-10 relative w-[128px] h-[128px] block flex-shrink-0">
            <Image
              src="/logos/rm-dot-logo.png"
              alt="RedefineMe"
              width={128}
              height={128}
              unoptimized
              className="absolute inset-0 animate-[logoDotFade_6s_ease-in-out_infinite]"
            />
            <Image
              src="/logos/rm-no-dot-logo.png"
              alt=""
              width={128}
              height={128}
              unoptimized
              className="absolute inset-0"
              aria-hidden
            />
          </Link>

          {/* Navigation */}
          <nav className="desktop-only flex items-center gap-[14px] text-subtle font-medium text-sm tracking-[-0.01em]">
            <Link href="/" className="text-inherit no-underline px-[10px] py-2 rounded-[10px] hover:bg-[rgba(15,23,42,0.04)] hover:text-text transition-colors">
              Discover
            </Link>
            <button
              onClick={() => {
                setShowCitiesDropdown(!showCitiesDropdown);
                setShowUniversitiesDropdown(false);
              }}
              className="text-inherit px-[10px] py-2 rounded-[10px] hover:bg-[rgba(15,23,42,0.04)] hover:text-text transition-colors relative bg-transparent border-none cursor-pointer"
            >
              Cities
              {showCitiesDropdown && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-surface border border-border rounded-lg shadow-md py-2 z-50">
                  {cities.map(city => (
                    <Link
                      key={city}
                      href={`/cities/${city.toLowerCase().replace(/\s+/g, '-')}`}
                      className="block px-4 py-2 text-sm text-text hover:bg-bg transition-colors"
                      onClick={() => setShowCitiesDropdown(false)}
                    >
                      {city}
                    </Link>
                  ))}
                </div>
              )}
            </button>
            <button
              onClick={() => {
                setShowUniversitiesDropdown(!showUniversitiesDropdown);
                setShowCitiesDropdown(false);
              }}
              className="text-inherit px-[10px] py-2 rounded-[10px] hover:bg-[rgba(15,23,42,0.04)] hover:text-text transition-colors relative bg-transparent border-none cursor-pointer"
            >
              Universities
              {showUniversitiesDropdown && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-surface border border-border rounded-lg shadow-md py-2 z-50 max-h-96 overflow-y-auto">
                  {universities.map(uni => (
                    <Link
                      key={uni}
                      href={`/universities/${uni.toLowerCase().replace(/\s+/g, '-')}`}
                      className="block px-4 py-2 text-sm text-text hover:bg-bg transition-colors"
                      onClick={() => setShowUniversitiesDropdown(false)}
                    >
                      {uni}
                    </Link>
                  ))}
                </div>
              )}
            </button>
          </nav>

          {/* Actions */}
          <div className="flex gap-[10px] items-center">
            {isLoggedIn ? (
              <>
                <Link
                  href="/society"
                  className="desktop-only px-4 py-[10px] text-sm font-medium text-text border border-border rounded-lg bg-transparent hover:bg-[rgba(15,23,42,0.04)] hover:border-text transition-all"
                >
                  Manage Society
                </Link>
                <button
                  onClick={handleSignOut}
                  className="desktop-only px-4 py-[10px] text-sm font-medium text-[var(--muted)] border border-border rounded-lg bg-transparent hover:bg-[rgba(15,23,42,0.04)] hover:text-text hover:border-text transition-all cursor-pointer"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                href="/auth"
                className="desktop-only px-4 py-[10px] text-sm font-medium text-text border border-border rounded-lg bg-transparent hover:bg-[rgba(15,23,42,0.04)] hover:border-text transition-all"
              >
                Log in
              </Link>
            )}
            <Link
              href="/about"
              className="group relative inline-flex items-center px-4 py-[10px] text-sm font-medium text-white bg-[#DC2626] border-2 border-[#9CA3AF] rounded-lg hover:brightness-110 transition-all overflow-hidden"
            >
              <span className="absolute inset-0 bg-[linear-gradient(110deg,transparent_30%,rgba(255,255,255,0.15)_38%,rgba(255,255,255,0.5)_50%,rgba(255,255,255,0.15)_62%,transparent_70%)] bg-[length:200%_100%] bg-[position:200%_0] group-hover:bg-[position:-200%_0] transition-[background-position] duration-1000 ease-in-out" />
              <span className="relative">Get the App</span>
            </Link>
            <button
              className="hamburger hamburger--emphatic mobile-only"
              onClick={() => setShowMobileMenu(true)}
              aria-label="Open menu"
              style={{ opacity: showMobileMenu ? 0 : 1, transition: 'opacity 0.2s', pointerEvents: showMobileMenu ? 'none' : 'auto' }}
            >
              <span className="hamburger-box">
                <span className="hamburger-inner" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* Backdrop */}
    <div
      className="fixed inset-0 bg-black/20 z-[150] mobile-only transition-opacity duration-500"
      style={{ opacity: showMobileMenu ? 1 : 0, pointerEvents: showMobileMenu ? 'auto' : 'none' }}
      onClick={handleClose}
    />

    {/* Slide-out panel */}
    <div
      className="fixed top-0 right-0 h-full w-[300px] bg-[#FAFAFA] z-[200] mobile-only shadow-[-4px_0_20px_rgba(0,0,0,0.08)] transition-transform duration-500 ease-out"
      style={{ transform: showMobileMenu ? 'translateX(0)' : 'translateX(100%)' }}
    >
      {/* Hamburger — slides in with panel, animates ☰ → X */}
      <div className="flex items-center h-16 px-2 border-b border-border">
        <button
          className={`hamburger hamburger--emphatic${hamburgerActive ? ' is-active' : ''}`}
          onClick={handleClose}
          aria-label="Close menu"
        >
          <span className="hamburger-box">
            <span className="hamburger-inner" />
          </span>
        </button>
      </div>

      {/* Nav links */}
      <div className="px-4 py-3 overflow-y-auto max-h-[calc(100vh-64px)]">
        <Link href="/" onClick={() => setShowMobileMenu(false)}
          className="block px-3 py-2 text-sm font-medium text-text rounded-lg hover:bg-[rgba(15,23,42,0.04)] transition-colors">
          Discover
        </Link>
        <div className="mt-1">
          <button
            onClick={() => setMobileCitiesOpen(o => !o)}
            className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-text rounded-lg hover:bg-[rgba(15,23,42,0.04)] transition-colors bg-transparent border-none cursor-pointer"
          >
            Cities
            <svg
              className={`w-4 h-4 text-subtle transition-transform duration-200${mobileCitiesOpen ? ' rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {mobileCitiesOpen && (
            <div className="ml-3 mt-0.5">
              {cities.map(city => (
                <Link key={city} href={`/cities/${city.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setShowMobileMenu(false)}
                  className="block px-3 py-2 text-sm text-text rounded-lg hover:bg-[rgba(15,23,42,0.04)] transition-colors">
                  {city}
                </Link>
              ))}
            </div>
          )}
        </div>
        <div className="mt-1">
          <button
            onClick={() => setMobileUnisOpen(o => !o)}
            className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-text rounded-lg hover:bg-[rgba(15,23,42,0.04)] transition-colors bg-transparent border-none cursor-pointer"
          >
            Universities
            <svg
              className={`w-4 h-4 text-subtle transition-transform duration-200${mobileUnisOpen ? ' rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {mobileUnisOpen && (
            <div className="ml-3 mt-0.5">
              {universities.map(uni => (
                <Link key={uni} href={`/universities/${uni.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setShowMobileMenu(false)}
                  className="block px-3 py-2 text-sm text-text rounded-lg hover:bg-[rgba(15,23,42,0.04)] transition-colors">
                  {uni}
                </Link>
              ))}
            </div>
          )}
        </div>
        {isLoggedIn ? (
          <>
            <Link href="/society" onClick={() => setShowMobileMenu(false)}
              className="block px-4 py-[10px] mt-3 text-sm font-medium text-text text-center border border-border rounded-lg bg-transparent hover:bg-[rgba(15,23,42,0.04)] hover:border-text transition-all">
              Manage Society
            </Link>
            <button
              onClick={() => { setShowMobileMenu(false); handleSignOut(); }}
              className="w-full px-4 py-[10px] mt-2 text-sm font-medium text-[var(--muted)] text-center border border-border rounded-lg bg-transparent hover:bg-[rgba(15,23,42,0.04)] hover:text-text hover:border-text transition-all cursor-pointer"
            >
              Sign out
            </button>
          </>
        ) : (
          <Link href="/auth" onClick={() => setShowMobileMenu(false)}
            className="block px-4 py-[10px] mt-3 text-sm font-medium text-text text-center border border-border rounded-lg bg-transparent hover:bg-[rgba(15,23,42,0.04)] hover:border-text transition-all">
            Log in
          </Link>
        )}
      </div>
    </div>
    </>
  );
}
