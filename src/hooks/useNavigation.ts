import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { OnboardingStep } from '../types';

// Type definitions for navigation
export type NavigationMode = 'onboarding' | 'profile' | 'dashboard';
export type ProfileSection = 'personal' | 'education' | 'experience' | 'preferences' | 'summary';

interface NavigationState {
  mode: NavigationMode;
  currentStep?: OnboardingStep;
  currentSection?: ProfileSection;
}

/**
 * Unified navigation hook that handles all navigation within the application
 */
export function useNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  // Core navigation functions
  const goTo = useCallback((path: string, replace = false) => {
    navigate(path, { replace });
  }, [navigate]);

  const goBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // Profile navigation
  const goToProfile = useCallback((section?: ProfileSection) => {
    if (section) {
      navigate(`/profile/${section}`);
    } else {
      navigate('/profile');
    }
  }, [navigate]);

  const goToNextProfileSection = useCallback(() => {
    const currentSection = location.pathname.split('/').pop() as ProfileSection;
    const sections: ProfileSection[] = ['personal', 'education', 'experience', 'preferences'];
    const currentIndex = sections.indexOf(currentSection);
    const nextSection = sections[currentIndex + 1] || 'summary';
    goToProfile(nextSection);
  }, [location.pathname, goToProfile]);

  // Onboarding navigation
  const goToOnboarding = useCallback((step?: OnboardingStep) => {
    navigate('/onboarding', { replace: true });
  }, [navigate]);

  const goToNextOnboardingStep = useCallback((currentStep: OnboardingStep, steps: OnboardingStep[]) => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      goToOnboarding(steps[currentIndex + 1]);
    }
  }, [goToOnboarding]);

  // Dashboard and other routes
  const goToDashboard = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);

  const goToJobDetails = useCallback((jobId: string) => {
    navigate(`/jobs/${jobId}`);
  }, [navigate]);

  // Auth routes
  const goToSignIn = useCallback(() => {
    navigate('/signin');
  }, [navigate]);

  const goToSignUp = useCallback(() => {
    navigate('/signup');
  }, [navigate]);

  // Helper functions
  const getCurrentPath = useCallback(() => {
    return location.pathname;
  }, [location.pathname]);

  const isCurrentPath = useCallback((path: string) => {
    return location.pathname === path;
  }, [location.pathname]);

  const getQueryParams = useCallback(() => {
    return new URLSearchParams(location.search);
  }, [location.search]);

  return {
    // Core navigation
    goTo,
    goBack,
    
    // Profile navigation
    goToProfile,
    goToNextProfileSection,
    
    // Onboarding navigation
    goToOnboarding,
    goToNextOnboardingStep,
    
    // Dashboard and other routes
    goToDashboard,
    goToJobDetails,
    
    // Auth routes
    goToSignIn,
    goToSignUp,
    
    // Helper functions
    getCurrentPath,
    isCurrentPath,
    getQueryParams,
    
    // Current location info
    currentPath: location.pathname,
    currentSearch: location.search
  };
} 