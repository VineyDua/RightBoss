import React, { useState } from 'react';
import TieredProfileSection, { FieldTier } from './TieredProfileSection';
import Input from '../../ui/Input';
import { MapPin, Monitor, DollarSign, X } from 'lucide-react';
import { useProfile } from '../../../contexts/ProfileContext';

interface TieredUserPreferencesProps {
  forceMode?: 'onboarding' | 'profile';
  hideTitle?: boolean;
  hideDescription?: boolean;
  hideSaveButton?: boolean;
}

const TieredUserPreferences: React.FC<TieredUserPreferencesProps> = ({ 
  forceMode,
  hideTitle,
  hideDescription,
  hideSaveButton 
}) => {
  const { profileData, updateProfile } = useProfile();
  const [locations, setLocations] = useState<string[]>(
    profileData?.locations || ['San Francisco, CA', 'New York, NY', 'Remote']
  );
  const [newLocation, setNewLocation] = useState('');
  const [workEnvironment, setWorkEnvironment] = useState(
    profileData?.work_environment || 'remote'
  );
  const [salaryMin, setSalaryMin] = useState(
    profileData?.salary_min?.toString() || ''
  );
  const [salaryMax, setSalaryMax] = useState(
    profileData?.salary_max?.toString() || ''
  );
  
  // Additional detailed preferences
  const [travelPreference, setTravelPreference] = useState(
    profileData?.travel_preference || 'none'
  );
  const [companySize, setCompanySize] = useState<string[]>(
    profileData?.company_size || []
  );
  const [industryPreferences, setIndustryPreferences] = useState<string[]>(
    profileData?.industry_preferences || []
  );
  
  // Handle adding a new location
  const handleAddLocation = () => {
    if (newLocation && !locations.includes(newLocation)) {
      const updatedLocations = [...locations, newLocation];
      setLocations(updatedLocations);
      setNewLocation('');
      
      // Update profile data
      updateProfile({ locations: updatedLocations });
    }
  };
  
  // Handle removing a location
  const handleRemoveLocation = (location: string) => {
    const updatedLocations = locations.filter(loc => loc !== location);
    setLocations(updatedLocations);
    
    // Update profile data
    updateProfile({ locations: updatedLocations });
  };
  
  // Handle work environment selection
  const handleWorkEnvironmentChange = (environment: string) => {
    setWorkEnvironment(environment);
    
    // Update profile data
    updateProfile({ work_environment: environment });
  };
  
  // Handle salary range changes
  const handleSalaryChange = (type: 'min' | 'max', value: string) => {
    if (type === 'min') {
      setSalaryMin(value);
      updateProfile({ salary_min: value ? parseInt(value) : undefined });
    } else {
      setSalaryMax(value);
      updateProfile({ salary_max: value ? parseInt(value) : undefined });
    }
  };
  
  // Handle company size preference
  const handleCompanySizeToggle = (size: string) => {
    const updatedSizes = companySize.includes(size)
      ? companySize.filter(s => s !== size)
      : [...companySize, size];
    
    setCompanySize(updatedSizes);
    updateProfile({ company_size: updatedSizes });
  };
  
  // Handle industry preference
  const handleIndustryToggle = (industry: string) => {
    const updatedIndustries = industryPreferences.includes(industry)
      ? industryPreferences.filter(i => i !== industry)
      : [...industryPreferences, industry];
    
    setIndustryPreferences(updatedIndustries);
    updateProfile({ industry_preferences: updatedIndustries });
  };
  
  // Handle travel preference
  const handleTravelPreferenceChange = (preference: string) => {
    setTravelPreference(preference);
    updateProfile({ travel_preference: preference });
  };
  
  // Essential Location Preferences (Tier 1)
  const LocationPreferencesComponent = (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-white mb-3">Location Preferences</h3>
        <div className="flex">
          <Input
            placeholder="Add locations you're interested in"
            leftIcon={<MapPin className="h-5 w-5" />}
            value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)}
            className="flex-grow"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="ml-2 px-6 py-2.5 min-w-[80px] h-[48px] bg-purple-600 rounded-md text-white font-medium text-sm hover:bg-purple-700 transition"
            onClick={(e) => {
              e.stopPropagation();
              handleAddLocation();
            }}
          >
            Add
          </button>
        </div>
        
        <div className="mt-2 flex flex-wrap gap-2">
          {locations.map((location, i) => (
            <span
              key={i}
              className="px-3 py-1 bg-gray-800 rounded-full text-sm text-gray-300 flex items-center"
            >
              {location}
              <button 
                className="ml-1 text-gray-500 hover:text-gray-300"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveLocation(location);
                }}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-white mb-3">Work Environment</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'remote', label: 'Remote', icon: <Monitor className="h-4 w-4 mr-2" /> },
            { id: 'hybrid', label: 'Hybrid', icon: <MapPin className="h-4 w-4 mr-2" /> },
            { id: 'onsite', label: 'On-site', icon: <MapPin className="h-4 w-4 mr-2" /> },
            { id: 'flexible', label: 'Flexible', icon: <Monitor className="h-4 w-4 mr-2" /> },
          ].map(option => (
            <div
              key={option.id}
              className={`
                rounded-lg border p-2 cursor-pointer hover:border-purple-500 flex items-center
                ${workEnvironment === option.id ? 'border-purple-500 bg-purple-900/20' : 'border-gray-700'}
              `}
              onClick={(e) => {
                e.stopPropagation();
                handleWorkEnvironmentChange(option.id);
              }}
            >
              {option.icon}
              <span className="text-gray-300 text-sm">{option.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  
  // Important Compensation Component (Tier 2)
  const CompensationComponent = (
    <div className="mt-6">
      <h3 className="text-lg font-medium text-white mb-3">Compensation</h3>
      <div className="flex space-x-3">
        <Input
          placeholder="Min"
          leftIcon={<DollarSign className="h-5 w-5" />}
          type="number"
          value={salaryMin}
          onChange={(e) => handleSalaryChange('min', e.target.value)}
          onClick={(e) => e.stopPropagation()}
        />
        <Input
          placeholder="Max"
          leftIcon={<DollarSign className="h-5 w-5" />}
          type="number"
          value={salaryMax}
          onChange={(e) => handleSalaryChange('max', e.target.value)}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
      <p className="text-sm text-gray-400 mt-2">
        Providing your compensation expectations helps us match you with appropriate opportunities.
      </p>
    </div>
  );
  
  // Comprehensive Company Preferences (Tier 3)
  const CompanyPreferencesComponent = (
    <div className="mt-6">
      <h3 className="text-lg font-medium text-white mb-3">Company Size Preferences</h3>
      <div className="grid grid-cols-2 gap-3">
        {[
          { id: 'startup', label: 'Startup (1-50)' },
          { id: 'small', label: 'Small (51-200)' },
          { id: 'midsize', label: 'Mid-size (201-1000)' },
          { id: 'large', label: 'Large (1000+)' },
        ].map(size => (
          <div
            key={size.id}
            className={`
              rounded-lg border p-2 cursor-pointer hover:border-indigo-500 flex items-center
              ${companySize.includes(size.id) ? 'border-indigo-500 bg-indigo-900/20' : 'border-gray-700'}
            `}
            onClick={(e) => {
              e.stopPropagation();
              handleCompanySizeToggle(size.id);
            }}
          >
            <div className="w-4 h-4 rounded-sm mr-2 border flex items-center justify-center
              ${companySize.includes(size.id) ? 'bg-indigo-600 border-indigo-500' : 'border-gray-500'}">
              {companySize.includes(size.id) && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className="text-gray-300 text-sm">{size.label}</span>
          </div>
        ))}
      </div>
      
      <h3 className="text-lg font-medium text-white mt-6 mb-3">Industry Preferences</h3>
      <div className="flex flex-wrap gap-2">
        {[
          'Healthcare', 'Finance', 'Technology', 'Education', 
          'Manufacturing', 'Retail', 'Entertainment', 'Energy'
        ].map(industry => (
          <div
            key={industry}
            className={`
              rounded-full px-3 py-1 cursor-pointer
              ${industryPreferences.includes(industry) 
                ? 'bg-indigo-900/40 text-indigo-300 border border-indigo-500/50' 
                : 'bg-gray-800 text-gray-400 border border-gray-700'}
            `}
            onClick={(e) => {
              e.stopPropagation();
              handleIndustryToggle(industry);
            }}
          >
            {industry}
          </div>
        ))}
      </div>
      
      <h3 className="text-lg font-medium text-white mt-6 mb-3">Travel Requirements</h3>
      <div className="grid grid-cols-2 gap-3">
        {[
          { id: 'none', label: 'No travel' },
          { id: 'minimal', label: 'Minimal (< 10%)' },
          { id: 'moderate', label: 'Moderate (10-25%)' },
          { id: 'frequent', label: 'Frequent (25%+)' },
        ].map(option => (
          <div
            key={option.id}
            className={`
              rounded-lg border p-2 cursor-pointer hover:border-indigo-500 flex items-center
              ${travelPreference === option.id ? 'border-indigo-500 bg-indigo-900/20' : 'border-gray-700'}
            `}
            onClick={(e) => {
              e.stopPropagation();
              handleTravelPreferenceChange(option.id);
            }}
          >
            <div className="w-4 h-4 rounded-full mr-2 border
              ${travelPreference === option.id ? 'border-indigo-500 bg-indigo-500' : 'border-gray-500'}">
              {travelPreference === option.id && (
                <div className="w-2 h-2 rounded-full bg-white mx-auto"></div>
              )}
            </div>
            <span className="text-gray-300 text-sm">{option.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
  
  // Define all fields with their tiers
  const fields = [
    {
      id: 'location-preferences',
      tier: FieldTier.ESSENTIAL,
      component: LocationPreferencesComponent,
      label: 'Location Preferences',
      required: true
    },
    {
      id: 'compensation',
      tier: FieldTier.IMPORTANT,
      component: CompensationComponent,
      label: 'Compensation'
    },
    {
      id: 'company-preferences',
      tier: FieldTier.COMPREHENSIVE,
      component: CompanyPreferencesComponent,
      label: 'Company Preferences'
    }
  ];
  
  // Create the save handler
  const handleSave = () => {
    console.log('Saving preferences data');
    // In a real implementation, would call the profile context saveProfile method
  };
  
  return (
    <TieredProfileSection
      title="Preferences"
      description="Set your preferences to help us find the perfect opportunities for you"
      sectionId="preferences-section"
      fields={fields}
      onSave={handleSave}
      forceMode={forceMode}
      hideTitle={hideTitle || forceMode === 'onboarding'}
      hideDescription={hideDescription || forceMode === 'onboarding'}
      hideSaveButton={hideSaveButton}
    />
  );
};

export default TieredUserPreferences; 