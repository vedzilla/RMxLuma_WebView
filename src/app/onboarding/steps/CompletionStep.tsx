'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

interface CompletionStepProps {
  onContinue: () => void;
}

export default function CompletionStep({ onContinue }: CompletionStepProps) {
  // Auto-redirect after 2.5 seconds
  useEffect(() => {
    const timer = setTimeout(onContinue, 2500);
    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-[var(--radius)] shadow-[var(--shadow)] p-8 text-center">
      {/* Indigo glow ring behind the checkmark */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        className="flex justify-center mb-6"
      >
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-[#DC2626]/20 blur-xl scale-150" />
          <CheckCircle size={72} className="relative text-[#DC2626] drop-shadow-[0_0_12px_rgba(220,38,38,0.4)]" />
        </div>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="text-xl font-semibold text-[var(--text)] mb-2"
      >
        You&apos;re all set!
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.4 }}
        className="text-sm text-[var(--muted)] mb-8"
      >
        Welcome to RedefineMe. Let&apos;s discover some events.
      </motion.p>

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        onClick={onContinue}
        className="group relative w-full py-2.5 rounded-xl bg-[#DC2626] text-white text-sm font-semibold hover:brightness-110 transition-all cursor-pointer overflow-hidden"
      >
        <span className="absolute inset-0 bg-[linear-gradient(110deg,transparent_30%,rgba(255,255,255,0.15)_38%,rgba(255,255,255,0.5)_50%,rgba(255,255,255,0.15)_62%,transparent_70%)] bg-[length:200%_100%] bg-[position:200%_0] group-hover:bg-[position:-200%_0] transition-[background-position] duration-1000 ease-in-out" />
        <span className="relative">Go to Discover</span>
      </motion.button>
    </div>
  );
}
