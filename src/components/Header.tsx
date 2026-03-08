'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface HeaderProps {
  cities: string[];
  universities: string[];
}

export default function Header({ cities, universities }: HeaderProps) {
  const [showCitiesDropdown, setShowCitiesDropdown] = useState(false);
  const [showUniversitiesDropdown, setShowUniversitiesDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [hamburgerActive, setHamburgerActive] = useState(false);

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
          <nav className="hidden md:flex items-center gap-[14px] text-muted font-medium text-sm tracking-[-0.01em]">
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
            <Link
              href="/about"
              className="px-4 py-[10px] text-sm font-medium text-text border border-border rounded-lg bg-transparent hover:bg-[rgba(15,23,42,0.04)] hover:border-text transition-all"
            >
              Get the App
            </Link>
            <button
              className="hamburger hamburger--emphatic md:hidden"
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
      className="fixed inset-0 bg-black/20 z-[150] md:hidden transition-opacity duration-500"
      style={{ opacity: showMobileMenu ? 1 : 0, pointerEvents: showMobileMenu ? 'auto' : 'none' }}
      onClick={handleClose}
    />

    {/* Slide-out panel */}
    <div
      className="fixed top-0 right-0 h-full w-[300px] bg-[#FAFAFA] z-[200] md:hidden shadow-[-4px_0_20px_rgba(0,0,0,0.08)] transition-transform duration-500 ease-out"
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
        <div className="mt-3">
          <p className="px-3 py-1 text-xs font-semibold text-muted uppercase tracking-wider">Cities</p>
          {cities.map(city => (
            <Link key={city} href={`/cities/${city.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => setShowMobileMenu(false)}
              className="block px-3 py-2 text-sm text-text rounded-lg hover:bg-[rgba(15,23,42,0.04)] transition-colors">
              {city}
            </Link>
          ))}
        </div>
        <div className="mt-3">
          <p className="px-3 py-1 text-xs font-semibold text-muted uppercase tracking-wider">Universities</p>
          {universities.map(uni => (
            <Link key={uni} href={`/universities/${uni.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => setShowMobileMenu(false)}
              className="block px-3 py-2 text-sm text-text rounded-lg hover:bg-[rgba(15,23,42,0.04)] transition-colors">
              {uni}
            </Link>
          ))}
        </div>
      </div>
    </div>
    </>
  );
}
