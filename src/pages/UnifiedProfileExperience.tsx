import React, { useState, useEffect, useCallback } from 'react';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useProfile } from '../contexts/ProfileContext';
import { useTheme } from '../contexts/ThemeContext';
import { useDebug } from '../components/ui/DebugController';
import { useNavigation } from '../hooks/useNavigation';
import { ProgressBar } from '../components/ui/ProgressBar';
import ChatInterface from '../components/features/ChatInterface';
import { OnboardingStep, InterviewMessage } from '../types';
import LoadingScreen from '../components/ui/LoadingScreen';

// Import all tiered section components
import TieredRoleSelection from '../components/profile/sections/TieredRoleSelection';
import TieredUserPreferences from '../components/profile/sections/TieredUserPreferences';
import TieredPersonalInfo from '../components/profile/sections/TieredPersonalInfo';
import TieredEducation from '../components/profile/sections/TieredEducation';
import TieredResumeUpload from '../components/profile/sections/TieredResumeUpload';

interface UnifiedProfileExperienceProps {
  initialMode?: 'onboarding' | 'profile';
  forceMode?: boolean;
}

// Mock interview messages for the AI interview
const mockInterviewMessages: InterviewMessage[] = [
  {
    id: '1',
    sender: 'ai',
    content: "Hi there! I'm the RightBos AI interviewer. I'd like to learn about your skills and experience through a casual conversation. Let's start with your background - could you tell me about your most recent role and the technologies you've been working with?",
    timestamp: new Date(),
  },
];

// Placeholder component for welcome and completion screens
const PlaceholderScreen: React.FC = () => <div />;

