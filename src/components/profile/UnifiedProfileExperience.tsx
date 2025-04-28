import React, { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import TieredPersonalInfo from './sections/TieredPersonalInfo';

interface UnifiedProfileExperienceProps {
  forceMode?: 'onboarding' | 'profile';
  initialMode?: 'onboarding' | 'profile';
  onComplete?: () => void;
}

const UnifiedProfileExperience: React.FC<UnifiedProfileExperienceProps> = ({
  forceMode,
  initialMode = 'profile',
  onComplete
}) => {
  const [mode, setMode] = useState<'onboarding' | 'profile'>(initialMode);
  const [currentStep, setCurrentStep] = useState(0);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [sectionValidation, setSectionValidation] = useState<Record<string, boolean>>({});

  const profileSections = [
    {
      id: 'personal-info',
      component: TieredPersonalInfo,
      title: 'Personal Information'
    }
    // Add other sections as needed
  ];

  useEffect(() => {
    // Set initial active section
    if (!activeSection && profileSections.length > 0) {
      setActiveSection(profileSections[0].id);
    }
  }, []);

  const handleSectionValidation = (sectionId: string, isValid: boolean) => {
    setSectionValidation(prev => ({
      ...prev,
      [sectionId]: isValid
    }));
  };

  const isCurrentSectionValid = () => {
    const currentSection = profileSections[currentStep];
    return sectionValidation[currentSection.id] !== false;
  };

  const handleNext = async () => {
    if (!isCurrentSectionValid()) {
      return;
    }

    try {
      setIsSaving(true);
      
      if (currentStep < profileSections.length - 1) {
        setCurrentStep(prev => prev + 1);
        setActiveSection(profileSections[currentStep + 1].id);
      } else {
        // Call onComplete if provided
        if (onComplete) {
          await onComplete();
        }
      }
    } catch (error) {
      console.error('Error during navigation:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      // Add any additional save logic here
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="unified-profile-experience">
      <div className="profile-sections space-y-6">
        {profileSections.map((section, index) => {
          const SectionComponent = section.component;
          return (
            <div
              key={section.id}
              className={`profile-section ${activeSection === section.id ? 'active' : 'hidden'}`}
            >
              <SectionComponent
                forceMode={mode}
                onValidationChange={(isValid) => handleSectionValidation(section.id, isValid)}
                onSave={handleSave}
              />
            </div>
          );
        })}
      </div>

      {mode === 'onboarding' && (
        <div className="onboarding-navigation mt-6 flex justify-end">
          <Button
            onClick={handleNext}
            disabled={!isCurrentSectionValid() || isSaving}
            variant="contained"
            color="primary"
            className="continue-button"
          >
            {currentStep === profileSections.length - 1 ? 'Complete' : 'Continue'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default UnifiedProfileExperience; 