'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  totalSteps: number;
  currentStep: number;
}

export default function StepIndicator({ totalSteps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {Array.from({ length: totalSteps }).map((_, i) => {
        const isCompleted = i < currentStep;
        const isActive = i === currentStep;

        return (
          <motion.div
            key={i}
            className="relative flex items-center justify-center"
            animate={{
              scale: isActive ? 1.15 : 1,
            }}
            transition={{ duration: 0.2 }}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                isCompleted
                  ? 'bg-[#DC2626] text-white shadow-[0_0_8px_rgba(220,38,38,0.3)]'
                  : isActive
                    ? 'bg-[#DC2626] text-white shadow-[0_0_12px_rgba(220,38,38,0.4)]'
                    : 'bg-white/60 backdrop-blur-sm border-2 border-[var(--border)] text-[var(--muted)]'
              }`}
            >
              {isCompleted ? <Check size={14} strokeWidth={3} /> : i + 1}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