const UnifiedProfileExperience: React.FC<UnifiedProfileExperienceProps> = ({ 
  initialMode = 'profile',
  forceMode = false
}) => {
  const { 
    profileData, 
    isLoading, 
    isOnboardingComplete,
    saveProfile,
    updateProfile
  } = useProfile();
  
  const { mode, setMode } = useTheme();
  const { isDebugEnabled } = useDebug();
  const { goToDashboard, goToProfile } = useNavigation();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [activeSection, setActiveSection] = useState('welcome');
  const [isSaving, setIsSaving] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');
  const [messages, setMessages] = useState<InterviewMessage[]>(mockInterviewMessages);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [hasAttemptedContinue, setHasAttemptedContinue] = useState(false);
  
  // Set up the list of steps/sections with their components
  const profileSections = [
    {
      id: 'welcome',
      title: 'Welcome',
      component: PlaceholderScreen
    },
    {
      id: 'personal',
      title: 'Personal Information',
      component: TieredPersonalInfo,
      required: true
    },
    {
      id: 'roles',
      title: 'Roles & Skills',
      component: TieredRoleSelection,
      required: true
    },
    {
      id: 'preferences',
      title: 'Preferences',
      component: TieredUserPreferences,
      required: false
    },
    {
      id: 'education',
      title: 'Education',
      component: TieredEducation,
      required: false
    },
    {
      id: 'resume',
      title: 'Resume',
      component: TieredResumeUpload,
      required: false
    },
    {
      id: 'complete',
      title: 'Complete',
      component: PlaceholderScreen
    }
  ];
  
  // Determine if we should show onboarding or profile mode
  useEffect(() => {
    // If force mode is enabled, always use onboarding mode
    if (forceMode) {
      setMode('onboarding');
      if (!localStorage.getItem('force_onboarding')) {
        localStorage.setItem('force_onboarding', 'true');
        localStorage.setItem('force_onboarding_timestamp', Date.now().toString());
      }
      return;
    }
    
    // Otherwise use the initial mode or determine based on onboarding status
    if (initialMode === 'onboarding' || !isOnboardingComplete) {
      setMode('onboarding');
    } else {
      setMode('profile');
    }
  }, [initialMode, isOnboardingComplete, forceMode, setMode]);
  
  // Set initial step/section based on profile data
  useEffect(() => {
    // Only set initial step if we haven't started yet (currentStep is 0)
    if (!isLoading && profileData && currentStep === 0) {
      if (mode === 'onboarding') {
        // For onboarding, check if welcome is already completed
        if (profileData.completed_steps?.includes('welcome')) {
          const nextIncompleteIndex = profileSections.findIndex(
            (section, index) => index > 0 && !profileData.completed_steps?.includes(section.id)
          );
          
          if (nextIncompleteIndex !== -1) {
            setCurrentStep(nextIncompleteIndex);
            setActiveSection(profileSections[nextIncompleteIndex].id);
            setShowWelcome(false);
          }
        } else if (!showWelcome) {
          // If welcome is not completed but showWelcome is false, move to first section
          setCurrentStep(1);
          setActiveSection(profileSections[1].id);
        }
      } else {
        // For profile editing, start at personal section
        setActiveSection('personal');
        setCurrentStep(profileSections.findIndex(s => s.id === 'personal'));
      }
    }
  }, [isLoading, profileData, mode, showWelcome, currentStep, profileSections]);
  
  // If user has completed onboarding, redirect to dashboard
  useEffect(() => {
    if (!forceMode && mode === 'onboarding' && isOnboardingComplete && !isLoading) {
      // Only redirect if we're on the completion screen
      if (currentStep === profileSections.length - 1) {
        // Clear force onboarding flags
        localStorage.removeItem('force_onboarding');
        localStorage.removeItem('force_onboarding_timestamp');
        
        goToDashboard();
      }
    }
  }, [forceMode, mode, isOnboardingComplete, isLoading, goToDashboard, currentStep, profileSections.length]);
  
  // Handle validation state changes from child components
  const handleValidationChange = (isValid: boolean) => {
    console.log('UnifiedProfileExperience: Received validation state change:', {
      isValid,
      currentStep,
      currentSection: profileSections[currentStep]?.id
    });
    
    setIsFormValid(isValid);
    
    // If user has attempted to continue before, show validation state
    if (hasAttemptedContinue) {
      const currentSection = profileSections[currentStep];
      if (currentSection?.required && !isValid) {
        setSaveSuccessMessage('Please complete all required fields before continuing.');
      } else {
        setSaveSuccessMessage('');
      }
    }
  };

  // Determine if continue button should be enabled
  const canContinue = useCallback(() => {
    const currentSection = profileSections[currentStep];
    
    console.log('UnifiedProfileExperience: Checking if can continue:', {
      currentStep,
      sectionId: currentSection?.id,
      isFormValid,
      isSaving,
      isRequired: currentSection?.required
    });
    
    if (isSaving) return false;
    if (!currentSection) return false;
    
    // Welcome and complete sections can always continue
    if (currentSection.id === 'welcome' || currentSection.id === 'complete') {
      return true;
    }
    
    // Required sections need to be valid
    if (currentSection.required) {
      return isFormValid;
    }
    
    // Optional sections can continue even if not valid
    return true;
  }, [currentStep, isSaving, isFormValid, profileSections]);

  // Handle continue button click
  const handleNext = async () => {
    setHasAttemptedContinue(true);
    
    if (!canContinue()) {
      return;
    }
    
    try {
      setIsSaving(true);
      console.log('handleNext: setting isSaving to true');
      
      // Special handling for personal info section
      if (activeSection === 'personal') {
        console.log('handleNext: Explicit save for personal info section data');
        
        // Ensure we have the most updated values before saving
        const formElement = document.getElementById('personal-info-form');
        if (formElement) {
          // Trigger a blur event on any focused input to ensure values are committed
          const activeElement = document.activeElement;
          if (activeElement instanceof HTMLElement && formElement.contains(activeElement)) {
            activeElement.blur();
          }
        }
        
        // First save to ensure all personal info is persisted
        try {
          await saveProfile();
          console.log('handleNext: Successfully saved personal info');
        } catch (saveError) {
          console.error('Error saving personal info:', saveError);
          setSaveSuccessMessage('Failed to save changes. Please try again.');
          return;
        }
      }
      
      // Mark current section as complete if not already completed
      if (!profileData.completed_steps?.includes(activeSection)) {
        console.log('handleNext: adding current section to completed_steps:', activeSection);
        await updateProfile({
          completed_steps: [...(profileData.completed_steps || []), activeSection]
        });
      }
      
      // If we're at the last step, mark onboarding as complete
      if (currentStep === profileSections.length - 1) {
        console.log('handleNext: at last step, marking onboarding as complete');
        await updateProfile({ onboarding_completed: true });
        
        try {
          await saveProfile();
        } catch (saveError) {
          console.error('Error in final save:', saveError);
          setSaveSuccessMessage('Failed to save changes. Please try again.');
          return;
        }
        
        // Clear force onboarding flags before redirecting
        localStorage.removeItem('force_onboarding');
        localStorage.removeItem('force_onboarding_timestamp');
        
        goToDashboard();
        return;
      }
      
      // Otherwise, move to the next step
      const nextStep = currentStep + 1;
      console.log('handleNext: moving to next step:', nextStep, 'section:', profileSections[nextStep].id);
      setCurrentStep(nextStep);
      setActiveSection(profileSections[nextStep].id);
      setHasAttemptedContinue(false); // Reset attempt flag for new section
      
      // Save profile after all updates
      try {
        await saveProfile();
        console.log('handleNext: Successfully saved profile after navigation');
        setSaveSuccessMessage('');
      } catch (saveError) {
        console.error('Error saving profile after navigation:', saveError);
        setSaveSuccessMessage('Changes saved but there was an error updating some information.');
      }
    } catch (error) {
      console.error('Error in handleNext:', error);
      setSaveSuccessMessage('Failed to save changes. Please try again.');
    } finally {
      console.log('handleNext: setting isSaving to false');
      setIsSaving(false);
    }
  };
  
  const handleBack = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      setActiveSection(profileSections[prevStep].id);
    }
  };
  
  const handleSectionClick = (sectionId: string, e: React.MouseEvent) => {
    // Check if we're actually clicking on the section button itself
    // and not on a child element inside a section component
    if (e.currentTarget !== e.target && (e.target as HTMLElement).tagName !== 'SPAN') {
      // If we're clicking on a child element, don't change the section
      return;
    }

    // Only allow clicking in profile mode or if the section is already completed
    if (mode === 'profile' || profileData?.completed_steps?.includes(sectionId)) {
      // Check if we're already on this section to avoid unnecessary re-renders
      if (activeSection !== sectionId) {
        console.log(`Switching from section ${activeSection} to ${sectionId}`);
        setActiveSection(sectionId);
        setCurrentStep(profileSections.findIndex(s => s.id === sectionId));
      }
    }
  };
  
  const handleSaveSection = async () => {
    try {
      setIsSaving(true);
      
      await saveProfile();
      
      setSaveSuccessMessage('Changes saved successfully!');
      setTimeout(() => setSaveSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving profile data:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  // AI chat handler
  const handleSendMessage = (content: string) => {
    const newMessage: InterviewMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content,
      timestamp: new Date(),
    };
    
    setMessages([...messages, newMessage]);
    setIsChatLoading(true);
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse: InterviewMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        content: "Thanks for sharing that! Could you tell me about a challenging project you worked on recently? What was your role, and how did you approach solving the problems you encountered?",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsChatLoading(false);
    }, 2000);
  };
  
  // Render welcome screen specifically for onboarding
  const renderWelcomeScreen = () => {
    return (
      <div className="text-center max-w-md mx-auto animate-fade-in py-10 px-4">
        <div className="mb-10 transform hover:scale-105 transition-transform duration-300">
          <div className="w-28 h-28 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 mx-auto flex items-center justify-center shadow-xl">
            <span className="text-4xl font-bold text-white">R</span>
          </div>
        </div>
        
        <h2 className="text-3xl font-bold mb-8 text-white bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">Welcome to RightBoss</h2>
        
        <div className="space-y-6">
          <div className="flex items-start p-5 bg-gray-800/50 rounded-lg">
            <div className="bg-purple-500/20 p-3 rounded-full mr-4 flex-shrink-0 mt-1">
              <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="text-left">
              <h3 className="text-white font-medium mb-1">Your Perfect Job Match</h3>
              <p className="text-gray-300">We're excited to help you find opportunities that align with your skills and preferences.</p>
            </div>
          </div>
          
          <div className="flex items-start p-5 bg-gray-800/50 rounded-lg">
            <div className="bg-pink-500/20 p-3 rounded-full mr-4 flex-shrink-0 mt-1">
              <svg className="w-6 h-6 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <div className="text-left">
              <h3 className="text-white font-medium mb-1">Personalized Experience</h3>
              <p className="text-gray-300">Only takes a few minutes to set up. The more information you provide, the better matches we'll find for you.</p>
            </div>
          </div>
          
          <div className="flex items-start p-5 bg-gray-800/50 rounded-lg">
            <div className="bg-blue-500/20 p-3 rounded-full mr-4 flex-shrink-0 mt-1">
              <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div className="text-left">
              <h3 className="text-white font-medium mb-1">Privacy Protected</h3>
              <p className="text-gray-300">Your information is secure and only shared with approved companies you're interested in.</p>
            </div>
          </div>
        </div>
        
        <div className="mt-10">
        <Button
          variant="primary"
          size="lg"
          gradient
          fullWidth
            className="py-4 text-lg shadow-lg transform transition-transform hover:scale-105"
          onClick={() => {
            setShowWelcome(false);
            setCurrentStep(1);
            setActiveSection(profileSections[1].id);
            // Mark welcome as complete
            if (profileData && !profileData.completed_steps?.includes('welcome')) {
              updateProfile({
                completed_steps: [...(profileData.completed_steps || []), 'welcome']
              });
            }
          }}
            rightIcon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>}
        >
          Get Started
        </Button>
          <p className="text-gray-500 mt-4 text-sm">Estimated completion time: 2-3 minutes</p>
        </div>
      </div>
    );
  };
  
  // Render completion screen specifically for onboarding
  const renderCompletionScreen = () => {
    return (
      <div className="text-center max-w-md mx-auto animate-fade-in py-10 px-4">
        <div className="mb-10 transform hover:scale-105 transition-transform duration-300">
          <div className="w-28 h-28 rounded-full bg-gradient-to-r from-green-500 to-teal-500 mx-auto flex items-center justify-center shadow-xl">
            <svg className="w-14 h-14 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        
        <h2 className="text-3xl font-bold mb-8 text-white bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-400">You're All Set!</h2>
        
        <div className="space-y-6">
          <div className="flex items-start p-5 bg-gray-800/50 rounded-lg">
            <div className="bg-green-500/20 p-3 rounded-full mr-4 flex-shrink-0 mt-1">
              <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-left">
              <h3 className="text-white font-medium mb-1">Profile Complete</h3>
              <p className="text-gray-300">Your profile is now complete and our AI is actively matching you with opportunities.</p>
            </div>
          </div>
          
          <div className="flex items-start p-5 bg-gray-800/50 rounded-lg">
            <div className="bg-teal-500/20 p-3 rounded-full mr-4 flex-shrink-0 mt-1">
              <svg className="w-6 h-6 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="text-left">
              <h3 className="text-white font-medium mb-1">Continuous Improvement</h3>
              <p className="text-gray-300">You can always enhance your profile later to improve your match quality.</p>
            </div>
          </div>
          
          <div className="flex items-start p-5 bg-gray-800/50 rounded-lg">
            <div className="bg-blue-500/20 p-3 rounded-full mr-4 flex-shrink-0 mt-1">
              <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div className="text-left">
              <h3 className="text-white font-medium mb-1">Stay Updated</h3>
              <p className="text-gray-300">You'll receive notifications when we find matches that meet your criteria.</p>
            </div>
          </div>
        </div>
        
        <div className="mt-10">
        <Button
            variant="success"
          size="lg"
          gradient
          fullWidth
          onClick={handleNext}
          isLoading={isSaving}
            className="py-4 text-lg shadow-lg transform transition-transform hover:scale-105"
            rightIcon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>}
        >
          Go to Dashboard
        </Button>
        </div>
      </div>
    );
  };
  
  // Render the appropriate section component
  const renderCurrentSection = () => {
    if (mode === 'onboarding' && showWelcome && currentStep === 0) {
      return renderWelcomeScreen();
    }
    
    if (mode === 'onboarding' && currentStep === profileSections.length - 1) {
      return renderCompletionScreen();
    }
    
    const currentSection = profileSections[currentStep];
    if (!currentSection || !currentSection.component) {
      return <div>Section not implemented yet</div>;
    }
    
    if (currentSection.id === 'interview') {
      return (
        <Card className="p-6">
          <ChatInterface
            messages={messages}
            isLoading={isChatLoading}
            onSendMessage={handleSendMessage}
          />
        </Card>
      );
    }
    
    return <currentSection.component 
      forceMode={mode} 
      hideTitle={mode === 'onboarding'} 
      hideDescription={mode === 'onboarding'} 
      hideSaveButton={mode === 'profile'} // Hide section's own save button in profile mode
    />;
  };
  
  // Calculate profile completion percentage
  const calculateCompletionPercentage = () => {
    if (!profileData || !profileData.completed_steps) return 0;
    
    const completedCount = profileData.completed_steps.length;
    const totalSections = profileSections.length - 2; // Exclude welcome and complete
    return Math.round((completedCount / totalSections) * 100);
  };
  
  // Render the profile sidebar for profile mode
  const renderProfileSidebar = () => {
    const completionPercentage = calculateCompletionPercentage();
    
    return (
      <div className="hidden lg:block lg:col-span-3">
        <Card className="sticky top-8">
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-medium">Profile Completion</h3>
              <span className="text-sm text-purple-400">{completionPercentage}%</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-600 to-pink-500" 
                style={{ width: `${completionPercentage}%` }} 
              />
            </div>
          </div>
          <nav className="divide-y divide-gray-800">
            {profileSections.filter(s => s.id !== 'welcome' && s.id !== 'complete').map((section) => {
              const isComplete = profileData?.completed_steps?.includes(section.id);
              
              return (
                <button
                  key={section.id}
                  className={`
                    w-full text-left px-4 py-3 transition-colors flex justify-between items-center
                    ${activeSection === section.id
                      ? 'bg-purple-600 text-white font-medium'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }
                  `}
                  onClick={(e) => handleSectionClick(section.id, e)}
                >
                  <span>{section.title}</span>
                  {isComplete && (
                    <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              );
            })}
          </nav>
        </Card>
      </div>
    );
  };
  
  // Show loading screen
  if (isLoading) {
    return <LoadingScreen message="Loading your profile data..." />;
  }
  
  return (
    <div className={`min-h-screen ${mode === 'onboarding' ? 'bg-gradient-to-br from-gray-900 to-black' : 'bg-black'}`}>
      {/* Use simplified header for onboarding */}
      <Header simplified={mode === 'onboarding'} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Page header */}
        {mode === 'profile' && (
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Profile Settings
              </h1>
              <p className="text-gray-400 mt-1">
                Update your information to improve your matches
              </p>
            </div>
            
            {/* Save success message */}
            {saveSuccessMessage && (
              <div className={`bg-${saveSuccessMessage.includes('Failed') ? 'red' : 'green'}-500/20 text-${saveSuccessMessage.includes('Failed') ? 'red' : 'green'}-300 px-4 py-2 rounded-md`}>
                {saveSuccessMessage}
              </div>
            )}
            
            {/* Mode toggle button for testing */}
            {isDebugEnabled && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMode(mode === 'onboarding' ? 'profile' : 'onboarding')}
              >
                Toggle Mode
              </Button>
            )}
          </div>
        )}
        
        {/* Progress indicator and heading for onboarding */}
        {mode === 'onboarding' && currentStep > 0 && currentStep < profileSections.length - 1 && (
          <div className="mb-10 max-w-3xl mx-auto px-4">
            <ProgressBar
              value={currentStep - 1}
              max={profileSections.length - 2}
              mode="indicator"
              showSteps={true}
              steps={profileSections.length - 2}
              stepsLabels={profileSections.filter(s => s.id !== 'welcome' && s.id !== 'complete').map(s => s.title)}
              className="mb-8"
            />
            
            <h1 className="text-2xl md:text-3xl font-bold text-white text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              {profileSections[currentStep].title}
            </h1>
            
            {/* Custom description for each section */}
            <p className="text-gray-300 mt-3 mb-8 text-center max-w-lg mx-auto">
              {currentStep === 1 && "Tell us about yourself so companies can get to know you"}
              {currentStep === 2 && "Select roles and skills that match your expertise and career goals"}
              {currentStep === 3 && "Set your preferences to help us find the perfect opportunities for you"}
              {currentStep === 4 && "Share your educational background to strengthen your profile"}
            </p>
          </div>
        )}
        
        {/* Main content area */}
        <div className={`grid grid-cols-1 ${mode === 'profile' ? 'lg:grid-cols-12 gap-8' : ''}`}>
          {/* Sidebar for profile mode */}
          {mode === 'profile' && renderProfileSidebar()}
          
          {/* Content area */}
          <div className={mode === 'profile' ? 'lg:col-span-9' : ''}>
            <Card 
              className={mode === 'onboarding' 
                ? 'bg-transparent border-0 shadow-none p-4 sm:p-6 mb-10' 
                : 'border border-gray-800 mb-8'
              }
              elevated={mode !== 'onboarding'}
              bordered={mode !== 'onboarding'}
            >
              <div className={mode === 'onboarding' ? '' : 'p-5 sm:p-6'}>
                {renderCurrentSection()}
                
                {/* Navigation buttons for onboarding */}
                {mode === 'onboarding' && !showWelcome && currentStep > 0 && currentStep < profileSections.length - 1 && (
                  <div className="flex flex-col sm:flex-row justify-between mt-10 max-w-md mx-auto gap-4 sm:gap-6 px-4">
                    <Button
                      variant="outline"
                      onClick={handleBack}
                      size="lg"
                      className="w-full sm:w-auto px-6 py-3"
                      leftIcon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>}
                    >
                      Back
                    </Button>
                    <Button
                      variant="primary"
                      gradient
                      onClick={handleNext}
                      isLoading={isSaving}
                      disabled={!canContinue()}
                      size="lg"
                      className="w-full sm:w-auto px-6 py-3"
                      rightIcon={!isSaving && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>}
                    >
                      {isSaving 
                        ? "Saving..." 
                        : !canContinue() && profileSections[currentStep]?.required
                          ? "Please Complete Required Fields"
                        : currentStep < profileSections.length - 2 
                          ? "Continue" 
                          : "Complete"
                      }
                    </Button>
                  </div>
                )}
                
                {/* Save button for profile mode */}
                {mode === 'profile' && (
                  <div className="flex justify-end mt-8">
                    <Button
                      variant="primary"
                      gradient
                      onClick={handleSaveSection}
                      isLoading={isSaving}
                      size="lg"
                    >
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UnifiedProfileExperience; 