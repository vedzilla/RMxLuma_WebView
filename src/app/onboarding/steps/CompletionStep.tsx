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
    <div className="bg-[var(--surface)] rounded-[var(--radius)] shadow-[var(--shadow)] p-8 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        className="flex justify-center mb-6"
      >
        <CheckCircle size={64} className="text-[var(--accent)]" />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-xl font-semibold text-[var(--text)] mb-2"
      >
        You&apos;re all set!
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="text-sm text-[var(--muted)] mb-8"
      >
        Welcome to RedefineMe. Let&apos;s discover some events.
      </motion.p>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        onClick={onContinue}
        className="w-full py-2.5 rounded-xl bg-[var(--text)] text-[var(--surface)] text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
      >
        Go to Discover
      </motion.button>
    </div>
  );
}
