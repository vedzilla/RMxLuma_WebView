'use client';

import { useState } from 'react';
import Spline from '@splinetool/react-spline';
import { cn } from '@/lib/utils';

interface SplineSceneProps {
  scene: string;
  className?: string;
}

function SplineLoader() {
  return (
    <div className="absolute inset-0 w-full h-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-subtle border-t-text rounded-full animate-spin" />
        <span className="text-sm text-subtle">Loading 3D scene...</span>
      </div>
    </div>
  );
}

export function SplineScene({ scene, className }: SplineSceneProps) {
  const [isLoading, setIsLoading] = useState(true);

  function handleLoad() {
    setIsLoading(false);
  }

  return (
    <div className={cn('relative w-full h-full', className)}>
      {isLoading && <SplineLoader />}
      <Spline
        scene={scene}
        onLoad={handleLoad}
        className="w-full h-full"
      />
    </div>
  );
}

