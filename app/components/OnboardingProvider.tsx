"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface OnboardingContextType {
  isOnboarding: boolean;
  currentStep: number;
  hasCompletedOnboarding: boolean;
  startOnboarding: () => void;
  nextStep: () => void;
  skipStep: () => void;
  completeOnboarding: () => void;
  skipOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Check if user has completed onboarding on mount
  useEffect(() => {
    try {
      const completed = localStorage.getItem('theaterTrackerOnboardingCompleted');
      if (completed === 'true') {
        setHasCompletedOnboarding(true);
      }
    } catch (error) {
      console.error('Failed to check onboarding status:', error);
    }
    setIsInitialized(true);
  }, []);

  // Check if user should start onboarding (no submissions yet)
  useEffect(() => {
    if (isInitialized && !hasCompletedOnboarding) {
      try {
        const submissions = localStorage.getItem('theaterSubmissions');
        if (!submissions || JSON.parse(submissions).length === 0) {
          setIsOnboarding(true);
        }
      } catch (error) {
        console.error('Failed to check submissions:', error);
        // If we can't check, assume no submissions and start onboarding
        setIsOnboarding(true);
      }
    }
  }, [hasCompletedOnboarding, isInitialized]);

  const startOnboarding = () => {
    setIsOnboarding(true);
    setCurrentStep(1);
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const skipStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const completeOnboarding = () => {
    setIsOnboarding(false);
    setHasCompletedOnboarding(true);
    try {
      localStorage.setItem('theaterTrackerOnboardingCompleted', 'true');
    } catch (error) {
      console.error('Failed to save onboarding completion:', error);
    }
  };

  const skipOnboarding = () => {
    setIsOnboarding(false);
    setHasCompletedOnboarding(true);
    try {
      localStorage.setItem('theaterTrackerOnboardingCompleted', 'true');
    } catch (error) {
      console.error('Failed to save onboarding completion:', error);
    }
  };

  return (
    <OnboardingContext.Provider value={{
      isOnboarding,
      currentStep,
      hasCompletedOnboarding,
      startOnboarding,
      nextStep,
      skipStep,
      completeOnboarding,
      skipOnboarding,
    }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
} 