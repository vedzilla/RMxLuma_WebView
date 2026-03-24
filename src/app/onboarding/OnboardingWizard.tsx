'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { createAuthBrowserClient } from '@/supabase_lib/auth/browser';
import { submitOnboarding, uploadProfilePicture, saveUserInterests } from '@/supabase_lib/onboarding';
import type { University, StudyLevel, Interest } from '@/supabase_lib/types';
import StepIndicator from './components/StepIndicator';
import ProfilePictureStep from './steps/ProfilePictureStep';
import UniversityStep from './steps/UniversityStep';
import StudyLevelStep from './steps/StudyLevelStep';
import InterestsStep from './steps/InterestsStep';
import CompletionStep from './steps/CompletionStep';

interface OnboardingWizardProps {
  userId: string;
  fullName: string;
  defaultAvatarUrl: string;
  universities: University[];
  studyLevels: StudyLevel[];
  interests: Interest[];
}

interface OnboardingData {
  profilePicture: File | null;
  universityId: string | null;
  studyLevelId: string | null;
  interestIds: string[];
}

const TOTAL_STEPS = 4;

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 200 : -200,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -200 : 200,
    opacity: 0,
  }),
};

export default function OnboardingWizard({
  userId,
  fullName,
  defaultAvatarUrl,
  universities,
  studyLevels,
  interests,
}: OnboardingWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [data, setData] = useState<OnboardingData>({
    profilePicture: null,
    universityId: null,
    studyLevelId: null,
    interestIds: [],
  });

  const goNext = useCallback(() => {
    setDirection(1);
    setCurrentStep(prev => Math.min(prev + 1, TOTAL_STEPS));
  }, []);

  const goBack = useCallback(() => {
    setDirection(-1);
    setCurrentStep(prev => Math.max(prev - 1, 0));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!data.universityId || !data.studyLevelId || data.interestIds.length === 0) return;

    setSubmitting(true);
    setError('');

    try {
      const supabase = createAuthBrowserClient();

      // Upload profile picture (optional, non-blocking)
      if (data.profilePicture) {
        await uploadProfilePicture(supabase, data.profilePicture).catch(err => {
          console.warn('[onboarding] Profile picture upload failed:', err);
        });
      }

      // Submit onboarding data (university + study level)
      const result = await submitOnboarding(supabase, {
        university_id: data.universityId,
        study_level_id: data.studyLevelId,
      });

      if (!result.success) {
        // Retry once
        const retry = await submitOnboarding(supabase, {
          university_id: data.universityId,
          study_level_id: data.studyLevelId,
        });
        if (!retry.success) {
          setError('Something went wrong. Please try again.');
          setSubmitting(false);
          return;
        }
      }

      // Save interests
      const interestsOk = await saveUserInterests(supabase, userId, data.interestIds);
      if (!interestsOk) {
        console.warn('[onboarding] Failed to save interests, continuing anyway');
      }

      // Move to completion step
      setDirection(1);
      setCurrentStep(TOTAL_STEPS);
    } catch (err) {
      console.error('[onboarding] Submission error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [data, userId]);

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <ProfilePictureStep
            defaultAvatarUrl={defaultAvatarUrl}
            fullName={fullName}
            file={data.profilePicture}
            onFileChange={file => setData(prev => ({ ...prev, profilePicture: file }))}
            onNext={goNext}
          />
        );
      case 1:
        return (
          <UniversityStep
            universities={universities}
            selectedId={data.universityId}
            onSelect={id => setData(prev => ({ ...prev, universityId: id }))}
            onNext={goNext}
            onBack={goBack}
          />
        );
      case 2:
        return (
          <StudyLevelStep
            studyLevels={studyLevels}
            selectedId={data.studyLevelId}
            onSelect={id => setData(prev => ({ ...prev, studyLevelId: id }))}
            onNext={goNext}
            onBack={goBack}
          />
        );
      case 3:
        return (
          <InterestsStep
            interests={interests}
            selectedIds={data.interestIds}
            onToggle={id =>
              setData(prev => ({
                ...prev,
                interestIds: prev.interestIds.includes(id)
                  ? prev.interestIds.filter(i => i !== id)
                  : [...prev.interestIds, id],
              }))
            }
            onSubmit={handleSubmit}
            onBack={goBack}
            submitting={submitting}
          />
        );
      case TOTAL_STEPS:
        return <CompletionStep onContinue={() => router.push('/discover')} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg)] px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src="/logos/rm-dot-logo.png"
            alt="RedefineMe"
            width={140}
            height={36}
            priority
          />
        </div>

        {/* Step indicator (hidden on completion) */}
        {currentStep < TOTAL_STEPS && (
          <StepIndicator totalSteps={TOTAL_STEPS} currentStep={currentStep} />
        )}

        {/* Error message */}
        {error && (
          <p className="text-sm text-[var(--red)] text-center mb-4">{error}</p>
        )}

        {/* Step content */}
        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
