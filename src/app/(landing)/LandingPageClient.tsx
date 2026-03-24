'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { SplineScene } from '@/components/ui/spline-scene';
import { GlobalSpotlight } from '@/components/ui/spotlight';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { formatCompactNumber } from '@/utils/formatUtils';

// Fixed positions for orbiting logos around the robot
const logoPositions = [
  { position: 'top-0 left-8', mobilePosition: 'top-0 left-4' },
  { position: 'top-4 left-1/2 -translate-x-1/2', mobilePosition: 'top-0 left-1/2 -translate-x-1/2' },
  { position: 'top-0 right-8', mobilePosition: 'top-0 right-4' },
  { position: 'top-24 -left-6', mobilePosition: 'top-12 left-0' },
  { position: 'top-24 -right-6', mobilePosition: 'top-12 right-0' },
  { position: 'top-1/2 -translate-y-1/2 -left-10', mobilePosition: 'top-1/2 -translate-y-1/2 -left-2' },
  { position: 'top-1/2 -translate-y-1/2 -right-10', mobilePosition: 'top-1/2 -translate-y-1/2 -right-2' },
  { position: 'bottom-32 -left-4', mobilePosition: 'bottom-20 left-0' },
  { position: 'bottom-32 -right-4', mobilePosition: 'bottom-20 right-0' },
  { position: 'bottom-8 left-12', mobilePosition: 'bottom-4 left-6' },
  { position: 'bottom-8 right-12', mobilePosition: 'bottom-4 right-6' },
];

interface LogoSociety {
  name: string;
  imageUrl: string;
}

interface LandingPageClientProps {
  societyCount: number;
  universityCount: number;
  studentCount: number;
  societyNames: string[];
  logoSocieties: LogoSociety[];
  cityNames: string[];
  universityNames: string[];
  featuredUniversities: string[];
}

