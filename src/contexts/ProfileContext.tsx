import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { OnboardingStep } from '../types';
import { CompanyStagePreference } from '../types/database';

// Define our profile data model
export interface ProfileData {
  // Basic info
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  phone_number?: string;
  location?: string;
  title?: string;
  bio?: string;
  
  // External profiles
  linkedin_url?: string;
  github_url?: string;
  website_url?: string;
  resume_url?: string;
  
  // Preferences
  company_stage_preferences: {
    early_stage: 'neutral' | 'preferred' | 'avoid';
    late_stage: 'neutral' | 'preferred' | 'avoid';
    enterprise: 'neutral' | 'preferred' | 'avoid';
  };
  locations: string[];
  remote_preference: 'remote' | 'hybrid' | 'office' | 'flexible';
  
  // Education
  graduation_date?: string | null;
  
  // Employment
  employment_type: 'full_time' | 'part_time' | 'contract' | 'internship';
  
  // Roles
  selected_roles: string[];
  
  // Add resume information
  resume?: {
    file_url: string;
    file_name: string;
    upload_date: string;
  };
  
  // Onboarding status
  onboarding_completed: boolean;
  completed_steps: string[];
}

// Define completion status for tracking
export interface CompletionStatus {
  personalInfo: boolean;
  externalProfiles: boolean;
  companyPreferences: boolean;
  locationPreferences: boolean;
  employmentDetails: boolean;
  roles: boolean;
}

// Define types for our context
interface ProfileContextType {
  profileData: ProfileData | null;
  isLoading: boolean;
  completionStatus: CompletionStatus;
  updateProfile: (data: Partial<ProfileData>) => Promise<void>;
  completeStep: (step: OnboardingStep) => void;
  saveProfile: () => Promise<boolean | undefined>;
  isOnboardingComplete: boolean;
}

// Initial profile data
const initialProfileData: ProfileData = {
  id: '',
  full_name: '',
  email: '',
  
  company_stage_preferences: {
    early_stage: 'neutral',
    late_stage: 'neutral',
    enterprise: 'neutral',
  },
  locations: [],
  remote_preference: 'flexible',
  employment_type: 'full_time',
  selected_roles: [],
  
  onboarding_completed: false,
  completed_steps: [],
};

// Create context with default values
const ProfileContext = createContext<ProfileContextType>({
  profileData: null,
  isLoading: true,
  completionStatus: {
    personalInfo: false,
    externalProfiles: false,
    companyPreferences: false,
    locationPreferences: false,
    employmentDetails: false,
    roles: false,
  },
  updateProfile: async () => {},
  completeStep: () => {},
  saveProfile: async () => true,
  isOnboardingComplete: false,
});

