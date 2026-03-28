'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { GlobalSpotlight } from '@/components/ui/spotlight';
import { createAuthBrowserClient } from '@/supabase_lib/auth/browser';
import { submitOnboarding, uploadProfilePicture, saveUserInterests } from '@/supabase_lib/onboarding';
import type { University, StudyLevel, Interest } from '@/supabase_lib/types';
import StepIndicator from './components/StepIndicator';
import ProfilePictureStep from './steps/ProfilePictureStep';
import UniversityStep from './steps/UniversityStep';
import CourseStep from './steps/CourseStep';
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
  universityCourseId: string | null;
  studyLevelId: string | null;
  interestIds: string[];
}

const TOTAL_STEPS = 5;

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
    universityCourseId: null,
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
    if (!data.universityId || !data.universityCourseId || !data.studyLevelId || data.interestIds.length === 0) return;

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

      // Submit onboarding data (university + course + study level)
      const result = await submitOnboarding(supabase, {
        university_id: data.universityId,
        study_level_id: data.studyLevelId,
        university_course_id: data.universityCourseId,
      });

      if (!result.success) {
        // Retry once
        const retry = await submitOnboarding(supabase, {
          university_id: data.universityId,
          study_level_id: data.studyLevelId,
          university_course_id: data.universityCourseId,
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
            onSelect={id => setData(prev => ({
              ...prev,
              universityId: id,
              // Reset course when university changes
              universityCourseId: prev.universityId !== id ? null : prev.universityCourseId,
            }))}
            onNext={goNext}
            onBack={goBack}
          />
        );
      case 2:
        return (
          <CourseStep
            universityId={data.universityId!}
            selectedId={data.universityCourseId}
            onSelect={id => setData(prev => ({ ...prev, universityCourseId: id }))}
            onNext={goNext}
            onBack={goBack}
          />
        );
      case 3:
        return (
          <StudyLevelStep
            studyLevels={studyLevels}
            selectedId={data.studyLevelId}
            onSelect={id => setData(prev => ({ ...prev, studyLevelId: id }))}
            onNext={goNext}
            onBack={goBack}
          />
        );
      case 4:
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
    <AuroraBackground opacity={12} showRadialGradient={false} className="min-h-screen">
      <GlobalSpotlight size={400} color="rgba(99, 102, 241, 0.06)" />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-md">
          {/* Logo — crossfade between dot and no-dot variants */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex justify-center mb-6"
          >
            <div className="relative w-[140px] h-[36px]">
              <Image
                src="/logos/rm-no-dot-logo.png"
                alt=""
                width={140}
                height={36}
                className="absolute inset-0 w-full h-full object-contain"
                aria-hidden
              />
              <Image
                src="/logos/rm-dot-logo.png"
                alt="RedefineMe"
                width={140}
                height={36}
                priority
                className="absolute inset-0 w-full h-full object-contain animate-[logoDotFade_6s_ease-in-out_infinite]"
              />
            </div>
          </motion.div>

          {/* Step indicator (hidden on completion) */}
          {currentStep < TOTAL_STEPS && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.25 }}
            >
              <StepIndicator totalSteps={TOTAL_STEPS} currentStep={currentStep} />
            </motion.div>
          )}

          {/* Error message */}
          {error && (
            <p className="text-sm text-[var(--red)] text-center mb-4">{error}</p>
          )}

          {/* Step content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="relative overflow-hidden"
          >
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
          </motion.div>
        </div>
      </div>
    </AuroraBackground>
  );
}