export default function LandingPageClient({ societyCount, universityCount, studentCount, societyNames, logoSocieties, cityNames, universityNames, featuredUniversities }: LandingPageClientProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());

  // Check for mobile
  useEffect(() => {
    const checkMobile = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < 1024);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Flip through society names
  useEffect(() => {
    if (societyNames.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % societyNames.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [societyNames.length]);

  return (
    <AuroraBackground className="relative">
      {/* Cursor Glow Effect */}
      <GlobalSpotlight size={400} color="rgba(99, 102, 241, 0.06)" />

      {/* Header */}
      <Header cities={cityNames} universities={universityNames} />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-24 pb-8 lg:pt-20 lg:pb-0">
        <div className="max-w-[1200px] mx-auto px-6 w-full">
          <div className="grid lg:grid-cols-2 gap-4 lg:gap-4 items-center min-h-[80vh] lg:min-h-[80vh]">
            {/* Left: Text Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="relative z-10 max-w-2xl text-center lg:text-left mx-auto lg:mx-0"
            >
              {/* Logo */}
              <motion.img
                src="/logos/Redefine Me logo wno bg.png"
                alt="Redefine Me"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="h-36 md:h-44 w-auto mt-4 mb-2 mx-auto lg:mx-0 lg:-ml-6 object-contain"
              />

              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border mb-8"
              >
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-subtle font-medium">Live in Manchester</span>
              </motion.div>

              {/* Main Heading - BIGGER */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-[48px] md:text-[60px] lg:text-[68px] font-bold text-text tracking-[-0.03em] leading-[1.05] mb-6"
              >
                Your uni life,
                <br />
                <span className="text-red">all in one</span> place.
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-subtle text-[17px] leading-[1.6] mb-5 max-w-md mx-auto lg:mx-0"
              >
                Never miss a society event again. {formatCompactNumber(societyCount)} events from Manchester universities, one platform.
              </motion.p>

              {/* Animated Society Flipper */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-subtle text-[15px] mb-8 flex items-center justify-center lg:justify-start gap-1.5"
              >
                <span>Find events from</span>
                <span className="relative inline-block min-w-[180px] h-[22px]">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={currentIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="absolute left-0 top-0 font-semibold text-red whitespace-nowrap"
                    >
                      {societyNames[currentIndex] ?? ''}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="flex flex-wrap gap-3 justify-center lg:justify-start"
              >
                <Link
                  href="/discover"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-text text-white font-medium rounded-lg hover:bg-gray-800 transition-all text-sm group"
                >
                  Explore Events
                  <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link
                  href="/auth"
                  className="group relative inline-flex items-center gap-2 px-6 py-3 bg-[#DC2626] text-white font-medium rounded-lg hover:brightness-110 transition-all text-sm overflow-hidden"
                >
                  <span className="absolute inset-0 bg-[linear-gradient(110deg,transparent_30%,rgba(255,255,255,0.15)_38%,rgba(255,255,255,0.5)_50%,rgba(255,255,255,0.15)_62%,transparent_70%)] bg-[length:200%_100%] bg-[position:200%_0] group-hover:bg-[position:-200%_0] transition-[background-position] duration-1000 ease-in-out" />
                  <span className="relative">Get Started</span>
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-transparent text-text font-medium rounded-lg border border-border hover:bg-surface hover:border-text/30 transition-all text-sm"
                >
                  Learn More
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-10 flex items-center justify-center lg:justify-start gap-6 text-sm"
              >
                <div>
                  <p className="text-xl font-bold text-text">{formatCompactNumber(societyCount)}</p>
                  <p className="text-subtle text-xs">Societies</p>
                </div>
                <div className="w-px h-8 bg-border" />
                <div>
                  <p className="text-xl font-bold text-text">{universityCount}</p>
                  <p className="text-subtle text-xs">{universityCount === 1 ? 'University' : 'Universities'}</p>
                </div>
                <div className="w-px h-8 bg-border" />
                <div>
                  <p className="text-xl font-bold text-text">{formatCompactNumber(studentCount)}</p>
                  <p className="text-subtle text-xs">Students</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Right: Spline Robot Scene with Static Logos */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="relative h-[350px] sm:h-[400px] lg:h-[600px]"
            >
              {/* Glow behind robot */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 rounded-full blur-3xl" />

              {/* Orbiting Logos - society profile pics from DB */}
              {logoSocieties.map((society, i) => {
                const pos = logoPositions[i];
                if (!pos) return null;
                const delay = i * 0.1;
                return (
                  <motion.div
                    key={i}
                    className={`absolute ${isMobile ? pos.mobilePosition : pos.position} z-20 pointer-events-none`}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: delay + 0.8, duration: 0.5, type: 'spring' }}
                  >
                    {/* Floating animation */}
                    <motion.div
                      animate={{
                        y: [0, isMobile ? -4 : -8, 0],
                        rotate: [0, 2, -2, 0],
                      }}
                      transition={{
                        duration: 4 + delay * 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    >
                      {/* Circular frame with glow - smaller on mobile */}
                      <div className={`relative rounded-full overflow-hidden border-2 border-white/30 shadow-xl shadow-black/20 bg-white ${isMobile ? 'w-10 h-10' : 'w-14 h-14'}`}>
                        {/* Subtle glow ring */}
                        <div className="absolute -inset-1 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-sm -z-10" />
                        {/* Logo image */}
                        {society.imageUrl && !failedImages.has(i) ? (
                          <img
                            src={society.imageUrl}
                            alt={society.name}
                            className="w-full h-full object-cover"
                            onError={() => setFailedImages(prev => new Set(prev).add(i))}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-bold">
                            {society.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}

              {/* Spline Scene - Robot tracks cursor */}
              <div className="relative w-full h-full">
                <SplineScene
                  scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                  className="w-full h-full"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="relative z-10 border-t border-border bg-surface/30 backdrop-blur-sm">
        <div className="max-w-[1200px] mx-auto px-6 py-10 text-center">
          <p className="text-subtle text-[15px]">
            <span className="font-semibold text-text">{formatCompactNumber(societyCount)} societies</span> from{' '}
            <span className="font-semibold text-text">{universityCount} {universityCount === 1 ? 'university' : 'universities'}</span> in{' '}
            <span className="font-semibold text-text">Manchester</span>
            {' '}— all in one place.
          </p>
          <div className="mt-6 flex justify-center items-center gap-10 opacity-40">
            {featuredUniversities.map((name) => (
              <span key={name} className="text-lg font-bold text-subtle">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </AuroraBackground>
  );
}