interface ProfileProviderProps {
  children: ReactNode;
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children }) => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [completionStatus, setCompletionStatus] = useState<CompletionStatus>({
    personalInfo: false,
    externalProfiles: false,
    companyPreferences: false,
    locationPreferences: false,
    employmentDetails: false,
    roles: false,
  });

  // Compute if onboarding is complete - simplified approach
  const isOnboardingComplete = React.useMemo(() => {
    // Debug logging
    console.log('ProfileContext: Calculating onboarding status', {
      hasProfileData: !!profileData,
      onboardingCompletedFlag: profileData?.onboarding_completed,
      completedStepsCount: profileData?.completed_steps?.length || 0,
      selectedRolesCount: profileData?.selected_roles?.length || 0
    });
    
    // If still loading or no profile data, definitely not complete
    if (isLoading || !profileData) {
      console.log('ProfileContext: Still loading or no data, onboarding status => false');
      return false;
    }
    
    // Primary check: explicit flag in database
    if (profileData.onboarding_completed === true) {
      console.log('ProfileContext: Database flag is true, onboarding status => true');
      return true;
    }
    
    // Secondary check: minimum criteria for a valid profile
    const hasMinimumRequirements = (
      // Must have selected at least one role
      profileData.selected_roles?.length > 0 &&
      // Must have completed at least 2 steps (welcome + role selection at minimum)
      profileData.completed_steps?.length >= 2
    );
    
    console.log('ProfileContext: Minimum requirements check:', {
      hasMinimumRequirements,
      selectedRoles: profileData.selected_roles,
      completedSteps: profileData.completed_steps
    });
    
    return hasMinimumRequirements;
  }, [profileData, isLoading]);

  // Load profile data on mount
  useEffect(() => {
    loadProfileData();
  }, []);

  // Calculate completion status whenever profile data changes
  useEffect(() => {
    if (profileData) {
      calculateCompletionStatus(profileData);
    }
  }, [profileData]);

  // Load profile data from Supabase
  const loadProfileData = async () => {
    const loadStart = Date.now();
    const loadId = Math.random().toString(36).substring(2, 9);
    console.log(`ProfileContext: loadProfileData started (ID: ${loadId})`);
    
    try {
      setIsLoading(true);
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log(`ProfileContext: No user found, aborting load (ID: ${loadId})`);
        setIsLoading(false);
        return;
      }
      
      console.log(`ProfileContext: Loading data for user ${user.id.substring(0, 6)}... (ID: ${loadId})`);
      
      // Get the user's profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (profileError && profileError.code !== 'PGRST116') {
        console.error(`ProfileContext: Error loading profile (ID: ${loadId}):`, profileError);
        setIsLoading(false);
        return;
      }
      
      // Get user preferences
      const { data: preferencesData, error: preferencesError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (preferencesError) {
        console.error(`ProfileContext: Error loading preferences (ID: ${loadId}):`, preferencesError);
      }
      
      // Get completed onboarding steps
      const { data: onboardingData, error: onboardingError } = await supabase
        .from('user_onboarding')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (onboardingError && onboardingError.code !== 'PGRST116') {
        console.error(`ProfileContext: Error loading onboarding status (ID: ${loadId}):`, onboardingError);
      }

      console.log(`ProfileContext: Data fetched (ID: ${loadId})`, { 
        hasProfileData: !!profileData, 
        hasPreferencesData: !!preferencesData, 
        hasOnboardingData: !!onboardingData,
        onboardingData: onboardingData ? {
          completed: onboardingData.completed,
          completed_steps: onboardingData.completed_steps,
          selected_roles: onboardingData.selected_roles
        } : null
      });

      // Combine all data into our profile model
      const combinedData: ProfileData = {
        ...initialProfileData,
        id: user.id,
        full_name: profileData?.full_name || user.user_metadata?.full_name || '',
        email: profileData?.email || user.email || '',
        avatar_url: profileData?.avatar_url || user.user_metadata?.avatar_url || '',
        phone_number: profileData?.phone_number || '',
        location: profileData?.location || '',
        
        linkedin_url: profileData?.linkedin_url || '',
        github_url: profileData?.github_url || '',
        website_url: profileData?.website_url || '',
        resume_url: preferencesData?.resume_url || '',
        
        company_stage_preferences: preferencesData?.company_stage_preferences || initialProfileData.company_stage_preferences,
        locations: preferencesData?.locations || [],
        remote_preference: preferencesData?.remote_preference || 'flexible',
        
        graduation_date: preferencesData?.graduation_date || null,
        employment_type: preferencesData?.employment_type || 'full_time',
        
        selected_roles: onboardingData?.selected_roles || [],
        
        onboarding_completed: onboardingData?.completed || false,
        completed_steps: onboardingData?.completed_steps || [],
      };
      
      console.log(`ProfileContext: Setting profileData (ID: ${loadId})`, {
        userId: combinedData.id.substring(0, 6) + '...',
        onboardingCompleted: combinedData.onboarding_completed,
        completedStepsCount: combinedData.completed_steps.length,
        selectedRolesCount: combinedData.selected_roles.length
      });
      
      setProfileData(combinedData);
      calculateCompletionStatus(combinedData);
    } catch (error) {
      console.error(`ProfileContext: Error in loadProfileData (ID: ${loadId}):`, error);
    } finally {
      console.log(`ProfileContext: loadProfileData completed in ${Date.now() - loadStart}ms (ID: ${loadId})`);
      setIsLoading(false);
    }
  };
  
  // Update profile data
  const updateProfile = async (data: Partial<ProfileData>) => {
    if (!profileData) {
      console.error('ProfileContext: updateProfile called but profileData is null');
      return;
    }
    
    // Check for specific important fields
    const hasPhoneUpdate = 'phone_number' in data;
    const hasLocationUpdate = 'location' in data;
    
    console.log('ProfileContext: updateProfile called with data:', {
      fields: Object.keys(data),
      phoneUpdate: hasPhoneUpdate ? data.phone_number : undefined,
      locationUpdate: hasLocationUpdate ? data.location : undefined,
      hasCompletedSteps: 'completed_steps' in data,
      onboardingCompleted: data.onboarding_completed
    });
    
    const updatedData = {
      ...profileData,
      ...data,
    };
    
    console.log('ProfileContext: Setting updated profile data', {
      prevCompletedSteps: profileData.completed_steps?.length || 0,
      newCompletedSteps: updatedData.completed_steps?.length || 0,
      prevOnboardingStatus: isOnboardingComplete,
      personalInfo: {
        prev: { 
          full_name: profileData.full_name, 
          email: profileData.email,
          phone: profileData.phone_number,
          location: profileData.location
        },
        new: { 
          full_name: updatedData.full_name, 
          email: updatedData.email,
          phone: updatedData.phone_number,
          location: updatedData.location
        }
      }
    });
    
    setProfileData(updatedData);
    calculateCompletionStatus(updatedData);
  };
  
  // Mark an onboarding step as complete
  const completeStep = (step: OnboardingStep) => {
    if (!profileData) return;
    
    // Only add the step if it's not already in the array
    if (!profileData.completed_steps.includes(step)) {
      const updatedSteps = [...profileData.completed_steps, step];
      
      setProfileData({
        ...profileData,
        completed_steps: updatedSteps,
      });
    }
  };
  
  // Calculate completion status based on profile data
  const calculateCompletionStatus = (data: ProfileData) => {
    const isPersonalInfoComplete = Boolean(data.full_name && data.email);
    
    const status: CompletionStatus = {
      personalInfo: isPersonalInfoComplete,
      externalProfiles: Boolean(data.linkedin_url || data.github_url || data.website_url || data.resume_url),
      companyPreferences: true, // These always have defaults
      locationPreferences: data.locations.length > 0,
      employmentDetails: Boolean(data.employment_type),
      roles: data.selected_roles.length > 0,
    };
    
    console.log('ProfileContext: Calculated completion status:', {
      personalInfo: {
        isComplete: isPersonalInfoComplete,
        full_name: data.full_name,
        email: data.email
      },
      status
    });
    
    setCompletionStatus(status);
  };
  
  // Save profile data to Supabase
  const saveProfile = async () => {
    if (!profileData) {
      console.error('ProfileContext: saveProfile called but profileData is null');
      return;
    }
    
    console.log('ProfileContext: saveProfile called with data:', {
      id: profileData.id,
      full_name: profileData.full_name,
      email: profileData.email,
      phone_number: profileData.phone_number,
      location: profileData.location,
      completed_steps: profileData.completed_steps,
      onboardingComplete: isOnboardingComplete,
      completionStatus
    });
    
    let saveSuccessful = true;
    
    try {
      setIsLoading(true);
      console.log('ProfileContext: saveProfile - setting isLoading to true');
      
      // Create profile data payload for update
      const profilePayload = {
        id: profileData.id,
        full_name: profileData.full_name,
        email: profileData.email,
        avatar_url: profileData.avatar_url,
        linkedin_url: profileData.linkedin_url,
        github_url: profileData.github_url,
        website_url: profileData.website_url,
        phone_number: profileData.phone_number,
        location: profileData.location,
        title: profileData.title,
        bio: profileData.bio
      };
      
      console.log('ProfileContext: saveProfile - profile payload:', {
        id: profilePayload.id.substring(0, 6) + '...',
        phone_number: profilePayload.phone_number || 'not set',
        location: profilePayload.location || 'not set'
      });
      
      // Update profile table
      const { data: profileResult, error: profileError } = await supabase
        .from('profiles')
        .upsert(profilePayload);
        
      if (profileError) {
        console.error('ProfileContext: Error updating profiles table:', profileError);
        saveSuccessful = false;
        // Don't throw to allow partial saves
      } else {
        console.log('ProfileContext: saveProfile - updated profiles table successfully');
      }
      
      // Update preferences table
      const preferencesPayload = {
        user_id: profileData.id,
        company_stage_preferences: profileData.company_stage_preferences,
        locations: profileData.locations,
        remote_preference: profileData.remote_preference,
        graduation_date: profileData.graduation_date,
        employment_type: profileData.employment_type,
        resume_url: profileData.resume_url,
      };
      
      const { data: preferencesResult, error: preferencesError } = await supabase
        .from('user_preferences')
        .upsert(preferencesPayload);
        
      if (preferencesError) {
        console.error('ProfileContext: Error updating user_preferences table:', preferencesError);
        saveSuccessful = false;
        // Don't throw to allow partial saves
      } else {
        console.log('ProfileContext: saveProfile - updated user_preferences table');
      }
      
      // Update onboarding status
      const onboardingPayload = {
        user_id: profileData.id,
        selected_roles: profileData.selected_roles,
        completed_steps: profileData.completed_steps,
        completed: isOnboardingComplete,
      };
      
      const { data: onboardingResult, error: onboardingError } = await supabase
        .from('user_onboarding')
        .upsert(onboardingPayload);
        
      if (onboardingError) {
        console.error('ProfileContext: Error updating user_onboarding table:', onboardingError);
        saveSuccessful = false;
        // Don't throw to allow partial saves
      } else {
        console.log('ProfileContext: saveProfile - updated user_onboarding table, completed:', isOnboardingComplete);
      }
      
      // Verify saved data with a fresh fetch to confirm - but don't let it block the save process
      try {
        const { data: verifyData, error: verifyError } = await supabase
          .from('profiles')
          .select('phone_number, location')
          .eq('id', profileData.id)
          .single();
          
        if (!verifyError && verifyData) {
          console.log('ProfileContext: Verification of saved data:', {
            phone_number: {
              original: profileData.phone_number,
              saved: verifyData.phone_number,
              match: profileData.phone_number === verifyData.phone_number
            },
            location: {
              original: profileData.location,
              saved: verifyData.location,
              match: profileData.location === verifyData.location
            }
          });
        }
      } catch (verifyError) {
        console.error('ProfileContext: Error during verification, but continuing:', verifyError);
      }
      
      // Return whether the save was fully successful
      if (!saveSuccessful) {
        console.warn('ProfileContext: saveProfile completed with some errors, profile may be partially updated');
      }
      
      return saveSuccessful;
    } catch (error) {
      console.error('ProfileContext: Critical error saving profile:', error);
      saveSuccessful = false;
      // Don't rethrow to prevent breaking the flow
      return false;
    } finally {
      console.log('ProfileContext: saveProfile - finished, setting isLoading to false');
      setIsLoading(false);
    }
  };
  
  // Context value
  const value = {
    profileData,
    isLoading,
    completionStatus,
    updateProfile,
    completeStep,
    saveProfile,
    isOnboardingComplete,
  };
  
  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};

// Hook for using the profile context
export const useProfile = () => useContext(ProfileContext); 