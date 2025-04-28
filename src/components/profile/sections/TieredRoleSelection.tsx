import React from 'react';
import TieredProfileSection, { FieldTier } from './TieredProfileSection';
import { useProfile } from '../../../contexts/ProfileContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { availableRoles } from '../../../config/roles';

interface TieredRoleSelectionProps {
  forceMode?: 'onboarding' | 'profile';
  hideTitle?: boolean;
  hideDescription?: boolean;
  hideSaveButton?: boolean;
  mode?: 'basic' | 'tiered';
  onRoleToggle?: (roleId: string) => void;
  selectedRoles?: string[];
  className?: string;
}

const TieredRoleSelection: React.FC<TieredRoleSelectionProps> = ({ 
  forceMode,
  hideTitle,
  hideDescription,
  hideSaveButton,
  mode = 'tiered',
  onRoleToggle,
  selectedRoles,
  className = ''
}) => {
  const { profileData, updateProfile } = useProfile();
  const { mode: themeMode } = useTheme();
  
  // Use provided selectedRoles or fall back to profileData
  const currentSelectedRoles = selectedRoles || profileData?.selected_roles || [];
  
  // Handle role selection
  const handleRoleToggle = (roleId: string) => {
    if (onRoleToggle) {
      onRoleToggle(roleId);
      return;
    }
    
    if (profileData) {
      const currentRoles = [...currentSelectedRoles];
      updateProfile({
        selected_roles: currentRoles.includes(roleId)
          ? currentRoles.filter(id => id !== roleId)
          : [...currentRoles, roleId]
      });
    }
  };

  // Role Selection Item Component
  const RoleItem: React.FC<{ role: typeof availableRoles[0] }> = ({ role }) => {
    const isSelected = currentSelectedRoles.includes(role.id);
    const isOnboardingMode = themeMode === 'onboarding';
    
    const itemClasses = `
      rounded-lg border p-3 cursor-pointer transition-all duration-200
      ${isSelected
        ? isOnboardingMode
          ? 'border-purple-500 bg-purple-900/20 shadow-inner-glow'
          : 'border-indigo-500 bg-indigo-900/20'
        : 'border-gray-700 hover:border-gray-500'
      }
    `;
    
    const checkboxClasses = `
      ${isOnboardingMode ? 'w-5 h-5' : 'w-4 h-4'}
      ${isOnboardingMode ? 'rounded-full' : 'rounded-sm'}
      ${isOnboardingMode ? 'mr-3' : 'mr-2'}
      border flex items-center justify-center
      ${isSelected
        ? isOnboardingMode
          ? 'border-purple-500 bg-purple-500/20'
          : 'bg-indigo-600 border-indigo-500'
        : 'border-gray-500'
      }
    `;

    return (
      <div
        className={itemClasses}
        onClick={() => handleRoleToggle(role.id)}
      >
        <div className="flex items-center">
          <div className={checkboxClasses}>
            {isSelected && (
              isOnboardingMode ? (
                <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              ) : (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )
            )}
          </div>
          <span className={`text-gray-200 ${isOnboardingMode ? 'font-medium' : 'text-sm'}`}>
            {role.name}
          </span>
        </div>
      </div>
    );
  };
  
  // Basic Role Selection Grid
  const RoleSelectionGrid = (
    <div className={`grid ${themeMode === 'onboarding' ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'} gap-3 ${className}`}>
      {availableRoles.map(role => (
        <RoleItem key={role.id} role={role} />
      ))}
    </div>
  );
  
  // Essential Primary Roles Component (Tier 1)
  const PrimaryRolesComponent = (
    <div className="space-y-4">
      {RoleSelectionGrid}
      <div className="text-sm text-gray-400 mt-2">
        Select the roles you're interested in pursuing. You can select multiple options.
      </div>
    </div>
  );
  
  // Important Experience Level Component (Tier 2)
  const ExperienceLevelComponent = (
    <div className="mt-8">
      <h3 className="text-lg font-medium text-white mb-3">Experience Level</h3>
      <div className="grid grid-cols-2 gap-3">
        {['Entry Level', 'Mid Level', 'Senior', 'Lead/Manager'].map((level, i) => (
          <div
            key={i}
            className="rounded-lg border border-gray-700 p-3 cursor-pointer hover:border-purple-500"
          >
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full mr-2 border border-gray-500" />
              <span className="text-gray-200">{level}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  
  // Comprehensive Skills Assessment Component (Tier 3)
  const SkillsAssessmentComponent = (
    <div className="mt-8">
      <h3 className="text-lg font-medium text-white mb-3">Technical Skills</h3>
      <p className="text-sm text-gray-400 mb-4">
        Rate your proficiency in technologies relevant to your selected roles.
      </p>
      
      <div className="space-y-4">
        {availableRoles
          .filter(role => currentSelectedRoles.includes(role.id))
          .map(role => (
            <div key={role.id} className="flex items-center justify-between">
              <span className="text-gray-300">{role.name}</span>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    className={`w-6 h-6 rounded-full 
                      ${level <= 3 ? 'bg-purple-900/30 hover:bg-purple-600' : 'bg-gray-800 hover:bg-gray-700'}
                    `}
                    onClick={() => {
                      // In a real implementation, would update profile with skill levels
                      console.log(`Setting ${role.id} to level ${level}`);
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
  
  // If in basic mode, just return the role selection grid
  if (mode === 'basic') {
    return RoleSelectionGrid;
  }
  
  // Define all fields with their tiers
  const fields = [
    {
      id: 'primary-roles',
      tier: FieldTier.ESSENTIAL,
      component: PrimaryRolesComponent,
      label: 'Primary Roles',
      required: true
    },
    {
      id: 'experience-level',
      tier: FieldTier.IMPORTANT,
      component: ExperienceLevelComponent,
      label: 'Experience Level'
    },
    {
      id: 'skills-assessment',
      tier: FieldTier.COMPREHENSIVE,
      component: SkillsAssessmentComponent,
      label: 'Skills Assessment'
    }
  ];
  
  return (
    <TieredProfileSection
      title="Roles & Skills"
      description="Select roles and skills that match your expertise and career goals"
      sectionId="roles-skills-section"
      fields={fields}
      onSave={() => {
        console.log('Saving role selection data');
        // In a real implementation, would call profile context saveProfile method
      }}
      forceMode={forceMode}
      hideTitle={hideTitle || forceMode === 'onboarding'}
      hideDescription={hideDescription || forceMode === 'onboarding'}
      hideSaveButton={hideSaveButton}
    />
  );
};

export default TieredRoleSelection; 