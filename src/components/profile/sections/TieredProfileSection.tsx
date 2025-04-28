import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';

// Define our data tiers
export enum FieldTier {
  ESSENTIAL = 1,  // Must be collected during onboarding
  IMPORTANT = 2,  // Encouraged after onboarding
  COMPREHENSIVE = 3, // Only in full profile mode
}

interface TieredField {
  id: string;
  tier: FieldTier;
  component: React.ReactNode;
  label?: string;
  required?: boolean;
}

interface TieredProfileSectionProps {
  title: string;
  description: string;
  sectionId: string;
  fields: TieredField[];
  onSave?: () => void;
  forceMode?: 'onboarding' | 'profile';
  hideTitle?: boolean;
  hideDescription?: boolean;
  hideSaveButton?: boolean;
  onValidationChange?: (isValid: boolean) => void;
}

/**
 * TieredProfileSection is a shared component that renders profile fields
 * according to their assigned tier and the current mode (onboarding vs profile)
 */
const TieredProfileSection: React.FC<TieredProfileSectionProps> = ({ 
  title,
  description,
  sectionId,
  fields,
  onSave,
  forceMode,
  hideTitle = false,
  hideDescription = false,
  hideSaveButton = false,
  onValidationChange
}) => {
  // Get the current theme mode
  const { mode } = useTheme();
  
  // Use the forced mode or the theme context mode
  const currentMode = forceMode || mode;
  
  // Track validation state of required fields
  const [isValid, setIsValid] = useState(true);

  // Check validation whenever fields change
  useEffect(() => {
    const requiredFields = fields.filter(field => field.required && field.tier === FieldTier.ESSENTIAL);
    const allValid = requiredFields.every(field => {
      // Add your validation logic here based on field type
      // For now, we'll assume all required fields are valid
      return true;
    });
    
    setIsValid(allValid);
    onValidationChange?.(allValid);
  }, [fields, onValidationChange]);
  
  // Determine which fields to show based on the current mode
  const visibleFields = fields.filter(field => {
    if (currentMode === 'onboarding') {
      // In onboarding, only show essential fields
      return field.tier === FieldTier.ESSENTIAL;
    } else {
      // In profile mode, show all fields
      return true;
    }
  });
  
  // Apply mode-specific styles
  const sectionClasses = currentMode === 'onboarding'
    ? 'p-5 sm:p-6 md:p-8 max-w-md mx-auto animate-fade-in'
    : 'p-5 sm:p-6 bg-gray-800/50 rounded-lg mb-6';
    
  const titleClasses = currentMode === 'onboarding'
    ? 'text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-white text-center'
    : 'text-xl sm:text-2xl font-bold text-white mb-4';
    
  const descriptionClasses = currentMode === 'onboarding'
    ? 'text-gray-300 mb-6 sm:mb-8 text-center text-base sm:text-lg'
    : 'text-gray-300 mb-6';
  
  return (
    <div className={sectionClasses} id={sectionId}>
      {!hideTitle && (
        <h2 className={titleClasses}>{title}</h2>
      )}
      
      {!hideDescription && description && (
        <p className={descriptionClasses}>{description}</p>
      )}
      
      <div className="space-y-6">
        {visibleFields.map(field => (
          <div key={field.id} className="animate-fade-in">
            {field.component}
          </div>
        ))}
      </div>
      
      {/* Show profile completion indicator in profile mode */}
      {currentMode === 'profile' && (
        <div className="mt-8 pt-4 border-t border-gray-700">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">
              {fields.filter(f => f.tier === FieldTier.ESSENTIAL).length} essential fields
            </span>
            <span className="text-gray-400">
              {fields.filter(f => f.tier !== FieldTier.ESSENTIAL).length} additional fields
            </span>
          </div>
        </div>
      )}
      
      {/* Show save button if needed and not hidden */}
      {onSave && currentMode === 'profile' && !hideSaveButton && (
        <div className="mt-6 flex justify-end">
          <button 
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-md text-white font-medium"
            onClick={onSave}
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
};

export default TieredProfileSection; 